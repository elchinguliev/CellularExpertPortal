# AI Assistant Module — Setup and Usage Guide

This README explains only the AI-related part of the Cellular Expert Portal.

This part includes:

- FastAPI AI backend
- RAG-based chatbot
- PostgreSQL document loading
- ChromaDB vector database
- Ollama local LLM
- AI-generated support ticket drafts
- AI question logging
- Admin AI Insights endpoint
- Admin AI Insights dashboard integration
- Login, page visit, and performance tracking related to support/admin usage

---

## 1. AI Module Overview

The AI assistant answers user questions using documentation stored in PostgreSQL.

The flow is:

```text
PostgreSQL documentation
        ↓
Chunk documents
        ↓
Create embeddings
        ↓
Store vectors in ChromaDB
        ↓
User asks a question
        ↓
Retrieve top 3 relevant chunks
        ↓
Send context to local LLM
        ↓
Return answer with confidence and sources
```

If the AI confidence is low, the system prepares a support ticket draft.

## 2. Required Software for AI Part

Install:

- Python 3.12
- PostgreSQL 17
- Ollama
- Git

---

## 3. Database Requirement

The AI module uses the PostgreSQL database:

```text
Database name: cellular_expert_docs
User: postgres
Password: cellular123
Host: localhost
Port: 5432
```

Important AI-related tables:

```text
documents
ai_question_logs
user_activity_logs
document_images
```

The schema is located in:

```text
ce-backend/schema.sql
```

## 4. AI Backend Setup

Go to the AI backend folder:

```powershell
cd C:\Users\Win10\Desktop\CellularExpertPortal\ai-backend
```

Install Python dependencies:

```powershell
py -m pip install -r requirements.txt
```

If PostgreSQL connection package is missing, install:

```powershell
py -m pip install psycopg2-binary
```

---

## 5. Ollama Setup

The AI backend uses a local Ollama model.

Install Ollama, then pull the model:

```powershell
ollama pull llama3.2
```

Check that the model exists:

```powershell
ollama list
```

Expected result:

```text
llama3.2
```

Ollama should be running before testing the AI chatbot.

---

## 6. Build the AI Vector Index

The AI backend loads documentation from PostgreSQL, splits it into chunks, creates embeddings, and stores them in ChromaDB.

Run:

```powershell
cd C:\Users\Win10\Desktop\CellularExpertPortal\ai-backend
py build_index.py
```

This creates or updates:

```text
ai-backend/knowledge_base/chunks/
ai-backend/vector_db/
```

The current retrieval setting is:

```text
top_k = 3
```

This means the chatbot retrieves the top 3 most relevant documentation chunks for each user question.

---

## 7. Start the AI Backend

Run:

```powershell
cd C:\Users\Win10\Desktop\CellularExpertPortal\ai-backend
py -m uvicorn main:app --reload --port 8000
```

Check if the AI backend is working:

```text
http://localhost:8000/health
```

Expected result:

```json
{ "status": "ok" }
```

---

## 8. Important AI Endpoints

### Health check

```text
GET http://localhost:8000/health
```

### Ask chatbot

```text
POST http://localhost:8000/ask
```

Used by the frontend chatbot.

### Prepare ticket

```text
POST http://localhost:8000/prepare-ticket
```

Used when the AI cannot answer confidently.

### Admin AI Insights

```text
GET http://localhost:8000/admin/ai-insights
```

Returns AI analytics for the admin dashboard.

### Activity logging

```text
POST http://localhost:8000/admin/log-activity
```

Stores login, page visit, and performance tracking events.

---

## 9. AI Chatbot Behavior

When the user asks a question, the AI system:

1. Searches relevant documentation chunks in ChromaDB.
2. Retrieves the top 3 matching chunks.
3. Calculates confidence.
4. Sends the context to the local LLM.
5. Returns an answer, confidence score, and sources.

Example question:

```text
What is CE Express?
```

Expected result:

```text
AI answer
Confidence score
Documentation sources
Related product or document information
```

---

## 10. Low-Confidence Ticket Flow

If the AI cannot find a reliable answer, it prepares a support ticket draft.

Example question:

```text
Why is my CE Express device not connecting to the portal?
```

Expected result:

```text
Low-confidence response
Ticket-needed status
Open Ticket button in frontend
AI-generated ticket draft
```

The ticket draft includes:

```text
User question
Product
Version
Issue type
Priority suggestion
Related documents
Clean context summary
```

---

## 11. AI Question Logging

Every chatbot question is stored in PostgreSQL in:

```text
ai_question_logs
```

The log includes:

```text
user_name
question
answer
confidence
ticket_needed
top_document
top_section
product
response_time_ms
source_count
answer_status
created_at
```

This helps admins understand:

```text
what users ask most often
which topics have low confidence
which questions become support tickets
how long AI responses take
how many documentation sources were used
```

Check recent AI logs:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h 127.0.0.1 -U postgres -d cellular_expert_docs -c "SELECT id, user_name, question, confidence, response_time_ms, source_count, answer_status, ticket_needed, created_at FROM ai_question_logs ORDER BY id DESC LIMIT 10;"
```

---

## 12. Admin AI Insights

The AI Insights dashboard shows useful statistics about chatbot usage.

It includes:

```text
Total AI Questions
Ticket Needed
Average Confidence
Answered Without Ticket
Ticket Rate
Low-Confidence Questions
Questions by Product
Recent AI Questions
```

Backend endpoint:

```text
GET http://localhost:8000/admin/ai-insights
```

Frontend location:

```text
Support Admin Side → AI Insights
```

This helps admins understand:

```text
which questions users ask most often
which documentation areas may be unclear
which questions often require support tickets
which AI responses have low confidence
```

---

## 13. Activity and Performance Tracking

The AI/support part also logs user activity in PostgreSQL.

The activity data is stored in:

```text
user_activity_logs
```

Currently tracked events:

```text
login
logout
register
page_visit
performance
```

This helps admins understand:

```text
who logged in
which admin or support page was opened
how long important pages took to open
when users visited AI Insights, Users, All Tickets, and other pages
```

Check recent activity logs:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h 127.0.0.1 -U postgres -d cellular_expert_docs -c "SELECT id, user_name, user_role, activity_type, page, details, created_at FROM user_activity_logs ORDER BY id DESC LIMIT 10;"
```

---

## 14. Common AI Issues

### FastAPI backend is not reachable

Check:

```text
http://localhost:8000/health
```

Restart the AI backend:

```powershell
cd C:\Users\Win10\Desktop\CellularExpertPortal\ai-backend
py -m uvicorn main:app --reload --port 8000
```

---

### ChromaDB error or corrupted vector database

Delete and rebuild the vector database:

```powershell
cd C:\Users\Win10\Desktop\CellularExpertPortal\ai-backend
Remove-Item -Recurse -Force vector_db
py build_index.py
```

---

### PostgreSQL password issue

Use:

```powershell
$env:PGPASSWORD="cellular123"
```

Then use `-h 127.0.0.1` in psql commands.

Example:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h 127.0.0.1 -U postgres -d cellular_expert_docs -c "SELECT 1;"
```

---

### First AI answer is slow

The first response can be slower because Ollama loads the local model.

Usually:

```text
First request: slower
Next requests: faster
```

---

## 15. Git Branch

AI work is currently developed in:

```text
natavan-ai
```

Update the branch:

```bash
git checkout natavan-ai
git pull origin natavan-ai
```

Commit and push AI changes:

```bash
git add .
git commit -m "Update AI module README"
git push origin natavan-ai
```

---

## 16. Implemented AI Features

Completed so far:

```text
AI chatbot connected to documentation
PostgreSQL document loading
RAG with ChromaDB
Top 3 chunk retrieval
Local LLM answer generation through Ollama
Confidence scoring
Source display
AI-generated ticket drafts
Clean ticket descriptions
AI question logging
AI response time logging
Source count logging
Answer status logging
Admin AI Insights backend
Admin AI Insights frontend
Login tracking
Page visit tracking
Page performance tracking
```

