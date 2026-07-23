import psycopg2
from psycopg2.extras import RealDictCursor
from decimal import Decimal
from datetime import datetime

from app.db_config import DB_CONFIG, set_search_path


def make_json_safe(value):
    """
    Converts PostgreSQL/Python special values into normal JSON-safe values.
    FastAPI can return these safely to the frontend.
    """
    if isinstance(value, Decimal):
        return float(value)

    if isinstance(value, datetime):
        return value.isoformat()

    return value


def clean_rows(rows):
    """
    Converts database rows into normal Python dictionaries.
    """
    clean_result = []

    for row in rows:
        clean_row = {}
        for key, value in dict(row).items():
            clean_row[key] = make_json_safe(value)
        clean_result.append(clean_row)

    return clean_result


def get_ai_insights():
    """
    Reads AI question logs from PostgreSQL and returns admin analytics.
    This is used for the future Admin AI Insights page.
    """

    connection = psycopg2.connect(**DB_CONFIG)
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    set_search_path(cursor)

    cursor.execute("""
        SELECT
            COUNT(*) AS total_questions,
            COUNT(*) FILTER (WHERE ticket_needed = TRUE) AS ticket_needed_count,
            ROUND(AVG(confidence)::numeric, 2) AS average_confidence
        FROM ai_question_logs;
    """)
    summary = dict(cursor.fetchone())

    cursor.execute("""
        SELECT
            COALESCE(product, 'Unknown') AS product,
            COUNT(*) AS question_count
        FROM ai_question_logs
        GROUP BY COALESCE(product, 'Unknown')
        ORDER BY question_count DESC
        LIMIT 10;
    """)
    questions_by_product = clean_rows(cursor.fetchall())

    cursor.execute("""
        SELECT
            id,
            user_name,
            question,
            confidence,
            ticket_needed,
            top_document,
            product,
            created_at
        FROM ai_question_logs
        WHERE confidence < 0.6
        ORDER BY created_at DESC
        LIMIT 10;
    """)
    low_confidence_questions = clean_rows(cursor.fetchall())

    cursor.execute("""
        SELECT
            id,
            user_name,
            question,
            confidence,
            top_document,
            product,
            created_at
        FROM ai_question_logs
        WHERE ticket_needed = TRUE
        ORDER BY created_at DESC
        LIMIT 10;
    """)
    ticket_needed_questions = clean_rows(cursor.fetchall())

    cursor.execute("""
        SELECT
            id,
            user_name,
            question,
            confidence,
            ticket_needed,
            top_document,
            product,
            created_at
        FROM ai_question_logs
        ORDER BY created_at DESC
        LIMIT 10;
    """)
    recent_questions = clean_rows(cursor.fetchall())

    cursor.close()
    connection.close()

    return {
        "summary": {
            "total_questions": summary["total_questions"] or 0,
            "ticket_needed_count": summary["ticket_needed_count"] or 0,
            "average_confidence": make_json_safe(summary["average_confidence"] or 0),
        },
        "questions_by_product": questions_by_product,
        "low_confidence_questions": low_confidence_questions,
        "ticket_needed_questions": ticket_needed_questions,
        "recent_questions": recent_questions,
    }