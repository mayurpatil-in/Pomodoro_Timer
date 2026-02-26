import uuid
from datetime import datetime, timezone
from app import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    daily_goal = db.Column(db.Integer, default=8, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    tasks = db.relationship('Task', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    sessions = db.relationship('PomodoroSession', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Task(db.Model):
    __tablename__ = 'tasks'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    priority = db.Column(db.String(10), default='medium', nullable=False)  # 'low', 'medium', 'high'
    is_completed = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


class PomodoroSession(db.Model):
    __tablename__ = 'pomodoro_sessions'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    duration_seconds = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(20), nullable=False) # 'pomodoro', 'shortBreak', 'longBreak'
    completed_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)


class DailyRoutine(db.Model):
    __tablename__ = 'daily_routines'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.String(10), nullable=False, index=True)  # YYYY-MM-DD
    entries = db.Column(db.Text, nullable=False, default='[]')   # JSON list of slot entries
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (db.UniqueConstraint('user_id', 'date', name='uq_user_date'),)


class RoutineTemplate(db.Model):
    __tablename__ = 'routine_templates'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    entries = db.Column(db.Text, nullable=False, default='[]')   # JSON list of slot entries
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
