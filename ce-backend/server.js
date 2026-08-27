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
const crypto = require('crypto');
const { legacyIdFromGithubPath } = require('./doc-discovery');

const app = express();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters.');
}

const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
if (corsOrigins.length === 0) {
  throw new Error('CORS_ORIGINS must list the permitted frontend origin(s).');
}

// IIS terminates TLS before proxying to Node. Trust only its immediate proxy
// hop, so req.secure and secure cookies work without trusting client headers.
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

// credentials: true + explicit origins are required for browser session cookies.
app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  next();
});
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// ── Session auth (JWT stored in an httpOnly cookie) ───────────────────────────
// Replaces trusting whatever role the frontend happens to have in
// localStorage — the server now verifies who's making each request instead
// of just taking the client's word for it.
const COOKIE_NAME = 'ce_session';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function serverError(res, err) {
  console.error('Request failed:', err.message);
  return res.status(500).json({ error: 'An unexpected server error occurred.' });
}

function createRateLimiter({ windowMs, max, key }) {
  const attempts = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const bucketKey = key(req);
    const current = attempts.get(bucketKey);
    const entries = current && now - current.startedAt < windowMs
      ? current
      : { startedAt: now, count: 0 };
    entries.count += 1;
    attempts.set(bucketKey, entries);
    if (entries.count > max) {
      res.set('Retry-After', String(Math.ceil((windowMs - (now - entries.startedAt)) / 1000)));
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    next();
  };
}

const authAttemptLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  key: (req) => `${req.ip}:${String(req.body?.email || '').trim().toLowerCase()}`,
});
const emailAttemptLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  key: (req) => `${req.ip}:${String(req.body?.email || '').trim().toLowerCase()}`,
});

function signSession(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      sessionVersion: user.session_version ?? 0,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function setSessionCookie(res, user) {
  res.cookie(COOKIE_NAME, signSession(user), {
    httpOnly: true,       // not readable from JS — protects against XSS reading it
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_MAX_AGE_MS,
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

async function loadCurrentUser(req) {
  if (!req.user) return null;
  const { rows } = await pool.query(
    'SELECT id, name, email, role, session_version FROM users WHERE id = $1 AND deleted_at IS NULL',
    [req.user.id],
  );
  return rows[0] || null;
}

async function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Please log in.' });
  try {
    const user = await loadCurrentUser(req);
    if (!user || req.user.sessionVersion !== user.session_version) {
      return res.status(401).json({ error: 'Please log in.' });
    }
    req.user = user;
    next();
  } catch (err) {
    serverError(res, err);
  }
}

async function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Please log in.' });
  try {
    // Look up the role on each privileged request so a role change takes
    // effect immediately, rather than when an existing JWT expires.
    const user = await loadCurrentUser(req);
    if (!user || req.user.sessionVersion !== user.session_version) {
      return res.status(401).json({ error: 'Please log in.' });
    }
    if (user.role !== 'admin') return res.status(403).json({ error: 'Admins only.' });
    req.user = user;
    next();
  } catch (err) {
    serverError(res, err);
  }
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
    console.error('Health check failed:', err.message);
    res.status(503).json({ ok: false });
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
    serverError(res, err);
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
    serverError(res, err);
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
    serverError(res, err);
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
    serverError(res, err);
  }
});

// ── Register a new account ───────────────────────────────────────────────────
// Registration is deliberately only available through the verification-code
// flow below. Keeping an unverified shortcut would bypass account ownership.
app.post('/api/auth/register', (_req, res) => {
  res.status(404).json({ error: 'Use the verified registration flow.' });
});

// ── Log in ────────────────────────────────────────────────────────────────────
app.post('/api/auth/login', authAttemptLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const { rows } = await pool.query(
      `SELECT id, name, email, password_hash, company, product, role, avatar, session_version, created_at
       FROM users WHERE LOWER(email) = $1 AND deleted_at IS NULL`,
      [email.trim().toLowerCase()]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    delete user.password_hash;
    setSessionCookie(res, user);
    res.json(user);
  } catch (err) {
    serverError(res, err);
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
       FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Account not found' });
    res.json(rows[0]);
  } catch (err) {
    serverError(res, err);
  }
});

app.post('/api/auth/logout', async (req, res) => {
  // Invalidate all sessions for this account when possible. This protects
  // against a copied cookie remaining usable after the user signs out.
  if (req.user?.id) {
    try {
      await pool.query('UPDATE users SET session_version = session_version + 1 WHERE id = $1', [req.user.id]);
    } catch (err) {
      console.error('Logout invalidation failed:', err.message);
    }
  }
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
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
       WHERE u.deleted_at IS NULL
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    serverError(res, err);
  }
});

// Create a user from the admin Users panel.
app.post('/api/auth/users', requireAdmin, async (req, res) => {
  try {
    const { name, email, password, company, role } = req.body;
    const cleanName = String(name || '').trim();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const cleanCompany = String(company || '').trim();
    const allowedRoles = ['user', 'admin'];
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanName || !normalizedEmail || !password || !cleanCompany) {
      return res.status(400).json({ error: 'Name, email, password, and company are required' });
    }
    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }
    if (String(password).length < 12) {
      return res.status(400).json({ error: 'Password must be at least 12 characters' });
    }
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid user role' });
    }
    const existing = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = $1 AND deleted_at IS NULL',
      [normalizedEmail],
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }
    const hash = await bcrypt.hash(password, 10);
    const avatar = cleanName.split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase();
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, company, product, role, avatar)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, company, product, role, avatar, created_at`,
      [cleanName, normalizedEmail, hash, cleanCompany, 'Both', role, avatar]
    );

    res.status(201).json({ ...rows[0], ticket_count: 0 });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }
    serverError(res, err);
  }
});

// Soft deletion preserves all ticket/history relationships while immediately
// removing the account from sign-in and Users management. The transaction
// serializes the last-admin check with the deletion itself.
app.delete('/api/auth/users/:id', requireAdmin, async (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isSafeInteger(userId) || userId < 1) {
    return res.status(400).json({ error: 'Invalid user ID.' });
  }
  if (userId === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own account.' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const target = await client.query(
      'SELECT id, role FROM users WHERE id = $1 AND deleted_at IS NULL FOR UPDATE',
      [userId],
    );
    if (target.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found.' });
    }
    if (target.rows[0].role === 'admin') {
      const admins = await client.query(
        "SELECT id FROM users WHERE role = 'admin' AND deleted_at IS NULL FOR UPDATE",
      );
      if (admins.rows.length <= 1) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'You cannot delete the last remaining admin account.' });
      }
    }

    await client.query(
      'UPDATE users SET deleted_at = NOW(), session_version = session_version + 1 WHERE id = $1',
      [userId],
    );
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    serverError(res, err);
  } finally {
    client?.release();
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
      `UPDATE users SET role = $2 WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, name, email, company, product, role, avatar, created_at`,
      [id, role]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const countRes = await pool.query(`SELECT COUNT(*)::int AS c FROM tickets WHERE user_id = $1`, [id]);
    res.json({ ...rows[0], ticket_count: countRes.rows[0].c });
  } catch (err) {
    serverError(res, err);
  }
});

// ── Change a user's product (admin) ──────────────────────────────────────────
app.put('/api/auth/users/:id/product', blockProductAccessChanges, async (req, res) => {
  try {
    const { id } = req.params;
    const { product } = req.body;
    const { rows } = await pool.query(
      `UPDATE users SET product = $2 WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, name, email, company, product, role, avatar, created_at`,
      [id, product]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const countRes = await pool.query(`SELECT COUNT(*)::int AS c FROM tickets WHERE user_id = $1`, [id]);
    res.json({ ...rows[0], ticket_count: countRes.rows[0].c });
  } catch (err) {
    serverError(res, err);
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
    serverError(res, err);
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
    serverError(res, err);
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
    serverError(res, err);
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
    serverError(res, err);
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
    serverError(res, err);
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
    serverError(res, err);
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
    serverError(res, err);
  }
});

// Step 2 — verify the code, then email the full request straight to the helpdesk inbox
app.post('/api/support/submit', emailAttemptLimiter, supportUpload.array('screenshots', 5), async (req, res) => {
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
    serverError(res, err);
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
    serverError(res, err);
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
    serverError(res, err);
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
    serverError(res, err);
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
    serverError(res, err);
  }
});

// ── Tickets ──────────────────────────────────────────────────────────────────

async function getTicketForUser(ticketId, user) {
  const { rows } = await pool.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
  const ticket = rows[0];
  if (!ticket) return null;
  return user.role === 'admin' || ticket.user_id === user.id ? ticket : false;
}

async function requireTicketAccess(req, res, next) {
  try {
    const ticket = await getTicketForUser(req.params.id, req.user);
    if (ticket === null) return res.status(404).json({ error: 'Ticket not found' });
    if (!ticket) return res.status(403).json({ error: 'Not permitted.' });
    req.ticket = ticket;
    next();
  } catch (err) {
    serverError(res, err);
  }
}

// Admins may list all tickets; users can only list their own tickets. The
// client-supplied userId is never used as an authorization decision.
app.get('/api/tickets', requireAuth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const query = isAdmin
      ? `SELECT t.*, u.name AS user_name, u.email AS user_email
           FROM tickets t LEFT JOIN users u ON u.id = t.user_id
           ORDER BY t.created_at DESC`
      : `SELECT t.*, u.name AS user_name, u.email AS user_email
           FROM tickets t LEFT JOIN users u ON u.id = t.user_id
           WHERE t.user_id = $1 ORDER BY t.created_at DESC`;
    const { rows } = await pool.query(query, isAdmin ? [] : [req.user.id]);
    res.json(rows);
  } catch (err) {
    serverError(res, err);
  }
});

// Get one ticket with its messages
app.get('/api/tickets/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await getTicketForUser(id, req.user);
    if (ticket === null) return res.status(404).json({ error: 'Not found' });
    if (!ticket) return res.status(403).json({ error: 'Not permitted.' });
    const m = await pool.query(`SELECT * FROM ticket_messages WHERE ticket_id = $1 ORDER BY created_at ASC`, [id]);
    res.json({ ...ticket, messages: m.rows });
  } catch (err) {
    serverError(res, err);
  }
});

// Create a ticket
app.post('/api/tickets', requireAuth, async (req, res) => {
  try {
    const { title, product, version, category, priority, description } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const ticketNumber = `T-${crypto.randomUUID()}`;

    const { rows } = await pool.query(
      `INSERT INTO tickets (ticket_number, user_id, title, product, version, category, priority, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'Open') RETURNING *`,
      [ticketNumber, req.user.id, title, product, version, category, priority || 'Normal']
    );
    const ticket = rows[0];

    if (description) {
      await pool.query(
        `INSERT INTO ticket_messages (ticket_id, sender_id, sender_name, message) VALUES ($1,$2,$3,$4)`,
        [ticket.id, req.user.id, req.user.name, description]
      );
    }

    res.status(201).json(ticket);
  } catch (err) {
    serverError(res, err);
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
app.post('/api/tickets/:id/attachment', requireAuth, requireTicketAccess, ticketUpload.single('screenshot'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const attachment_url = `/ticket-attachments/${id}/${req.file.filename}`;

    const { rows } = await pool.query(
      `UPDATE tickets SET attachment_url = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, attachment_url]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    res.status(201).json(rows[0]);
  } catch (err) {
    serverError(res, err);
  }
});

// Update ticket status
app.put('/api/tickets/:id/status', requireAdmin, async (req, res) => {
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
    serverError(res, err);
  }
});

// Add a reply message to a ticket
app.post('/api/tickets/:id/messages', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });
    const ticket = await getTicketForUser(id, req.user);
    if (ticket === null) return res.status(404).json({ error: 'Ticket not found' });
    if (!ticket) return res.status(403).json({ error: 'Not permitted.' });

    const { rows } = await pool.query(
      `INSERT INTO ticket_messages (ticket_id, sender_id, sender_name, message) VALUES ($1,$2,$3,$4) RETURNING *`,
      [id, req.user.id, req.user.name, message]
    );
    await pool.query(`UPDATE tickets SET updated_at = NOW() WHERE id = $1`, [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    serverError(res, err);
  }
});

app.get('/ticket-attachments/:ticketId/:filename', requireAuth, async (req, res) => {
  try {
    const { ticketId, filename } = req.params;
    if (path.basename(filename) !== filename) return res.status(400).json({ error: 'Invalid filename.' });
    const ticket = await getTicketForUser(ticketId, req.user);
    if (ticket === null) return res.status(404).json({ error: 'Not found' });
    if (!ticket) return res.status(403).json({ error: 'Not permitted.' });
    res.sendFile(path.join(__dirname, 'public', 'ticket-attachments', ticketId, filename));
  } catch (err) {
    serverError(res, err);
  }
});

// ── Email verification helpers ────────────────────────────────────────────────
function generateCode() {
  return String(crypto.randomInt(100000, 1000000));
}

// ── Registration: step 1 — send verification code ────────────────────────────
app.post('/api/auth/register/send-code', emailAttemptLimiter, async (req, res) => {
  try {
    const { name, email, password, company, product } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await pool.query(
      `SELECT id FROM users WHERE LOWER(email) = $1 AND deleted_at IS NULL`,
      [normalizedEmail],
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const avatar = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const code = generateCode();
    const payload = { name, email: normalizedEmail, password_hash: hash, company: company || null, product: 'Both', avatar };

    await pool.query(
      `INSERT INTO verification_codes (email, code, purpose, payload, expires_at)
       VALUES ($1, $2, 'register', $3, NOW() + INTERVAL '10 minutes')`,
      [normalizedEmail, code, JSON.stringify(payload)]
    );

    await sendVerificationCode(email, code, 'register');
    res.json({ ok: true });
  } catch (err) {
    serverError(res, err);
  }
});

// ── Registration: step 2 — verify code, create account ───────────────────────
app.post('/api/auth/register/verify', authAttemptLimiter, async (req, res) => {
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
    const existing = await pool.query(
      `SELECT id FROM users WHERE LOWER(email) = $1 AND deleted_at IS NULL`,
      [payload.email],
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
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
    serverError(res, err);
  }
});

// ── Forgot password: step 1 — send verification code ──────────────────────────
app.post('/api/auth/forgot-password/send-code', emailAttemptLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const normalizedEmail = email.trim().toLowerCase();
    const user = await pool.query(
      `SELECT id, name FROM users WHERE LOWER(email) = $1 AND deleted_at IS NULL`,
      [normalizedEmail],
    );
    if (user.rows.length === 0) return res.status(404).json({ error: 'No account found with this email' });

    const code = generateCode();
    await pool.query(
      `INSERT INTO verification_codes (email, code, purpose, payload, expires_at)
       VALUES ($1, $2, 'reset_password', $3, NOW() + INTERVAL '10 minutes')`,
      [normalizedEmail, code, JSON.stringify({ user_id: user.rows[0].id })]
    );

    await sendVerificationCode(email, code, 'reset_password');
    res.json({ ok: true });
  } catch (err) {
    serverError(res, err);
  }
});

// ── Forgot password: step 2 — verify code, set new password ──────────────────
app.post('/api/auth/forgot-password/verify', authAttemptLimiter, async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }
    if (String(newPassword).length < 12) return res.status(400).json({ error: 'Password must be at least 12 characters' });

    const { rows } = await pool.query(
      `SELECT * FROM verification_codes
       WHERE email = $1 AND code = $2 AND purpose = 'reset_password' AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email.toLowerCase(), code]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid or expired code' });

    // Bind a reset code to the account ID that requested it. If that account
    // is soft-deleted and the address is later reused, the old code cannot
    // reset the replacement account's password.
    const resetUserId = Number(rows[0].payload?.user_id);
    if (!Number.isSafeInteger(resetUserId) || resetUserId < 1) {
      return res.status(401).json({ error: 'Invalid or expired code' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    const updated = await pool.query(
      `UPDATE users
       SET password_hash = $2, session_version = session_version + 1
       WHERE id = $1 AND LOWER(email) = $3 AND deleted_at IS NULL
       RETURNING name, email`,
      [resetUserId, newHash, email.trim().toLowerCase()]
    );
    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'No active account found with this email' });
    }

    await pool.query(`UPDATE verification_codes SET used = TRUE WHERE id = $1`, [rows[0].id]);
    sendPasswordChangedEmail(updated.rows[0].email, updated.rows[0].name).catch(err => console.error('Email error:', err.message));

    res.json({ ok: true });
  } catch (err) {
    serverError(res, err);
  }
});

// Keeps malformed JSON and Multer failures from falling through to Express's
// development error page, which can include implementation details.
app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.too.large' || err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Request or file is too large.' });
  }
  if (err instanceof multer.MulterError || err?.message === 'Only image files are allowed') {
    return res.status(400).json({ error: 'Invalid upload.' });
  }
  console.error('Unhandled request error:', err?.message || err);
  return res.status(500).json({ error: 'An unexpected server error occurred.' });
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ CE Docs API running at http://localhost:${PORT}`);
  console.log(`   Try: http://localhost:${PORT}/api/health`);
  console.log(`        http://localhost:${PORT}/api/docs`);
});
