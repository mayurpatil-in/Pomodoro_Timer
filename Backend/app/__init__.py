from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from config import config

# Initialize extensions (unbound)
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
limiter = Limiter(key_func=get_remote_address)

def create_app(config_name='default'):
    """Application factory function."""
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Initialize extensions with the app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Configure Limiter
    limiter.init_app(app)
    
    # Enable CORS for the React frontend securely
    cors.init_app(app, resources={r"/api/*": {"origins": app.config.get('CORS_ORIGINS', '*')}})

    # Register blueprints (we will create these next)
    from app.routes.auth import auth_bp
    from app.routes.tasks import tasks_bp
    from app.routes.sessions import sessions_bp
    from app.routes.routines import routines_bp
    from app.routes.money import bp as money_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(tasks_bp, url_prefix='/api/tasks')
    app.register_blueprint(sessions_bp, url_prefix='/api/sessions')
    app.register_blueprint(routines_bp, url_prefix='/api/routines')
    app.register_blueprint(money_bp, url_prefix='/api/money')

    # Health check route
    @app.route('/health')
    def health_check():
        return {'status': 'ok'}, 200

    return app
