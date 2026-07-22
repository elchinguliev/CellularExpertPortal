import os

import psycopg2
from dotenv import load_dotenv


load_dotenv()


DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "5432")),
    "database": os.getenv("DB_NAME", "cellular_expert_docs"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "cellular123"),
}


DB_SCHEMA = os.getenv("DB_SCHEMA", "public")


def get_images_for_sources(sources: list, limit_per_document: int = 2) -> list:
    """
    Find useful documentation images for the documents used by the AI answer.
    Images are matched by document_id/doc_id.
    """
    if not sources:
        return []

    document_ids = []
    for source in sources:
        document_id = source.get("document_id") or source.get("doc_id")
        if document_id and document_id not in document_ids:
            document_ids.append(document_id)

    if not document_ids:
        return []

    try:
        connection = psycopg2.connect(**DB_CONFIG)
        cursor = connection.cursor()

        cursor.execute(f"SET search_path TO {DB_SCHEMA};")

        images = []

        for document_id in document_ids:
            cursor.execute(
                """
                SELECT doc_id, image_url, caption, section_anchor, display_order
                FROM document_images
                WHERE doc_id = %s
                ORDER BY display_order
                LIMIT %s;
                """,
                (document_id, limit_per_document),
            )

            rows = cursor.fetchall()

            for row in rows:
                images.append({
                    "document_id": row[0],
                    "image_url": row[1],
                    "caption": row[2],
                    "section_anchor": row[3],
                    "display_order": row[4],
                })

        cursor.close()
        connection.close()

        return images

    except Exception as error:
        print("Image lookup failed:", error)
        return []