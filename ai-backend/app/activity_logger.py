import psycopg2


DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "cellular_expert_docs",
    "user": "postgres",
    "password": "cellular123",
}


def log_user_activity(user_id, user_name, user_role, activity_type, page=None, details=None):
    """
    Logs user activity such as login, page visit, or admin action.
    This is used for admin tracking and reporting.
    """

    try:
        connection = psycopg2.connect(**DB_CONFIG)
        cursor = connection.cursor()

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