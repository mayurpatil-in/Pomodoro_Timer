from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta, timezone
from calendar import monthrange
from app.models import Goal, InterviewApplication, CreditCard, db

calendar_bp = Blueprint('calendar', __name__)

@calendar_bp.route('/events', methods=['GET'])
@jwt_required()
def get_calendar_events():
    """
    Returns events (goals, interviews, credit card bills) within a date range.
    Expected query params: start_date, end_date (YYYY-MM-DD)
    """
    user_id = get_jwt_identity()
    start_str = request.args.get('start_date')
    end_str = request.args.get('end_date')

    if not start_str or not end_str:
        # Default to current month if not provided
        now = datetime.now(timezone.utc)
        start_str = now.replace(day=1).strftime('%Y-%m-%d')
        _, last_day = monthrange(now.year, now.month)
        end_str = now.replace(day=last_day).strftime('%Y-%m-%d')

    try:
        start_date = datetime.strptime(start_str, '%Y-%m-%d')
        end_date = datetime.strptime(end_str, '%Y-%m-%d')
    except ValueError:
        return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD'}), 400

    events = []

    # 1. Goals (deadline based)
    goals = Goal.query.filter(
        Goal.user_id == user_id,
        Goal.deadline >= start_str,
        Goal.deadline <= end_str,
        Goal.is_archived == False
    ).all()

    for g in goals:
        events.append({
            'id': f'goal-{g.id}',
            'original_id': g.id,
            'title': g.title,
            'date': g.deadline,
            'type': 'goal',
            'status': g.status,
            'description': g.description or '',
            'color': g.color or 'emerald'
        })

    # 2. Interviews
    interviews = InterviewApplication.query.filter(
        InterviewApplication.user_id == user_id,
        InterviewApplication.interview_date >= start_date,
        InterviewApplication.interview_date <= end_date + timedelta(days=1)
    ).all()

    for i in interviews:
        events.append({
            'id': f'interview-{i.id}',
            'original_id': i.id,
            'title': f"{i.role} at {i.company_name}",
            'date': i.interview_date.strftime('%Y-%m-%d'),
            'type': 'interview',
            'stage': i.stage,
            'company': i.company_name,
            'color': 'indigo'
        })

    # 3. Credit Card Bills
    # These are recurring monthly based on card.due_date
    cards = CreditCard.query.filter_by(user_id=user_id).all()
    
    # Iterate through each month in the range
    curr = start_date.replace(day=1)
    while curr <= end_date:
        year = curr.year
        month = curr.month
        _, last_day = monthrange(year, month)
        
        for card in cards:
            if card.due_date and card.used > 0:
                day = min(card.due_date, last_day)
                bill_date = datetime(year, month, day)
                
                if start_date <= bill_date <= end_date:
                    events.append({
                        'id': f'bill-{card.id}-{year}-{month}',
                        'original_id': card.id,
                        'title': f"{card.name} Bill Due",
                        'date': bill_date.strftime('%Y-%m-%d'),
                        'type': 'bill',
                        'amount': card.used,
                        'color': 'rose'
                    })
        
        # Next month
        if month == 12:
            curr = curr.replace(year=year + 1, month=1)
        else:
            curr = curr.replace(month=month + 1)

    return jsonify(events), 200
