from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db, limiter
from app.models import User
from app.schemas import user_schema
from app.utils import error_response

auth_bp = Blueprint('auth', __name__)



@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return error_response(401, 'Invalid email or password.')

    access_token = create_access_token(identity=user.id)
    return jsonify({
        'message': 'Login successful',
        'token': access_token,
        'user': user_schema.dump(user)
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return error_response(404, 'User not found.')

    return jsonify(user_schema.dump(user)), 200

@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return error_response(404, 'User not found.')

    data = request.get_json()
    if 'daily_goal' in data:
        user.daily_goal = int(data['daily_goal'])
        db.session.commit()

    return jsonify(user_schema.dump(user)), 200

@auth_bp.route('/password', methods=['PUT'])
@jwt_required()
def update_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return error_response(404, 'User not found.')

    data = request.get_json()
    current_password = data.get('current_password')
    new_password = data.get('new_password')

    if not current_password or not new_password:
        return error_response(400, 'Current and new passions are required.')

    if not user.check_password(current_password):
        return error_response(401, 'Incorrect current password.')
        
    if len(new_password) < 6:
        return error_response(400, 'New password must be at least 6 characters.')

    user.set_password(new_password)
    db.session.commit()

    return jsonify({'message': 'Password updated successfully'}), 200
