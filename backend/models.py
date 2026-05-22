from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id           = db.Column(db.Integer, primary_key=True)
    name         = db.Column(db.String(100), nullable=False)
    email        = db.Column(db.String(150), unique=True, nullable=False)
    password     = db.Column(db.String(200), nullable=False)   # bcrypt hash
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)

    sessions     = db.relationship("ExamSession", backref="user", lazy=True)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "email": self.email}


class ExamSession(db.Model):
    __tablename__ = "exam_sessions"

    id              = db.Column(db.Integer, primary_key=True)
    user_id         = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)

    pdf_paths       = db.Column(db.JSON)       # list of upload file paths
    repeated_qs     = db.Column(db.JSON)       # output of question_finder
    paper_text      = db.Column(db.JSON)       # structured paper dict from AI
    paper_pdf_path  = db.Column(db.String)     # path to generated PDF

    # "pending" | "processing" | "done" | "failed"
    status          = db.Column(db.String(20), default="pending")

    def to_dict(self):
        return {
            "id":           self.id,
            "status":       self.status,
            "created_at":   self.created_at.isoformat(),
            "pdf_count":    len(self.pdf_paths) if self.pdf_paths else 0,
            "repeated_qs":  self.repeated_qs,
            "paper":        self.paper_text,
        }