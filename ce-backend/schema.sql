-- ════════════════════════════════════════════════════════════════════════════
-- Cellular Expert Documentation — PostgreSQL schema
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS documents (
  id             SERIAL PRIMARY KEY,
  doc_id         TEXT UNIQUE NOT NULL,
  title          TEXT NOT NULL,
  product        TEXT NOT NULL,
  category       TEXT NOT NULL,
  tags           TEXT[] DEFAULT '{}',
  github_path    TEXT NOT NULL,
  content        TEXT NOT NULL,
  display_order  INTEGER DEFAULT 99,
  created_at     TIMESTAMP DEFAULT NOW(),
  updated_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_images (
  id             SERIAL PRIMARY KEY,
  doc_id         TEXT REFERENCES documents(doc_id) ON DELETE CASCADE,
  image_url      TEXT NOT NULL,
  caption        TEXT,
  section_anchor TEXT,
  display_order  INTEGER DEFAULT 0,
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_links (
  id              SERIAL PRIMARY KEY,
  from_doc_id     TEXT REFERENCES documents(doc_id) ON DELETE CASCADE,
  to_doc_id       TEXT REFERENCES documents(doc_id) ON DELETE CASCADE,
  link_label      TEXT
);

CREATE TABLE IF NOT EXISTS document_headings (
  id           SERIAL PRIMARY KEY,
  doc_id       TEXT REFERENCES documents(doc_id) ON DELETE CASCADE,
  heading_text TEXT NOT NULL,
  heading_slug TEXT NOT NULL,
  level        INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_documents_product  ON documents(product);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_tags     ON documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_headings_doc       ON document_headings(doc_id);
CREATE INDEX IF NOT EXISTS idx_headings_slug      ON document_headings(heading_slug);

ALTER TABLE documents ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Raw GitHub folder-name chain a doc lives under, BELOW its auto-discovery
-- root (e.g. {'3-ce-express-tools'} for a file under
-- v73-sections/3-ce-express-tools/ — the root folder itself, "v73-sections",
-- is a structural/version container and is deliberately excluded so it
-- never becomes a visible nav node). Kept separate from `category` (a flat
-- display label) and `github_path` (the exact file path) per the "one
-- concept per column" split described in doc-discovery.js.
--
-- NULL (not '{}') for documents that were never auto-discovered — NULL is
-- the "no real parent_path" sentinel the frontend nav builder checks via
-- Array.isArray() to fall back to the flat `category` column, exactly as it
-- always has. An auto-discovered doc always gets a real array here, even
-- when legitimately empty (a file sitting directly in the root, with no
-- group folder) — see sync-from-github.js's syncDoc().
ALTER TABLE documents ADD COLUMN IF NOT EXISTS parent_path TEXT[];
ALTER TABLE documents ALTER COLUMN parent_path DROP DEFAULT;

-- Root-level navigation priority, distinct from a document's numeric reading
-- order. This keeps versioned documentation before Training, and Training
-- before an Administrator Guide without changing any page-level ordering.
ALTER TABLE documents ADD COLUMN IF NOT EXISTS nav_group_order INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION documents_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags,' '),'')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.content,'')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS documents_search_vector_trigger ON documents;
CREATE TRIGGER documents_search_vector_trigger
  BEFORE INSERT OR UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION documents_search_vector_update();


CREATE INDEX IF NOT EXISTS idx_documents_search ON documents USING GIN(search_vector);

-- ════════════════════════════════════════════════════════════════════════════
-- Real, persistent user accounts (replaces the in-memory demo SEED_USERS)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  company       TEXT,
  product       TEXT DEFAULT 'CE Express',
  role          TEXT NOT NULL DEFAULT 'user',   -- 'user' | 'agent' | 'admin'
  avatar        TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);


CREATE TABLE IF NOT EXISTS tickets (
  id            SERIAL PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  user_id       INTEGER REFERENCES users(id),
  title         TEXT NOT NULL,
  product       TEXT,
  version       TEXT,
  category      TEXT,
  priority      TEXT DEFAULT 'Normal',
  status        TEXT DEFAULT 'Open',
  assigned_to   INTEGER REFERENCES users(id),
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW(),
  assigned_to   INTEGER REFERENCES users(id),
  attachment_url TEXT,
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id          SERIAL PRIMARY KEY,
  ticket_id   INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
  sender_id   INTEGER,
  sender_name TEXT,
  message     TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);


CREATE TABLE IF NOT EXISTS verification_codes (
  id          SERIAL PRIMARY KEY,
  email       TEXT NOT NULL,
  code        TEXT NOT NULL,
  purpose     TEXT NOT NULL, -- 'register' | 'reset_password'
  payload     JSONB,          -- pending registration data (name, password_hash, company, product)
  expires_at  TIMESTAMP NOT NULL,
  used        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);

SET search_path TO ce_boss;

CREATE TABLE IF NOT EXISTS faq_items (
  id             SERIAL PRIMARY KEY,
  title          TEXT NOT NULL,
  answer         TEXT NOT NULL,
  tags           TEXT[] DEFAULT '{}',
  display_order  INTEGER DEFAULT 99,
  created_at     TIMESTAMP DEFAULT NOW(),
  updated_at     TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_faq_items_display_order ON faq_items(display_order);

SET search_path TO ce_boss;
CREATE TABLE IF NOT EXISTS synced_images (
  id         SERIAL PRIMARY KEY,
  path       TEXT UNIQUE NOT NULL,
  mime_type  TEXT NOT NULL,
  data       BYTEA NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
