from pathlib import Path
import json


BASE_DIR = Path(__file__).resolve().parents[1]
MARKDOWN_DIR = BASE_DIR / "knowledge_base" / "markdown"
METADATA_DIR = BASE_DIR / "knowledge_base" / "metadata"


def parse_front_matter(content: str) -> tuple[dict, str]:
    """
    Extract YAML-like metadata from the top of a markdown file.

    Example:
    ---
    id: ce-express-introduction
    title: Introduction to CE Express
    product: CE Express
    ---

    Returns:
    metadata dictionary + clean markdown content
    """

    if not content.startswith("---"):
        return {}, content

    parts = content.split("---", 2)

    if len(parts) < 3:
        return {}, content

    raw_metadata = parts[1].strip()
    clean_content = parts[2].strip()

    metadata = {}

    for line in raw_metadata.splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            metadata[key.strip()] = value.strip().strip('"').strip("'")

    return metadata, clean_content


def extract_title_from_content(content: str, fallback_title: str) -> str:
    for line in content.splitlines():
        if line.startswith("# "):
            return line.replace("# ", "").strip()

    return fallback_title


def load_markdown_file(file_path: Path) -> dict:
    raw_content = file_path.read_text(encoding="utf-8")

    front_matter, clean_content = parse_front_matter(raw_content)

    fallback_title = file_path.stem.replace("-", " ").title()
    title = front_matter.get(
        "title",
        extract_title_from_content(clean_content, fallback_title)
    )

    return {
        "id": front_matter.get("id", file_path.stem),
        "title": title,
        "product": front_matter.get("product", "Unknown"),
        "version": front_matter.get("version", "Unknown"),
        "category": front_matter.get("category", "Uncategorized"),
        "source_file": file_path.name,
        "path": str(file_path),
        "content": clean_content,
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
        print("Product:", doc["product"])
        print("Version:", doc["version"])
        print("Category:", doc["category"])
        print("Source file:", doc["source_file"])
        print("Preview:", doc["content"][:300])

    METADATA_DIR.mkdir(parents=True, exist_ok=True)

    metadata_path = METADATA_DIR / "documents.json"
    metadata_path.write_text(
        json.dumps(documents, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )

    print(f"\nMetadata saved to: {metadata_path}")