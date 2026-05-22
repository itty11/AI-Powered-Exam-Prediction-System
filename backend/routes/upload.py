import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, ExamSession

upload_bp = Blueprint("upload", __name__)


def allowed_file(filename: str) -> bool:
    return (
        "." in filename and
        filename.rsplit(".", 1)[1].lower() in current_app.config["ALLOWED_EXTENSIONS"]
    )


@upload_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload():
    user_id = int(get_jwt_identity())

    files = request.files.getlist("pdfs")   # React sends files under key "pdfs"

    if not files or len(files) == 0:
        return jsonify({"error": "No files uploaded"}), 400

    if len(files) < 3 or len(files) > 5:
        return jsonify({"error": "Upload between 3 and 5 PDF files"}), 400

    saved_paths = []

    for file in files:
        if not allowed_file(file.filename):
            return jsonify({"error": f"{file.filename} is not a PDF"}), 400

        # unique filename to avoid collisions
        unique_name = f"{uuid.uuid4().hex}_{file.filename}"
        save_path   = os.path.join(current_app.config["UPLOAD_FOLDER"], unique_name)
        file.save(save_path)
        saved_paths.append(save_path)

    # create a new exam session in DB
    session = ExamSession(user_id=user_id, pdf_paths=saved_paths, status="pending")
    db.session.add(session)
    db.session.commit()

    return jsonify({
        "message":    f"{len(saved_paths)} PDFs uploaded successfully",
        "session_id": session.id
    }), 201