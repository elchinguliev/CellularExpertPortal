-- Run this in pgAdmin (or psql) against your existing cellular_expert_docs database.
-- These are ADDITIVE only — safe alongside your existing users/documents tables.

CREATE TABLE IF NOT EXISTS ai_question_logs (
  id                SERIAL PRIMARY KEY,
  user_name         TEXT,
  question          TEXT NOT NULL,
  answer            TEXT,
  confidence        NUMERIC,
  ticket_needed     BOOLEAN DEFAULT FALSE,
  top_document      TEXT,
  top_section       TEXT,
  product           TEXT,
  response_time_ms  INTEGER,
  source_count      INTEGER DEFAULT 0,
  answer_status     TEXT,
  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_activity_logs (
  id             SERIAL PRIMARY KEY,
  user_id        TEXT,
  user_name      TEXT,
  user_role      TEXT,
  activity_type  TEXT NOT NULL,
  page           TEXT,
  details        TEXT,
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_question_logs_created_at ON ai_question_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_question_logs_ticket_needed ON ai_question_logs(ticket_needed);
CREATE INDEX IF NOT EXISTS idx_ai_question_logs_product ON ai_question_logs(product);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type ON user_activity_logs(activity_type);
