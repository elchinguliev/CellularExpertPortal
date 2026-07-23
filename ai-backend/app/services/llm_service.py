import requests


OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.2:latest"

def generate(prompt: str) -> str:

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.2
            },
        },
        timeout=120,
    )

    response.raise_for_status()

    result = response.json()

    return result["response"]


if __name__ == "__main__":

    test_prompt = """
Explain in one sentence what Artificial Intelligence is.
"""

    answer = generate(test_prompt)

    print(answer)