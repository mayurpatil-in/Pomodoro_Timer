import os
import uuid
from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, jsonify, current_app
from flask_cors import CORS
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app import db
from app.models import Goal, GoalStep
from app.utils import error_response

goals_bp = Blueprint('goals', __name__)
CORS(goals_bp)


def goal_to_dict(goal):
    steps = goal.steps.all()
    return {
        'id': goal.id,
        'type': goal.type,
        'title': goal.title,
        'description': goal.description or '',
        'deadline': goal.deadline or '',
        'priority': goal.priority,
        'status': goal.status,
        'category': goal.category or '',
        'color': goal.color or '',
        'is_archived': goal.is_archived,
        'is_pinned': goal.is_pinned,
        'notes': goal.notes or '',
        'order': goal.order,
        'recurrence': goal.recurrence or '',
        'streak_count': goal.streak_count,
        'last_streak_date': goal.last_streak_date or '',
        'project_id': goal.project_id,
        'image_url': goal.image_url,
        'dependency_ids': [d.id for d in goal.dependencies.all()],
        'created_at': goal.created_at.isoformat(),
        'steps': [
            {'id': s.id, 'text': s.text, 'done': s.done, 'is_milestone': s.is_milestone, 'deadline': s.deadline or ''}
            for s in steps
        ],
    }


# ── GET all goals ─────────────────────────────────────────────────────────────
@goals_bp.route('', methods=['GET'])
@jwt_required()
def get_goals():
    user_id = get_jwt_identity()
    all_goals = Goal.query.filter_by(user_id=user_id).order_by(Goal.order.asc(), Goal.created_at.desc()).all()
    short = [goal_to_dict(g) for g in all_goals if g.type == 'short']
    long  = [goal_to_dict(g) for g in all_goals if g.type == 'long']
    return jsonify({'short': short, 'long': long}), 200


# ── CREATE goal ───────────────────────────────────────────────────────────────
@goals_bp.route('', methods=['POST'])
@jwt_required()
def create_goal():
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    title = data.get('title', '').strip()
    if not title:
        return error_response(400, 'Goal title is required.')

    goal_type = data.get('type', 'short')
    if goal_type not in ('short', 'long'):
        goal_type = 'short'

    priority = data.get('priority', 'medium')
    if priority not in ('low', 'medium', 'high'):
        priority = 'medium'

    status = data.get('status', 'todo')
    if status not in ('todo', 'inprogress', 'done'):
        status = 'todo'

    goal = Goal(
        user_id=user_id,
        type=goal_type,
        title=title,
        description=data.get('description', ''),
        deadline=data.get('deadline', '') or None,
        priority=priority,
        status=status,
        category=data.get('category', '') or None,
        color=data.get('color', '') or None,
        is_archived=bool(data.get('is_archived', False)),
        is_pinned=bool(data.get('is_pinned', False)),
        notes=data.get('notes', '') or None,
        order=data.get('order', 0),
        recurrence=data.get('recurrence', '') or None,
        project_id=data.get('project_id'),
        image_url=data.get('image_url'),
    )
    
    # Handle dependencies
    dep_ids = data.get('dependency_ids', [])
    if dep_ids:
        deps = Goal.query.filter(Goal.user_id == user_id, Goal.id.in_(dep_ids)).all()
        goal.dependencies = deps

    db.session.add(goal)
    db.session.flush()  # get goal.id

    for step_data in data.get('steps', []):
        if step_data.get('text', '').strip():
            s = GoalStep(
                goal_id=goal.id, 
                text=step_data['text'].strip(), 
                done=bool(step_data.get('done', False)),
                is_milestone=bool(step_data.get('is_milestone', False)),
                deadline=step_data.get('deadline', '') or None
            )
            db.session.add(s)

    db.session.commit()
    return jsonify(goal_to_dict(goal)), 201


# ── UPDATE goal ───────────────────────────────────────────────────────────────
@goals_bp.route('/<goal_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_goal(goal_id):
    user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return error_response(404, 'Goal not found.')

    data = request.get_json() or {}

    if 'title' in data and data['title'].strip():
        goal.title = data['title'].strip()
    if 'description' in data:
        goal.description = data['description']
    if 'deadline' in data:
        goal.deadline = data['deadline'] or None
    if 'priority' in data and data['priority'] in ('low', 'medium', 'high'):
        goal.priority = data['priority']
    if 'status' in data and data['status'] in ('todo', 'inprogress', 'done'):
        goal.status = data['status']
    if 'category' in data:
        goal.category = data['category'] or None
    if 'color' in data:
        goal.color = data['color'] or None
    if 'is_archived' in data:
        goal.is_archived = bool(data['is_archived'])
    if 'is_pinned' in data:
        goal.is_pinned = bool(data['is_pinned'])
    if 'notes' in data:
        goal.notes = data['notes'] or None
    if 'order' in data:
        goal.order = int(data['order'])
    if 'recurrence' in data:
        goal.recurrence = data['recurrence'] or None
    if 'project_id' in data:
        goal.project_id = data['project_id'] or None
    if 'image_url' in data:
        goal.image_url = data['image_url'] or None
    if 'dependency_ids' in data:
        dep_ids = data['dependency_ids']
        deps = Goal.query.filter(Goal.user_id == user_id, Goal.id.in_(dep_ids)).all()
        goal.dependencies = deps

    # Handle steps if provided: replace all
    if 'steps' in data:
        GoalStep.query.filter_by(goal_id=goal.id).delete()
        for step_data in data['steps']:
            if step_data.get('text', '').strip():
                s = GoalStep(
                    goal_id=goal.id, 
                    text=step_data['text'].strip(), 
                    done=bool(step_data.get('done', False)),
                    is_milestone=bool(step_data.get('is_milestone', False)),
                    deadline=step_data.get('deadline', '') or None
                )
                db.session.add(s)

    db.session.commit()
    return jsonify(goal_to_dict(goal)), 200


# ── DELETE goal ───────────────────────────────────────────────────────────────
@goals_bp.route('/<goal_id>', methods=['DELETE'])
@jwt_required()
def delete_goal(goal_id):
    user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return error_response(404, 'Goal not found.')

    db.session.delete(goal)
    db.session.commit()
    return '', 204


# ── BULK REORDER goals ────────────────────────────────────────────────────────
@goals_bp.route('/reorder', methods=['PUT'])
@jwt_required()
def reorder_goals():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    # Expecting: { "ordered_ids": ["id1", "id2", "id3"] }
    ordered_ids = data.get('ordered_ids', [])
    if not isinstance(ordered_ids, list):
        return error_response(400, 'ordered_ids must be a list')

    # Fetch all goals that belong to the user and are in the list
    goals = Goal.query.filter(Goal.user_id == user_id, Goal.id.in_(ordered_ids)).all()
    goal_map = {g.id: g for g in goals}

    # Update order based on list position
    for index, goal_id in enumerate(ordered_ids):
        if goal_id in goal_map:
            goal_map[goal_id].order = index

    db.session.commit()
    return jsonify({'msg': 'Goals reordered successfully'}), 200


# ── ADD a single step ─────────────────────────────────────────────────────────
@goals_bp.route('/<goal_id>/steps', methods=['POST'])
@jwt_required()
def add_step(goal_id):
    user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return error_response(404, 'Goal not found.')

    data = request.get_json() or {}
    text = data.get('text', '').strip()
    if not text:
        return error_response(400, 'Step text is required.')

    step = GoalStep(
        goal_id=goal.id, 
        text=text,
        is_milestone=bool(data.get('is_milestone', False)),
        deadline=data.get('deadline', '') or None
    )
    db.session.add(step)
    db.session.commit()
    return jsonify({'id': step.id, 'text': step.text, 'done': step.done, 'deadline': step.deadline or ''}), 201


# ── TOGGLE / update a step ────────────────────────────────────────────────────
@goals_bp.route('/<goal_id>/steps/<step_id>', methods=['PATCH'])
@jwt_required()
def update_step(goal_id, step_id):
    user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return error_response(404, 'Goal not found.')

    step = GoalStep.query.filter_by(id=step_id, goal_id=goal.id).first()
    if not step:
        return error_response(404, 'Step not found.')

    data = request.get_json() or {}
    if 'done' in data:
        new_done = bool(data['done'])
        if new_done and not step.done:
            # Streak logic
            today = datetime.now(timezone.utc).date()
            today_str = today.isoformat()
            
            if goal.last_streak_date:
                last_date = datetime.fromisoformat(goal.last_streak_date).date()
                if last_date == today:
                    pass # already worked on today
                elif last_date == today - timedelta(days=1):
                    goal.streak_count += 1
                    goal.last_streak_date = today_str
                else:
                    goal.streak_count = 1
                    goal.last_streak_date = today_str
            else:
                goal.streak_count = 1
                goal.last_streak_date = today_str
        step.done = new_done
    if 'text' in data and data['text'].strip():
        step.text = data['text'].strip()
    if 'is_milestone' in data:
        step.is_milestone = bool(data['is_milestone'])
    if 'deadline' in data:
        step.deadline = data['deadline'] or None

    db.session.commit()
    return jsonify({'id': step.id, 'text': step.text, 'done': step.done, 'is_milestone': step.is_milestone, 'deadline': step.deadline or ''}), 200


# ── DELETE a step ──────────────────────────────────────────────────────────────
@goals_bp.route('/<goal_id>/steps/<step_id>', methods=['DELETE'])
@jwt_required()
def delete_step(goal_id, step_id):
    user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return error_response(404, 'Goal not found.')

    step = GoalStep.query.filter_by(id=step_id, goal_id=goal.id).first()
    if not step:
        return error_response(404, 'Step not found.')

    db.session.delete(step)
    db.session.commit()
    return '', 204


# ── GET analytics ─────────────────────────────────────────────────────────────
@goals_bp.route('/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    user_id = get_jwt_identity()
    all_goals = Goal.query.filter_by(user_id=user_id).all()
    
    # Simple analytics: count by day/week created/completed
    # We want a list for Chart.js: { label: "MM-DD", value: count }
    # For now, let's just do total distribution by status and category
    
    stats = {
        'total': len(all_goals),
        'status': {
            'todo': len([g for g in all_goals if g.status == 'todo']),
            'inprogress': len([g for g in all_goals if g.status == 'inprogress']),
            'done': len([g for g in all_goals if g.status == 'done']),
        },
        'categories': [], # [ { name: 'Career', value: 5 }, ... ]
        'weekly_progress': [] # [ {day: 'Mon', completed: 5}, ... ]
    }
    
    cat_distribution = {}
    for g in all_goals:
        cat = g.category or 'Uncategorized'
        cat_distribution[cat] = cat_distribution.get(cat, 0) + 1
    
    for cat, count in cat_distribution.items():
        stats['categories'].append({'name': cat, 'value': count})
        
    # Mock some weekly data for the chart if we don't have enough history
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    for day in days:
        stats['weekly_progress'].append({'name': day, 'completed': 0})
        
    # Count goals updated in the last 7 days
    now = datetime.now(timezone.utc)
    for g in all_goals:
        if g.status == 'done' and g.updated_at:
            # Handle both string and datetime objects
            updated = g.updated_at
            if isinstance(updated, str):
                try:
                    updated = datetime.fromisoformat(updated.replace('Z', '+00:00'))
                except ValueError:
                    continue # Skip if unparseable
            
            if updated.tzinfo is None:
                updated = updated.replace(tzinfo=timezone.utc)
                
            diff = now - updated
            if diff.days < 7 and diff.days >= 0:
                day_idx = updated.weekday()
                stats['weekly_progress'][day_idx]['completed'] += 1

    return jsonify(stats), 200


# ── UPLOAD goal image ──────────────────────────────────────────────────────────
@goals_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_image():
    if 'file' not in request.files:
        return error_response(400, 'No file part')
    
    file = request.files['file']
    if file.filename == '':
        return error_response(400, 'No selected file')
    
    if file:
        filename = secure_filename(file.filename)
        # Create a unique filename
        ext = os.path.splitext(filename)[1]
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        
        target_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'goals')
        if not os.path.exists(target_dir):
            os.makedirs(target_dir)
            
        file_path = os.path.join(target_dir, unique_filename)
        file.save(file_path)
        
        # Return the URL to access the file
        # The backend is configured to serve /uploads/
        file_url = f"/uploads/goals/{unique_filename}"
        return jsonify({'url': file_url}), 200
    
    return error_response(400, 'File upload failed')
