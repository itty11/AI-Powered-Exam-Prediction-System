import re
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import os
os.environ["HUGGINGFACE_TOKEN"] = os.environ.get("HF_TOKEN", "")

# loads once, cached after first download (~90MB)
model = SentenceTransformer('all-mpnet-base-v2')


def extract_questions(text: str) -> list[str]:
    pattern = r'(?:^|\n)\s*(?:Q\.?\s*)?\d+[\.\)]\s+'
    parts   = re.split(pattern, text, flags=re.MULTILINE)

    questions = []
    for part in parts:
        part = part.strip()
        if len(part) < 15:
            continue
        question = part[:300].replace('\n', ' ').strip()
        questions.append(question)

    return questions


def find_repeated(
    extracted_texts: list[str],
    similarity_threshold: float = 0.55
) -> list[dict]:

    all_questions = []
    source_map    = []

    for pdf_index, text in enumerate(extracted_texts):
        qs = extract_questions(text)
        all_questions.extend(qs)
        source_map.extend([pdf_index] * len(qs))

    if not all_questions:
        return []

    # semantic embeddings — understands meaning not just keywords
    print(f"[SBERT] Encoding {len(all_questions)} questions...")
    embeddings        = model.encode(all_questions)
    similarity_matrix = cosine_similarity(embeddings)

    n       = len(all_questions)
    visited = [False] * n
    groups  = []

    for i in range(n):
        if visited[i]:
            continue
        similar_indices = [
            j for j in range(n)
            if not visited[j] and similarity_matrix[i][j] >= similarity_threshold
        ]
        if len(similar_indices) > 1:
            for idx in similar_indices:
                visited[idx] = True
            groups.append(similar_indices)

    repeated = []
    for group in groups:
        variants    = [all_questions[i] for i in group]
        sources     = [source_map[i] for i in group]
        canonical   = max(variants, key=len)
        unique_pdfs = len(set(sources))

        repeated.append({
            "question":          canonical,
            "count":             unique_pdfs,
            "total_occurrences": len(group),
            "similar_variants":  [v for v in variants if v != canonical][:3]
        })

    repeated.sort(key=lambda x: x["count"], reverse=True)
    return repeated