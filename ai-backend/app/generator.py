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


def generate_answer(question: str, user: str = "Unknown User") -> dict:
    results = search(question, top_k=3)

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

        return {
            "answer": "I could not find a reliable answer in the available documentation.",
            "confidence": confidence,
            "ticket_needed": True,
            "sources": sources,
            "ticket_prefill": ticket_prefill
        }

    prompt = build_rag_prompt(question, results)
    answer = generate_llm(prompt)

    return {
        "answer": answer,
        "confidence": confidence,
        "ticket_needed": False,
        "sources": sources,
        "ticket_prefill": None
    }