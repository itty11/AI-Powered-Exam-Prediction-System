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

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def build_styles():
    styles = {
        "college": ParagraphStyle(
            "college",
            fontSize=13,
            fontName="Helvetica-Bold",
            alignment=TA_CENTER,
            spaceAfter=2,
            textColor=colors.black,
        ),
        "exam_title": ParagraphStyle(
            "exam_title",
            fontSize=11,
            fontName="Helvetica-Bold",
            alignment=TA_CENTER,
            spaceAfter=2,
            textColor=colors.black,
        ),
        "meta": ParagraphStyle(
            "meta",
            fontSize=9,
            fontName="Helvetica",
            alignment=TA_CENTER,
            spaceAfter=4,
            textColor=colors.black,
        ),
        "section_header": ParagraphStyle(
            "section_header",
            fontSize=10,
            fontName="Helvetica-Bold",
            alignment=TA_CENTER,
            spaceBefore=10,
            spaceAfter=4,
            textColor=colors.black,
            borderPadding=(4, 8, 4, 8),
        ),
        "instructions": ParagraphStyle(
            "instructions",
            fontSize=8.5,
            fontName="Helvetica-Oblique",
            alignment=TA_CENTER,
            textColor=colors.black,
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
            firstLineIndent=-18,
            textColor=colors.black,
        ),
        "footer": ParagraphStyle(
            "footer",
            fontSize=8,
            fontName="Helvetica-Oblique",
            alignment=TA_CENTER,
            textColor=colors.black,
        ),
    }
    return styles


def build_header(styles, metadata: dict) -> Table:
    subject  = metadata.get("subject", "Subject")
    exam     = metadata.get("predicted_for", "Final Examination")
    marks    = metadata.get("total_marks", 100)
    duration = metadata.get("duration", "3 Hours")
    year     = datetime.now().year

    college_style = ParagraphStyle(
        "college_plain",
        fontSize=13,
        fontName="Helvetica-Bold",
        alignment=TA_CENTER,
        textColor=colors.black,
    )

    header_data = [
        [Paragraph("EXAM PREDICTOR AI", college_style)],
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
        ("BOX",           (0, 0), (-1, -1), 1,   colors.black),
        ("LINEBELOW",     (0, 0), (-1, -2), 0.5, colors.black),
        ("BACKGROUND",    (0, 0), (-1, 0),       colors.white),
        ("TOPPADDING",    (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
    ]))

    return table


def build_section(section: dict, styles: dict) -> list:
    flowables = []

    flowables.append(Spacer(1, 0.3 * cm))

    # plain black section header bar
    section_style = ParagraphStyle(
        "section_plain",
        fontSize=10,
        fontName="Helvetica-Bold",
        alignment=TA_CENTER,
        spaceBefore=6,
        spaceAfter=4,
        textColor=colors.black,
        borderPadding=(4, 8, 4, 8),
    )

    section_table = Table(
        [[Paragraph(section["name"], section_style)]],
        colWidths=[19 * cm]
    )
    section_table.setStyle(TableStyle([
        ("BOX",           (0, 0), (-1, -1), 0.8, colors.black),
        ("BACKGROUND",    (0, 0), (-1, -1),      colors.white),
        ("TOPPADDING",    (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    flowables.append(section_table)
    flowables.append(Paragraph(section["instructions"], styles["instructions"]))

    questions = section.get("questions", [])
    for q in questions:
        no    = q.get("no", "")
        text  = q.get("question", "")
        marks = q.get("marks", "")

        q_para = Paragraph(f"{no}.&nbsp;&nbsp;{text}", styles["question"])
        m_para = Paragraph(
            f"<b>[{marks} M]</b>",
            ParagraphStyle(
                "marks",
                fontSize=9,
                fontName="Helvetica-Bold",
                alignment=TA_CENTER,
                textColor=colors.black,
            )
        )

        row = Table(
            [[q_para, m_para]],
            colWidths=[16.5 * cm, 2.5 * cm],
        )
        row.setStyle(TableStyle([
            ("VALIGN",        (0, 0), (-1, -1), "TOP"),
            ("LINEBELOW",     (0, 0), (-1, -1), 0.3, colors.black),
            ("TOPPADDING",    (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING",   (0, 0), (0, -1),  0),
            ("RIGHTPADDING",  (-1, 0), (-1, -1), 0),
        ]))

        flowables.append(KeepTogether(row))

    return flowables


def on_page(canvas, doc, styles):
    canvas.saveState()

    # page number
    page_num = canvas.getPageNumber()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.black)
    canvas.drawCentredString(
        A4[0] / 2, 1.5 * cm,
        f"Page {page_num}  |  AI-Generated Predicted Paper  |  For Practice Only"
    )

    # simple light grey watermark
    canvas.setFont("Helvetica-Bold", 55)
    canvas.setFillGray(0.88)
    canvas.translate(A4[0] / 2, A4[1] / 2)
    canvas.rotate(45)
    canvas.drawCentredString(0, 0, "PREDICTED")

    canvas.restoreState()


def generate_pdf(paper: dict, session_id: int) -> str:
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
    story    = []

    # header
    story.append(build_header(styles, metadata))
    story.append(Spacer(1, 0.4 * cm))

    # general instructions
    story.append(Paragraph(
        "<b>General Instructions:</b> Read all questions carefully. "
        "Write answers in the space provided. "
        "This is an AI-predicted paper for practice purposes only.",
        ParagraphStyle(
            "general_inst",
            fontSize=8.5,
            fontName="Helvetica",
            borderColor=colors.black,
            borderWidth=0.5,
            borderPadding=(5, 8, 5, 8),
            spaceAfter=6,
            textColor=colors.black,
        )
    ))

    # sections
    for section in sections:
        story.extend(build_section(section, styles))

    # end rule
    story.append(Spacer(1, 0.5 * cm))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.black))
    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph(
        "* * * END OF QUESTION PAPER * * *",
        styles["footer"]
    ))

    doc.build(
        story,
        onFirstPage=lambda c, d: on_page(c, d, styles),
        onLaterPages=lambda c, d: on_page(c, d, styles),
    )

    return filepath