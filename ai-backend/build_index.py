from pathlib import Path
import json

from app.postgres_loader import load_documents_from_postgres
from app.chunker import split_by_markdown_headings
from app.embedder import create_vector_database


BASE_DIR = Path(__file__).resolve().parent
CHUNKS_DIR = BASE_DIR / "knowledge_base" / "chunks"


def clear_old_chunks() -> None:
    """
    Remove old chunk files before building a new index.

    This prevents mixing old Markdown chunks with new PostgreSQL chunks.
    """

    CHUNKS_DIR.mkdir(parents=True, exist_ok=True)

    for file_path in CHUNKS_DIR.glob("*_chunks.json"):
        file_path.unlink()


def save_chunks_per_document(documents: list) -> int:
    """
    Split PostgreSQL documentation records into chunks
    and save them as JSON files.

    The existing embedder reads these chunk files and creates ChromaDB embeddings.
    """

    CHUNKS_DIR.mkdir(parents=True, exist_ok=True)

    total_chunks = 0

    for document in documents:
        chunks = split_by_markdown_headings(document)

        safe_file_name = f"{document['id']}_chunks.json"
        output_path = CHUNKS_DIR / safe_file_name

        output_path.write_text(
            json.dumps(chunks, indent=2, ensure_ascii=False),
            encoding="utf-8"
        )

        total_chunks += len(chunks)

        print(f"✓ {document['title']} -> {len(chunks)} chunk(s)")
        print(f"  Saved: {output_path.name}")

    return total_chunks


def build_index():
    print("\n==============================")
    print("Building AI Documentation Index")
    print("==============================")

    print("\nStep 1: Loading documentation from PostgreSQL...")
    documents = load_documents_from_postgres()
    print(f"Loaded {len(documents)} document(s) from PostgreSQL.")

    if not documents:
        print("No documents found in PostgreSQL. Index build stopped.")
        return

    print("\nStep 2: Removing old chunk files...")
    clear_old_chunks()
    print("Old chunks removed.")

    print("\nStep 3: Creating and saving new chunks...")
    total_chunks = save_chunks_per_document(documents)
    print(f"Total chunks saved: {total_chunks}")

    print("\nStep 4: Creating embeddings and vector database...")
    create_vector_database()

    print("\nIndex build completed successfully.")


if __name__ == "__main__":
    build_index()