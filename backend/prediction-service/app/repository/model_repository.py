# from app import db
# from app.data.models import UserModel

# def save_user_model(user_id, model_name, model_path):
#     model_record = UserModel(userId=user_id, modelName=model_name, modelPath=model_path)
#     db.session.add(model_record)
#     db.session.commit()
#     return model_record
# def get_model_path(user_id, model_name):
#     model_record = UserModel.query.filter_by(userId=user_id, modelName=model_name).first()
#     if model_record:
#         return model_record.modelPath
#     return None