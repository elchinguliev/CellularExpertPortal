from datetime import datetime


def suggest_priority(confidence: float, question: str) -> str:
    question_lower = question.lower()

    critical_keywords = ["crash", "data loss", "cannot login", "system down", "not opening"]
    medium_keywords = ["error", "failed", "bug", "not working", "cannot create"]

    if any(word in question_lower for word in critical_keywords):
        return "High"

    if any(word in question_lower for word in medium_keywords):
        return "Medium"

    if confidence < 0.5:
        return "Low"

    return "Low"


def build_ticket_prefill(question: str, sources: list, confidence: float, user: str = "Unknown User") -> dict:
    first_source = sources[0] if sources else {}

    return {
        "product": first_source.get("product", "Unknown"),
        "version": first_source.get("version", "Unknown"),
        "ticket_title": f"Question about: {question[:80]}",
        "issue_type": "Documentation / User Question",
        "full_question": question,
        "retrieved_documents": sources,
        "user": user,
        "time": datetime.now().isoformat(timespec="seconds"),
        "conversation_context": [
            {
                "role": "user",
                "message": question
            }
        ],
        "priority_suggestion": suggest_priority(confidence, question)
    }


if __name__ == "__main__":
    example_sources = [
        {
            "document": "Introduction to CE Express",
            "section": "Architecture",
            "product": "CE Express",
            "version": "7.3",
            "source_file": "01-introduction.md",
            "distance": 0.532
        }
    ]

    ticket = build_ticket_prefill(
        question="How do I create a workspace?",
        sources=example_sources,
        confidence=0.46,
        user="Admin User"
    )

    print(ticket)