from pathlib import Path
import json

from app.knowledge_loader import load_all_markdown_files
from app.chunker import split_by_markdown_headings
from app.embedder import create_vector_database


BASE_DIR = Path(__file__).resolve().parent
CHUNKS_DIR = BASE_DIR / "knowledge_base" / "chunks"


def save_chunks_per_document(documents: list) -> int:
    CHUNKS_DIR.mkdir(parents=True, exist_ok=True)

    total_chunks = 0

    for document in documents:
        chunks = split_by_markdown_headings(document)

        output_path = (
            CHUNKS_DIR /
            f"{document['source_file'].replace('.md', '')}_chunks.json"
        )

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

    print("\nStep 1: Loading markdown documents...")
    documents = load_all_markdown_files()
    print(f"Loaded {len(documents)} document(s).")

    print("\nStep 2: Creating and saving chunks...")
    total_chunks = save_chunks_per_document(documents)
    print(f"Total chunks saved: {total_chunks}")

    print("\nStep 3: Creating embeddings and vector database...")
    create_vector_database()

    print("\nIndex build completed successfully.")


if __name__ == "__main__":
    build_index()