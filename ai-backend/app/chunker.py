from pathlib import Path
import json
from knowledge_loader import load_all_markdown_files


BASE_DIR = Path(__file__).resolve().parents[1]
CHUNKS_DIR = BASE_DIR / "knowledge_base" / "chunks"


def split_by_markdown_headings(document: dict) -> list:
    content = document["content"]
    lines = content.splitlines()

    chunks = []
    current_heading = document["title"]
    current_text = []

    for line in lines:
        if line.startswith("#"):
            if current_text:
                chunks.append({
                    "chunk_id": f"{document['id']}_chunk_{len(chunks) + 1}",
                    "document_id": document["id"],
                    "document_title": document["title"],
                    "section_title": current_heading,
                    "product": document["product"],
                    "version": document["version"],
                    "category": document["category"],
                    "source_file": document["source_file"],
                    "text": "\n".join(current_text).strip()
                })
                current_text = []

            current_heading = line.replace("#", "").strip()
        else:
            if line.strip():
                current_text.append(line)

    if current_text:
        chunks.append({
            "chunk_id": f"{document['id']}_chunk_{len(chunks) + 1}",
            "document_id": document["id"],
            "document_title": document["title"],
            "section_title": current_heading,
            "product": document["product"],
            "version": document["version"],
            "category": document["category"],
            "source_file": document["source_file"],
            "text": "\n".join(current_text).strip()
        })

    return chunks


if __name__ == "__main__":
    CHUNKS_DIR.mkdir(parents=True, exist_ok=True)

    documents = load_all_markdown_files()
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

        print(f"\n✓ {document['title']}")
        print(f"  {len(chunks)} chunk(s)")
        print(f"  Saved -> {output_path.name}")

    print(f"\nTotal chunks created: {total_chunks}")