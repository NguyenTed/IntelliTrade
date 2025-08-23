from flask import Flask

def create_app():
    app = Flask(__name__)

    # Register blueprints
    from .routes.backtest_controller import backtest_controller
    app.register_blueprint(backtest_controller)
    
    return app