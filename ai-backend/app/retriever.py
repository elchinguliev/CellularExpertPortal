import os
os.environ["USE_TF"] = "0"
os.environ["TRANSFORMERS_NO_TF"] = "1"

from pathlib import Path
import chromadb
from sentence_transformers import SentenceTransformer


BASE_DIR = Path(__file__).resolve().parents[1]
VECTOR_DB_DIR = BASE_DIR / "vector_db"

COLLECTION_NAME = "cellular_expert_docs"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"


model = SentenceTransformer(EMBEDDING_MODEL)

client = chromadb.PersistentClient(path=str(VECTOR_DB_DIR))
collection = client.get_collection(COLLECTION_NAME)


def search(question: str, top_k: int = 3):
    question_embedding = model.encode(question).tolist()

    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=top_k
    )

    return results