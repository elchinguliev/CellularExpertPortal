import time
from app.retriever import search
from app.prompt_builder import build_rag_prompt
from app.services.llm_service import generate as generate_llm
from app.ticket_service import build_ticket_prefill
from app.analytics_logger import log_ai_question
from app.image_lookup import get_images_for_sources


CONFIDENCE_THRESHOLD = 0.60


def distance_to_confidence(distance: float) -> float:
    confidence = 1 / (1 + distance)
    return round(confidence, 2)


def extract_sources(results: dict) -> list:
    sources = []

    for i in range(len(results["ids"][0])):
        metadata = results["metadatas"][0][i]

        sources.append({
            "document_id": metadata.get("document_id") or metadata.get("doc_id"),
            "document": metadata["document_title"],
            "section": metadata["section_title"],
            "product": metadata["product"],
            "version": metadata["version"],
            "source_file": metadata["source_file"],
            "distance": round(results["distances"][0][i], 3)
        })

    return sources


def build_conversation_context(conversation: list, max_messages: int = 4) -> str:
    if not conversation:
        return ""

    recent_messages = conversation[-max_messages:]

    lines = []
    for msg in recent_messages:
        role = msg.get("role", "user")
        message = msg.get("message", "")

        if not message:
            continue

        lines.append(f"{role}: {message}")

    return "\n".join(lines)


def build_ticket_context_summary(conversation: list, question: str) -> list:
    """
    Build a short clean context for the ticket draft.

    We do NOT store the full raw chat in the visible ticket description.
    We keep only the latest useful user questions.
    """

    user_questions = []

    for msg in conversation:
        role = msg.get("role", "")
        message = msg.get("message", "")

        if role != "user":
            continue

        if not message:
            continue

        # Skip very long messages to avoid noisy ticket descriptions
        clean_message = message.strip()
        if len(clean_message) > 200:
            clean_message = clean_message[:200] + "..."

        user_questions.append(clean_message)

    # Always include the current question
    user_questions.append(question)

    # Keep only last 3 user questions
    user_questions = user_questions[-3:]

    return [
        {
            "role": "summary",
            "message": "Recent user questions: " + " | ".join(user_questions)
        }
    ]


def question_needs_context(question: str) -> bool:
    """
    Decide whether the current question needs previous conversation.

    We use memory only for follow-up questions like:
    - Does it require ArcGIS?
    - How does it work?
    - What about this?

    We do not use previous conversation for clear standalone questions like:
    - What is CE Express?
    - Does CE Express require ArcGIS?
    """

    question_lower = question.lower()

    context_words = [
        "it",
        "this",
        "that",
        "they",
        "them",
        "these",
        "those",
        "its",
        "their"
    ]

    words = (
        question_lower
        .replace("?", "")
        .replace(".", "")
        .replace(",", "")
        .replace("!", "")
        .replace(":", "")
        .replace(";", "")
        .split()
    )

    return any(word in words for word in context_words)


def build_search_question(question: str, conversation: list) -> str:
    """
    Build the query used for retrieval.

    Important:
    - If the user asks a clear standalone question, search only the current question.
    - If the user asks a follow-up question with words like "it" or "this",
      include recent conversation.
    """

    if not question_needs_context(question):
        return question

    conversation_context = build_conversation_context(conversation)

    if not conversation_context:
        return question

    return f"""
Previous conversation:
{conversation_context}

Current question:
{question}
""".strip()


def safe_log_ai_question(
    user: str,
    question: str,
    answer: str,
    confidence: float,
    ticket_needed: bool,
    sources: list,
    response_time_ms: int | None = None,
    answer_status: str | None = None,
) -> None:
    """
    Log AI interaction for admin analytics.

    This must never break the chat response.
    If logging fails, the AI should still answer the user.
    """

    try:
        log_ai_question(
            user_name=user,
            question=question,
            answer=answer,
            confidence=confidence,
            ticket_needed=ticket_needed,
            sources=sources,
            response_time_ms=response_time_ms,
            answer_status=answer_status,
        )
    except Exception as error:
        print(f"[rag_pipeline] Analytics logging failed: {error}")


def prepare_ticket_response(
    question: str,
    answer: str,
    sources: list,
    confidence: float,
    user: str,
    conversation: list,
    response_time_ms: int | None = None,
) -> dict:
    """
    Create a clean ticket response.

    The visible ticket description should be useful for admins,
    not overloaded with full raw conversation text.
    """

    ticket_prefill = build_ticket_prefill(
        question=question,
        sources=sources,
        confidence=confidence,
        user=user
    )

    ticket_prefill["conversation_context"] = build_ticket_context_summary(
        conversation=conversation,
        question=question
    )

    safe_log_ai_question(
        user=user,
        question=question,
        answer=answer,
        confidence=confidence,
        ticket_needed=True,
        sources=sources,
        response_time_ms=response_time_ms,
        answer_status="ticket_needed"
    )

    images = get_images_for_sources(sources)

    return {
        "answer": answer,
        "confidence": confidence,
        "ticket_needed": True,
        "sources": sources,
        "images": images,
        "ticket_prefill": ticket_prefill
    }


def run_rag_pipeline(
    question: str,
    user: str = "Unknown User",
    conversation: list | None = None
) -> dict:
    start_time = time.perf_counter()

    conversation = conversation or []

    search_question = build_search_question(question, conversation)

    results = search(search_question, top_k=3)

    top_distance = results["distances"][0][0]
    confidence = distance_to_confidence(top_distance)
    sources = extract_sources(results)

    if confidence < CONFIDENCE_THRESHOLD:
        answer = "I could not find a reliable answer in the available documentation."

        response_time_ms = round(
            (time.perf_counter() - start_time) * 1000
        )

        return prepare_ticket_response(
            question=question,
            answer=answer,
            sources=sources,
            confidence=confidence,
            user=user,
            conversation=conversation,
            response_time_ms=response_time_ms
        )

    prompt = build_rag_prompt(question, results)

    if question_needs_context(question) and conversation:
        conversation_context = build_conversation_context(conversation)

        if conversation_context:
            prompt = f"""
Previous conversation:
{conversation_context}

Important: Answer the current user question. Use previous conversation only to resolve references like "it", "this", or "that".

{prompt}
""".strip()

    answer = generate_llm(prompt)

    answer_lower = answer.lower()

    llm_says_no_answer = (
        "could not find" in answer_lower or
        "couldn't find" in answer_lower or
        "cannot find" in answer_lower or
        "not contain enough information" in answer_lower or
        "do not have enough information" in answer_lower or
        "no reliable answer" in answer_lower
    )

    if llm_says_no_answer:
        response_time_ms = round(
            (time.perf_counter() - start_time) * 1000
        )

        return prepare_ticket_response(
            question=question,
            answer=answer,
            sources=sources,
            confidence=confidence,
            user=user,
            conversation=conversation,
            response_time_ms=response_time_ms
        )

    response_time_ms = round(
        (time.perf_counter() - start_time) * 1000
    )

    safe_log_ai_question(
        user=user,
        question=question,
        answer=answer,
        confidence=confidence,
        ticket_needed=False,
        sources=sources,
        response_time_ms=response_time_ms,
        answer_status="answered"
    )

    images = get_images_for_sources(sources)

    return {
        "answer": answer,
        "confidence": confidence,
        "ticket_needed": False,
        "sources": sources,
        "images": images,
        "ticket_prefill": None
    }