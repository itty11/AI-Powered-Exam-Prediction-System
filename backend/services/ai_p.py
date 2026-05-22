import os
import json

def predict_questions(extracted_texts: list[str], repeated_questions: list[dict]) -> dict:
    """Mock response — swap for real API once network works."""

    short_qs = []
    for i, q in enumerate(repeated_questions[:5], 1):
        short_qs.append({"no": i, "question": q["question"], "marks": 2})

    defaults = [
        "Define data structure with an example.",
        "What is a stack? List its operations.",
        "Define time complexity.",
        "What is a linked list?",
        "Explain binary search.",
    ]
    while len(short_qs) < 5:
        short_qs.append({
            "no": len(short_qs) + 1,
            "question": defaults[len(short_qs)],
            "marks": 2
        })

    return {
        "metadata": {
            "subject": "Predicted Exam Paper",
            "predicted_for": "Final Examination",
            "total_marks": 100
        },
        "sections": [
            {
                "name": "Part A – Short Answer",
                "instructions": "Answer all questions. 2 marks each.",
                "questions": short_qs
            },
            {
                "name": "Part B – Medium Answer",
                "instructions": "Answer any 4 questions. 8 marks each.",
                "questions": [
                    {"no": 1, "question": "Explain stack and queue with diagrams and examples.", "marks": 8},
                    {"no": 2, "question": "Describe binary search tree with insertion and deletion.", "marks": 8},
                    {"no": 3, "question": "Compare singly and doubly linked lists with examples.", "marks": 8},
                    {"no": 4, "question": "Explain time and space complexity with examples.", "marks": 8},
                    {"no": 5, "question": "Write and explain the binary search algorithm.", "marks": 8},
                ]
            },
            {
                "name": "Part C – Essay",
                "instructions": "Answer any 1 question. 20 marks.",
                "questions": [
                    {"no": 1, "question": "Explain bubble sort, merge sort and quick sort with time complexity analysis.", "marks": 20},
                    {"no": 2, "question": "Describe graph traversal algorithms BFS and DFS with examples.", "marks": 20},
                ]
            }
        ]
    }


---------------------------------------------------------------------------------------------

def predict_questions(extracted_texts: list[str], repeated_questions: list[dict]) -> dict:
    prompt = _build_prompt(extracted_texts, repeated_questions)

    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 3000,
            "temperature": 0.7,
            "return_full_text": False,   # only return generated part, not the prompt
            "do_sample": True,
        }
    }

    response = requests.post(HF_API_URL, headers=HEADERS, json=payload, timeout=120)

    if response.status_code == 503:
        # Model is loading (cold start) — HF free tier does this
        raise RuntimeError("Model is loading on HuggingFace, retry in 20 seconds")

    response.raise_for_status()

    data = response.json()

    # HF returns [{"generated_text": "..."}]
    raw_text = data[0]["generated_text"]
    clean = _clean_json(raw_text)
    return json.loads(clean)


---------------------------------------------------------------------------------------------
# old question_finder.py code for reference

import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


def extract_questions(text: str) -> list[str]:
    """
    Pull individual questions out of raw PDF text.
    Handles common exam formats:
      1. What is ...?
      Q1. Explain ...
      (1) Define ...
    """
    # Split on numbered patterns like "1.", "Q1.", "(1)", "1)"
    pattern = r'(?:^|\n)\s*(?:Q\.?\s*)?\d+[\.\)]\s+'
    parts = re.split(pattern, text, flags=re.MULTILINE)

    questions = []
    for part in parts:
        part = part.strip()
        if len(part) < 15:          
            continue
        # take only the first 300 chars (avoid grabbing answers/marks schemes)
        question = part[:300].replace('\n', ' ').strip()
        questions.append(question)

    return questions


def find_repeated(
    extracted_texts: list[str],
    similarity_threshold: float = 0.45
) -> list[dict]:
    """
    Given text from multiple PDFs, find questions that appear
    repeatedly (same or similar phrasing) across papers.

    Returns a list sorted by frequency descending:
    [
      {"question": "Define Newton's second law.", "count": 3, "similar_variants": [...]},
      ...
    ]
    """
    # Step 1 — extract questions from every PDF
    all_questions = []
    source_map = []           # track which PDF each question came from

    for pdf_index, text in enumerate(extracted_texts):
        qs = extract_questions(text)
        all_questions.extend(qs)
        source_map.extend([pdf_index] * len(qs))

    if not all_questions:
        return []

    # Step 2 — vectorize using TF-IDF (no model download needed)
    vectorizer = TfidfVectorizer(
        stop_words='english',
        ngram_range=(1, 2),    # unigrams + bigrams catch paraphrases better
        min_df=1,
        max_features=5000
    )
    tfidf_matrix = vectorizer.fit_transform(all_questions)

    # Step 3 — compute pairwise cosine similarity
    similarity_matrix = cosine_similarity(tfidf_matrix)

    # Step 4 — cluster similar questions together
    n = len(all_questions)
    visited = [False] * n
    groups = []

    for i in range(n):
        if visited[i]:
            continue
        # find all questions similar to question[i]
        similar_indices = [
            j for j in range(n)
            if not visited[j] and similarity_matrix[i][j] >= similarity_threshold
        ]
        if len(similar_indices) > 1:          # appeared in more than one place
            for idx in similar_indices:
                visited[idx] = True
            groups.append(similar_indices)

    # Step 5 — build result, keeping the "best" (longest/cleanest) variant as canonical
    repeated = []
    for group in groups:
        variants = [all_questions[i] for i in group]
        sources  = [source_map[i] for i in group]

        # canonical = longest variant (usually the most complete phrasing)
        canonical = max(variants, key=len)

        # count unique PDFs it appeared in (more meaningful than raw count)
        unique_pdfs = len(set(sources))

        repeated.append({
            "question":         canonical,
            "count":            unique_pdfs,
            "total_occurrences": len(group),
            "similar_variants": [v for v in variants if v != canonical][:3]
        })

    # sort: questions appearing in most PDFs first
    repeated.sort(key=lambda x: x["count"], reverse=True)

    return repeated