from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import GymDay, GymExercise, GymMeal, GymGoal
from app import db
from datetime import datetime, timedelta

gym_bp = Blueprint('gym_bp', __name__)

@gym_bp.route('/<date>', methods=['GET'])
@jwt_required()
def get_gym_day(date):
    current_user_id = get_jwt_identity()

    gym_day = GymDay.query.filter_by(user_id=current_user_id, date=date).first()

    if not gym_day:
        return jsonify({
            'weight': None,
            'water_glasses': 0,
            'pushups': 0,
            'pullups': 0,
            'squads': 0,
            'notes': '',
            'exercises': [],
            'meals': []
        }), 200

    exercises = [{'id': e.id, 'name': e.name, 'muscle_group': e.muscle_group, 'sets': e.sets, 'reps': e.reps, 'weight': e.weight} for e in gym_day.exercises]
    meals = [{'id': m.id, 'name': m.name, 'meal_type': m.meal_type, 'calories': m.calories, 'protein': m.protein, 'carbs': m.carbs, 'fat': m.fat} for m in gym_day.meals]

    return jsonify({
        'id': gym_day.id,
        'weight': gym_day.weight,
        'water_glasses': gym_day.water_glasses,
        'pushups': gym_day.pushups,
        'pullups': gym_day.pullups,
        'squads': gym_day.squads,
        'notes': gym_day.notes,
        'exercises': exercises,
        'meals': meals
    }), 200

@gym_bp.route('/day', methods=['POST'])
@jwt_required()
def save_gym_day():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    date = data.get('date')
    if not date:
        return jsonify({'message': 'Date is required'}), 400

    gym_day = GymDay.query.filter_by(user_id=current_user_id, date=date).first()
    
    if not gym_day:
        gym_day = GymDay(user_id=current_user_id, date=date)
        db.session.add(gym_day)
    
    if 'weight' in data:
        gym_day.weight = data['weight']
    if 'water_glasses' in data:
        gym_day.water_glasses = data['water_glasses']
    if 'pushups' in data:
        gym_day.pushups = data['pushups']
    if 'pullups' in data:
        gym_day.pullups = data['pullups']
    if 'squads' in data:
        gym_day.squads = data['squads']
    if 'notes' in data:
        gym_day.notes = data['notes']

    db.session.commit()
    return jsonify({'message': 'Gym day updated successfully', 'id': gym_day.id}), 200

@gym_bp.route('/exercise', methods=['POST'])
@jwt_required()
def add_exercise():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    date = data.get('date')
    if not date:
        return jsonify({'message': 'Date is required'}), 400

    gym_day = GymDay.query.filter_by(user_id=current_user_id, date=date).first()
    if not gym_day:
        gym_day = GymDay(user_id=current_user_id, date=date)
        db.session.add(gym_day)
        db.session.commit()

    exercise = GymExercise(
        gym_day_id=gym_day.id,
        name=data.get('name', 'Unknown Exercise'),
        muscle_group=data.get('muscle_group', 'Other'),
        sets=data.get('sets', 1),
        reps=data.get('reps', 1),
        weight=data.get('weight', 0.0)
    )
    db.session.add(exercise)
    db.session.commit()

    return jsonify({
        'message': 'Exercise added successfully',
        'exercise': {
            'id': exercise.id,
            'name': exercise.name,
            'muscle_group': exercise.muscle_group,
            'sets': exercise.sets,
            'reps': exercise.reps,
            'weight': exercise.weight
        }
    }), 201

@gym_bp.route('/exercise/<exercise_id>', methods=['DELETE'])
@jwt_required()
def delete_exercise(exercise_id):
    current_user_id = get_jwt_identity()
    
    exercise = GymExercise.query.join(GymDay).filter(GymExercise.id == exercise_id, GymDay.user_id == current_user_id).first()
    if not exercise:
        return jsonify({'message': 'Exercise not found'}), 404

    db.session.delete(exercise)
    db.session.commit()
    return jsonify({'message': 'Exercise deleted successfully'}), 200

@gym_bp.route('/meal', methods=['POST'])
@jwt_required()
def add_meal():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    date = data.get('date')
    if not date:
        return jsonify({'message': 'Date is required'}), 400

    gym_day = GymDay.query.filter_by(user_id=current_user_id, date=date).first()
    if not gym_day:
        gym_day = GymDay(user_id=current_user_id, date=date)
        db.session.add(gym_day)
        db.session.commit()

    meal = GymMeal(
        gym_day_id=gym_day.id,
        name=data.get('name', 'Unknown Meal'),
        meal_type=data.get('meal_type', 'Snack'),
        calories=data.get('calories', 0),
        protein=data.get('protein', 0.0),
        carbs=data.get('carbs', 0.0),
        fat=data.get('fat', 0.0)
    )
    db.session.add(meal)
    db.session.commit()

    return jsonify({
        'message': 'Meal added successfully',
        'meal': {
            'id': meal.id,
            'name': meal.name,
            'meal_type': meal.meal_type,
            'calories': meal.calories,
            'protein': meal.protein,
            'carbs': meal.carbs,
            'fat': meal.fat
        }
    }), 201

@gym_bp.route('/meal/<meal_id>', methods=['DELETE'])
@jwt_required()
def delete_meal(meal_id):
    current_user_id = get_jwt_identity()
    
    meal = GymMeal.query.join(GymDay).filter(GymMeal.id == meal_id, GymDay.user_id == current_user_id).first()
    if not meal:
        return jsonify({'message': 'Meal not found'}), 404

    db.session.delete(meal)
    db.session.commit()
    return jsonify({'message': 'Meal deleted successfully'}), 200

@gym_bp.route('/goal', methods=['GET'])
@jwt_required()
def get_gym_goal():
    current_user_id = get_jwt_identity()
    goal = GymGoal.query.filter_by(user_id=current_user_id).first()
    
    if not goal:
        goal = GymGoal(user_id=current_user_id)
        db.session.add(goal)
        db.session.commit()
        
    return jsonify({
        'target_water': goal.target_water,
        'target_protein': goal.target_protein,
        'target_calories': goal.target_calories,
        'target_pushups': goal.target_pushups,
        'target_pullups': goal.target_pullups,
        'target_squads': goal.target_squads,
        'target_workouts_per_week': goal.target_workouts_per_week
    }), 200

@gym_bp.route('/goal', methods=['POST'])
@jwt_required()
def update_gym_goal():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    goal = GymGoal.query.filter_by(user_id=current_user_id).first()
    if not goal:
        goal = GymGoal(user_id=current_user_id)
        db.session.add(goal)
        
    if 'target_water' in data:
        goal.target_water = data['target_water']
    if 'target_protein' in data:
        goal.target_protein = data['target_protein']
    if 'target_calories' in data:
        goal.target_calories = data['target_calories']
    if 'target_pushups' in data:
        goal.target_pushups = data['target_pushups']
    if 'target_pullups' in data:
        goal.target_pullups = data['target_pullups']
    if 'target_squads' in data:
        goal.target_squads = data['target_squads']
    if 'target_workouts_per_week' in data:
        goal.target_workouts_per_week = data['target_workouts_per_week']
        
    db.session.commit()
    return jsonify({'message': 'Goals updated successfully'}), 200

@gym_bp.route('/analytics/<range>', methods=['GET'])
@jwt_required()
def get_gym_analytics(range):
    current_user_id = get_jwt_identity()

    end_date = datetime.now()
    if range == 'week':
        start_date = end_date - timedelta(days=7)
    elif range == 'month':
        start_date = end_date - timedelta(days=30)
    else:
        return jsonify({'message': 'Invalid range'}), 400

    start_date_str = start_date.strftime('%Y-%m-%d')
    end_date_str = end_date.strftime('%Y-%m-%d')

    gym_days = GymDay.query.filter(
        GymDay.user_id == current_user_id,
        GymDay.date >= start_date_str,
        GymDay.date <= end_date_str
    ).order_by(GymDay.date.asc()).all()

    analytics = []
    for day in gym_days:
        total_calories = sum(m.calories for m in day.meals)
        total_protein = sum(m.protein for m in day.meals)
        total_carbs = sum(m.carbs for m in day.meals)
        total_fat = sum(m.fat for m in day.meals)

        analytics.append({
            'date': day.date,
            'weight': day.weight or 0,
            'water_glasses': day.water_glasses or 0,
            'pushups': day.pushups or 0,
            'pullups': day.pullups or 0,
            'squads': day.squads or 0,
            'calories_consumed': total_calories,
            'protein_consumed': total_protein,
            'carbs_consumed': total_carbs,
            'fat_consumed': total_fat,
            'workout_count': day.exercises.count()
        })

    return jsonify(analytics), 200
@gym_bp.route('/history', methods=['GET'])
@jwt_required()
def get_gym_history():
    current_user_id = get_jwt_identity()
    month = request.args.get('month', type=int)
    year = request.args.get('year', type=int)

    if not month or not year:
        return jsonify({'message': 'Month and year are required'}), 400

    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1) - timedelta(days=1)
    else:
        end_date = datetime(year, month + 1, 1) - timedelta(days=1)

    start_date_str = start_date.strftime('%Y-%m-%d')
    end_date_str = end_date.strftime('%Y-%m-%d')

    gym_days = GymDay.query.filter(
        GymDay.user_id == current_user_id,
        GymDay.date >= start_date_str,
        GymDay.date <= end_date_str
    ).order_by(GymDay.date.asc()).all()

    history = []
    for day in gym_days:
        total_calories = sum(m.calories or 0 for m in day.meals)
        total_protein = sum(m.protein or 0 for m in day.meals)

        history.append({
            'date': day.date,
            'weight': day.weight or 0,
            'water_glasses': day.water_glasses or 0,
            'pushups': day.pushups or 0,
            'pullups': day.pullups or 0,
            'squads': day.squads or 0,
            'calories_consumed': total_calories,
            'protein_consumed': total_protein,
            'workout_count': day.exercises.count()
        })

    return jsonify(history), 200
