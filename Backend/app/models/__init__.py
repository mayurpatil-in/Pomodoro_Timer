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
    role = db.Column(db.String(20), default='user', nullable=False) # 'user', 'admin', 'superadmin'
    subscription_plan = db.Column(db.String(50), default='free', nullable=False) # 'free', 'pro', etc.
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    dashboard_preferences = db.Column(db.Text, default='[]') # JSON array of widget layout orders/visibility
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    tasks = db.relationship('Task', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    sessions = db.relationship('PomodoroSession', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    credit_cards = db.relationship('CreditCard', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    transactions = db.relationship('MoneyTransaction', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    assets = db.relationship('AssetAllocation', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    lending_records = db.relationship('LendingRecord', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    gym_days = db.relationship('GymDay', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    projects = db.relationship('Project', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    interview_applications = db.relationship('InterviewApplication', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    goals = db.relationship('Goal', backref='user', lazy='dynamic', cascade='all, delete-orphan')

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
    project_id = db.Column(db.String(36), db.ForeignKey('projects.id'), nullable=True)
    project_task_id = db.Column(db.String(36), db.ForeignKey('project_tasks.id'), nullable=True)
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
    total_spend = db.Column(db.Float, nullable=False, default=0.0)
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

class GymDay(db.Model):
    __tablename__ = 'gym_days'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.String(20), nullable=False) # YYYY-MM-DD
    weight = db.Column(db.Float, nullable=True) # in kg or lbs
    water_glasses = db.Column(db.Integer, nullable=True, default=0)
    pushups = db.Column(db.Integer, nullable=True, default=0)
    pullups = db.Column(db.Integer, nullable=True, default=0)
    squads = db.Column(db.Integer, nullable=True, default=0)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (db.UniqueConstraint('user_id', 'date', name='uq_user_gym_date'),)

    exercises = db.relationship('GymExercise', backref='gym_day', lazy='dynamic', cascade='all, delete-orphan')
    meals = db.relationship('GymMeal', backref='gym_day', lazy='dynamic', cascade='all, delete-orphan')

class GymExercise(db.Model):
    __tablename__ = 'gym_exercises'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    gym_day_id = db.Column(db.String(36), db.ForeignKey('gym_days.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    muscle_group = db.Column(db.String(50), nullable=True) # Chest, Back, Legs, etc.
    sets = db.Column(db.Integer, nullable=False, default=1)
    reps = db.Column(db.Integer, nullable=False, default=1)
    weight = db.Column(db.Float, nullable=False, default=0.0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

class GymMeal(db.Model):
    __tablename__ = 'gym_meals'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    gym_day_id = db.Column(db.String(36), db.ForeignKey('gym_days.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    meal_type = db.Column(db.String(50), nullable=False) # 'Breakfast', 'Lunch', 'Dinner', 'Snack'
    calories = db.Column(db.Integer, nullable=False, default=0)
    protein = db.Column(db.Float, nullable=False, default=0.0)
    carbs = db.Column(db.Float, nullable=False, default=0.0)
    fat = db.Column(db.Float, nullable=False, default=0.0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

class GymGoal(db.Model):
    __tablename__ = 'gym_goals'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, unique=True)
    target_water = db.Column(db.Integer, nullable=False, default=8)
    target_protein = db.Column(db.Float, nullable=False, default=150.0)
    target_calories = db.Column(db.Integer, nullable=False, default=2500)
    target_pushups = db.Column(db.Integer, nullable=False, default=0)
    target_pullups = db.Column(db.Integer, nullable=False, default=0)
    target_squads = db.Column(db.Integer, nullable=False, default=0)
    target_workouts_per_week = db.Column(db.Integer, nullable=False, default=3)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

class GymWorkoutTemplate(db.Model):
    __tablename__ = 'gym_workout_templates'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    exercises = db.relationship('GymTemplateExercise', backref='template', lazy='dynamic', cascade='all, delete-orphan')

class GymTemplateExercise(db.Model):
    __tablename__ = 'gym_template_exercises'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    template_id = db.Column(db.String(36), db.ForeignKey('gym_workout_templates.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    muscle_group = db.Column(db.String(50), nullable=True)
    sets = db.Column(db.Integer, nullable=False, default=1)
    reps = db.Column(db.Integer, nullable=False, default=1)
    weight = db.Column(db.Float, nullable=False, default=0.0)

class GymBodyMeasurement(db.Model):
    __tablename__ = 'gym_body_measurements'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.String(20), nullable=False)  # YYYY-MM-DD
    weight = db.Column(db.Float, nullable=True)
    height = db.Column(db.Float, nullable=True)  # in cm
    bmi = db.Column(db.Float, nullable=True)
    body_fat = db.Column(db.Float, nullable=True)
    neck = db.Column(db.Float, nullable=True)
    chest = db.Column(db.Float, nullable=True)
    waist = db.Column(db.Float, nullable=True)
    hips = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    __table_args__ = (db.UniqueConstraint('user_id', 'date', name='uq_user_measurement_date'),)

class GymPersonalRecord(db.Model):
    __tablename__ = 'gym_personal_records'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    exercise_name = db.Column(db.String(255), nullable=False)
    max_weight = db.Column(db.Float, nullable=False, default=0.0)
    max_reps = db.Column(db.Integer, nullable=False, default=1)
    achieved_at = db.Column(db.String(20), nullable=False)  # YYYY-MM-DD
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

class GymProgressPhoto(db.Model):
    __tablename__ = 'gym_progress_photos'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.String(20), nullable=False)  # YYYY-MM-DD
    image_url = db.Column(db.String(500), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


class Project(db.Model):
    __tablename__ = 'projects'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(100), nullable=True)
    archived = db.Column(db.Boolean, default=False, nullable=False)
    status = db.Column(db.String(20), default='backlog', nullable=False) # 'backlog', 'in-progress', 'review', 'completed'
    priority = db.Column(db.String(20), default='medium', nullable=False) # 'low', 'medium', 'high'
    due_date = db.Column(db.DateTime, nullable=True)
    notes = db.Column(db.Text, nullable=True, default='')
    color = db.Column(db.String(20), nullable=True)  # e.g. '#6366f1'
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    tasks = db.relationship('ProjectTask', backref='project', lazy='dynamic', cascade='all, delete-orphan')
    sessions = db.relationship('PomodoroSession', backref='project', lazy='dynamic')

class ProjectTask(db.Model):
    __tablename__ = 'project_tasks'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = db.Column(db.String(36), db.ForeignKey('projects.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    priority = db.Column(db.String(20), default='medium', nullable=False) # 'low', 'medium', 'high'
    due_date = db.Column(db.DateTime, nullable=True)
    is_completed = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    sessions = db.relationship('PomodoroSession', backref='project_task', lazy='dynamic')


class ProjectActivity(db.Model):
    __tablename__ = 'project_activities'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = db.Column(db.String(36), db.ForeignKey('projects.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # 'status_change','task_added','task_completed','focus_session'
    message = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)

class InterviewApplication(db.Model):
    __tablename__ = 'interview_applications'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    company_name = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(255), nullable=False)
    company_phone = db.Column(db.String(50), nullable=True)
    company_email = db.Column(db.String(255), nullable=True)
    expected_ctc = db.Column(db.String(100), nullable=True)
    current_ctc = db.Column(db.String(100), nullable=True)
    stage = db.Column(db.String(50), nullable=False, default='Applied') # Applied, HR Round, Technical Round, Final Round, Offer, Rejected
    applied_date = db.Column(db.DateTime, nullable=True)
    interview_date = db.Column(db.DateTime, nullable=True)
    location_type = db.Column(db.String(50), nullable=True) # Remote, Onsite, Hybrid
    referral = db.Column(db.String(10), nullable=True, default='No') # Yes, No
    job_description = db.Column(db.Text, nullable=True)
    job_portal_url = db.Column(db.String(255), nullable=True)
    job_portal_username = db.Column(db.String(255), nullable=True)
    job_portal_password = db.Column(db.String(255), nullable=True)
    application_source = db.Column(db.String(100), nullable=True, default='Company Website')
    resume_version = db.Column(db.String(255), nullable=True)
    interviewers = db.Column(db.Text, nullable=False, default='[]') # JSON text: [{name, role, linkedin}]
    notes = db.Column(db.Text, nullable=True)
    questions = db.Column(db.Text, nullable=False, default='[]') # JSON text for storing questions per round
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


# Join table for goal dependencies
goal_dependencies = db.Table('goal_dependencies',
    db.Column('goal_id', db.String(36), db.ForeignKey('goals.id'), primary_key=True),
    db.Column('depends_on_id', db.String(36), db.ForeignKey('goals.id'), primary_key=True)
)

class Goal(db.Model):
    __tablename__ = 'goals'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(10), nullable=False, default='short')  # 'short' or 'long'
    title = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text, nullable=True, default='')
    deadline = db.Column(db.String(20), nullable=True)   # YYYY-MM-DD
    priority = db.Column(db.String(10), nullable=False, default='medium')  # 'low', 'medium', 'high'
    status = db.Column(db.String(20), nullable=False, default='todo')  # 'todo', 'inprogress', 'done'
    category = db.Column(db.String(100), nullable=True)
    color = db.Column(db.String(50), nullable=True)
    is_archived = db.Column(db.Boolean, nullable=False, default=False)
    is_pinned = db.Column(db.Boolean, nullable=False, default=False)
    notes = db.Column(db.Text, nullable=True, default='')
    order = db.Column(db.Integer, nullable=False, default=0)
    recurrence = db.Column(db.String(20), nullable=True) # e.g., 'daily', 'weekly', 'monthly'
    streak_count = db.Column(db.Integer, nullable=False, default=0)
    last_streak_date = db.Column(db.String(20), nullable=True) # YYYY-MM-DD
    project_id = db.Column(db.String(36), db.ForeignKey('projects.id'), nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    completed_at = db.Column(db.DateTime, nullable=True)

    steps = db.relationship('GoalStep', backref='goal', lazy='dynamic', cascade='all, delete-orphan', order_by='GoalStep.created_at')
    
    dependencies = db.relationship(
        'Goal', 
        secondary=goal_dependencies,
        primaryjoin=(goal_dependencies.c.goal_id == id),
        secondaryjoin=(goal_dependencies.c.depends_on_id == id),
        backref=db.backref('depended_on_by', lazy='dynamic'),
        lazy='dynamic'
    )


class GoalStep(db.Model):
    __tablename__ = 'goal_steps'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    goal_id = db.Column(db.String(36), db.ForeignKey('goals.id'), nullable=False)
    text = db.Column(db.String(500), nullable=False)
    done = db.Column(db.Boolean, default=False, nullable=False)
    is_milestone = db.Column(db.Boolean, default=False, nullable=False)
    deadline = db.Column(db.String(20), nullable=True)   # YYYY-MM-DD
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = db.Column(db.DateTime, nullable=True)
