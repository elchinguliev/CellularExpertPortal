# Cellular Expert Portal

A support & documentation portal for the Cellular Expert product family (CE Express, CE Desktop Pro, Inventory3D, Geodata), with:

- **Documentation browser** — content synced from a GitHub docs repo into PostgreSQL
- **AI support chatbot** — a RAG (Retrieval-Augmented Generation) pipeline over the same documentation, answered by a local LLM (Ollama)
- **Support ticket system** — with screenshots, admin replies, and status tracking
- **Admin panel** — manage documentation, FAQ, tickets, and users
- **User accounts** — registration with email verification, login, forgot-password flow

This README explains how to set the whole thing up from zero.

---

## 1. Architecture overview

```
CellularExpertDocs (GitHub repo, markdown docs + images)
        │
        │  npm run sync  (ce-backend/sync-from-github.js)
        ▼
PostgreSQL  (shared DB — see "Database" section below)
        │
        ├──────────────► ce-backend (Node/Express, port 4000)
        │                 REST API: docs, auth, tickets, FAQ, users, images
        │
        └──────────────► ai-backend (Python/FastAPI, port 8000)
                          RAG pipeline: chunk → embed → ChromaDB → retrieve → Ollama

Frontend (React, port 3000) — talks to both backends above
```

| Piece        | Tech                       | Port  | Folder          |
| ------------ | -------------------------- | ----- | --------------- |
| Frontend     | React                      | 3000  | `/` (root)      |
| Main backend | Node.js / Express          | 4000  | `ce-backend/`   |
| AI backend   | Python / FastAPI           | 8000  | `ai-backend/`   |
| LLM          | Ollama (`llama3.2`)        | 11434 | (external tool) |
| Database     | PostgreSQL (shared server) | 5432  | —               |

---

## 2. Prerequisites

Install these before doing anything else:

- **Node.js** 18+ (comes with `npm`)
- **Python** 3.10+ (with `pip`)
- **PostgreSQL client tools** (`psql`) — or use pgAdmin / DBeaver as a GUI alternative
- **[Ollama](https://ollama.com/download)** — for the local LLM used by the AI chatbot
- **Git**
- Access to the shared PostgreSQL server (host/port/credentials — ask a teammate/mentor) and, if it's office-only, a **VPN client** (e.g. WireGuard) with a valid `.conf` profile

---

## 3. Clone the repo

```bash
git clone https://github.com/elchinguliev/CellularExpertPortal.git
cd CellularExpertPortal
git checkout elchinbranch   # or whichever branch you're working on
```

---

## 4. Database setup

This project uses a **shared PostgreSQL database** with a dedicated schema (commonly `ce_boss`, but confirm the name you were given).

### 4.1 Connect and confirm access

```bash
psql -h <DB_HOST> -p 5432 -U <DB_USER> -d <DB_NAME>
```

If this is an office-only server, connect to the VPN first.

### 4.2 Create the schema objects

Inside `psql` (or pgAdmin's Query Tool), with `search_path` set to your schema:

```sql
SET search_path TO ce_boss;   -- use your actual schema name

\i ce-backend/schema.sql
\i ce-backend/schema-additions.sql
```

This creates all tables the app needs:

| Table                                                                 | Purpose                                                                            |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `documents`, `document_images`, `document_links`, `document_headings` | Synced documentation content + full-text search                                    |
| `users`                                                               | Accounts (bcrypt-hashed passwords, roles: `user` / `agent` / `admin`)              |
| `tickets`, `ticket_messages`                                          | Support ticket system (with `attachment_url` for screenshots)                      |
| `verification_codes`                                                  | Email verification codes (registration + password reset)                           |
| `faq_items`                                                           | Admin-editable FAQ shown on the client FAQ tab                                     |
| `synced_images`                                                       | Actual image bytes downloaded from the docs repo (served via `/api/synced-images`) |
| `ai_question_logs`, `user_activity_logs`                              | Analytics for the AI backend / admin dashboard                                     |

### 4.3 Create an admin account

Handled by a script later in step 6 (`node seed-admin.js`) — don't do this manually.

---

## 5. Configure environment variables

Create `ce-backend/.env`:

```env
DB_HOST=<your-db-host>
DB_PORT=5432
DB_NAME=<your-db-name>
DB_USER=<your-db-user>
DB_PASSWORD=<your-db-password>
DB_SCHEMA=ce_boss

PORT=4000

GITHUB_RAW_BASE=https://raw.githubusercontent.com/elchinguliev/CellularExpertDocs/main

EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> `EMAIL_PASS` must be a Gmail **App Password**, not your normal account password.
> Never commit this `.env` file — check it's listed in `ce-backend/.gitignore`.

---

## 6. Install & run the main backend (`ce-backend`)

```bash
cd ce-backend
npm install

# Pull documentation content from GitHub into PostgreSQL
npm run sync

# Create the default admin account (prints login credentials — change the password after logging in)
node seed-admin.js

# Start the API server
node server.js
```

You should see:

```
✅ CE Docs API running at http://localhost:4000
```

Sanity check in a browser:

- `http://localhost:4000/api/health` → `{"ok":true,"db":"connected"}`
- `http://localhost:4000/api/docs` → JSON list of synced documents

> **Note on `npm run sync`:** the first run downloads every image referenced in the docs (a few thousand) into the `synced_images` table and can take a while. Subsequent runs are much faster — images already in the database are skipped, only new/changed markdown content and new images are fetched.

---

## 7. Install & run the AI backend (`ai-backend`)

### 7.1 Start Ollama and pull the model

```bash
ollama pull llama3.2
```

Ollama typically runs automatically in the background after installation, listening on `http://localhost:11434`.

### 7.2 Set up the Python environment

```bash
cd ai-backend
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt --break-system-packages   # or without the flag, depending on your OS
```

### 7.3 Build the vector index and start the server

```bash
python build_index.py
uvicorn main:app --reload --port 8000
```

Sanity check: `http://localhost:8000/health` → `{"status":"ok"}`

---

## 8. Install & run the frontend

From the project root (not `ce-backend`):

```bash
npm install
npm start
```

This opens `http://localhost:3000` automatically.

---

## 9. Running everything together

You need **4 things running at once**, each in its own terminal:

| Terminal | Command                                    | Folder                      |
| -------- | ------------------------------------------ | --------------------------- |
| 1        | `node server.js`                           | `ce-backend/`               |
| 2        | Ollama (runs in background once installed) | —                           |
| 3        | `uvicorn main:app --reload --port 8000`    | `ai-backend/` (venv active) |
| 4        | `npm start`                                | project root                |

If the frontend shows "Backend not reachable" — terminal 1 isn't running or crashed. If the AI chat doesn't respond — check terminals 2 and 3.

---

## 10. Logging in

Use the credentials printed by `node seed-admin.js` (default: `admin@cellular-expert.com` / `ChangeMe123!` — **change this password after first login**). Regular users can self-register through the app (with email verification).

---

## 11. Updating documentation content later

Documentation content itself lives in the [`CellularExpertDocs`](https://github.com/elchinguliev/CellularExpertDocs) repo, **not** in this repo. To pull in content changes made there:

```bash
cd ce-backend
npm run sync
```

If files were renamed, merged, split, or removed in `CellularExpertDocs`, you'll also need to update `ce-backend/doc-index.json` and `src/useGithubDocs.js` (which map document IDs to their paths in that repo) to match — otherwise `npm run sync` will report fetch errors for paths that no longer exist, and new files won't be picked up until they're added to these two index files.

---

## 12. Common issues

| Symptom                                                  | Likely cause                                                                                                                                                                                               |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `psql : term not recognized`                             | PostgreSQL's `bin` folder isn't on your `PATH` for this terminal session — see step 4 above, or run `$env:Path += ";C:\Program Files\PostgreSQL\<version>\bin"` (Windows/PowerShell)                       |
| Can't connect to the DB at all                           | You're off the office network/VPN, or the server firewall doesn't allow your IP                                                                                                                            |
| `column "..." does not exist` during sync                | `schema.sql` wasn't fully applied, or you're on an older DB snapshot — re-run `schema.sql` / `schema-additions.sql`                                                                                        |
| Sync reports "fetch failed" for some docs                | Those paths no longer exist in `CellularExpertDocs` — update `doc-index.json` / `useGithubDocs.js`                                                                                                         |
| Images don't show in a doc                               | Re-run `npm run sync` after confirming the image actually exists in the `CellularExpertDocs` repo at the expected relative path                                                                            |
| Typing in an admin form loses focus after each keystroke | A React component is being invoked as `<Component/>` instead of `Component()` inside another component's render — see how `AdminDocs`/`AdminFaq` are called in `SupportPortal.jsx` for the correct pattern |

---

## 13. Project structure

```
CellularExpertPortal/
├── src/                      React frontend
│   ├── App.js                 Documentation browser, markdown renderer
│   ├── useGithubDocs.js        Document index + nav grouping (mirrors ce-backend/doc-index.json)
│   ├── supportData.js          Static seed data (chat suggestions, agents, etc.)
│   └── components/
│       ├── SupportPortal.jsx   Support portal shell: chat, tickets, FAQ, profile, admin panel
│       ├── LoginForm.jsx        Login / register / forgot-password flows
│       ├── NewTicketForm.jsx    Ticket creation form (incl. screenshot upload)
│       └── StableInput.jsx      Memoized input/textarea (prevents focus loss — see issue above)
│
├── ce-backend/                Node/Express API + PostgreSQL
│   ├── server.js                All REST endpoints
│   ├── sync-from-github.js      Pulls docs + images from GitHub into Postgres
│   ├── seed-admin.js            Creates the default admin account
│   ├── mailer.js                Email sending (welcome, password change, verification codes)
│   ├── doc-index.json           Document ID → GitHub path → title/category/order mapping
│   ├── schema.sql                Core tables
│   └── schema-additions.sql      FAQ, synced_images, analytics tables
│
└── ai-backend/                 Python/FastAPI RAG chatbot
    ├── main.py                   API entrypoint
    ├── build_index.py            Builds the ChromaDB vector index
    └── app/
        ├── rag_pipeline.py        Retrieval + conversation logic
        ├── retriever.py           Vector similarity search
        ├── embedder.py            Text embedding (sentence-transformers)
        ├── llm_service.py         Calls Ollama for answer generation
        └── postgres_loader.py     Loads/logs data to/from Postgres
```
