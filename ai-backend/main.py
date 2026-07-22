from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.generator import generate_answer
from app.ticket_service import build_ticket_prefill
from app.admin_analytics import get_ai_insights
from app.activity_logger import log_user_activity
from build_index import build_index


app = FastAPI(
    title="Cellular Expert AI Assistant",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    role: str
    message: str


class QuestionRequest(BaseModel):
    question: str
    user: str = "Demo User"
    conversation: list[ChatMessage] = []


class TicketRequest(BaseModel):
    question: str
    user: str = "Demo User"
    confidence: float
    sources: list


class ActivityLogRequest(BaseModel):
    user_id: str | None = None
    user_name: str | None = None
    user_role: str | None = None
    activity_type: str
    page: str | None = None
    details: str | None = None


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
        user=request.user,
        conversation=[msg.dict() for msg in request.conversation]
    )


@app.post("/prepare-ticket")
def prepare_ticket(request: TicketRequest):
    return build_ticket_prefill(
        question=request.question,
        sources=request.sources,
        confidence=request.confidence,
        user=request.user
    )


@app.get("/admin/ai-insights")
def admin_ai_insights():
    """
    Admin endpoint for AI chatbot analytics.
    Shows total AI questions, ticket-needed questions,
    low-confidence questions, and recent AI activity.
    """
    return get_ai_insights()


@app.post("/admin/log-activity")
def admin_log_activity(request: ActivityLogRequest):
    """
    Admin tracking endpoint.
    Logs user activities such as login, page visit, or admin action.
    """
    log_user_activity(
        user_id=request.user_id,
        user_name=request.user_name,
        user_role=request.user_role,
        activity_type=request.activity_type,
        page=request.page,
        details=request.details
    )

    return {"ok": True}


@app.post("/admin/rebuild-index")
def admin_rebuild_index():
    """
    Rebuild AI vector database from the latest shared PostgreSQL documents.
    Use this after documentation is synced or updated.
    """
    try:
        build_index()

        return {
            "ok": True,
            "message": "AI vector index rebuilt successfully from PostgreSQL."
        }

    except Exception as error:
        return {
            "ok": False,
            "message": "AI vector index rebuild failed.",
            "error": str(error)
        }