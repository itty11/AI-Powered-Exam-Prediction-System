from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.pdf_extractor import extract_texts
from services.question_finder import find_repeated
from services.ai_predictor import predict_questions
from services.pdf_generator import generate_pdf
from models import db, ExamSession
import time

analyze_bp = Blueprint("analyze", __name__)

@analyze_bp.route("/analyze/<int:session_id>", methods=["POST"])
@jwt_required()
def analyze(session_id):
    session = ExamSession.query.get_or_404(session_id)
    session.status = "processing"
    db.session.commit()

    try:
        texts = extract_texts(session.pdf_paths)
        repeated = find_repeated(texts)
        session.repeated_qs = repeated

        # retry up to 3 times for HF cold starts
        result = None
        for attempt in range(3):
            try:
                result = predict_questions(texts, repeated)
                break
            except RuntimeError as e:
                if "loading" in str(e) and attempt < 2:
                    time.sleep(25)  # wait for model to warm up
                else:
                    raise

        session.paper_text = result
        session.paper_pdf_path = generate_pdf(result, session_id)
        session.status = "done"

    except Exception as e:
        session.status = "failed"
        db.session.commit()
        return jsonify({"error": str(e)}), 500

    db.session.commit()
    return jsonify({"status": "done", "session_id": session_id})

@analyze_bp.route("/session/<int:session_id>", methods=["GET"])
@jwt_required()
def get_session(session_id):
    session = ExamSession.query.get_or_404(session_id)
    return jsonify(session.to_dict())