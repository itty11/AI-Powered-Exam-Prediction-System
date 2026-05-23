import os
import re
import json
import requests

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_TOKEN   = os.environ.get("GROQ_API_KEY")


def _extract_questions_only(text: str) -> str:
    """Extract just numbered question lines — skips answer text."""
    lines   = text.split('\n')
    q_lines = []

    for line in lines:
        line = line.strip()
        if re.match(r'^\d+[\.\)]', line) or re.match(r'^Q\d+', line, re.IGNORECASE):
            q_lines.append(line[:200])

    return '\n'.join(q_lines[:20])  # max 20 questions per paper


def _build_prompt(extracted_texts: list[str], repeated_questions: list[dict]) -> str:

    # dynamic limit based on PDF count
    n = len(extracted_texts)
    if n <= 3:
        per_pdf_limit = 5000
    elif n == 4:
        per_pdf_limit = 2500
    else:
        per_pdf_limit = 1500

    repeated_summary = "\n".join(
        f"- (appeared {q['count']}x) {q['question']}"
        for q in repeated_questions[:10]
    )

    # extract questions only to reduce payload
    combined_text = "\n\n--- NEXT PAPER ---\n\n".join(
        _extract_questions_only(text)[:per_pdf_limit]
        for text in extracted_texts
    )

    print(f"[DEBUG] PDFs: {n}, per_pdf_limit: {per_pdf_limit}")
    print(f"[DEBUG] Combined text length: {len(combined_text)}")

    return f"""Analyze these past exam papers and generate a predicted question paper as JSON only.
No explanation, no markdown fences, just raw JSON.

PAST PAPERS:
{combined_text}

REPEATED QUESTIONS FOUND:
{repeated_summary}

Generate using this exact JSON format:
{{
  "metadata": {{
    "subject": "<inferred subject name>",
    "predicted_for": "Final Exam",
    "total_marks": 100
  }},
  "sections": [
    {{
      "name": "Part A – Short Answer",
      "instructions": "Answer all. 2 marks each.",
      "questions": [
        {{"no": 1, "question": "...", "marks": 2, "difficulty": "easy"}},
        {{"no": 2, "question": "...", "marks": 2, "difficulty": "easy"}},
        {{"no": 3, "question": "...", "marks": 2, "difficulty": "easy"}},
        {{"no": 4, "question": "...", "marks": 2, "difficulty": "medium"}},
        {{"no": 5, "question": "...", "marks": 2, "difficulty": "medium"}},
        {{"no": 6, "question": "...", "marks": 2, "difficulty": "medium"}},
        {{"no": 7, "question": "...", "marks": 2, "difficulty": "medium"}},
        {{"no": 8, "question": "...", "marks": 2, "difficulty": "hard"}},
        {{"no": 9, "question": "...", "marks": 2, "difficulty": "hard"}},
        {{"no": 10, "question": "...", "marks": 2, "difficulty": "hard"}}
      ]
    }},
    {{
      "name": "Part B – Medium Answer",
      "instructions": "Answer any 4. 8 marks each.",
      "questions": [
        {{"no": 1, "question": "...", "marks": 8, "difficulty": "medium"}},
        {{"no": 2, "question": "...", "marks": 8, "difficulty": "medium"}},
        {{"no": 3, "question": "...", "marks": 8, "difficulty": "medium"}},
        {{"no": 4, "question": "...", "marks": 8, "difficulty": "hard"}},
        {{"no": 5, "question": "...", "marks": 8, "difficulty": "hard"}}
      ]
    }},
    {{
      "name": "Part C – Essay",
      "instructions": "Answer any 1. 20 marks.",
      "questions": [
        {{"no": 1, "question": "...", "marks": 20, "difficulty": "hard"}},
        {{"no": 2, "question": "...", "marks": 20, "difficulty": "hard"}}
      ]
    }}
  ]
}}"""


def _clean_json(raw: str) -> str:
    raw   = raw.strip().replace("```json", "").replace("```", "").strip()
    start = raw.find("{")
    end   = raw.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError("No JSON found in model response")
    return raw[start:end]


def predict_questions(extracted_texts: list[str], repeated_questions: list[dict]) -> dict:
    prompt = _build_prompt(extracted_texts, repeated_questions)

    print(f"[DEBUG] Total prompt length: {len(prompt)}")

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {
                "role":    "system",
                "content": "You are an expert exam question predictor. Always respond with valid JSON only. No preamble, no explanation, no markdown fences."
            },
            {
                "role":    "user",
                "content": prompt
            }
        ],
        "temperature": 0.7,
        "max_tokens":  3000,
    }

    response = requests.post(
        GROQ_API_URL,
        headers={
            "Authorization": f"Bearer {GROQ_TOKEN}",
            "Content-Type":  "application/json"
        },
        json=payload,
        timeout=60
    )

    if not response.ok:
        print("GROQ ERROR:", response.status_code, response.text[:300])
        response.raise_for_status()

    data     = response.json()
    raw_text = data["choices"][0]["message"]["content"]
    clean    = _clean_json(raw_text)
    return json.loads(clean)