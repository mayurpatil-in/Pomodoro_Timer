from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app.models import (
    GymDay, GymExercise, GymMeal, GymGoal, 
    GymWorkoutTemplate, GymTemplateExercise, 
    GymBodyMeasurement, GymPersonalRecord, GymProgressPhoto
)
from app import db
from datetime import datetime, timedelta
import json
import os
import uuid

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
    
    def safe_float(val):
        if val is None or (isinstance(val, str) and val.strip() == ""):
            return None
        try:
            return float(val)
        except (ValueError, TypeError):
            return None

    if 'weight' in data:
        gym_day.weight = safe_float(data['weight'])
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
    
    def safe_num(val, default, type_func=float):
        if val is None or (isinstance(val, str) and val.strip() == ""):
            return default
        try:
            return type_func(val)
        except (ValueError, TypeError):
            raise ValueError

    try:
        weight = safe_num(data.get('weight'), 0.0, float)
        sets = safe_num(data.get('sets'), 1, int)
        reps = safe_num(data.get('reps'), 1, int)
    except ValueError:
        return jsonify({'message': 'Invalid input types for weight, sets, or reps'}), 400

    exercise = GymExercise(
        gym_day_id=gym_day.id,
        name=data.get('name', 'Unknown Exercise'),
        muscle_group=data.get('muscle_group', 'Other'),
        sets=sets,
        reps=reps,
        weight=weight
    )
    db.session.add(exercise)
    db.session.flush()

    # check for PR
    name = exercise.name.strip()
    weight = exercise.weight
    reps = exercise.reps

    pr = GymPersonalRecord.query.filter_by(user_id=current_user_id, exercise_name=name).first()
    is_new_pr = False
    if not pr:
        pr = GymPersonalRecord(user_id=current_user_id, exercise_name=name, max_weight=weight, max_reps=reps, achieved_at=date)
        db.session.add(pr)
        is_new_pr = True
    else:
        # Simple PR logic: more weight, or same weight with more reps
        if weight > pr.max_weight or (weight == pr.max_weight and reps > pr.max_reps):
            pr.max_weight = weight
            pr.max_reps = reps
            pr.achieved_at = date
            is_new_pr = True

    db.session.commit()

    return jsonify({
        'message': 'Exercise added successfully',
        'is_new_pr': is_new_pr,
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

@gym_bp.route('/templates/<template_id>', methods=['DELETE'])
@jwt_required()
def delete_template(template_id):
    user_id = get_jwt_identity()
    template = GymWorkoutTemplate.query.filter_by(id=template_id, user_id=user_id).first()
    if not template:
        return jsonify({'message': 'Template not found'}), 404
    
    # GymTemplateExercise has cascade delete in many setups, but let's be safe
    GymTemplateExercise.query.filter_by(template_id=template.id).delete()
    db.session.delete(template)
    db.session.commit()
    return jsonify({'message': 'Template deleted successfully'}), 200

@gym_bp.route('/measurements/<measurement_id>', methods=['DELETE'])
@jwt_required()
def delete_measurement(measurement_id):
    user_id = get_jwt_identity()
    m = GymBodyMeasurement.query.filter_by(id=measurement_id, user_id=user_id).first()
    if not m:
        return jsonify({'message': 'Measurement not found'}), 404
    db.session.delete(m)
    db.session.commit()
    return jsonify({'message': 'Measurement deleted successfully'}), 200

@gym_bp.route('/photos/<photo_id>', methods=['DELETE'])
@jwt_required()
def delete_photo(photo_id):
    user_id = get_jwt_identity()
    photo = GymProgressPhoto.query.filter_by(id=photo_id, user_id=user_id).first()
    if not photo:
        return jsonify({'message': 'Photo not found'}), 404
    
    # Optionally delete the file from disk
    try:
        if photo.image_url.startswith('/uploads/'):
            # Convert /uploads/gym/filename to absolute path
            relative_path = photo.image_url.lstrip('/')
            file_path = os.path.join(current_app.root_path, '..', relative_path)
            if os.path.exists(file_path):
                os.remove(file_path)
    except Exception as e:
        print(f"Error deleting file: {e}")

    db.session.delete(photo)
    db.session.commit()
    return jsonify({'message': 'Photo deleted successfully'}), 200

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

    try:
        analytics = []
        for day in gym_days:
            total_calories = sum((m.calories or 0) for m in day.meals)
            total_protein = sum((m.protein or 0) for m in day.meals)
            total_carbs = sum((m.carbs or 0) for m in day.meals)
            total_fat = sum((m.fat or 0) for m in day.meals)

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
                'workout_count': day.exercises.count() if hasattr(day.exercises, 'count') else len(day.exercises),
                'muscles': [e.muscle_group for e in (day.exercises.all() if hasattr(day.exercises, 'all') else day.exercises) if e.muscle_group]
            })

        return jsonify(analytics), 200
    except Exception as e:
        return jsonify({'message': f'Server Error: {str(e)}'}), 500
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

# ── Workout Templates ────────────────────────────────────────────────────────

@gym_bp.route('/templates', methods=['GET'])
@jwt_required()
def get_templates():
    try:
        user_id = get_jwt_identity()
        templates = GymWorkoutTemplate.query.filter_by(user_id=user_id).all()
        
        result = []
        for t in templates:
            result.append({
                'id': t.id,
                'name': t.name,
                'exercises': [{'name': e.name, 'muscle_group': e.muscle_group, 'sets': e.sets, 'reps': e.reps, 'weight': e.weight} for e in t.exercises]
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': f'Server Error: {str(e)}'}), 500

@gym_bp.route('/templates', methods=['POST'])
@jwt_required()
def create_template():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    name = data.get('name')
    exercises_data = data.get('exercises', [])
    
    if not name:
        return jsonify({'message': 'Template name is required'}), 400
        
    template = GymWorkoutTemplate(user_id=user_id, name=name)
    db.session.add(template)
    db.session.flush() # Get template ID
    
    def safe_num(val, default, type_func=float):
        if val is None or (isinstance(val, str) and val.strip() == ""):
            return default
        try:
            return type_func(val)
        except (ValueError, TypeError):
            return default

    for ex in exercises_data:
        ex_sets = safe_num(ex.get('sets'), 1, int)
        ex_reps = safe_num(ex.get('reps'), 1, int)
        ex_weight = safe_num(ex.get('weight'), 0.0, float)

        t_ex = GymTemplateExercise(
            template_id=template.id,
            name=ex.get('name'),
            muscle_group=ex.get('muscle_group'),
            sets=ex_sets,
            reps=ex_reps,
            weight=ex_weight
        )
        db.session.add(t_ex)
    
    db.session.commit()
    return jsonify({'message': 'Template created successfully', 'id': template.id}), 201

@gym_bp.route('/templates/<id>/apply', methods=['POST'])
@jwt_required()
def apply_template(id):
    user_id = get_jwt_identity()
    data = request.get_json()
    date = data.get('date')
    
    if not date:
        return jsonify({'message': 'Date is required'}), 400
        
    template = GymWorkoutTemplate.query.filter_by(id=id, user_id=user_id).first()
    if not template:
        return jsonify({'message': 'Template not found'}), 404
        
    gym_day = GymDay.query.filter_by(user_id=user_id, date=date).first()
    if not gym_day:
        gym_day = GymDay(user_id=user_id, date=date)
        db.session.add(gym_day)
        db.session.commit()
        
    for ex in template.exercises:
        new_ex = GymExercise(
            gym_day_id=gym_day.id,
            name=ex.name,
            muscle_group=ex.muscle_group,
            sets=ex.sets,
            reps=ex.reps,
            weight=ex.weight
        )
        db.session.add(new_ex)
        
    db.session.commit()
    return jsonify({'message': 'Template applied successfully'}), 200

# ── Body Measurements ─────────────────────────────────────────────────────────

@gym_bp.route('/measurements', methods=['GET'])
@jwt_required()
def get_measurements():
    try:
        user_id = get_jwt_identity()
        measurements = GymBodyMeasurement.query.filter_by(user_id=user_id).order_by(GymBodyMeasurement.date.desc()).all()
        
        result = []
        for m in measurements:
            result.append({
                'id': m.id,
                'date': m.date,
                'weight': m.weight,
                'height': m.height,
                'bmi': m.bmi,
                'body_fat': m.body_fat,
                'neck': m.neck,
                'chest': m.chest,
                'waist': m.waist,
                'hips': m.hips
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': f'Server Error: {str(e)}'}), 500

@gym_bp.route('/measurements', methods=['POST'])
@jwt_required()
def save_measurement():
    user_id = get_jwt_identity()
    data = request.get_json()
    date = data.get('date')
    
    if not date:
        return jsonify({'message': 'Date is required'}), 400
        
    m = GymBodyMeasurement.query.filter_by(user_id=user_id, date=date).first()
    if not m:
        m = GymBodyMeasurement(user_id=user_id, date=date)
        db.session.add(m)
        
    def safe_float(val):
        if val is None or (isinstance(val, str) and val.strip() == ""):
            return None
        try:
            return float(val)
        except (ValueError, TypeError):
            raise ValueError

    try:
        weight = safe_float(data.get('weight'))
        height = safe_float(data.get('height'))
        body_fat = safe_float(data.get('body_fat'))
        neck = safe_float(data.get('neck'))
        chest = safe_float(data.get('chest'))
        waist = safe_float(data.get('waist'))
        hips = safe_float(data.get('hips'))
        
        if weight is not None: m.weight = weight
        if height is not None: m.height = height
        if body_fat is not None: m.body_fat = body_fat
        if neck is not None: m.neck = neck
        if chest is not None: m.chest = chest
        if waist is not None: m.waist = waist
        if hips is not None: m.hips = hips
    except ValueError:
        return jsonify({'message': 'Invalid numeric value in measurements'}), 400
    
    # Calculate BMI if height and weight exist
    if m.height and m.weight:
        height_m = m.height / 100
        m.bmi = round(m.weight / (height_m * height_m), 1)
        
    db.session.commit()
    return jsonify({'message': 'Measurements saved successfully'}), 200

# ── Personal Records ───────────────────────────────────────────────────────────

@gym_bp.route('/prs', methods=['GET'])
@jwt_required()
def get_prs():
    try:
        user_id = get_jwt_identity()
        prs = GymPersonalRecord.query.filter_by(user_id=user_id).all()
        
        result = []
        for pr in prs:
            result.append({
                'id': pr.id,
                'exercise_name': pr.exercise_name,
                'max_weight': pr.max_weight,
                'max_reps': pr.max_reps,
                'achieved_at': pr.achieved_at
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': f'Server Error: {str(e)}'}), 500

# ── Progress Photos ───────────────────────────────────────────────────────────

@gym_bp.route('/photos', methods=['GET'])
@jwt_required()
def get_photos():
    try:
        user_id = get_jwt_identity()
        photos = GymProgressPhoto.query.filter_by(user_id=user_id).order_by(GymProgressPhoto.date.desc()).all()
        return jsonify([{ 'id': p.id, 'date': p.date, 'image_url': p.image_url, 'notes': p.notes } for p in photos]), 200
    except Exception as e:
        return jsonify({'message': f'Server Error: {str(e)}'}), 500

@gym_bp.route('/photos', methods=['POST'])
@jwt_required()
def add_photo():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    new_photo = GymProgressPhoto(
        user_id=user_id,
        date=data.get('date'),
        image_url=data.get('image_url'),
        notes=data.get('notes')
    )
    db.session.add(new_photo)
    db.session.commit()
    return jsonify({'message': 'Photo added successfully'}), 201
@gym_bp.route('/photos/upload', methods=['POST'])
@jwt_required()
def upload_photo_file():
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    
    if file:
        filename = secure_filename(file.filename)
        ext = os.path.splitext(filename)[1]
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        
        target_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'gym')
        if not os.path.exists(target_dir):
            os.makedirs(target_dir)
            
        file_path = os.path.join(target_dir, unique_filename)
        file.save(file_path)
        
        file_url = f"/uploads/gym/{unique_filename}"
        return jsonify({'image_url': file_url}), 200
    
    return jsonify({'message': 'File upload failed'}), 400
