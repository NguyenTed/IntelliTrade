from app import db
from datetime import datetime

class UserModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.String(64), nullable=False)
    modelName = db.Column(db.String(128), nullable=False)  
    modelPath = db.Column(db.String(256), nullable=False)
    uploadedAt = db.Column(db.DateTime, default=datetime.utcnow)