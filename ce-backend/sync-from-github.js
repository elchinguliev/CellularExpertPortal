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
const STATIC_DOCS = require('./doc-index.json');
const { discoverDocs } = require('./doc-discovery');

// The doc index this sync run works from = the hand-listed entries (still
// flat/manually-categorized products, PDFs) + whatever doc-discovery.js
// finds under the auto-discoverable roots (see doc-discovery.js for which
// roots those are). Neither list needs to know about the other.
async function buildDocIndex() {
  const discovered = await discoverDocs();
  if (discovered.length > 0) {
    console.log(`  🔎 auto-discovered ${discovered.length} doc(s) from GitHub's folder structure`);
  }
  return [...STATIC_DOCS, ...discovered];
}

const MIME_TYPES = { png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', gif:'image/gif', svg:'image/svg+xml', webp:'image/webp' };

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');
}

// A folder move (e.g. a page dropping one level into a new subfolder during
// a docs reorg) can leave a markdown file's own "../" count one-or-more
// levels off from what its *current* location actually needs, without the
// link itself ever being touched — the image's real repo path is still
// reached by walking the SAME asset filename, just from a different number
// of parent-directory steps. Given the naive path (computed straight off
// the file's real github_path, per its own containing folder) 404s, this
// tries nearby "../" counts — fewer first (a link authored with an extra
// stray "../"), then more (a link that never picked up the extra level a
// move added) — and uses whichever one actually exists on GitHub. This
// never touches the markdown itself and never assumes anything about a
// specific folder or filename — it only ever probes the exact same asset
// filename the link already names, at a handful of nearby depths.
const IMAGE_PATH_PROBE_RANGE = 2;

function candidateResolvedPaths(baseDir, relPath) {
  const m = relPath.match(/^((?:\.\.\/)*)(.*)$/);
  const dotCount = m[1].length / 3; // each "../" is 3 chars
  const tail = m[2];

  const depths = [dotCount];
  for (let delta = 1; delta <= IMAGE_PATH_PROBE_RANGE; delta++) {
    if (dotCount - delta >= 0) depths.push(dotCount - delta);
    depths.push(dotCount + delta);
  }

  return depths.map((n) => path.posix.normalize(path.posix.join(baseDir, '../'.repeat(n) + tail)));
}

// Tries each candidate path in order (closest to the markdown's literal
// "../" count first) and stores the bytes for whichever one actually
// exists on GitHub — skipped entirely if any candidate is already cached
// from a previous run. Falls back to the literal/naive path (today's
// behavior) if none of them exist, so an image that's genuinely missing
// still fails the same way it always has, logged the same way.
async function downloadAndStoreImage(candidates) {
  const { rows: cached } = await pool.query(
    `SELECT path FROM synced_images WHERE path = ANY($1::text[]) LIMIT 1`,
    [candidates]
  );
  if (cached.length > 0) return cached[0].path;

  for (const resolvedPath of candidates) {
    try {
      const ext = resolvedPath.split('.').pop().toLowerCase();
      const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
      const res = await fetch(`${GITHUB_RAW}/${resolvedPath}`);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      await pool.query(
        `INSERT INTO synced_images (path, mime_type, data, updated_at) VALUES ($1,$2,$3,NOW())
         ON CONFLICT (path) DO UPDATE SET mime_type = EXCLUDED.mime_type, data = EXCLUDED.data, updated_at = NOW()`,
        [resolvedPath, mimeType, buf]
      );
      if (resolvedPath !== candidates[0]) {
        console.log(`    ↪️  image resolved off its literal relative path: ${candidates[0]} -> ${resolvedPath}`);
      }
      return resolvedPath;
    } catch (err) {
      // try the next candidate depth
    }
  }
  console.log(`    ⚠️  image not found on GitHub under any of ${candidates.length} candidate path(s): ${candidates[0]}`);
  return candidates[0];
}

// Markdown image links are written relative to the .md file's own location
// in the repo (e.g. "../../assets/images/foo.png"). This downloads the actual
// image bytes from GitHub into the synced_images table, then rewrites the
// markdown link to point at our own /api/synced-images endpoint — so the
// image is served straight from Postgres, not from GitHub, at render time.
async function resolveImagePaths(content, entryPath) {
  const baseDir = path.posix.dirname(entryPath);

  const markdownImageRegex = /!\[([^\]]*)\]\((?!https?:\/\/|\/api\/)([^)\s]+)(\s+"[^"]*")?\)/g;
  const htmlImageRegex = /<img\s+([^>]*?\bsrc=["'])(?!https?:\/\/|\/api\/)([^"']+)(["'][^>]*)>/gi;

  const resolvedMap = new Map();

  const cleanRelPath = (relPath = "") =>
    String(relPath)
      .replace(/&amp;/g, "&")
      .replace(/\\/g, "/")
      .trim();

  const resolveAndStore = async (relPath) => {
    const clean = cleanRelPath(relPath);

    if (resolvedMap.has(clean)) {
      return resolvedMap.get(clean);
    }

    const candidates = candidateResolvedPaths(baseDir, clean);
    const resolved = await downloadAndStoreImage(candidates);
    resolvedMap.set(clean, resolved);

    return resolved;
  };

  for (const m of content.matchAll(markdownImageRegex)) {
    await resolveAndStore(m[2]);
  }

  for (const m of content.matchAll(htmlImageRegex)) {
    await resolveAndStore(m[2]);
  }

  let out = content.replace(markdownImageRegex, (match, alt, relPath, titlePart) => {
    const resolved = resolvedMap.get(cleanRelPath(relPath));
    const newUrl = SERVER_BASE + "/api/synced-images?path=" + encodeURIComponent(resolved);
    return "![" + alt + "](" + newUrl + (titlePart || "") + ")";
  });

  out = out.replace(htmlImageRegex, (match, beforeSrc, relPath, afterSrc) => {
    const resolved = resolvedMap.get(cleanRelPath(relPath));
    const newUrl = SERVER_BASE + "/api/synced-images?path=" + encodeURIComponent(resolved);
    return "<img " + beforeSrc + newUrl + afterSrc + ">";
  });

  return out;
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
  // A doc can override its auto-derived title (or fix a humanization that
  // reads oddly) by starting with `---\ntitle: Something Nicer\n---` —
  // otherwise entry.title (derived from the filename, or hand-set in
  // doc-index.json for the still-static products) is used as-is.
  let frontmatterTitle = null;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`  ⚠️  SKIP (HTTP ${res.status}): ${entry.path}`);
      return { ok: false };
    }
    content = await res.text();
    if (content.startsWith('---')) {
      const parts = content.split('---');
      if (parts.length >= 3) {
        const m = parts[1].match(/^\s*title:\s*(.+?)\s*$/m);
        if (m) frontmatterTitle = m[1].replace(/^["']|["']$/g, '');
        content = parts.slice(2).join('---').trim();
      }
    }
    content = await resolveImagePaths(content, entry.path);
  } catch (err) {
    console.log(`  ❌ FETCH ERROR: ${entry.path} — ${err.message}`);
    return { ok: false };
  }

  const title = frontmatterTitle || entry.title;
  const tags = guessTags(entry);
  const headings = extractHeadings(content);

  await pool.query(
    `INSERT INTO documents (doc_id, title, product, category, tags, github_path, content, display_order, pdf_path, parent_path, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, NOW())
     ON CONFLICT (doc_id) DO UPDATE SET
       title = EXCLUDED.title,
       product = EXCLUDED.product,
       category = EXCLUDED.category,
       tags = EXCLUDED.tags,
       github_path = EXCLUDED.github_path,
       content = EXCLUDED.content,
       display_order = EXCLUDED.display_order,
       pdf_path = EXCLUDED.pdf_path,
       parent_path = EXCLUDED.parent_path,
       updated_at = NOW()`,
    [
      entry.id, title, entry.product, entry.category, tags, entry.path, content,
      entry.order || 99, entry.pdf || null,
      // NULL (not []) for statically-configured docs — an array here means
      // "this doc's nav placement comes from real folder discovery", even
      // when that array is legitimately empty (a file sitting directly in
      // an auto-discovered root, with no group folder). See buildNav() in
      // src/useGithubDocs.js, which relies on telling those two cases apart.
      Array.isArray(entry.parent_path) ? entry.parent_path : null,
    ]
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

async function deleteDocsMissingFromIndex(docIndex) {
  const indexedIds = docIndex.map((d) => d.id);
  if (indexedIds.length === 0) {
    console.log('  ⚠️  doc index is empty; skipping stale-document cleanup.');
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
    console.log(`  🧹 removed ${rows.length} stale docs no longer in the index (deleted/renamed/moved on GitHub)`);
    console.log(`     ${preview}${suffix}`);
  }

  return { deleted: rows.length };
}

async function main() {
  const docIndex = await buildDocIndex();
  console.log(`Syncing ${docIndex.length} documents from GitHub → PostgreSQL...\n`);
  let success = 0, failed = 0;

  for (const entry of docIndex) {
    const result = await syncDoc(entry);
    if (result.ok) {
      success++;
      console.log(`  ✅ ${entry.id} — ${result.contentLength} chars, ${result.headingCount} headings`);
    } else {
      failed++;
    }
    await new Promise(r => setTimeout(r, 100));
  }

  const cleanup = await deleteDocsMissingFromIndex(docIndex);

  console.log(`\nDone. ${success} synced, ${failed} failed, ${cleanup.deleted} stale removed.`);
  await pool.end();
}

main().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});