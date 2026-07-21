def build_rag_prompt(question: str, retrieved_results: dict) -> str:
    context_blocks = []

    for i in range(len(retrieved_results["ids"][0])):
        metadata = retrieved_results["metadatas"][0][i]
        document_text = retrieved_results["documents"][0][i]

        context_blocks.append(
            f"""
Source {i + 1}
Document: {metadata["document_title"]}
Section: {metadata["section_title"]}
Product: {metadata["product"]}
Version: {metadata["version"]}

Content:
{document_text}
""".strip()
        )

    context = "\n\n---\n\n".join(context_blocks)

    prompt = f"""
You are the Cellular Expert AI Documentation Assistant.

Answer the user's question using ONLY the documentation context below.

Rules:
- Give a clear and short answer.
- Mention the document and section used.
- If the documentation does not contain enough information, say that you cannot find a reliable answer.
- Do not invent information.

Documentation context:
{context}

User question:
{question}

Answer:
""".strip()

    return prompt