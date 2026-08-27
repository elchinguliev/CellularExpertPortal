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


def load_documents_from_postgres() -> list:
    """
    Load documentation records from PostgreSQL.

    Output format is intentionally the same as the old Markdown loader,
    so the existing chunker and embedder can still work.
    """

    connection = psycopg2.connect(**DB_CONFIG)
    cursor = connection.cursor()
    cursor.execute(f"SET search_path TO {DB_SCHEMA};")

    cursor.execute("""
        SELECT
            doc_id,
            title,
            product,
            category,
            content,
            github_path
        FROM documents
        ORDER BY product, category, display_order;
    """)

    rows = cursor.fetchall()

    documents = []

    for row in rows:
        doc_id, title, product, category, content, github_path = row

        documents.append({
            "id": doc_id,
            "title": title,
            "product": product,
            "version": "Unknown",
            "category": category,
            "source_file": github_path,
            "path": github_path,
            "content": content,
        })

    cursor.close()
    connection.close()

    return documents


if __name__ == "__main__":
    docs = load_documents_from_postgres()

    print(f"Loaded {len(docs)} document(s) from PostgreSQL.")

    for doc in docs[:5]:
        print("\n--- Document ---")
        print("ID:", doc["id"])
        print("Title:", doc["title"])
        print("Product:", doc["product"])
        print("Category:", doc["category"])
        print("Content preview:", doc["content"][:200])
