from pathlib import Path
import json


BASE_DIR = Path(__file__).resolve().parents[1]
MARKDOWN_DIR = BASE_DIR / "knowledge_base" / "markdown"
METADATA_DIR = BASE_DIR / "knowledge_base" / "metadata"


def load_markdown_file(file_path: Path) -> dict:
    content = file_path.read_text(encoding="utf-8")

    title = file_path.stem.replace("-", " ").title()

    for line in content.splitlines():
        if line.startswith("# "):
            title = line.replace("# ", "").strip()
            break

    return {
        "id": file_path.stem,
        "title": title,
        "path": str(file_path),
        "content": content,
    }


def load_all_markdown_files() -> list:
    documents = []

    for file_path in MARKDOWN_DIR.glob("*.md"):
        documents.append(load_markdown_file(file_path))

    return documents


if __name__ == "__main__":
    documents = load_all_markdown_files()

    print(f"Loaded {len(documents)} markdown document(s).")

    for doc in documents:
        print("\n--- Document ---")
        print("ID:", doc["id"])
        print("Title:", doc["title"])
        print("Path:", doc["path"])
        print("Preview:", doc["content"][:300])

    METADATA_DIR.mkdir(parents=True, exist_ok=True)

    metadata_path = METADATA_DIR / "documents.json"
    metadata_path.write_text(
        json.dumps(documents, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )

    print(f"\nMetadata saved to: {metadata_path}")