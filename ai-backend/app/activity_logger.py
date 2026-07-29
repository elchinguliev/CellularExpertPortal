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


def log_user_activity(user_id, user_name, user_role, activity_type, page=None, details=None):
    """
    Logs user activity such as login, page visit, or admin action.
    This is used for admin tracking and reporting.
    """

    try:
        connection = psycopg2.connect(**DB_CONFIG)
        cursor = connection.cursor()
        cursor.execute(f"SET search_path TO {DB_SCHEMA};")

        cursor.execute(
            """
            INSERT INTO user_activity_logs (
                user_id,
                user_name,
                user_role,
                activity_type,
                page,
                details
            )
            VALUES (%s, %s, %s, %s, %s, %s);
            """,
            (
                user_id,
                user_name,
                user_role,
                activity_type,
                page,
                details,
            )
        )

        connection.commit()
        cursor.close()
        connection.close()

    except Exception as error:
        print(f"[activity_logger] Failed to log user activity: {error}")