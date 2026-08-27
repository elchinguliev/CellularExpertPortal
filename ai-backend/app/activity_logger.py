import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "host": os.environ["DB_HOST"],
    "port": int(os.environ["DB_PORT"]),
    "dbname": os.environ["DB_NAME"],
    "user": os.environ["DB_USER"],
    "password": os.environ["DB_PASSWORD"],
}
DB_SCHEMA = os.environ["DB_SCHEMA"]


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
