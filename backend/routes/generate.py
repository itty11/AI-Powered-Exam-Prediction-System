from flask import Blueprint, send_file, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import ExamSession
import os

generate_bp = Blueprint("generate", __name__)

@generate_bp.route("/download/<int:session_id>", methods=["GET"])
@jwt_required()
def download(session_id):
    session = ExamSession.query.get_or_404(session_id)

    if session.status != "done":
        abort(400, "Paper not ready yet")

    if not session.paper_pdf_path or not os.path.exists(session.paper_pdf_path):
        abort(404, "PDF file not found")

    return send_file(
        session.paper_pdf_path,
        as_attachment=True,
        download_name=f"predicted_paper_{session_id}.pdf",
        mimetype="application/pdf"
    )