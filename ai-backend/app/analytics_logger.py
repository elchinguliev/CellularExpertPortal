import os

import psycopg2
from dotenv import load_dotenv


load_dotenv()


DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "5432")),
    "dbname": os.getenv("DB_NAME", "cellular_expert_docs"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "cellular123"),
}


DB_SCHEMA = os.getenv("DB_SCHEMA", "public")


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
        cursor.execute(f"SET search_path TO {DB_SCHEMA};")

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