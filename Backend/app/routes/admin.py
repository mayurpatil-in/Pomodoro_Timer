from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User
from app.schemas import user_schema, UserSchema
from app.utils import error_response

admin_bp = Blueprint('admin', __name__)
users_schema = UserSchema(many=True)

def require_admin(f):
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or user.role not in ['admin', 'superadmin']:
            return error_response(403, 'Admin privileges required.')
        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@require_admin
def get_users():
    users = User.query.all()
    return jsonify(users_schema.dump(users)), 200

@admin_bp.route('/users', methods=['POST'])
@jwt_required()
@require_admin
def create_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'user')
    subscription_plan = data.get('subscription_plan', 'free')

    if not email or not password:
        return error_response(400, 'Email and password are required.')

    if User.query.filter_by(email=email).first():
        return error_response(400, 'Email already registered.')

    user = User(email=email, role=role, subscription_plan=subscription_plan)
    user.set_password(password)
    
    db.session.add(user)
    db.session.commit()

    return jsonify({
        'message': 'User created successfully',
        'user': user_schema.dump(user)
    }), 201

@admin_bp.route('/users/<user_id>', methods=['PUT'])
@jwt_required()
@require_admin
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return error_response(404, 'User not found.')

    data = request.get_json()
    if 'role' in data:
        user.role = data['role']
    if 'subscription_plan' in data:
        user.subscription_plan = data['subscription_plan']
    if 'is_active' in data:
        user.is_active = data['is_active']
        
    db.session.commit()
    return jsonify({
        'message': 'User updated successfully',
        'user': user_schema.dump(user)
    }), 200

@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@jwt_required()
@require_admin
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return error_response(404, 'User not found.')

    # Prevent admin from deleting themselves
    if str(user.id) == str(current_user_id):
        return error_response(400, 'You cannot delete your own account.')

    # If the user being deleted is a superadmin, only a superadmin can delete them
    current_admin = User.query.get(current_user_id)
    if user.role == 'superadmin' and current_admin.role != 'superadmin':
        return error_response(403, 'Only Superadmins can delete other Superadmins.')

    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': 'User deleted successfully'}), 200
