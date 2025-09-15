# app.py
# Flask application entry point with JWT and PostgreSQL integration

import os
from flask import Flask, jsonify
from flask_jwt_extended import JWTManager

from db import db
from config import Config

# Initialize extensions here to be registered in the app factory
jwt = JWTManager()

def create_app():
    """Application factory function."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Configure upload folder
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)

    from flask import request, send_file
    from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
    from werkzeug.utils import secure_filename
    from sqlalchemy import func
    from models import User, Resource, Tag, Feedback

    ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt', 'jpg', 'png'}

    def allowed_file(filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    @app.route('/')
    def index():
        return jsonify({"message": "Assessment Project Backend Running"})

    @app.route('/register', methods=['POST'])
    def register():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        role = data.get('role', 'student')
        if not username or not password:
            return jsonify({'msg': 'Username and password required'}), 400
        if User.query.filter_by(username=username).first():
            return jsonify({'msg': 'Username already exists'}), 409
        user = User(username=username, role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return jsonify({'msg': 'User registered successfully'}), 201

    @app.route('/login', methods=['POST'])
    def login():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        user = User.query.filter_by(username=username).first()
        if not user or not user.check_password(password):
            return jsonify({'msg': 'Invalid credentials'}), 401
        access_token = create_access_token(identity={'id': user.id, 'role': user.role})
        return jsonify({'access_token': access_token, 'role': user.role}), 200

    @app.route('/resources/upload', methods=['POST'])
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
        description = data.get('description', '')
        tags = data.get('tags', '')  # comma-separated
        if not title:
            return jsonify({'msg': 'Title required'}), 400
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        user_id = get_jwt_identity()['id']
        resource = Resource(title=title, description=description, file_path=file_path, uploaded_by=user_id)
        # Handle tags
        tag_objs = []
        for tag_name in [t.strip() for t in tags.split(',') if t.strip()]:
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.session.add(tag)
            tag_objs.append(tag)
        resource.tags = tag_objs
        db.session.add(resource)
        db.session.commit()
        return jsonify({'msg': 'Resource uploaded successfully'}), 201

    @app.route('/resources/<int:resource_id>/download', methods=['GET'])
    @jwt_required()
    def download_resource(resource_id):
        resource = Resource.query.get(resource_id)
        if not resource:
            return jsonify({'msg': 'Resource not found'}), 404
        resource.downloads += 1
        db.session.commit()
        return send_file(resource.file_path, as_attachment=True)

    @app.route('/resources', methods=['GET'])
    @jwt_required()
    def list_resources():
        tag = request.args.get('tag')
        subject = request.args.get('subject')
        semester = request.args.get('semester')
        query = Resource.query
        if tag:
            query = query.join(Resource.tags).filter(Tag.name.ilike(f"%{tag}%"))
        # For subject/semester, assume tags are used for both
        if subject:
            query = query.join(Resource.tags).filter(Tag.name.ilike(f"%{subject}%"))
        if semester:
            query = query.join(Resource.tags).filter(Tag.name.ilike(f"%{semester}%"))
        resources = query.all()
        result = []
        for r in resources:
            result.append({
                'id': r.id,
                'title': r.title,
                'description': r.description,
                'tags': [t.name for t in r.tags],
                'downloads': r.downloads,
                'uploaded_by': r.uploaded_by,
                'upload_time': r.upload_time.isoformat() if r.upload_time else None
            })
        return jsonify(result)

    @app.route('/resources/<int:resource_id>/feedback', methods=['POST'])
    @jwt_required()
    def submit_feedback(resource_id):
        user_id = get_jwt_identity()['id']
        data = request.get_json()
        rating = data.get('rating')
        comment = data.get('comment', '')
        if not rating or not (1 <= int(rating) <= 5):
            return jsonify({'msg': 'Rating must be 1-5'}), 400
        feedback = Feedback(user_id=user_id, resource_id=resource_id, rating=rating, comment=comment)
        db.session.add(feedback)
        db.session.commit()
        return jsonify({'msg': 'Feedback submitted'}), 201

    @app.route('/resources/<int:resource_id>/feedback', methods=['GET'])
    @jwt_required()
    def get_feedback(resource_id):
        feedbacks = Feedback.query.filter_by(resource_id=resource_id).all()
        result = []
        for f in feedbacks:
            user = User.query.get(f.user_id)
            result.append({
                'user': user.username if user else None,
                'rating': f.rating,
                'comment': f.comment,
                'timestamp': f.timestamp.isoformat() if f.timestamp else None
            })
        return jsonify(result)

    @app.route('/dashboard/top-rated', methods=['GET'])
    @jwt_required()
    def top_rated_resources():
        # Calculate average rating for each resource
        avg_ratings = db.session.query(
            Feedback.resource_id,
            func.avg(Feedback.rating).label('avg_rating')
        ).group_by(Feedback.resource_id).order_by(func.avg(Feedback.rating).desc()).limit(10).all()
        result = []
        for resource_id, avg_rating in avg_ratings:
            resource = Resource.query.get(resource_id)
            if resource:
                result.append({
                    'id': resource.id,
                    'title': resource.title,
                    'avg_rating': round(avg_rating, 2),
                    'downloads': resource.downloads
                })
        return jsonify(result)

    @app.route('/dashboard/most-downloaded', methods=['GET'])
    @jwt_required()
    def most_downloaded_resources():
        resources = Resource.query.order_by(Resource.downloads.desc()).limit(10).all()
        result = []
        for r in resources:
            result.append({
                'id': r.id,
                'title': r.title,
                'downloads': r.downloads
            })
        return jsonify(result)

    @app.route('/dashboard/recommendations', methods=['GET'])
    @jwt_required()
    def personalized_recommendations():
        # Simple example: recommend resources with tags matching user's most-used tags
        user_id = get_jwt_identity()['id']
        # Find tags from resources the user rated highly
        high_rated = db.session.query(Feedback.resource_id).filter(Feedback.user_id==user_id, Feedback.rating>=4).all()
        resource_ids = [r[0] for r in high_rated]
        tag_counts = {}
        for rid in resource_ids:
            resource = Resource.query.get(rid)
            if resource:
                for tag in resource.tags:
                    tag_counts[tag.name] = tag_counts.get(tag.name, 0) + 1
        # Recommend resources with these tags, excluding already rated
        recommended = []
        if tag_counts:
            top_tags = sorted(tag_counts, key=tag_counts.get, reverse=True)[:3]
            rec_query = Resource.query.join(Resource.tags).filter(Tag.name.in_(top_tags)).filter(~Resource.id.in_(resource_ids)).limit(10)
            for r in rec_query:
                recommended.append({
                    'id': r.id,
                    'title': r.title,
                    'tags': [t.name for t in r.tags]
                })
        return jsonify(recommended)

    return app
