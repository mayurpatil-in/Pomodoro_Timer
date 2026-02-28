from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone, timedelta
import json
from calendar import monthrange

from app.models import (
    Task, PomodoroSession, DailyRoutine, GymDay,
    MoneyTransaction, CreditCard,
    Goal,
    InterviewApplication,
    Project,
)

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_dashboard_summary():
    """
    Aggregates data for the main dashboard view.
    Expects 'local_iso_date' query parameter (e.g., '2026-02-28').
    """
    user_id = get_jwt_identity()
    local_iso_date = request.args.get('local_iso_date')
    
    if not local_iso_date:
        local_iso_date = datetime.now(timezone.utc).strftime('%Y-%m-%d')
        
    try:
        date_obj = datetime.strptime(local_iso_date, '%Y-%m-%d')
        current_year = date_obj.year
        current_month = date_obj.month
    except ValueError:
        return jsonify({'message': 'Invalid local_iso_date format. Expected YYYY-MM-DD'}), 400

    # ── 1. Tasks ──────────────────────────────────────────────────────────────
    all_user_tasks = Task.query.filter_by(user_id=user_id).order_by(Task.is_completed.asc(), Task.created_at.desc()).all()
    pending_tasks = [t for t in all_user_tasks if not t.is_completed]
    completed_tasks_count = len(all_user_tasks) - len(pending_tasks)
    tasks_data = {
        'stats': {'completed': completed_tasks_count, 'pending': len(pending_tasks)},
        'pending_preview': [
            {'id': t.id, 'title': t.title, 'priority': t.priority, 'is_completed': t.is_completed}
            for t in pending_tasks[:5]
        ]
    }

    # ── 2. Today's Pomodoro count ────────────────────────────────────────────
    now_utc = datetime.now(timezone.utc)
    start_of_today_utc = now_utc.replace(hour=0, minute=0, second=0, microsecond=0)
    today_pomodoros = PomodoroSession.query.filter(
        PomodoroSession.user_id == user_id,
        PomodoroSession.type == 'pomodoro',
        PomodoroSession.completed_at >= start_of_today_utc
    ).count()

    # ── 3. Weekly Sessions (last 7 days) ─────────────────────────────────────
    start_date = now_utc - timedelta(days=6)
    start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
    weekly_sessions_db = PomodoroSession.query.filter(
        PomodoroSession.user_id == user_id,
        PomodoroSession.type == 'pomodoro',
        PomodoroSession.completed_at >= start_date
    ).order_by(PomodoroSession.completed_at.asc()).all()
    
    stats_dict = {(start_date + timedelta(days=i)).strftime('%Y-%m-%d'): 0 for i in range(7)}
    for s in weekly_sessions_db:
        day_str = s.completed_at.strftime('%Y-%m-%d')
        if day_str in stats_dict:
            stats_dict[day_str] += 1
    weekly_chart_data = [{'date': k, 'count': v} for k, v in stats_dict.items()]

    # ── 4. Today's Routine ───────────────────────────────────────────────────
    routine = DailyRoutine.query.filter_by(user_id=user_id, date=local_iso_date).first()
    routine_entries = json.loads(routine.entries) if routine else []

    # ── 5. Today's Gym Data ───────────────────────────────────────────────────
    gym_day = GymDay.query.filter_by(user_id=user_id, date=local_iso_date).first()
    gym_data = {
        'water_glasses': (gym_day.water_glasses or 0) if gym_day else 0,
        'pushups': (gym_day.pushups or 0) if gym_day else 0,
        'pullups': (gym_day.pullups or 0) if gym_day else 0,
    }

    # ── 6. Finance Overview ───────────────────────────────────────────────────
    month_prefix = f"{current_year}-{current_month:02d}"
    monthly_txs = MoneyTransaction.query.filter(
        MoneyTransaction.user_id == user_id,
        MoneyTransaction.date.startswith(month_prefix)
    ).all()
    income = sum(t.amount for t in monthly_txs if t.type == 'income')
    expense = sum(t.amount for t in monthly_txs if t.type == 'expense')
    finance_data = {'income': income, 'expense': expense}

    # ── 7. Upcoming Bills (Credit Cards due within 5 days) ───────────────────
    cards = CreditCard.query.filter_by(user_id=user_id).all()
    upcoming_bills = []
    today_local = datetime(current_year, current_month, date_obj.day)
    for card in cards:
        if card.due_date and card.used > 0:
            try:
                if not isinstance(card.due_date, int) or not (1 <= card.due_date <= 31):
                    continue
                _, last_day = monthrange(current_year, current_month)
                due_date_this_month = datetime(current_year, current_month, min(card.due_date, last_day))
            except (ValueError, TypeError):
                continue
            if due_date_this_month < today_local:
                next_month = current_month + 1 if current_month < 12 else 1
                next_year = current_year if current_month < 12 else current_year + 1
                _, last_day = monthrange(next_year, next_month)
                try:
                    due_date_this_month = datetime(next_year, next_month, min(card.due_date, last_day))
                except (ValueError, TypeError):
                    continue
            diff_days = (due_date_this_month - today_local).days
            if 0 <= diff_days <= 5:
                upcoming_bills.append({
                    'id': card.id, 'name': card.name, 'used': card.used,
                    'due_date': card.due_date, 'daysLeft': diff_days
                })

    # ── 8. Goals Summary ──────────────────────────────────────────────────────
    try:
        all_goals = Goal.query.filter_by(user_id=user_id, is_archived=False).all()
        active_goals = [g for g in all_goals if g.status != 'done']
        done_goals_count = len(all_goals) - len(active_goals)
        streak_goals = sorted([g for g in all_goals if g.streak_count > 0], key=lambda g: -g.streak_count)[:3]

        goals_data = {
            'total': len(all_goals),
            'active': len(active_goals),
            'done': done_goals_count,
            'streaks': [{'title': g.title, 'streak': g.streak_count, 'color': g.color or 'slate'} for g in streak_goals],
            'recent_active': [
                {
                    'id': g.id, 'title': g.title, 'status': g.status,
                    'priority': g.priority, 'color': g.color or 'slate',
                    'category': g.category, 'deadline': g.deadline,
                    'steps_total': g.steps.count(),
                    'steps_done': g.steps.filter_by(done=True).count(),
                }
                for g in sorted(active_goals, key=lambda g: g.is_pinned, reverse=True)[:4]
            ]
        }
    except Exception:
        goals_data = {'total': 0, 'active': 0, 'done': 0, 'streaks': [], 'recent_active': []}

    # ── 9. Interview Pipeline Summary ─────────────────────────────────────────
    try:
        all_apps = InterviewApplication.query.filter_by(user_id=user_id).all()
        pipeline = {}
        for app in all_apps:
            pipeline[app.stage] = pipeline.get(app.stage, 0) + 1

        now_naive = datetime.now()
        week_later = now_naive + timedelta(days=7)
        upcoming_interviews = []
        for app in all_apps:
            if app.interview_date:
                try:
                    idate = app.interview_date if isinstance(app.interview_date, datetime) else datetime.fromisoformat(str(app.interview_date))
                    idate_naive = idate.replace(tzinfo=None)
                    if now_naive <= idate_naive <= week_later:
                        diff_days = (idate_naive - now_naive).days
                        upcoming_interviews.append({
                            'id': app.id, 'company': app.company_name,
                            'role': app.role, 'stage': app.stage,
                            'days_left': max(0, diff_days),
                        })
                except Exception:
                    pass
        upcoming_interviews.sort(key=lambda x: x['days_left'])

        interviews_data = {
            'total': len(all_apps),
            'pipeline': pipeline,
            'offers': pipeline.get('Offer', 0),
            'upcoming_interviews': upcoming_interviews[:5],
        }
    except Exception:
        interviews_data = {'total': 0, 'pipeline': {}, 'offers': 0, 'upcoming_interviews': []}

    # ── 10. Projects Summary ─────────────────────────────────────────────────
    try:
        all_projects = Project.query.filter_by(user_id=user_id, archived=False).all()
        active_projects = [p for p in all_projects if p.status in ('in-progress', 'review')]

        projects_data = {
            'total': len(all_projects),
            'active': len(active_projects),
            'recent': [
                {
                    'id': p.id, 'name': p.name, 'status': p.status,
                    'color': p.color, 'priority': p.priority,
                    'total_tasks': p.tasks.count(),
                    'done_tasks': p.tasks.filter_by(is_completed=True).count(),
                }
                for p in sorted(active_projects, key=lambda p: p.updated_at or p.created_at, reverse=True)[:4]
            ]
        }
    except Exception:
        projects_data = {'total': 0, 'active': 0, 'recent': []}

    return jsonify({
        'tasks': tasks_data,
        'today_pomodoros': today_pomodoros,
        'weekly_sessions': weekly_chart_data,
        'routine': routine_entries,
        'gym': gym_data,
        'finance': finance_data,
        'upcoming_bills': upcoming_bills,
        'goals': goals_data,
        'interviews': interviews_data,
        'projects': projects_data,
    }), 200
