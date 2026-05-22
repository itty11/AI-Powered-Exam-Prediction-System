import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer,
    Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.platypus.flowables import HRFlowable


# ── Output folder ────────────────────────────────────────────────────────────

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)


# ── Styles ────────────────────────────────────────────────────────────────────

def build_styles():
    base = getSampleStyleSheet()

    styles = {
        "college": ParagraphStyle(
            "college",
            fontSize=13,
            fontName="Helvetica-Bold",
            alignment=TA_CENTER,
            spaceAfter=2,
        ),
        "exam_title": ParagraphStyle(
            "exam_title",
            fontSize=11,
            fontName="Helvetica-Bold",
            alignment=TA_CENTER,
            spaceAfter=2,
        ),
        "meta": ParagraphStyle(
            "meta",
            fontSize=9,
            fontName="Helvetica",
            alignment=TA_CENTER,
            spaceAfter=4,
        ),
        "section_header": ParagraphStyle(
            "section_header",
            fontSize=10,
            fontName="Helvetica-Bold",
            alignment=TA_CENTER,
            spaceBefore=10,
            spaceAfter=4,
            textColor=colors.white,
            backColor=colors.HexColor("#2c3e50"),
            borderPadding=(4, 8, 4, 8),
        ),
        "instructions": ParagraphStyle(
            "instructions",
            fontSize=8.5,
            fontName="Helvetica-Oblique",
            alignment=TA_CENTER,
            textColor=colors.HexColor("#555555"),
            spaceAfter=6,
        ),
        "question": ParagraphStyle(
            "question",
            fontSize=9.5,
            fontName="Helvetica",
            alignment=TA_JUSTIFY,
            spaceBefore=4,
            spaceAfter=4,
            leftIndent=18,
            firstLineIndent=-18,    # hanging indent for question number
        ),
        "footer": ParagraphStyle(
            "footer",
            fontSize=8,
            fontName="Helvetica-Oblique",
            alignment=TA_CENTER,
            textColor=colors.grey,
        ),
    }
    return styles


# ── Header table (college info box) ──────────────────────────────────────────

def build_header(styles, metadata: dict) -> Table:
    subject  = metadata.get("subject", "Subject")
    exam     = metadata.get("predicted_for", "Final Examination")
    marks    = metadata.get("total_marks", 100)
    duration = metadata.get("duration", "3 Hours")
    year     = datetime.now().year

    header_data = [
        [Paragraph("AI Exam Question Paper Prediction System", styles["college"])],
        [Paragraph(f"{subject} — {exam} {year}", styles["exam_title"])],
        [Paragraph(
            f"Time Allowed: {duration}&nbsp;&nbsp;|&nbsp;&nbsp;"
            f"Maximum Marks: {marks}&nbsp;&nbsp;|&nbsp;&nbsp;"
            f"<i>AI Predicted Paper</i>",
            styles["meta"]
        )],
    ]

    table = Table(header_data, colWidths=[19 * cm])
    table.setStyle(TableStyle([
        ("BOX",        (0, 0), (-1, -1), 1,   colors.HexColor("#2c3e50")),
        ("LINEBELOW",  (0, 0), (-1, -2), 0.5, colors.HexColor("#aaaaaa")),
        ("BACKGROUND", (0, 0), (-1, 0),       colors.HexColor("#2c3e50")),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
    ]))

    # make college name white text on dark background
    header_data[0][0].style = ParagraphStyle(
        "college_white",
        fontSize=13,
        fontName="Helvetica-Bold",
        alignment=TA_CENTER,
        textColor=colors.white,
    )

    return table


# ── Questions ─────────────────────────────────────────────────────────────────

def build_section(section: dict, styles: dict) -> list:
    """Build flowables for one section (Part A / B / C)."""
    flowables = []

    # section header bar
    flowables.append(Spacer(1, 0.3 * cm))
    flowables.append(Paragraph(section["name"], styles["section_header"]))
    flowables.append(Paragraph(section["instructions"], styles["instructions"]))

    questions = section.get("questions", [])

    for q in questions:
        no   = q.get("no", "")
        text = q.get("question", "")
        marks = q.get("marks", "")

        # right-align marks, question text left — use a two-column mini table
        q_para  = Paragraph(f"{no}.&nbsp;&nbsp;{text}", styles["question"])
        m_para  = Paragraph(
            f"<b>[{marks} M]</b>",
            ParagraphStyle("marks", fontSize=9, fontName="Helvetica-Bold",
                           alignment=TA_CENTER, textColor=colors.HexColor("#2c3e50"))
        )

        row = Table(
            [[q_para, m_para]],
            colWidths=[16.5 * cm, 2.5 * cm],
        )
        row.setStyle(TableStyle([
            ("VALIGN",        (0, 0), (-1, -1), "TOP"),
            ("LINEBELOW",     (0, 0), (-1, -1), 0.3, colors.HexColor("#dddddd")),
            ("TOPPADDING",    (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING",   (0, 0), (0, -1),  0),
            ("RIGHTPADDING",  (-1, 0), (-1, -1), 0),
        ]))

        # KeepTogether prevents a question splitting across pages
        flowables.append(KeepTogether(row))

    return flowables


# ── Footer ────────────────────────────────────────────────────────────────────

def on_page(canvas, doc, styles):
    """Drawn on every page — page number + watermark."""
    canvas.saveState()

    # page number
    page_num = canvas.getPageNumber()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.grey)
    canvas.drawCentredString(
        A4[0] / 2, 1.5 * cm,
        f"Page {page_num}  |  AI-Generated Predicted Paper  |  For Practice Only"
    )

    # light watermark
    canvas.setFont("Helvetica-Bold", 55)
    canvas.setFillColor(colors.HexColor("#f0f0f0"))
    canvas.setFillAlpha(0.3)
    canvas.translate(A4[0] / 2, A4[1] / 2)
    canvas.rotate(45)
    canvas.drawCentredString(0, 0, "PREDICTED")
    canvas.restoreState()


# ── Main entry point ──────────────────────────────────────────────────────────

def generate_pdf(paper: dict, session_id: int) -> str:
    """
    paper      : the dict returned by ai_predictor.predict_questions()
    session_id : used to name the output file uniquely
    returns    : absolute path to the generated PDF
    """
    filename = f"predicted_paper_{session_id}.pdf"
    filepath = os.path.join(OUTPUT_DIR, filename)

    doc = SimpleDocTemplate(
        filepath,
        pagesize=A4,
        topMargin=1.5 * cm,
        bottomMargin=2 * cm,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
    )

    styles   = build_styles()
    metadata = paper.get("metadata", {})
    sections = paper.get("sections", [])

    story = []

    # 1 — header
    story.append(build_header(styles, metadata))
    story.append(Spacer(1, 0.4 * cm))

    # 2 — general instructions box
    general = (
        "<b>General Instructions:</b> Read all questions carefully. "
        "Write answers in the space provided. "
        "This is an AI-predicted paper for practice purposes only."
    )
    story.append(Paragraph(general, ParagraphStyle(
        "general_inst",
        fontSize=8.5,
        fontName="Helvetica",
        backColor=colors.HexColor("#fef9e7"),
        borderColor=colors.HexColor("#f0c040"),
        borderWidth=0.5,
        borderPadding=(5, 8, 5, 8),
        spaceAfter=6,
    )))

    # 3 — sections
    for section in sections:
        story.extend(build_section(section, styles))

    # 4 — end rule
    story.append(Spacer(1, 0.5 * cm))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#2c3e50")))
    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph("★ ★ ★ END OF QUESTION PAPER ★ ★ ★", styles["footer"]))

    # build
    doc.build(
        story,
        onFirstPage=lambda c, d: on_page(c, d, styles),
        onLaterPages=lambda c, d: on_page(c, d, styles),
    )

    return filepath