import psycopg2


DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "cellular_expert_docs",
    "user": "postgres",
    "password": "cellular123",
}


def log_ai_question(
    user_name: str,
    question: str,
    answer: str,
    confidence: float,
    ticket_needed: bool,
    sources: list
) -> None:
    """
    Store one AI chatbot interaction in PostgreSQL.

    This is used later for admin insights:
    - most asked questions
    - low-confidence topics
    - documentation gaps
    - ticket-triggering questions
    """

    top_source = sources[0] if sources else {}

    top_document = top_source.get("document")
    top_section = top_source.get("section")
    product = top_source.get("product")

    try:
        connection = psycopg2.connect(**DB_CONFIG)
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO ai_question_logs (
                user_name,
                question,
                answer,
                confidence,
                ticket_needed,
                top_document,
                top_section,
                product
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
            """,
            (
                user_name,
                question,
                answer,
                confidence,
                ticket_needed,
                top_document,
                top_section,
                product
            )
        )

        connection.commit()
        cursor.close()
        connection.close()

    except Exception as error:
        print(f"[analytics_logger] Failed to log AI question: {error}")