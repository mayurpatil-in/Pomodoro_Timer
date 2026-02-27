from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Project, ProjectTask, User, PomodoroSession, ProjectActivity
from app import db
from datetime import datetime, timezone

projects_bp = Blueprint('projects_bp', __name__)


def log_activity(project_id, activity_type, message):
    """Helper to create a ProjectActivity record."""
    try:
        activity = ProjectActivity(
            project_id=project_id,
            type=activity_type,
            message=message,
        )
        db.session.add(activity)
    except Exception as e:
        # Non-fatal — don't let logging failures break the main request
        print(f"[activity log error] {e}")


@projects_bp.route('', methods=['GET'])
@jwt_required()
def get_projects():
    current_user_id = get_jwt_identity()
    projects = Project.query.filter_by(user_id=current_user_id).all()
    
    result = []
    for project in projects:
        tasks = [{
            'id': t.id,
            'title': t.title,
            'description': t.description,
            'priority': t.priority,
            'due_date': t.due_date.isoformat() if t.due_date else None,
            'is_completed': t.is_completed,
            'created_at': t.created_at.isoformat(),
            'time_seconds': db.session.query(db.func.sum(PomodoroSession.duration_seconds)).filter(
                PomodoroSession.project_task_id == t.id,
                PomodoroSession.type == 'pomodoro'
            ).scalar() or 0
        } for t in project.tasks]
        
        # Calculate time spent on this project
        total_time = db.session.query(db.func.sum(PomodoroSession.duration_seconds)).filter(
            PomodoroSession.project_id == project.id,
            PomodoroSession.type == 'pomodoro'
        ).scalar() or 0

        result.append({
            'id': project.id,
            'name': project.name,
            'description': project.description,
            'notes': project.notes or '',
            'color': project.color,
            'category': project.category,
            'archived': project.archived,
            'status': project.status,
            'priority': project.priority,
            'due_date': project.due_date.isoformat() if project.due_date else None,
            'created_at': project.created_at.isoformat(),
            'updated_at': project.updated_at.isoformat(),
            'total_time_seconds': total_time,
            'tasks': tasks
        })
    
    return jsonify(result), 200

@projects_bp.route('', methods=['POST'])
@jwt_required()
def create_project():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    name = data.get('name')
    if not name:
        return jsonify({'message': 'Project name is required'}), 400
        
    due_date = None
    if data.get('due_date'):
        try:
            due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
        except ValueError:
            pass

    project = Project(
        user_id=current_user_id,
        name=name,
        description=data.get('description', ''),
        notes=data.get('notes', ''),
        color=data.get('color'),
        category=data.get('category', ''),
        status=data.get('status', 'backlog'),
        priority=data.get('priority', 'medium'),
        due_date=due_date
    )
    db.session.add(project)
    db.session.flush()  # get the project.id before commit

    log_activity(project.id, 'project_created', f'Project "{name}" was created')
    db.session.commit()
    
    return jsonify({
        'id': project.id,
        'name': project.name,
        'message': 'Project created successfully'
    }), 201

@projects_bp.route('/<project_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_project(project_id):
    current_user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, user_id=current_user_id).first()
    
    if not project:
        return jsonify({'message': 'Project not found'}), 404
        
    data = request.get_json()

    STATUS_LABELS = {
        'backlog': 'Backlog',
        'in-progress': 'In Progress',
        'review': 'In Review',
        'completed': 'Completed',
    }

    if 'name' in data:
        project.name = data['name']
    if 'description' in data:
        project.description = data['description']
    if 'category' in data:
        project.category = data['category']
    if 'archived' in data:
        if data['archived'] != project.archived:
            log_activity(project_id, 'archived', 'Project was archived' if data['archived'] else 'Project was unarchived')
        project.archived = data['archived']
    if 'status' in data and data['status'] != project.status:
        old_label = STATUS_LABELS.get(project.status, project.status)
        new_label = STATUS_LABELS.get(data['status'], data['status'])
        log_activity(project_id, 'status_change', f'Status changed from {old_label} → {new_label}')
        project.status = data['status']
    elif 'status' in data:
        project.status = data['status']
    if 'priority' in data:
        project.priority = data['priority']
    if 'due_date' in data:
        if data['due_date']:
            try:
                project.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
            except ValueError:
                pass
        else:
            project.due_date = None
    if 'notes' in data:
        project.notes = data['notes']
    if 'color' in data:
        project.color = data['color'] or None
        
    db.session.commit()
    return jsonify({'message': 'Project updated successfully'}), 200

@projects_bp.route('/<project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    current_user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, user_id=current_user_id).first()
    
    if not project:
        return jsonify({'message': 'Project not found'}), 404
        
    db.session.delete(project)
    db.session.commit()
    return jsonify({'message': 'Project deleted successfully'}), 200

# Activity route
@projects_bp.route('/<project_id>/activity', methods=['GET'])
@jwt_required()
def get_project_activity(project_id):
    current_user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, user_id=current_user_id).first()
    if not project:
        return jsonify({'message': 'Project not found'}), 404

    activities = ProjectActivity.query.filter_by(project_id=project_id)\
        .order_by(ProjectActivity.created_at.desc())\
        .limit(50).all()

    return jsonify([{
        'id': a.id,
        'type': a.type,
        'message': a.message,
        'created_at': a.created_at.isoformat(),
    } for a in activities]), 200

# Task Routes
@projects_bp.route('/<project_id>/tasks', methods=['POST'])
@jwt_required()
def add_project_task(project_id):
    current_user_id = get_jwt_identity()
    project = Project.query.filter_by(id=project_id, user_id=current_user_id).first()
    
    if not project:
        return jsonify({'message': 'Project not found'}), 404
        
    data = request.get_json()
    title = data.get('title')
    if not title:
        return jsonify({'message': 'Task title is required'}), 400
        
    task = ProjectTask(
        project_id=project.id,
        title=title,
        description=data.get('description', ''),
        priority=data.get('priority', 'medium'),
        due_date=datetime.fromisoformat(data['due_date'].replace('Z', '+00:00')) if data.get('due_date') else None
    )
    db.session.add(task)
    log_activity(project_id, 'task_added', f'Task "{title}" was added')
    db.session.commit()
    
    return jsonify({
        'id': task.id,
        'title': task.title,
        'message': 'Task added successfully'
    }), 201

@projects_bp.route('/tasks/<task_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_project_task(task_id):
    current_user_id = get_jwt_identity()
    task = ProjectTask.query.join(Project).filter(
        ProjectTask.id == task_id,
        Project.user_id == current_user_id
    ).first()
    
    if not task:
        return jsonify({'message': 'Task not found'}), 404
        
    data = request.get_json()
    if 'title' in data:
        task.title = data['title']
    if 'description' in data:
        task.description = data['description']
    if 'priority' in data:
        task.priority = data['priority']
    if 'due_date' in data:
        if data['due_date']:
            try:
                task.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
            except ValueError:
                pass
        else:
            task.due_date = None
    if 'is_completed' in data:
        if data['is_completed'] and not task.is_completed:
            log_activity(task.project_id, 'task_completed', f'Task "{task.title}" was completed ✓')
        elif not data['is_completed'] and task.is_completed:
            log_activity(task.project_id, 'task_completed', f'Task "{task.title}" was reopened')
        task.is_completed = data['is_completed']
        
    db.session.commit()
    return jsonify({'message': 'Task updated successfully'}), 200

@projects_bp.route('/tasks/<task_id>', methods=['DELETE'])
@jwt_required()
def delete_project_task(task_id):
    current_user_id = get_jwt_identity()
    task = ProjectTask.query.join(Project).filter(
        ProjectTask.id == task_id,
        Project.user_id == current_user_id
    ).first()
    
    if not task:
        return jsonify({'message': 'Task not found'}), 404

    log_activity(task.project_id, 'task_deleted', f'Task "{task.title}" was deleted')
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted successfully'}), 200
