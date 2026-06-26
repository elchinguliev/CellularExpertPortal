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


if __name__ == "__main__":

    while True:

        question = input("\nAsk a question (or 'exit'): ")

        if question.lower() == "exit":
            break

        results = search(question)

        print("\n=============================")
        print("Top Results")
        print("=============================\n")

        for i in range(len(results["ids"][0])):

            metadata = results["metadatas"][0][i]

            print(f"Result {i+1}")
            print("-----------------------")
            print("Document :", metadata["document_title"])
            print("Section  :", metadata["section_title"])
            print("Product  :", metadata["product"])
            print("Version  :", metadata["version"])
            print()

            print(results["documents"][0][i][:600])
            print()

            print("Distance:", results["distances"][0][i])

            print("\n")