from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, InterviewApplication
from datetime import datetime, timezone
import json

interviews_bp = Blueprint('interviews', __name__)

@interviews_bp.route('/', methods=['GET'])
@jwt_required()
def get_interviews():
    user_id = get_jwt_identity()
    applications = InterviewApplication.query.filter_by(user_id=user_id).order_by(InterviewApplication.created_at.desc()).all()
    
    result = []
    for app in applications:
        result.append({
            'id': app.id,
            'company_name': app.company_name,
            'role': app.role,
            'company_phone': app.company_phone,
            'company_email': app.company_email,
            'expected_ctc': app.expected_ctc,
            'current_ctc': app.current_ctc,
            'stage': app.stage,
            'applied_date': app.applied_date.isoformat() if app.applied_date else None,
            'interview_date': app.interview_date.isoformat() if app.interview_date else None,
            'location_type': app.location_type,
            'referral': app.referral,
            'job_description': app.job_description,
            'job_portal_url': app.job_portal_url,
            'job_portal_username': app.job_portal_username,
            'job_portal_password': app.job_portal_password,
            'application_source': app.application_source,
            'resume_version': app.resume_version,
            'interviewers': json.loads(app.interviewers) if app.interviewers else [],
            'notes': app.notes,
            'questions': json.loads(app.questions) if app.questions else [],
            'created_at': app.created_at.isoformat() if app.created_at else None,
            'updated_at': app.updated_at.isoformat() if app.updated_at else None
        })
    return jsonify(result), 200

@interviews_bp.route('/kpis', methods=['GET'])
@jwt_required()
def get_kpis():
    user_id = get_jwt_identity()
    applications = InterviewApplication.query.filter_by(user_id=user_id).all()
    
    total = len(applications)
    scheduled = sum(1 for app in applications if app.interview_date is not None and app.stage not in ['Rejected', 'Offer'])
    offers = sum(1 for app in applications if app.stage == 'Offer')
    rejected = sum(1 for app in applications if app.stage == 'Rejected')
    
    return jsonify({
        'total': total,
        'scheduled': scheduled,
        'offers': offers,
        'rejected': rejected
    }), 200

@interviews_bp.route('/', methods=['POST'])
@jwt_required()
def create_interview():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    applied_date = None
    if data.get('applied_date'):
        try:
            applied_date_str = data.get('applied_date')
            if 'T' in applied_date_str:
                applied_date = datetime.fromisoformat(applied_date_str.replace('Z', '+00:00'))
            else:
                applied_date = datetime.strptime(applied_date_str, '%Y-%m-%d')
        except ValueError:
            pass

    interview_date = None
    if data.get('interview_date'):
        try:
            # Handle possible datetime parsing if providing from frontend
            # Assuming YYYY-MM-DD or ISO string
            interview_date_str = data.get('interview_date')
            if 'T' in interview_date_str:
                interview_date = datetime.fromisoformat(interview_date_str.replace('Z', '+00:00'))
            else:
                interview_date = datetime.strptime(interview_date_str, '%Y-%m-%d')
        except ValueError:
            pass

    questions = data.get('questions', [])
    try:
        questions_str = json.dumps(questions)
    except Exception:
        questions_str = '[]'
        
    interviewers = data.get('interviewers', [])
    try:
        interviewers_str = json.dumps(interviewers)
    except Exception:
        interviewers_str = '[]'
        
    new_app = InterviewApplication(
        user_id=user_id,
        company_name=data.get('company_name'),
        role=data.get('role'),
        company_phone=data.get('company_phone'),
        company_email=data.get('company_email'),
        expected_ctc=data.get('expected_ctc'),
        current_ctc=data.get('current_ctc'),
        stage=data.get('stage', 'Applied'),
        applied_date=applied_date,
        interview_date=interview_date,
        location_type=data.get('location_type'),
        referral=data.get('referral', 'No'),
        job_description=data.get('job_description'),
        job_portal_url=data.get('job_portal_url'),
        job_portal_username=data.get('job_portal_username'),
        job_portal_password=data.get('job_portal_password'),
        application_source=data.get('application_source', 'Company Website'),
        resume_version=data.get('resume_version'),
        interviewers=interviewers_str,
        notes=data.get('notes'),
        questions=questions_str
    )
    
    db.session.add(new_app)
    db.session.commit()
    
    return jsonify({
        'message': 'Interview application created successfully',
        'id': new_app.id
    }), 201

@interviews_bp.route('/<app_id>', methods=['PUT'])
@jwt_required()
def update_interview(app_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    app = InterviewApplication.query.filter_by(id=app_id, user_id=user_id).first()
    if not app:
        return jsonify({'message': 'Application not found'}), 404
        
    if 'company_name' in data: app.company_name = data['company_name']
    if 'role' in data: app.role = data['role']
    if 'company_phone' in data: app.company_phone = data['company_phone']
    if 'company_email' in data: app.company_email = data['company_email']
    if 'expected_ctc' in data: app.expected_ctc = data['expected_ctc']
    if 'current_ctc' in data: app.current_ctc = data['current_ctc']
    if 'stage' in data: app.stage = data['stage']
    if 'location_type' in data: app.location_type = data['location_type']
    if 'referral' in data: app.referral = data['referral']
    if 'job_description' in data: app.job_description = data['job_description']
    if 'job_portal_url' in data: app.job_portal_url = data['job_portal_url']
    if 'job_portal_username' in data: app.job_portal_username = data['job_portal_username']
    if 'job_portal_password' in data: app.job_portal_password = data['job_portal_password']
    if 'application_source' in data: app.application_source = data['application_source']
    if 'resume_version' in data: app.resume_version = data['resume_version']
    if 'notes' in data: app.notes = data['notes']
    
    if 'interviewers' in data:
        try:
            app.interviewers = json.dumps(data['interviewers'])
        except Exception:
            pass
    
    if 'questions' in data:
        try:
            app.questions = json.dumps(data['questions'])
        except Exception:
            pass
            
    if 'applied_date' in data:
        applied_date_str = data.get('applied_date')
        if not applied_date_str:
             app.applied_date = None
        else:
            try:
                if 'T' in applied_date_str:
                    app.applied_date = datetime.fromisoformat(applied_date_str.replace('Z', '+00:00'))
                else:
                     app.applied_date = datetime.strptime(applied_date_str, '%Y-%m-%d')
            except ValueError:
                 pass
                 
    if 'interview_date' in data:
        interview_date_str = data.get('interview_date')
        if not interview_date_str:
             app.interview_date = None
        else:
            try:
                if 'T' in interview_date_str:
                    app.interview_date = datetime.fromisoformat(interview_date_str.replace('Z', '+00:00'))
                else:
                     app.interview_date = datetime.strptime(interview_date_str, '%Y-%m-%d')
            except ValueError:
                 pass
                 
    db.session.commit()
    return jsonify({'message': 'Application updated successfully'}), 200

@interviews_bp.route('/<app_id>', methods=['DELETE'])
@jwt_required()
def delete_interview(app_id):
    user_id = get_jwt_identity()
    app = InterviewApplication.query.filter_by(id=app_id, user_id=user_id).first()
    
    if not app:
        return jsonify({'message': 'Application not found'}), 404
        
    db.session.delete(app)
    db.session.commit()
    return jsonify({'message': 'Application deleted successfully'}), 200
