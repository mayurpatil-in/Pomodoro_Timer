from functools import wraps
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from flask import jsonify

def admin_required():
    """Example custom decorator if we ever add an admin role."""
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt_identity() # Normally this is just the user id
            # If we wanted claims, we'd check them here
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def error_response(status_code, message):
    return jsonify({'error': message}), status_code
