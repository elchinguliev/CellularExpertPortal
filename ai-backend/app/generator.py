from app.rag_pipeline import run_rag_pipeline


def generate_answer(
    question: str,
    user: str = "Unknown User",
    conversation: list | None = None
) -> dict:
    return run_rag_pipeline(
        question=question,
        user=user,
        conversation=conversation or []
    )


if __name__ == "__main__":
    while True:
        question = input("\nAsk a question (or 'exit'): ")

        if question.lower() == "exit":
            break

        response = generate_answer(
            question=question,
            user="Admin User",
            conversation=[]
        )

        print("\nAnswer:")
        print(response["answer"])
        print("\nConfidence:", response["confidence"])
        print("Ticket needed:", response["ticket_needed"])