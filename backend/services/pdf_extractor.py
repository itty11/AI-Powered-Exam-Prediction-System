import fitz  # PyMuPDF
import os
import re


def clean_text(text: str) -> str:
    """
    Clean raw PDF text:
    - remove excessive whitespace / blank lines
    - fix broken hyphenated words (e.g. "photo-\nsynthesis" → "photosynthesis")
    - strip page headers/footers (page numbers, college name repeating every page)
    """
    # fix hyphenated line breaks
    text = re.sub(r'-\n(\w)', r'\1', text)

    # collapse multiple blank lines into one
    text = re.sub(r'\n{3,}', '\n\n', text)

    # remove lone page numbers (e.g. "- 3 -" or just "3" on its own line)
    text = re.sub(r'^\s*[-–]?\s*\d{1,3}\s*[-–]?\s*$', '', text, flags=re.MULTILINE)

    # collapse multiple spaces
    text = re.sub(r'[ \t]{2,}', ' ', text)

    return text.strip()


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract and clean all text from a single PDF file.
    Tries normal text extraction first; falls back to
    larger block sorting if text comes out scrambled.
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    doc = fitz.open(pdf_path)
    pages_text = []

    for page_num, page in enumerate(doc, start=1):
        # "blocks" mode preserves reading order better than raw .get_text()
        blocks = page.get_text("blocks")          # list of (x0,y0,x1,y1, text, ...)

        # sort top-to-bottom, left-to-right
        blocks.sort(key=lambda b: (round(b[1] / 10) * 10, b[0]))

        page_text = "\n".join(
            block[4].strip()
            for block in blocks
            if block[4].strip()           # skip empty blocks
        )

        if page_text:
            pages_text.append(f"--- Page {page_num} ---\n{page_text}")

    doc.close()

    raw = "\n\n".join(pages_text)
    return clean_text(raw)


def extract_texts(pdf_paths: list[str]) -> list[str]:
    """
    Extract text from a list of PDF paths.
    Returns a list of cleaned text strings (one per PDF).
    Skips files that fail with a warning instead of crashing the whole pipeline.
    """
    results = []

    for path in pdf_paths:
        try:
            text = extract_text_from_pdf(path)
            if len(text) < 50:
                print(f"[WARNING] Very little text extracted from {path} — may be a scanned image PDF")
            results.append(text)
        except Exception as e:
            print(f"[ERROR] Could not extract {path}: {e}")
            results.append("")      # keep list length = number of PDFs

    return results


def get_pdf_metadata(pdf_path: str) -> dict:
    """
    Bonus — pull subject/title hints from PDF metadata.
    Useful for auto-filling the 'subject' field in your question paper.
    """
    doc = fitz.open(pdf_path)
    meta = doc.metadata
    doc.close()

    return {
        "title":    meta.get("title", ""),
        "subject":  meta.get("subject", ""),
        "author":   meta.get("author", ""),
        "pages":    doc.page_count if not doc.is_closed else None
    }