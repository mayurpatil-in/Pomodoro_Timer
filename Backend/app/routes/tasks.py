from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Task
from app.schemas import task_schema, tasks_schema
from app.utils import error_response

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('', methods=['GET'])
@jwt_required()
def get_tasks():
    user_id = get_jwt_identity()
    # Order by uncompleted first, then by creation date descending
    user_tasks = Task.query.filter_by(user_id=user_id)\
        .order_by(Task.is_completed.asc(), Task.created_at.desc()).all()
    
    return jsonify(tasks_schema.dump(user_tasks)), 200

@tasks_bp.route('', methods=['POST'])
@jwt_required()
def create_task():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    title = data.get('title')
    if not title:
        return error_response(400, 'Task title is required.')

    priority = data.get('priority', 'medium')
    if priority not in ('low', 'medium', 'high'):
        priority = 'medium'

    new_task = Task(user_id=user_id, title=title, priority=priority)
    db.session.add(new_task)
    db.session.commit()

    return jsonify(task_schema.dump(new_task)), 201

@tasks_bp.route('/<task_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_task(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()
    
    if not task:
        return error_response(404, 'Task not found.')

    data = request.get_json()
    
    if 'title' in data:
        task.title = data['title']
    if 'is_completed' in data:
        task.is_completed = data['is_completed']
    if 'priority' in data and data['priority'] in ('low', 'medium', 'high'):
        task.priority = data['priority']
        
    db.session.commit()
    return jsonify(task_schema.dump(task)), 200

@tasks_bp.route('/<task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first()
    
    if not task:
        return error_response(404, 'Task not found.')

    db.session.delete(task)
    db.session.commit()
    return '', 204
