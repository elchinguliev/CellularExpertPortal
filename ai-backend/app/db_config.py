import os

from dotenv import load_dotenv


load_dotenv()


DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", "5432")),
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
}


DB_SCHEMA = os.getenv("DB_SCHEMA", "public")


def set_search_path(cursor) -> None:
    cursor.execute(f"SET search_path TO {DB_SCHEMA};")