// server.js
// Minimal Express API that serves documentation from PostgreSQL.
// Run with: npm start
const { sendWelcomeEmail, sendPasswordChangedEmail, sendVerificationCode, sendSupportRequest } = require('./mailer');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { legacyIdFromGithubPath } = require('./doc-discovery');

const app = express();

// credentials: true + an explicit origin (not "*") are both required for the
// browser to actually send/accept the session cookie set below.
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://10.8.0.11:3000'
  ],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ── Session auth (JWT stored in an httpOnly cookie) ───────────────────────────
// Replaces trusting whatever role the frontend happens to have in
// localStorage — the server now verifies who's making each request instead
// of just taking the client's word for it.
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-me';
const COOKIE_NAME = 'ce_session';

function signSession(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function setSessionCookie(res, user) {
  res.cookie(COOKIE_NAME, signSession(user), {
    httpOnly: true,       // not readable from JS — protects against XSS reading it
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// Attaches req.user if a valid session cookie is present; does not block the
// request either way (used on every request so /api/auth/me can check it).
function readSession(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      req.user = null;
    }
  }
  next();
}
app.use(readSession);

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Please log in.' });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Please log in.' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only.' });
  next();
}

function blockDocumentationEditing(req, res) {
  return res.status(404).json({ error: 'Documentation editing is disabled.' });
}

function blockProductAccessChanges(req, res) {
  return res.status(404).json({ error: 'Product access changes are disabled.' });
}

// Serves everything under ce-backend/public/downloads at:
//   http://localhost:4000/downloads/<product>/<...>/<file>.pdf
// Used by the frontend "Download PDF" button (doc.pdf_path).
app.use('/downloads', express.static(path.join(__dirname, 'public', 'downloads')));

// Serves extracted screenshots/diagrams used inline inside doc content at:
//   http://localhost:4000/images/<doc-id>/<file>.png
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Serves ticket screenshots at:
//   http://localhost:4000/ticket-attachments/<ticket-id>/<file>.png
app.use('/ticket-attachments', express.static(path.join(__dirname, 'public', 'ticket-attachments')));

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: `-c search_path=${process.env.DB_SCHEMA || 'ce_boss'}`,
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
      `SELECT doc_id, title, product, category, github_path, display_order, tags, parent_path, nav_group_order
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
    let docRes = await pool.query(`SELECT * FROM documents WHERE doc_id = $1`, [docId]);

    // Not found under its current id — doc-discovery.js's id scheme has
    // changed before (numeric ordering prefixes used to leak into the id,
    // e.g. ce-express-v73-3-1-31-audibility instead of today's
    // ce-express-v73-ce-express-tools-audibility) and may again. Recompute
    // what the OLD-style id would've been for each auto-discovered doc's
    // github_path and see if the requested id matches one of those, so a
    // bookmarked/shared link from before a rename keeps working — the
    // response below still carries the doc's real, current doc_id, and the
    // frontend uses that to fix the address bar (see fetchDoc in
    // src/useGithubDocs.js).
    if (docRes.rows.length === 0) {
      const candidates = await pool.query(
        `SELECT doc_id, product, github_path FROM documents WHERE github_path IS NOT NULL`
      );
      const match = candidates.rows.find(
        (r) => legacyIdFromGithubPath(r.product, r.github_path) === docId
      );
      if (match) {
        docRes = await pool.query(`SELECT * FROM documents WHERE doc_id = $1`, [match.doc_id]);
      }
    }

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
app.post('/api/docs/:docId/images', blockDocumentationEditing, async (req, res) => {
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
    const { name, email, password, company } = req.body;
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
    setSessionCookie(res, user);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Called once when the app loads to check "am I already logged in?" — reads
// the httpOnly cookie server-side instead of trusting anything from the
// client, so a tampered localStorage value can no longer fake a role.
app.get('/api/auth/me', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not logged in' });
  try {
    // The session cookie only carries id/name/email/role (kept small on
    // purpose) — always look up the full, current profile from the database
    // rather than trusting whatever was baked into the token at login time.
    const { rows } = await pool.query(
      `SELECT id, name, email, company, product, role, avatar, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Account not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

// ── List all users (admin "Users" tab) — includes ticket count per user ─────
app.get('/api/auth/users', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.email, u.company, u.product, u.role, u.avatar, u.created_at,
              COUNT(t.id)::int AS ticket_count
       FROM users u
       LEFT JOIN tickets t ON t.user_id = u.id
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a user from the admin Users panel.
app.post('/api/auth/users', requireAdmin, async (req, res) => {
  try {
    const { name, email, password, company, role } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const allowedRoles = ['user', 'admin'];

    if (!name || !normalizedEmail || !password || !company) {
      return res.status(400).json({ error: 'Name, email, password, and company are required' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid user role' });
    }
    const hash = await bcrypt.hash(password, 10);
    const cleanName = String(name).trim();
    const avatar = cleanName.split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase();
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, company, product, role, avatar)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, company, product, role, avatar, created_at`,
      [cleanName, normalizedEmail, hash, String(company).trim(), 'Both', role, avatar]
    );

    res.status(201).json({ ...rows[0], ticket_count: 0 });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// ── Change a user's role (admin) ─────────────────────────────────────────────
app.put('/api/auth/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'role must be user, agent, or admin' });
    }
    const { rows } = await pool.query(
      `UPDATE users SET role = $2 WHERE id = $1
       RETURNING id, name, email, company, product, role, avatar, created_at`,
      [id, role]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const countRes = await pool.query(`SELECT COUNT(*)::int AS c FROM tickets WHERE user_id = $1`, [id]);
    res.json({ ...rows[0], ticket_count: countRes.rows[0].c });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Change a user's product (admin) ──────────────────────────────────────────
app.put('/api/auth/users/:id/product', blockProductAccessChanges, async (req, res) => {
  try {
    const { id } = req.params;
    const { product } = req.body;
    const { rows } = await pool.query(
      `UPDATE users SET product = $2 WHERE id = $1
       RETURNING id, name, email, company, product, role, avatar, created_at`,
      [id, product]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const countRes = await pool.query(`SELECT COUNT(*)::int AS c FROM tickets WHERE user_id = $1`, [id]);
    res.json({ ...rows[0], ticket_count: countRes.rows[0].c });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Update a document (admin CRUD) ───────────────────────────────────────────
app.put('/api/docs/:docId', blockDocumentationEditing, async (req, res) => {
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
app.delete('/api/docs/:docId', blockDocumentationEditing, async (req, res) => {
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
app.post('/api/docs', blockDocumentationEditing, async (req, res) => {
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
app.post('/api/docs/:docId/images/upload', blockDocumentationEditing, upload.single('image'), async (req, res) => {
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
app.delete('/api/docs/:docId/images/:imageId', blockDocumentationEditing, async (req, res) => {
  try {
    const { imageId } = req.params;
    const { rowCount } = await pool.query(`DELETE FROM document_images WHERE id = $1`, [imageId]);
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Serve images that were downloaded from GitHub and stored in the DB ───────
// (as opposed to /images/... which serves admin-uploaded files from disk)
app.get('/api/synced-images', async (req, res) => {
  try {
    const { path: imgPath } = req.query;
    if (!imgPath) return res.status(400).json({ error: 'path query param is required' });
    const { rows } = await pool.query(
      `SELECT data, mime_type FROM synced_images WHERE path = $1`,
      [imgPath]
    );
    if (rows.length === 0) return res.status(404).send('Not found');
    res.set('Content-Type', rows[0].mime_type);
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(rows[0].data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Support Request (AI chat → confirmed support form → helpdesk email) ──────
const supportUpload = multer({
  storage: multer.memoryStorage(), // no need to persist screenshots on disk — attach and forget
  limits: { fileSize: 8 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'));
    cb(null, true);
  },
});

// Step 1 — send a verification code to the email the user typed in the form
app.post('/api/support/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const code = generateCode();
    await pool.query(
      `INSERT INTO verification_codes (email, code, purpose, expires_at)
       VALUES ($1, $2, 'support_request', NOW() + INTERVAL '10 minutes')`,
      [email.toLowerCase(), code]
    );

    await sendVerificationCode(email, code, 'support_request');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Step 2 — verify the code, then email the full request straight to the helpdesk inbox
app.post('/api/support/submit', supportUpload.array('screenshots', 5), async (req, res) => {
  try {
    const { email, code, company, fullName, product, description } = req.body;
    if (!email || !code || !fullName || !description) {
      return res.status(400).json({ error: 'Email, code, full name, and description are required' });
    }

    const { rows } = await pool.query(
      `SELECT * FROM verification_codes
       WHERE email = $1 AND code = $2 AND purpose = 'support_request' AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email.toLowerCase(), code]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid or expired code' });

    await sendSupportRequest(
      { email, company, fullName, product, description },
      req.files || []
    );

    await pool.query(`UPDATE verification_codes SET used = TRUE WHERE id = $1`, [rows[0].id]);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── FAQ ──────────────────────────────────────────────────────────────────────

// List all FAQ items (public — used by client FAQ tab and admin FAQ panel)
app.get('/api/faq', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM faq_items ORDER BY display_order, id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a FAQ item (admin)
app.post('/api/faq', requireAdmin, async (req, res) => {
  try {
    const { title, answer, tags, display_order } = req.body;
    if (!title || !answer) return res.status(400).json({ error: 'title and answer are required' });
    const { rows } = await pool.query(
      `INSERT INTO faq_items (title, answer, tags, display_order)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [title, answer, tags || [], display_order || 99]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a FAQ item (admin)
app.put('/api/faq/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, answer, tags, display_order } = req.body;
    const { rows } = await pool.query(
      `UPDATE faq_items
       SET title = COALESCE($2, title),
           answer = COALESCE($3, answer),
           tags = COALESCE($4, tags),
           display_order = COALESCE($5, display_order),
           updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, title, answer, tags, display_order]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a FAQ item (admin)
app.delete('/api/faq/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query(`DELETE FROM faq_items WHERE id = $1`, [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Tickets ──────────────────────────────────────────────────────────────────

// List tickets — pass ?userId=X for a specific user's tickets, omit for all (admin)
app.get('/api/tickets', async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId
      ? `SELECT t.*, u.name AS user_name, u.email AS user_email
         FROM tickets t LEFT JOIN users u ON u.id = t.user_id
         WHERE t.user_id = $1 ORDER BY t.created_at DESC`
      : `SELECT t.*, u.name AS user_name, u.email AS user_email
         FROM tickets t LEFT JOIN users u ON u.id = t.user_id
         ORDER BY t.created_at DESC`;
    const { rows } = await pool.query(query, userId ? [userId] : []);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one ticket with its messages
app.get('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const t = await pool.query(`SELECT * FROM tickets WHERE id = $1`, [id]);
    if (t.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const m = await pool.query(`SELECT * FROM ticket_messages WHERE ticket_id = $1 ORDER BY created_at ASC`, [id]);
    res.json({ ...t.rows[0], messages: m.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a ticket
app.post('/api/tickets', async (req, res) => {
  try {
    const { userId, title, product, version, category, priority, description, senderName } = req.body;
    if (!userId || !title) return res.status(400).json({ error: 'userId and title are required' });

    const countRes = await pool.query(`SELECT COUNT(*) FROM tickets`);
    const ticketNumber = 'T-' + String(parseInt(countRes.rows[0].count, 10) + 1).padStart(3, '0');

    const { rows } = await pool.query(
      `INSERT INTO tickets (ticket_number, user_id, title, product, version, category, priority, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'Open') RETURNING *`,
      [ticketNumber, userId, title, product, version, category, priority || 'Normal']
    );
    const ticket = rows[0];

    if (description) {
      await pool.query(
        `INSERT INTO ticket_messages (ticket_id, sender_id, sender_name, message) VALUES ($1,$2,$3,$4)`,
        [ticket.id, userId, senderName || 'User', description]
      );
    }

    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Ticket screenshot attachment ──────────────────────────────────────────────
const ticketUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, 'public', 'ticket-attachments', req.params.id);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const safe = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      cb(null, safe);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'));
    cb(null, true);
  },
});

// Upload/replace the screenshot attached to a ticket (client, right after creating it)
app.post('/api/tickets/:id/attachment', ticketUpload.single('screenshot'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const attachment_url = `http://localhost:${process.env.PORT || 4000}/ticket-attachments/${id}/${req.file.filename}`;

    const { rows } = await pool.query(
      `UPDATE tickets SET attachment_url = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, attachment_url]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update ticket status
app.put('/api/tickets/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { rows } = await pool.query(
      `UPDATE tickets SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, status]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a reply message to a ticket
app.post('/api/tickets/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { senderId, senderName, message } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const { rows } = await pool.query(
      `INSERT INTO ticket_messages (ticket_id, sender_id, sender_name, message) VALUES ($1,$2,$3,$4) RETURNING *`,
      [id, senderId, senderName, message]
    );
    await pool.query(`UPDATE tickets SET updated_at = NOW() WHERE id = $1`, [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Email verification helpers ────────────────────────────────────────────────
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit code
}

// ── Registration: step 1 — send verification code ────────────────────────────
app.post('/api/auth/register/send-code', async (req, res) => {
  try {
    const { name, email, password, company, product } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const existing = await pool.query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const avatar = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const code = generateCode();
    const payload = { name, email: email.toLowerCase(), password_hash: hash, company: company || null, product: 'Both', avatar };

    await pool.query(
      `INSERT INTO verification_codes (email, code, purpose, payload, expires_at)
       VALUES ($1, $2, 'register', $3, NOW() + INTERVAL '10 minutes')`,
      [email.toLowerCase(), code, JSON.stringify(payload)]
    );

    await sendVerificationCode(email, code, 'register');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Registration: step 2 — verify code, create account ───────────────────────
app.post('/api/auth/register/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and code are required' });

    const { rows } = await pool.query(
      `SELECT * FROM verification_codes
       WHERE email = $1 AND code = $2 AND purpose = 'register' AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email.toLowerCase(), code]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid or expired code' });

    const payload = rows[0].payload;
    const created = await pool.query(
      `INSERT INTO users (name, email, password_hash, company, product, role, avatar)
       VALUES ($1,$2,$3,$4,$5,'user',$6)
       RETURNING id, name, email, company, product, role, avatar, created_at`,
      [payload.name, payload.email, payload.password_hash, payload.company, payload.product, payload.avatar]
    );

    await pool.query(`UPDATE verification_codes SET used = TRUE WHERE id = $1`, [rows[0].id]);
    sendWelcomeEmail(created.rows[0].email, created.rows[0].name).catch(err => console.error('Email error:', err.message));

    setSessionCookie(res, created.rows[0]);
    res.status(201).json(created.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'An account with this email already exists' });
    res.status(500).json({ error: err.message });
  }
});

// ── Forgot password: step 1 — send verification code ──────────────────────────
app.post('/api/auth/forgot-password/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await pool.query(`SELECT id, name FROM users WHERE email = $1`, [email.toLowerCase()]);
    if (user.rows.length === 0) return res.status(404).json({ error: 'No account found with this email' });

    const code = generateCode();
    await pool.query(
      `INSERT INTO verification_codes (email, code, purpose, expires_at)
       VALUES ($1, $2, 'reset_password', NOW() + INTERVAL '10 minutes')`,
      [email.toLowerCase(), code]
    );

    await sendVerificationCode(email, code, 'reset_password');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Forgot password: step 2 — verify code, set new password ──────────────────
app.post('/api/auth/forgot-password/verify', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const { rows } = await pool.query(
      `SELECT * FROM verification_codes
       WHERE email = $1 AND code = $2 AND purpose = 'reset_password' AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email.toLowerCase(), code]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid or expired code' });

    const newHash = await bcrypt.hash(newPassword, 10);
    const updated = await pool.query(
      `UPDATE users SET password_hash = $2 WHERE email = $1 RETURNING name, email`,
      [email.toLowerCase(), newHash]
    );

    await pool.query(`UPDATE verification_codes SET used = TRUE WHERE id = $1`, [rows[0].id]);
    sendPasswordChangedEmail(updated.rows[0].email, updated.rows[0].name).catch(err => console.error('Email error:', err.message));

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
