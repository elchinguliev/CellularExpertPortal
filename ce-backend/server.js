// server.js
// Minimal Express API that serves documentation from PostgreSQL.
// Run with: npm start

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Serves everything under ce-backend/public/downloads at:
//   http://localhost:4000/downloads/<product>/<...>/<file>.pdf
// Used by the frontend "Download PDF" button (doc.pdf_path).
app.use('/downloads', express.static(path.join(__dirname, 'public', 'downloads')));

// Serves extracted screenshots/diagrams used inline inside doc content at:
//   http://localhost:4000/images/<doc-id>/<file>.png
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'connected' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── List all docs (index for sidebar nav) — lightweight, no content ──────────
app.get('/api/docs', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT doc_id, title, product, category, github_path, display_order, tags
       FROM documents ORDER BY product, category, display_order`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get a single document with full content + images + headings ──────────────
app.get('/api/docs/:docId', async (req, res) => {
  try {
    const { docId } = req.params;
    const docRes = await pool.query(`SELECT * FROM documents WHERE doc_id = $1`, [docId]);
    if (docRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    // Exclude inline UI icons (gear/book/button glyphs scraped alongside real
    // screenshots) — these were never meant to be shown as standalone figures.
    // Real screenshots are captioned as "... page" / "... dialog" etc.;
    // scraped inline icons are captioned "... icon".
   const imagesRes = await pool.query(
      `SELECT image_url, caption, section_anchor, display_order
       FROM document_images
       WHERE doc_id = $1
         AND caption NOT ILIKE '%inline use%'
       ORDER BY display_order`,
      [docId]
    );
    const headingsRes = await pool.query(
      `SELECT heading_text, heading_slug, level
       FROM document_headings WHERE doc_id = $1`,
      [docId]
    );

    res.json({
      ...docRes.rows[0],
      images: imagesRes.rows,
      headings: headingsRes.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Full-text search using PostgreSQL's built-in search_vector ───────────────
app.get('/api/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);

    const { rows } = await pool.query(
      `SELECT doc_id, title, product, category,
              ts_rank(search_vector, plainto_tsquery('english', $1)) AS rank,
              ts_headline('english', content, plainto_tsquery('english', $1),
                'MaxFragments=1, MaxWords=25, MinWords=10') AS snippet
       FROM documents
       WHERE search_vector @@ plainto_tsquery('english', $1)
       ORDER BY rank DESC
       LIMIT 10`,
      [q]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Add/update an image for a doc (used by an admin tool later) ──────────────
app.post('/api/docs/:docId/images', async (req, res) => {
  try {
    const { docId } = req.params;
    const { image_url, caption, section_anchor, display_order } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO document_images (doc_id, image_url, caption, section_anchor, display_order)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [docId, image_url, caption || null, section_anchor || null, display_order || 0]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ CE Docs API running at http://localhost:${PORT}`);
  console.log(`   Try: http://localhost:${PORT}/api/health`);
  console.log(`        http://localhost:${PORT}/api/docs`);
});