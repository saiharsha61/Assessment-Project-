import os
from flask import Blueprint, request, jsonify, send_file, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models import Resource, Tag, Feedback, User
from db import db

resources_bp = Blueprint('resources_bp', __name__, url_prefix='/resources')

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt', 'jpg', 'png'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@resources_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_resource():
    if 'file' not in request.files:
        return jsonify({'msg': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'msg': 'No selected file'}), 400
    if not allowed_file(file.filename):
        return jsonify({'msg': 'File type not allowed'}), 400
    
    data = request.form
    title = data.get('title')
    tags_str = data.get('tags', '')
    if not title:
        return jsonify({'msg': 'Title required'}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    user_id = get_jwt_identity()['id']
    resource = Resource(
        title=title,
        description=data.get('description', ''),
        file_path=file_path,
        uploaded_by=user_id
    )

    tag_objs = []
    for tag_name in [t.strip() for t in tags_str.split(',') if t.strip()]:
        tag = Tag.query.filter_by(name=tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
            db.session.add(tag)
        tag_objs.append(tag)
    resource.tags = tag_objs

    db.session.add(resource)
    db.session.commit()
    return jsonify({'msg': 'Resource uploaded successfully'}), 201

@resources_bp.route('/<int:resource_id>/download', methods=['GET'])
@jwt_required()
def download_resource(resource_id):
    resource = Resource.query.get_or_404(resource_id)
    resource.downloads += 1
    db.session.commit()
    return send_file(resource.file_path, as_attachment=True)

@resources_bp.route('', methods=['GET'])
@jwt_required()
def list_resources():
    query = Resource.query
    # Unified search for tags, subjects, and semesters
    for key in ['tag', 'subject', 'semester']:
        value = request.args.get(key)
        if value:
            query = query.join(Resource.tags).filter(Tag.name.ilike(f"%{value}%"))
    
    resources = query.distinct().all()
    return jsonify([{
        'id': r.id, 'title': r.title, 'description': r.description,
        'tags': [t.name for t in r.tags], 'downloads': r.downloads,
        'uploaded_by': r.uploaded_by, 'upload_time': r.upload_time.isoformat()
    } for r in resources])

@resources_bp.route('/<int:resource_id>/feedback', methods=['POST', 'GET'])
@jwt_required()
def handle_feedback(resource_id):
    Resource.query.get_or_404(resource_id) # Ensure resource exists

    if request.method == 'POST':
        user_id = get_jwt_identity()['id']
        data = request.get_json()
        rating = data.get('rating')
        if not rating or not (1 <= int(rating) <= 5):
            return jsonify({'msg': 'Rating must be an integer between 1 and 5'}), 400
        
        feedback = Feedback(
            user_id=user_id, resource_id=resource_id,
            rating=rating, comment=data.get('comment', '')
        )
        db.session.add(feedback)
        db.session.commit()
        return jsonify({'msg': 'Feedback submitted'}), 201

    if request.method == 'GET':
        feedbacks = Feedback.query.filter_by(resource_id=resource_id).all()
        return jsonify([{
            'user': User.query.get(f.user_id).username,
            'rating': f.rating,
            'comment': f.comment,
            'timestamp': f.timestamp.isoformat()
        } for f in feedbacks])
