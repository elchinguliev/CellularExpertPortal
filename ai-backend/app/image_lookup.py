import os
import re

import psycopg2
from dotenv import load_dotenv


load_dotenv()


DB_CONFIG = {
    "host": os.environ["DB_HOST"],
    "port": int(os.environ["DB_PORT"]),
    "database": os.environ["DB_NAME"],
    "user": os.environ["DB_USER"],
    "password": os.environ["DB_PASSWORD"],
}


DB_SCHEMA = os.environ["DB_SCHEMA"]

# sync-from-github.js rewrites every relative markdown image link to point at
# our own DB-backed endpoint, e.g.:
#   ![Image p3](http://localhost:4000/api/synced-images?path=docs/assets/images/ce-express/training-01/p003-img1.png)
# Unlike document_images (a separate table with structured caption/order per
# doc, used only for admin-uploaded images), the images actually embedded in
# a document's own content live inside that content as these links — so we
# extract them directly instead of querying a separate images table.
IMAGE_URL_PATTERN = re.compile(
    r"!\[([^\]]*)\]\((http[^\s)]*?/api/synced-images\?path=[^\s)]+)\)"
)


def get_images_for_sources(sources: list, limit_per_document: int = 2) -> list:
    """
    Find documentation images embedded in the documents used by the AI answer.

    Images are matched by pulling each source document's content and
    extracting the /api/synced-images links already present in it (rewritten
    there during `npm run sync`). Return shape is kept identical to the old
    document_images-based lookup so callers (rag_pipeline.py) don't need to
    change.
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
                SELECT content
                FROM documents
                WHERE doc_id = %s;
                """,
                (document_id,),
            )

            row = cursor.fetchone()
            if not row or not row[0]:
                continue

            content = row[0]
            matches = IMAGE_URL_PATTERN.findall(content)[:limit_per_document]

            for alt_text, image_url in matches:
                images.append({
                    "document_id": document_id,
                    "image_url": image_url,
                    "caption": alt_text or None,
                    "section_anchor": None,
                    "display_order": 0,
                })

        cursor.close()
        connection.close()

        return images

    except Exception as error:
        print("Image lookup failed:", error)
        return []
