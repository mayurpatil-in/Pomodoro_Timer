from marshmallow import Schema, fields

class UserSchema(Schema):
    id = fields.String(dump_only=True)
    email = fields.Email(required=True)
    daily_goal = fields.Integer()
    role = fields.String()
    subscription_plan = fields.String()
    is_active = fields.Boolean()
    created_at = fields.DateTime(dump_only=True)

class TaskSchema(Schema):
    id = fields.String(dump_only=True)
    title = fields.String(required=True)
    priority = fields.String()
    is_completed = fields.Boolean()
    created_at = fields.DateTime(dump_only=True)

class PomodoroSessionSchema(Schema):
    id = fields.String(dump_only=True)
    duration_seconds = fields.Integer(required=True)
    type = fields.String(required=True)
    project_id = fields.String(allow_none=True)
    project_task_id = fields.String(allow_none=True)
    completed_at = fields.DateTime(dump_only=True)

user_schema = UserSchema()
task_schema = TaskSchema()
tasks_schema = TaskSchema(many=True)
session_schema = PomodoroSessionSchema()
sessions_schema = PomodoroSessionSchema(many=True)
