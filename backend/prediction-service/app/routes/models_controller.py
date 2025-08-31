import os
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from app import db

from app.data.models import UserModel
from app.service.model_service import handle_upload_model

models_bp = Blueprint('models', __name__)

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')

@models_bp.route('/api/v1/predict/model', methods=['POST'])
def upload_model():
    user_id = request.form.get('userId')
    file = request.files.get('model')
    if not user_id or not file:
        return jsonify({'error': 'Missing userId or model file'}), 400

    # Thêm timestamp vào tên file để tránh trùng
    import time
    original_filename = secure_filename(file.filename)
    timestamp = int(time.time())
    name, ext = os.path.splitext(original_filename)
    new_filename = f"{name}_{timestamp}{ext}"
    file.filename = new_filename
    model_record, filename, save_path = handle_upload_model(user_id, file)
    return jsonify({'message': 'Model uploaded and info saved', 'modelName': filename, 'modelPath': save_path})

@models_bp.route('/api/v1/predict/model', methods=['GET'])
def get_user_models():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({'error': 'Missing userId'}), 400

    models = UserModel.query.filter_by(userId=user_id).all()
    result = [
        {
            'id': m.id,
            'modelPath': m.model_path,
            'uploadedAt': m.uploaded_at.strftime('%Y-%m-%d %H:%M:%S')
        }
        for m in models
    ]

    return jsonify(result)