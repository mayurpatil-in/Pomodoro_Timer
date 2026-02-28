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
    from app.routes.admin import admin_bp
    from app.routes.gym import gym_bp
    from app.routes.projects import projects_bp
    from app.routes.interviews import interviews_bp
    from app.routes.goals import goals_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.calendar import calendar_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(tasks_bp, url_prefix='/api/tasks')
    app.register_blueprint(sessions_bp, url_prefix='/api/sessions')
    app.register_blueprint(routines_bp, url_prefix='/api/routines')
    app.register_blueprint(money_bp, url_prefix='/api/money')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(gym_bp, url_prefix='/api/gym')
    app.register_blueprint(projects_bp, url_prefix='/api/projects')
    app.register_blueprint(interviews_bp, url_prefix='/api/interviews')
    app.register_blueprint(goals_bp, url_prefix='/api/goals')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(calendar_bp, url_prefix='/api/calendar')

    # Static file serving for uploads
    import os
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
        os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'goals'))

    from flask import send_from_directory
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Health check route
    @app.route('/health')
    def health_check():
        return {'status': 'ok'}, 200

    # Catch-all route for the React Frontend
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def catch_all(path):
        from flask import send_file
        import os
        
        # In a production environment (Webhostmost / Apache), this serves the React index.html
        # Path: domains/api.mayurpatil.in/public_html/index.html
        # The backend usually lives in domains/api.mayurpatil.in/pomodoro_backend/app
        frontend_index = os.path.abspath(os.path.join(app.root_path, '..', '..', 'public_html', 'index.html'))
        
        # Robust fallback for development or misconfigured ambientes (e.g., missing index.html)
        if os.path.exists(frontend_index):
            return send_file(frontend_index)

        # Log for server-side debugging if needed (could Use app.logger.error here)
        print(f"Frontend build not found at: {frontend_index}")
        
        if path.startswith('api/'):
            return {'message': f'API endpoint /{path} not found'}, 404
            
        return f"Backend is running. Frontend build (index.html) was not found at expected location: {frontend_index}. If you are in development, ensure you are accessing the frontend via the dev server (e.g. port 5173).", 404

    return app
