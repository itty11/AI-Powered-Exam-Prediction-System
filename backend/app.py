import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from models import db

os.environ["HUGGINGFACE_TOKEN"] = os.environ.get("HF_TOKEN", "")
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

def create_app():
    app = Flask(__name__)

    app.config.update(
        SQLALCHEMY_DATABASE_URI=os.environ.get(
            "DATABASE_URL", "sqlite:///exam_predictor.db"
        ),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,

        JWT_SECRET_KEY=os.environ.get("JWT_SECRET_KEY", "change-me-in-production"),
        JWT_ACCESS_TOKEN_EXPIRES=False,   

        # Uploads
        UPLOAD_FOLDER=os.path.join(os.path.dirname(__file__), "uploads"),
        MAX_CONTENT_LENGTH=50 * 1024 * 1024,   
        ALLOWED_EXTENSIONS={"pdf"},
    )

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # ── Extensions ────────────────────────────────────────────────────────────
    db.init_app(app)
    JWTManager(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})  # tighten in production

    # ── Blueprints ────────────────────────────────────────────────────────────
    from routes.auth     import auth_bp
    from routes.upload   import upload_bp
    from routes.analyze  import analyze_bp
    from routes.generate import generate_bp

    app.register_blueprint(auth_bp,     url_prefix="/api/auth")
    app.register_blueprint(upload_bp,   url_prefix="/api")
    app.register_blueprint(analyze_bp,  url_prefix="/api")
    app.register_blueprint(generate_bp, url_prefix="/api")

    # ── Create tables on first run ────────────────────────────────────────────
    with app.app_context():
        db.create_all()

    # ── Health check ──────────────────────────────────────────────────────────
    @app.route("/api/health")
    def health():
        return {"status": "ok", "message": "Exam Predictor API running"}

    # ── Error handlers ────────────────────────────────────────────────────────
    @app.errorhandler(400)
    def bad_request(e):
        return {"error": str(e.description)}, 400

    @app.errorhandler(401)
    def unauthorized(e):
        return {"error": "Unauthorized"}, 401

    @app.errorhandler(404)
    def not_found(e):
        return {"error": "Not found"}, 404

    @app.errorhandler(413)
    def too_large(e):
        return {"error": "File too large. Max total upload is 50MB"}, 413

    @app.errorhandler(500)
    def server_error(e):
        return {"error": "Internal server error"}, 500

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)