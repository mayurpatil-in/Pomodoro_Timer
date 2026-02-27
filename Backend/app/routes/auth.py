from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db, limiter
from app.models import User
from app.schemas import user_schema
from app.utils import error_response

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return error_response(400, 'Email and password are required.')

    if User.query.filter_by(email=email).first():
        return error_response(400, 'Email already registered.')

    user = User(email=email)
    user.set_password(password)
    
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=user.id)
    return jsonify({
        'message': 'User registered successfully',
        'token': access_token,
        'user': user_schema.dump(user)
    }), 201

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
