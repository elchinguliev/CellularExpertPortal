# Cellular Expert — Documentation & Support Portal

A documentation and support platform for the Cellular Expert product family (CE Express, CE Desktop Pro, Inventory3D, Geodata).

## Prerequisites

Install these first:

- **Node.js** v18+ (includes npm) — https://nodejs.org
- **PostgreSQL** v14+ — https://www.postgresql.org/download
- **Git**

## How to Run This Project

### 1. Clone the repository

```bash
git clone https://github.com/elchinguliev/CellularExpertPortal.git
cd CellularExpertPortal
```

### 2. Install dependencies

```bash
npm install
cd ce-backend
npm install
cd ..
```

### 3. Create the PostgreSQL database

Open `psql` or pgAdmin and run:

```sql
CREATE DATABASE cellular_expert_docs;
```

Then apply the schema:

```bash
psql -U postgres -d cellular_expert_docs -f ce-backend/schema.sql
```

### 4. Create the `.env` file

Create a file named `.env` inside `ce-backend/` with:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cellular_expert_docs
DB_USER=postgres
DB_PASSWORD=your_postgres_password
PORT=4000
GITHUB_RAW_BASE=https://raw.githubusercontent.com/elchinguliev/CellularExpertDocs/main
```

Replace `your_postgres_password` with your actual PostgreSQL password.

### 5. Sync the documentation content

This pulls all documentation from GitHub into your PostgreSQL database:

```bash
cd ce-backend
npm run sync
```

Wait for it to finish — it should end with `Done. X synced, 0 failed.`

### 6. Start the backend server

Still inside `ce-backend/`:

```bash
node server.js
```

Leave this terminal open. You should see:

```
✅ CE Docs API running at http://localhost:4000
```

### 7. Start the frontend

Open a **new** terminal, go back to the project root, and run:

```bash
cd CellularExpertPortal
npm start
```

This will automatically open **http://localhost:3000** in your browser.

### 8. Done

You now have two terminals running at the same time:

- Terminal 1 → backend (`node server.js`) on port 4000
- Terminal 2 → frontend (`npm start`) on port 3000

The website should be fully working — homepage, Documentation, and Support sections.

## Optional: PDF Downloads

If you also received a folder of PDF files, place it at:

```
ce-backend/public/downloads/
```

so the "Download PDF" buttons on documentation pages work.
