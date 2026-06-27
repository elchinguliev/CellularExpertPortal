from retriever import search


CONFIDENCE_THRESHOLD = 0.60


def distance_to_confidence(distance: float) -> float:
    """
    Chroma returns distance. Lower distance means better match.
    We convert it to a simple confidence score between 0 and 1.
    """
    confidence = 1 / (1 + distance)
    return round(confidence, 2)


def generate_answer(question: str) -> dict:
    results = search(question, top_k=3)

    top_distance = results["distances"][0][0]
    confidence = distance_to_confidence(top_distance)

    sources = []
    retrieved_texts = []

    for i in range(len(results["ids"][0])):
        metadata = results["metadatas"][0][i]
        document_text = results["documents"][0][i]

        sources.append({
            "document": metadata["document_title"],
            "section": metadata["section_title"],
            "product": metadata["product"],
            "version": metadata["version"],
            "source_file": metadata["source_file"],
            "distance": round(results["distances"][0][i], 3)
        })

        retrieved_texts.append(document_text)

    if confidence < CONFIDENCE_THRESHOLD:
        return {
            "answer": "I could not find a reliable answer in the available documentation.",
            "confidence": confidence,
            "ticket_needed": True,
            "sources": sources,
            "ticket_prefill": {
                "product": sources[0]["product"] if sources else "Unknown",
                "version": sources[0]["version"] if sources else "Unknown",
                "ticket_title": f"Question about: {question[:60]}",
                "issue_type": "Documentation / User Question",
                "full_question": question,
                "retrieved_documents": sources,
                "priority_suggestion": "Low",
            }
        }

    answer = (
        "Based on the available documentation, the most relevant information is:\n\n"
        + retrieved_texts[0][:900]
    )

    return {
        "answer": answer,
        "confidence": confidence,
        "ticket_needed": False,
        "sources": sources,
        "ticket_prefill": None
    }


if __name__ == "__main__":
    while True:
        question = input("\nAsk a question (or 'exit'): ")

        if question.lower() == "exit":
            break

        response = generate_answer(question)

        print("\n=============================")
        print("AI Assistant Response")
        print("=============================")
        print("Answer:")
        print(response["answer"])
        print("\nConfidence:", response["confidence"])
        print("Ticket needed:", response["ticket_needed"])

        print("\nSources:")
        for source in response["sources"]:
            print(
                f"- {source['product']} {source['version']} | "
                f"{source['document']} → {source['section']} "
                f"(distance: {source['distance']})"
            )

        if response["ticket_needed"]:
            print("\nTicket pre-fill:")
            print(response["ticket_prefill"])