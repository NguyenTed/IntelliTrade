from flask import Flask
from app.controllers.comment_controller import comment_bp
from app.controllers.crawl_controller import crawler_bp
from app.controllers.tag_controller import tag_bp
from app.controllers.symbol_controller import symbol_bp

app = Flask(__name__)
app.register_blueprint(comment_bp)
app.register_blueprint(crawler_bp)
app.register_blueprint(tag_bp)
app.register_blueprint(symbol_bp)

if __name__ == "__main__":
    # app.run(debug=True)
    app.run(host="0.0.0.0", port=5002)