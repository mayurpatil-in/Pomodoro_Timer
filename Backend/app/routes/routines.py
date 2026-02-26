import json
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
    return jsonify([
        {'date': r.date, 'count': len(json.loads(r.entries))}
        for r in routines
    ]), 200

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
