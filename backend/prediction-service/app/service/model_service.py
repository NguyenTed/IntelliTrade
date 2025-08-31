# import os
# from werkzeug.utils import secure_filename
# from cachetools import TTLCache
# from app.repository.model_repository import save_user_model



# UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')

# def handle_upload_model(user_id, file):
#     filename = secure_filename(file.filename)
#     user_folder = os.path.join(UPLOAD_FOLDER, user_id)
#     os.makedirs(user_folder, exist_ok=True)
#     save_path = os.path.join(user_folder, filename)
#     file.save(save_path)
#     model_record = save_user_model(user_id, filename, save_path)
#     return model_record, filename, save_path