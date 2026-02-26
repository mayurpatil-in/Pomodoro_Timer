from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import PomodoroSession
from app.schemas import session_schema, sessions_schema
from app.utils import error_response
from datetime import datetime, timezone, timedelta

sessions_bp = Blueprint('sessions', __name__)

@sessions_bp.route('', methods=['POST'])
@jwt_required()
def create_session():
    """Log a completed session (pomodoro focus or break)."""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    duration = data.get('duration_seconds')
    session_type = data.get('type')
    
    if not duration or not session_type:
        return error_response(400, 'Duration and type are required.')

    if session_type not in ['pomodoro', 'shortBreak', 'longBreak']:
        return error_response(400, 'Invalid session type.')

    new_session = PomodoroSession(
        user_id=user_id,
        duration_seconds=duration,
        type=session_type
    )
    
    db.session.add(new_session)
    db.session.commit()

    return jsonify(session_schema.dump(new_session)), 201

@sessions_bp.route('/stats/today', methods=['GET'])
@jwt_required()
def get_today_stats():
    """Get the number of completed pomodoros for the current day UTC."""
    user_id = get_jwt_identity()
    
    # Get the start of today in UTC
    now = datetime.now(timezone.utc)
    start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # Count only 'pomodoro' (focus) sessions from today
    count = PomodoroSession.query.filter(
        PomodoroSession.user_id == user_id,
        PomodoroSession.type == 'pomodoro',
        PomodoroSession.completed_at >= start_of_today
    ).count()

    return jsonify({'today_pomodoros': count}), 200

@sessions_bp.route('/stats/weekly', methods=['GET'])
@jwt_required()
def get_weekly_stats():
    """Get the past 7 days of focus sessions for chart rendering."""
    user_id = get_jwt_identity()
    
    # 7 days ago
    now = datetime.now(timezone.utc)
    start_date = now - timedelta(days=6)
    start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)

    sessions = PomodoroSession.query.filter(
        PomodoroSession.user_id == user_id,
        PomodoroSession.type == 'pomodoro',
        PomodoroSession.completed_at >= start_date
    ).order_by(PomodoroSession.completed_at.asc()).all()

    # Aggregate by day (YYYY-MM-DD string as key)
    # Output format for chart.js/recharts: [{ date: '2023-10-01', count: 4 }, ...]
    # We must ensure days with 0 pomodoros still show up in the array.
    
    stats_dict = {}
    for i in range(7):
        day = (start_date + timedelta(days=i)).strftime('%Y-%m-%d')
        stats_dict[day] = 0

    for s in sessions:
        day_str = s.completed_at.strftime('%Y-%m-%d')
        if day_str in stats_dict:
            stats_dict[day_str] += 1

    chart_data = [{'date': k, 'count': v} for k, v in stats_dict.items()]

    return jsonify(chart_data), 200
