import psycopg2

from app.db_config import DB_CONFIG, set_search_path


def log_user_activity(user_id, user_name, user_role, activity_type, page=None, details=None):
    """
    Logs user activity such as login, page visit, or admin action.
    This is used for admin tracking and reporting.
    """

    try:
        connection = psycopg2.connect(**DB_CONFIG)
        cursor = connection.cursor()

        set_search_path(cursor)

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