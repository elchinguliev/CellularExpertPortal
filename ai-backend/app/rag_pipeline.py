from app.retriever import search
from app.prompt_builder import build_rag_prompt
from app.services.llm_service import generate as generate_llm
from app.ticket_service import build_ticket_prefill


CONFIDENCE_THRESHOLD = 0.60


def distance_to_confidence(distance: float) -> float:
    confidence = 1 / (1 + distance)
    return round(confidence, 2)


def extract_sources(results: dict) -> list:
    sources = []

    for i in range(len(results["ids"][0])):
        metadata = results["metadatas"][0][i]

        sources.append({
            "document": metadata["document_title"],
            "section": metadata["section_title"],
            "product": metadata["product"],
            "version": metadata["version"],
            "source_file": metadata["source_file"],
            "distance": round(results["distances"][0][i], 3)
        })

    return sources


def build_conversation_context(conversation: list, max_messages: int = 6) -> str:
    if not conversation:
        return ""

    recent_messages = conversation[-max_messages:]

    lines = []
    for msg in recent_messages:
        role = msg.get("role", "user")
        message = msg.get("message", "")
        lines.append(f"{role}: {message}")

    return "\n".join(lines)


def build_question_with_context(question: str, conversation: list) -> str:
    conversation_context = build_conversation_context(conversation)

    if not conversation_context:
        return question

    return f"""
Conversation history:
{conversation_context}

Current user question:
{question}
""".strip()


def run_rag_pipeline(
    question: str,
    user: str = "Unknown User",
    conversation: list | None = None
) -> dict:
    conversation = conversation or []

    search_question = build_question_with_context(question, conversation)

    results = search(search_question, top_k=3)

    top_distance = results["distances"][0][0]
    confidence = distance_to_confidence(top_distance)
    sources = extract_sources(results)

    if confidence < CONFIDENCE_THRESHOLD:
        ticket_prefill = build_ticket_prefill(
            question=question,
            sources=sources,
            confidence=confidence,
            user=user
        )

        ticket_prefill["conversation_context"] = conversation + [
            {"role": "user", "message": question}
        ]

        return {
            "answer": "I could not find a reliable answer in the available documentation.",
            "confidence": confidence,
            "ticket_needed": True,
            "sources": sources,
            "ticket_prefill": ticket_prefill
        }

    prompt = build_rag_prompt(question, results)

    if conversation:
        conversation_context = build_conversation_context(conversation)
        prompt = f"""
Previous conversation:
{conversation_context}

{prompt}
""".strip()

    answer = generate_llm(prompt)

    return {
        "answer": answer,
        "confidence": confidence,
        "ticket_needed": False,
        "sources": sources,
        "ticket_prefill": None
    }