import os

import jwt
import psycopg2
from psycopg2 import sql
from fastapi import Cookie, Depends, FastAPI, HTTPException, status
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

JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET or len(JWT_SECRET) < 32:
    raise RuntimeError("JWT_SECRET must be configured with at least 32 characters.")

CORS_ORIGINS = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "").split(",") if origin.strip()]
if not CORS_ORIGINS:
    raise RuntimeError("CORS_ORIGINS must list the permitted frontend origin(s).")

DB_CONFIG = {
    "host": os.environ["DB_HOST"],
    "port": int(os.environ["DB_PORT"]),
    "dbname": os.environ["DB_NAME"],
    "user": os.environ["DB_USER"],
    "password": os.environ["DB_PASSWORD"],
}
DB_SCHEMA = os.environ["DB_SCHEMA"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def current_user(ce_session: str | None = Cookie(default=None)):
    if not ce_session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Please log in.")
    try:
        token_user = jwt.decode(ce_session, JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Please log in.")

    try:
        connection = psycopg2.connect(**DB_CONFIG)
        cursor = connection.cursor()
        cursor.execute(sql.SQL("SET search_path TO {}").format(sql.Identifier(DB_SCHEMA)))
        cursor.execute(
            "SELECT id, name, email, role, session_version FROM users WHERE id = %s AND deleted_at IS NULL",
            (token_user.get("id"),),
        )
        row = cursor.fetchone()
        cursor.close()
        connection.close()
    except psycopg2.Error:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Authentication service unavailable.")

    if not row or token_user.get("sessionVersion", 0) != row[4]:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Please log in.")
    return {"id": row[0], "name": row[1], "email": row[2], "role": row[3]}


def current_admin(user: dict = Depends(current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins only.")
    return user


class ChatMessage(BaseModel):
    role: str
    message: str


class QuestionRequest(BaseModel):
    question: str
    conversation: list[ChatMessage] = []


class TicketRequest(BaseModel):
    question: str
    confidence: float
    sources: list


class ActivityLogRequest(BaseModel):
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
def ask(request: QuestionRequest, user: dict = Depends(current_user)):
    return generate_answer(
        question=request.question,
        user=user.get("name") or user.get("email") or "Unknown user",
        conversation=[msg.dict() for msg in request.conversation]
    )


@app.post("/prepare-ticket")
def prepare_ticket(request: TicketRequest, user: dict = Depends(current_user)):
    return build_ticket_prefill(
        question=request.question,
        sources=request.sources,
        confidence=request.confidence,
        user=user.get("name") or user.get("email") or "Unknown user"
    )


@app.get("/admin/ai-insights")
def admin_ai_insights(_user: dict = Depends(current_admin)):
    """
    Admin endpoint for AI chatbot analytics.
    Shows total AI questions, ticket-needed questions,
    low-confidence questions, and recent AI activity.
    """
    return get_ai_insights()


@app.post("/admin/log-activity")
def admin_log_activity(request: ActivityLogRequest, user: dict = Depends(current_user)):
    """
    Admin tracking endpoint.
    Logs user activities such as login, page visit, or admin action.
    """
    log_user_activity(
        user_id=str(user.get("id")),
        user_name=user.get("name"),
        user_role=user.get("role"),
        activity_type=request.activity_type,
        page=request.page,
        details=request.details
    )

    return {"ok": True}


@app.post("/admin/rebuild-index")
def admin_rebuild_index(_user: dict = Depends(current_admin)):
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
            "error": "The index rebuild failed. Check server logs."
        }
