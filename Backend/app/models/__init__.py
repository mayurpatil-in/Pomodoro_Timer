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
    credit_cards = db.relationship('CreditCard', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    transactions = db.relationship('MoneyTransaction', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    assets = db.relationship('AssetAllocation', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    lending_records = db.relationship('LendingRecord', backref='user', lazy='dynamic', cascade='all, delete-orphan')

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

class CreditCard(db.Model):
    __tablename__ = 'credit_cards'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    limit = db.Column(db.Float, nullable=False, default=0.0)
    used = db.Column(db.Float, nullable=False, default=0.0)
    color = db.Column(db.String(100), nullable=False) # Store the tailwind gradient string
    due_date = db.Column(db.Integer, nullable=True) # Day of the month billing is due (1-31)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

class MoneyTransaction(db.Model):
    __tablename__ = 'money_transactions'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False) # income, expense, investment, lending, loan
    category = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.String(20), nullable=False) # YYYY-MM-DD
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

class AssetAllocation(db.Model):
    __tablename__ = 'asset_allocations'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False) # 'fixedDeposits', 'mutualFunds', 'stocks', 'lending'
    label = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False, default=0.0)
    color = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    __table_args__ = (db.UniqueConstraint('user_id', 'type', name='uq_user_asset_type'),)

class LendingRecord(db.Model):
    __tablename__ = 'lending_records'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    borrower = db.Column(db.String(255), nullable=False)  # Name of person who borrowed
    total_lent = db.Column(db.Float, nullable=False, default=0.0)
    returned = db.Column(db.Float, nullable=False, default=0.0)
    due_date = db.Column(db.String(20), nullable=True)  # YYYY-MM-DD
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    transactions = db.relationship('LendingTransaction', backref='lending_record', lazy='dynamic', cascade='all, delete-orphan')

class LendingTransaction(db.Model):
    __tablename__ = 'lending_transactions'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lending_id = db.Column(db.String(36), db.ForeignKey('lending_records.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(20), nullable=False)  # 'lend' or 'return'
    date = db.Column(db.String(20), nullable=False)  # YYYY-MM-DD
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
