// server.js
// Minimal Express API that serves documentation from PostgreSQL.
// Run with: npm start

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');

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
      `SELECT id, image_url, caption, section_anchor, display_order
       FROM document_images
       WHERE doc_id = $1
         AND caption NOT ILIKE '%icon%'
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

// ── Register a new account ───────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, company, product } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const hash = await bcrypt.hash(password, 10);
    const avatar = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, company, product, role, avatar)
       VALUES ($1, $2, $3, $4, $5, 'user', $6)
       RETURNING id, name, email, company, product, role, avatar, created_at`,
      [name, email.toLowerCase(), hash, company || null, product || 'CE Express', avatar]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// ── Log in ────────────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const { rows } = await pool.query(
      `SELECT id, name, email, password_hash, company, product, role, avatar, created_at
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Account not found' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Incorrect password' });
    }
    delete user.password_hash;
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── List all users (admin "Users" tab) ───────────────────────────────────────
app.get('/api/auth/users', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, company, product, role, avatar, created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Update a document (admin CRUD) ───────────────────────────────────────────
app.put('/api/docs/:docId', async (req, res) => {
  try {
    const { docId } = req.params;
    const { title, product, category, content } = req.body;
    const { rows } = await pool.query(
      `UPDATE documents
       SET title    = COALESCE($2, title),
           product  = COALESCE($3, product),
           category = COALESCE($4, category),
           content  = COALESCE($5, content),
           updated_at = NOW()
       WHERE doc_id = $1
       RETURNING *`,
      [docId, title, product, category, content]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Delete a document (admin CRUD) ───────────────────────────────────────────
app.delete('/api/docs/:docId', async (req, res) => {
  try {
    const { docId } = req.params;
    const { rowCount } = await pool.query(`DELETE FROM documents WHERE doc_id = $1`, [docId]);
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true, deleted: docId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Create a new document (admin CRUD) ───────────────────────────────────────
app.post('/api/docs', async (req, res) => {
  try {
    const { doc_id, title, product, category, content, github_path } = req.body;
    if (!doc_id || !title || !product || !category) {
      return res.status(400).json({ error: 'doc_id, title, product, and category are required' });
    }
    const { rows } = await pool.query(
      `INSERT INTO documents (doc_id, title, product, category, content, github_path, display_order)
       VALUES ($1,$2,$3,$4,$5,$6,99)
       RETURNING *`,
      [doc_id, title, product, category, content || '', github_path || `admin/${doc_id}.md`]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A document with this ID already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, 'public', 'images', req.params.docId);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const safe = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      cb(null, safe);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB max
});

// ── Upload a new image/icon for a document (admin CRUD) ──────────────────────
app.post('/api/docs/:docId/images/upload', upload.single('image'), async (req, res) => {
  try {
    const { docId } = req.params;
    const { caption, section_anchor, display_order } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const image_url = `http://localhost:${process.env.PORT || 4000}/images/${docId}/${req.file.filename}`;

    const { rows } = await pool.query(
      `INSERT INTO document_images (doc_id, image_url, caption, section_anchor, display_order)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [docId, image_url, caption || null, section_anchor || null, display_order || 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Delete an image (admin CRUD) ──────────────────────────────────────────────
app.delete('/api/docs/:docId/images/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const { rowCount } = await pool.query(`DELETE FROM document_images WHERE id = $1`, [imageId]);
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
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