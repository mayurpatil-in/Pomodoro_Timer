import json
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import DailyRoutine, RoutineTemplate
from app.utils import error_response

routines_bp = Blueprint('routines', __name__)

@routines_bp.route('/<date_str>', methods=['GET'])
@jwt_required()
def get_routine(date_str):
    """Get routine for a specific date (YYYY-MM-DD)."""
    user_id = get_jwt_identity()
    routine = DailyRoutine.query.filter_by(user_id=user_id, date=date_str).first()
    if not routine:
        return jsonify({'date': date_str, 'entries': []}), 200
    return jsonify({'date': routine.date, 'entries': json.loads(routine.entries)}), 200


@routines_bp.route('/<date_str>', methods=['PUT'])
@jwt_required()
def save_routine(date_str):
    """Upsert routine for a date. Expects { entries: [...] }."""
    user_id = get_jwt_identity()
    data = request.get_json()
    entries = data.get('entries', [])

    routine = DailyRoutine.query.filter_by(user_id=user_id, date=date_str).first()
    if routine:
        routine.entries = json.dumps(entries)
    else:
        routine = DailyRoutine(user_id=user_id, date=date_str, entries=json.dumps(entries))
        db.session.add(routine)

    db.session.commit()
    return jsonify({'date': routine.date, 'entries': entries}), 200


@routines_bp.route('/calendar', methods=['GET'])
@jwt_required()
def get_calendar_summary():
    """Return list of dates that have saved routines (for calendar highlighting)."""
    user_id = get_jwt_identity()
    routines = DailyRoutine.query.filter_by(user_id=user_id).all()
    
    result = []
    for r in routines:
        entries = json.loads(r.entries) if r.entries else []
        is_completed = all(e.get('completed', False) for e in entries) if entries else False
        result.append({
            'date': r.date, 
            'count': len(entries),
            'is_completed': is_completed
        })
        
    return jsonify(result), 200


@routines_bp.route('/streak', methods=['GET'])
@jwt_required()
def get_streak():
    """Calculate the current daily routine completion streak."""
    user_id = get_jwt_identity()
    
    # Get all routines for user ordered by date descending
    routines = DailyRoutine.query.filter_by(user_id=user_id).order_by(DailyRoutine.date.desc()).all()
    
    if not routines:
        return jsonify({'current_streak': 0, 'today_completed': False}), 200

    now = datetime.now()
    today_str = now.strftime('%Y-%m-%d')
    yesterday_str = (now - timedelta(days=1)).strftime('%Y-%m-%d')
    
    streak = 0
    today_completed = False
    
    # Check today first
    today_routine = next((r for r in routines if r.date == today_str), None)
    if today_routine:
        entries = json.loads(today_routine.entries) if today_routine.entries else []
        if entries and all(e.get('completed', False) for e in entries):
            streak += 1
            today_completed = True
    
    # If not completed today, check if streak is still alive from yesterday
    last_date = datetime.strptime(today_str, '%Y-%m-%d')
    if not today_completed:
        last_date = datetime.strptime(yesterday_str, '%Y-%m-%d')
        # We start checking from yesterday. If yesterday isn't completed, streak is 0.
        
    # Check consecutive days backwards
    check_date = datetime.strptime(yesterday_str, '%Y-%m-%d')
    
    # Filter routines from before today
    historical = [r for r in routines if r.date < today_str]
    
    for r in historical:
        r_date = datetime.strptime(r.date, '%Y-%m-%d')
        # Skip if it's not the next day we expect in the streak
        if r_date > check_date:
            continue
        # Break if there's a gap
        if r_date < check_date:
            break
            
        entries = json.loads(r.entries) if r.entries else []
        if entries and all(e.get('completed', False) for e in entries):
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break
            
    return jsonify({
        'current_streak': streak,
        'today_completed': today_completed
    }), 200

# ── Templates ──

@routines_bp.route('/templates', methods=['GET'])
@jwt_required()
def get_templates():
    user_id = get_jwt_identity()
    templates = RoutineTemplate.query.filter_by(user_id=user_id).order_by(RoutineTemplate.created_at.desc()).all()
    result = []
    for t in templates:
        result.append({
            'id': t.id,
            'name': t.name,
            'entries': json.loads(t.entries),
            'created_at': t.created_at.isoformat()
        })
    return jsonify(result), 200


@routines_bp.route('/templates', methods=['POST'])
@jwt_required()
def create_template():
    user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get('name')
    entries = data.get('entries', [])

    if not name or not name.strip():
        return error_response(400, "Template name is required")

    template = RoutineTemplate(
        user_id=user_id,
        name=name.strip(),
        entries=json.dumps(entries)
    )
    db.session.add(template)
    db.session.commit()

    return jsonify({
        'id': template.id,
        'name': template.name,
        'entries': entries,
        'created_at': template.created_at.isoformat()
    }), 201


@routines_bp.route('/templates/<template_id>', methods=['DELETE'])
@jwt_required()
def delete_template(template_id):
    user_id = get_jwt_identity()
    template = RoutineTemplate.query.filter_by(id=template_id, user_id=user_id).first()
    if not template:
        return error_response(404, "Template not found")

    db.session.delete(template)
    db.session.commit()
    return '', 204
