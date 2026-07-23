import psycopg2

from app.db_config import DB_CONFIG, set_search_path


def log_ai_question(
    user_name: str,
    question: str,
    answer: str,
    confidence: float,
    ticket_needed: bool,
    sources: list,
    response_time_ms: int | None = None,
    answer_status: str | None = None,
) -> None:
    """
    Store one AI chatbot interaction in PostgreSQL.

    This data is used for admin insights:
    - most asked questions
    - low-confidence topics
    - documentation gaps
    - ticket-triggering questions
    - AI response time
    - number of retrieved sources
    - answer status
    """

    top_source = sources[0] if sources else {}

    top_document = top_source.get("document")
    top_section = top_source.get("section")
    product = top_source.get("product")

    source_count = len(sources)

    if answer_status is None:
        answer_status = (
            "ticket_needed"
            if ticket_needed
            else "answered"
        )

    try:
        connection = psycopg2.connect(**DB_CONFIG)
        cursor = connection.cursor()

        set_search_path(cursor)

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
                product,
                response_time_ms,
                source_count,
                answer_status
            )
            VALUES (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s
            );
            """,
            (
                user_name,
                question,
                answer,
                confidence,
                ticket_needed,
                top_document,
                top_section,
                product,
                response_time_ms,
                source_count,
                answer_status,
            )
        )

        connection.commit()
        cursor.close()
        connection.close()

    except Exception as error:
        print(f"[analytics_logger] Failed to log AI question: {error}")