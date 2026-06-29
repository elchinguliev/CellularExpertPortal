from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.generator import generate_answer
from app.ticket_service import build_ticket_prefill


app = FastAPI(
    title="Cellular Expert AI Assistant",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuestionRequest(BaseModel):
    question: str
    user: str = "Demo User"


class TicketRequest(BaseModel):
    question: str
    user: str = "Demo User"
    confidence: float
    sources: list


@app.get("/")
def root():
    return {"message": "Cellular Expert AI Assistant is running."}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ask")
def ask(request: QuestionRequest):
    return generate_answer(
        question=request.question,
        user=request.user
    )


@app.post("/prepare-ticket")
def prepare_ticket(request: TicketRequest):
    return build_ticket_prefill(
        question=request.question,
        sources=request.sources,
        confidence=request.confidence,
        user=request.user
    )