// sync-from-github.js
// Pulls all markdown docs from your GitHub repo and writes them into PostgreSQL.
// Run with: npm run sync

require('dotenv').config();
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: `-c search_path=${process.env.DB_SCHEMA || 'ce_boss'}`,
});

const GITHUB_RAW = process.env.GITHUB_RAW_BASE;
const SERVER_BASE = `http://localhost:${process.env.PORT || 4000}`;
const DOC_INDEX = require('./doc-index.json');

const MIME_TYPES = { png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', gif:'image/gif', svg:'image/svg+xml', webp:'image/webp' };

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');
}

// Downloads one image from GitHub and stores its bytes in the synced_images
// table (skipped if we already have it — re-run the sync after truncating
// synced_images if you need to force a refresh of already-stored images).
async function downloadAndStoreImage(resolvedPath) {
  try {
    const existing = await pool.query(`SELECT 1 FROM synced_images WHERE path = $1`, [resolvedPath]);
    if (existing.rows.length > 0) return;

    const ext = resolvedPath.split('.').pop().toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
    const res = await fetch(`${GITHUB_RAW}/${resolvedPath}`);
    if (!res.ok) {
      console.log(`    ⚠️  image not found on GitHub: ${resolvedPath}`);
      return;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await pool.query(
      `INSERT INTO synced_images (path, mime_type, data, updated_at) VALUES ($1,$2,$3,NOW())
       ON CONFLICT (path) DO UPDATE SET mime_type = EXCLUDED.mime_type, data = EXCLUDED.data, updated_at = NOW()`,
      [resolvedPath, mimeType, buf]
    );
  } catch (err) {
    console.log(`    ⚠️  image download failed: ${resolvedPath} — ${err.message}`);
  }
}

// Markdown image links are written relative to the .md file's own location
// in the repo (e.g. "../../assets/images/foo.png"). This downloads the actual
// image bytes from GitHub into the synced_images table, then rewrites the
// markdown link to point at our own /api/synced-images endpoint — so the
// image is served straight from Postgres, not from GitHub, at render time.
async function resolveImagePaths(content, entryPath) {
  const baseDir = path.posix.dirname(entryPath);
  const regex = /!\[([^\]]*)\]\((?!https?:\/\/)([^)\s]+)(\s+"[^"]*")?\)/g;
  const resolvedMap = new Map(); // relPath -> resolved repo-relative path

  for (const m of content.matchAll(regex)) {
    const relPath = m[2];
    if (!resolvedMap.has(relPath)) {
      const resolved = path.posix.normalize(path.posix.join(baseDir, relPath));
      resolvedMap.set(relPath, resolved);
      await downloadAndStoreImage(resolved);
    }
  }

  return content.replace(regex, (match, alt, relPath, titlePart) => {
    const resolved = resolvedMap.get(relPath);
    const newUrl = `${SERVER_BASE}/api/synced-images?path=${encodeURIComponent(resolved)}`;
    return `![${alt}](${newUrl}${titlePart || ''})`;
  });
}

function extractHeadings(content) {
  const headings = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let m;
  while ((m = regex.exec(content)) !== null) {
    headings.push({
      level: m[1].length,
      text: m[2].trim(),
      slug: slugify(m[2].trim()),
    });
  }
  return headings;
}

function guessTags(doc) {
  const words = `${doc.title} ${doc.category} ${doc.product}`
    .toLowerCase()
    .split(/[\s\/\-,()]+/)
    .filter(w => w.length > 2);
  return [...new Set(words)];
}

async function syncDoc(entry) {
  const url = `${GITHUB_RAW}/${entry.path}`;
  let content;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`  ⚠️  SKIP (HTTP ${res.status}): ${entry.path}`);
      return { ok: false };
    }
    content = await res.text();
    if (content.startsWith('---')) {
      const parts = content.split('---');
      if (parts.length >= 3) content = parts.slice(2).join('---').trim();
    }
    content = await resolveImagePaths(content, entry.path);
  } catch (err) {
    console.log(`  ❌ FETCH ERROR: ${entry.path} — ${err.message}`);
    return { ok: false };
  }

  const tags = guessTags(entry);
  const headings = extractHeadings(content);

  await pool.query(
    `INSERT INTO documents (doc_id, title, product, category, tags, github_path, content, display_order, pdf_path, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, NOW())
     ON CONFLICT (doc_id) DO UPDATE SET
       title = EXCLUDED.title,
       product = EXCLUDED.product,
       category = EXCLUDED.category,
       tags = EXCLUDED.tags,
       github_path = EXCLUDED.github_path,
       content = EXCLUDED.content,
       display_order = EXCLUDED.display_order,
       pdf_path = EXCLUDED.pdf_path,
       updated_at = NOW()`,
    [entry.id, entry.title, entry.product, entry.category, tags, entry.path, content, entry.order || 99, entry.pdf || null]
  );

  await pool.query(`DELETE FROM document_headings WHERE doc_id = $1`, [entry.id]);
  for (const h of headings) {
    await pool.query(
      `INSERT INTO document_headings (doc_id, heading_text, heading_slug, level) VALUES ($1,$2,$3,$4)`,
      [entry.id, h.text, h.slug, h.level]
    );
  }

  return { ok: true, headingCount: headings.length, contentLength: content.length };
}

async function deleteDocsMissingFromIndex() {
  const indexedIds = DOC_INDEX.map((d) => d.id);
  if (indexedIds.length === 0) {
    console.log('  ⚠️  doc-index.json is empty; skipping stale-document cleanup.');
    return { deleted: 0 };
  }

  const { rows } = await pool.query(
    `DELETE FROM documents
     WHERE NOT (doc_id = ANY($1::text[]))
     RETURNING doc_id`,
    [indexedIds]
  );

  if (rows.length > 0) {
    const preview = rows.slice(0, 10).map((r) => r.doc_id).join(', ');
    const suffix = rows.length > 10 ? ', ...' : '';
    console.log(`  🧹 removed ${rows.length} stale docs not present in doc-index.json`);
    console.log(`     ${preview}${suffix}`);
  }

  return { deleted: rows.length };
}

async function main() {
  console.log(`Syncing ${DOC_INDEX.length} documents from GitHub → PostgreSQL...\n`);
  let success = 0, failed = 0;

  for (const entry of DOC_INDEX) {
    const result = await syncDoc(entry);
    if (result.ok) {
      success++;
      console.log(`  ✅ ${entry.id} — ${result.contentLength} chars, ${result.headingCount} headings`);
    } else {
      failed++;
    }
    await new Promise(r => setTimeout(r, 100));
  }

  const cleanup = await deleteDocsMissingFromIndex();

  console.log(`\nDone. ${success} synced, ${failed} failed, ${cleanup.deleted} stale removed.`);
  await pool.end();
}

main().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});