import os
os.environ["USE_TF"] = "0"
os.environ["TRANSFORMERS_NO_TF"] = "1"
from pathlib import Path
import json
import chromadb
from sentence_transformers import SentenceTransformer


BASE_DIR = Path(__file__).resolve().parents[1]
CHUNKS_DIR = BASE_DIR / "knowledge_base" / "chunks"
VECTOR_DB_DIR = BASE_DIR / "vector_db"

COLLECTION_NAME = "cellular_expert_docs"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"


def load_chunks() -> list:
    chunks = []

    for file_path in CHUNKS_DIR.glob("*_chunks.json"):
        file_chunks = json.loads(file_path.read_text(encoding="utf-8"))
        chunks.extend(file_chunks)

    return chunks


def build_embedding_text(chunk: dict) -> str:
    return f"""
Document: {chunk["document_title"]}
Section: {chunk["section_title"]}
Product: {chunk["product"]}
Version: {chunk["version"]}
Category: {chunk["category"]}

Content:
{chunk["text"]}
""".strip()


def create_vector_database():
    chunks = load_chunks()

    if not chunks:
        print("No chunks found. Run chunker.py first.")
        return

    print(f"Loaded {len(chunks)} chunk(s).")
    print(f"Loading embedding model: {EMBEDDING_MODEL}")

    model = SentenceTransformer(EMBEDDING_MODEL)

    documents = [build_embedding_text(chunk) for chunk in chunks]
    ids = [chunk["chunk_id"] for chunk in chunks]

    metadatas = [
        {
            "document_id": chunk["document_id"],
            "document_title": chunk["document_title"],
            "section_title": chunk["section_title"],
            "product": chunk["product"],
            "version": chunk["version"],
            "category": chunk["category"],
            "source_file": chunk["source_file"],
        }
        for chunk in chunks
    ]

    VECTOR_DB_DIR.mkdir(parents=True, exist_ok=True)

    client = chromadb.PersistentClient(path=str(VECTOR_DB_DIR))
    collection = client.get_or_create_collection(name=COLLECTION_NAME)

    embeddings = model.encode(documents).tolist()

    collection.upsert(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas
    )

    print("Vector database created successfully.")
    print(f"Stored {len(chunks)} embedding(s).")
    print(f"Database path: {VECTOR_DB_DIR}")


if __name__ == "__main__":
    create_vector_database()