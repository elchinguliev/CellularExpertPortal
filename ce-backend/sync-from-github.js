// sync-from-github.js
// Pulls all markdown docs from your GitHub repo and writes them into PostgreSQL.
// Run with: npm run sync

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const GITHUB_RAW = process.env.GITHUB_RAW_BASE;
const DOC_INDEX = require('./doc-index.json');

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');
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
  } catch (err) {
    console.log(`  ❌ FETCH ERROR: ${entry.path} — ${err.message}`);
    return { ok: false };
  }

  const tags = guessTags(entry);
  const headings = extractHeadings(content);

  await pool.query(
    `INSERT INTO documents (doc_id, title, product, category, tags, github_path, content, display_order, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8, NOW())
     ON CONFLICT (doc_id) DO UPDATE SET
       title = EXCLUDED.title,
       product = EXCLUDED.product,
       category = EXCLUDED.category,
       tags = EXCLUDED.tags,
       content = EXCLUDED.content,
       display_order = EXCLUDED.display_order,
       updated_at = NOW()`,
    [entry.id, entry.title, entry.product, entry.category, tags, entry.path, content, entry.order || 99]
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

  console.log(`\nDone. ${success} synced, ${failed} failed.`);
  await pool.end();
}

main().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});