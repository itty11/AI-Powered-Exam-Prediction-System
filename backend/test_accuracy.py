from services.question_finder import find_repeated

# simulate 3 papers with known repeated questions
papers = [
    # paper 1
    """
    1. Define data structure with an example.
    2. Explain stack and its operations.
    3. What is time complexity?
    4. Define binary search tree.
    5. Explain BFS and DFS traversal.
    """,
    # paper 2 — same topics, different phrasing
    """
    1. What do you mean by data structure?
    2. Describe push and pop operations in stack.
    3. Define time and space complexity.
    4. What is BST? Explain with example.
    5. Differentiate BFS and DFS.
    """,
    # paper 3 — again rephrased
    """
    1. Classify data structures with examples.
    2. Explain stack operations with diagram.
    3. What is Big-O notation?
    4. Explain binary search tree operations.
    5. Explain graph traversal algorithms.
    """
]

# known repeated topics (ground truth)
known_repeated = [
    "data structure",
    "stack",
    "complexity",
    "binary search",
    "graph traversal"
]

results = find_repeated(papers)
print(f"\nDetected {len(results)} repeated question groups\n")

detected_topics = [r["question"].lower() for r in results]
correct = 0
for topic in known_repeated:
    found = any(topic.lower() in q for q in detected_topics)
    status = "✅ FOUND" if found else "❌ MISSED"
    if found:
        correct += 1
    print(f"{status} — {topic}")

accuracy = (correct / len(known_repeated)) * 100
print(f"\nDetection Accuracy: {correct}/{len(known_repeated)} = {accuracy:.1f}%")
print(f"Similarity threshold used: 0.55")

# add this after the results loop
print("\n--- What was actually detected ---")
for r in results:
    print(f"• [{r['count']}x] {r['question'][:80]}")