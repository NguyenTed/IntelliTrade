from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# db = SQLAlchemy()

def create_app():
    app = Flask(__name__)

    # # Database configuration
    # app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:nguyenquocthuan@localhost:3306/predict_service'
    # app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    # db.init_app(app)

    # Import models here!
    from app.data import models

    # Register blueprints
    from .routes.routes import main as main_blueprint
    from .routes.predict_controller import predict_routes
    # from .routes.models_controller import models_bp
    app.register_blueprint(main_blueprint)
    app.register_blueprint(predict_routes)
    # app.register_blueprint(models_bp)

    # with app.app_context():
    #     db.create_all()
    return app