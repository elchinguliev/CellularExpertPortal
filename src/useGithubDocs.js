// Production is served by IIS under its application path. Local development
// keeps CRA's root-relative API calls and development proxy unchanged.
const API_BASE = process.env.REACT_APP_API_BASE || (
  process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:4000/api'
);
const SERVER_BASE = API_BASE.endsWith('/api') ? API_BASE.slice(0, -4) : API_BASE;

// Documentation records and ticket attachments created before the IIS move can
// contain either localhost URLs or root-relative backend paths. Keep those
// assets inside the mounted IIS application in production.
function toPortalUrl(value = '') {
  return String(value).replace(
    /(?:https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?)?\/(api|images|downloads|ticket-attachments)(?=\/|\?|#|$)/gi,
    `${SERVER_BASE}/$1`,
  );
}

// ── Display-name / sort-order helpers ────────────────────────────────────────
// File and folder names carry numeric prefixes purely to control ordering —
// they're never shown to a reader. This is the frontend half of the same
// convention ce-backend/doc-discovery.js applies server-side (kept as a
// small separate copy since the two bundles don't share a module); it's
// applied uniformly to real folder segments (from `parent_path`, e.g.
// "3-ce-express-tools") and to the flat `category` string older/manually
// -configured docs still carry (e.g. "Data Management") — the latter has no
// digits or dashes to strip, so it passes through unchanged.
const ACRONYMS = {
  ce: 'CE', rf: 'RF', api: 'API', dxf: 'DXF', emf: 'EMF', hcm: 'HCM', mw: 'MW',
  fs: 'FS', gis: 'GIS', pdf: 'PDF', dem: 'DEM', csv: 'CSV', cpe: 'CPE',
  rcp: 'RCP', rlp: 'RLP', rl: 'RL', sat: 'SAT', fwa: 'FWA', wifi: 'WiFi',
  gsm: 'GSM', cdma: 'CDMA', lte: 'LTE', cbrs: 'CBRS',
  '2g': '2G', '3g': '3G', '4g': '4G', '5g': '5G', '3d': '3D',
};

function humanizeSegment(rawName = '') {
  const stem = String(rawName).replace(/\.md$/i, '');
  // "v73-sections" -> "v7.3" — a version folder should read as a version,
  // not as its literal directory name.
  const versionMatch = stem.match(/^v(\d)(\d)(?:-sections?)?$/i);
  if (versionMatch) return `v${versionMatch[1]}.${versionMatch[2]}`;
  const withoutPrefix = stem.replace(/^(\d+-)+/, '') || stem;
  const words = withoutPrefix.split(/[-_]+/).filter(Boolean);
  if (words.length === 0) return stem;
  return words
    .map((w) => ACRONYMS[w.toLowerCase()] || w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Leading numeric-prefix groups as an array, e.g. "3-1-workspaces.md" ->
// [3, 1], "2-map-view" -> [2], "Data Management" -> [] (no digits).
// Array (not a single number) so multi-digit-group prefixes compare
// correctly — "3-9-x" before "3-10-x" — instead of a naive decimal collapse.
function numericPrefixKey(rawName = '') {
  const stem = String(rawName).replace(/\.md$/i, '');
  const m = stem.match(/^(\d+(?:-\d+)*)-?/);
  if (!m) return [];
  return m[1].split('-').map(Number);
}

function compareKeys(a, b) {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const av = a[i] ?? -1;
    const bv = b[i] ?? -1;
    if (av !== bv) return av - bv;
  }
  return 0;
}

function keyMin(a, b) {
  return compareKeys(a, b) <= 0 ? a : b;
}

// ── Product-level config ─────────────────────────────────────────────────────
// The one thing that genuinely can't be derived from the docs repo: which
// products exist and what to call/order them. Everything below this line
// (categories, sections, page titles, sort order within a product) is
// derived from what's actually in the database, which in turn mirrors
// whatever's actually in the docs repo — see ce-backend/doc-discovery.js.
const PRODUCT_LABELS = {
  'CE Express': 'CE Express',
  'CE Pro': 'CE Pro',
  'Geodata': 'Geodata',
  'Inventory3D': 'Inventory3D',
};
const PRODUCT_ORDER = ['CE Express', 'CE Pro', 'Geodata', 'Inventory3D'];

// ── Doc index ─────────────────────────────────────────────────────────────────
// The full doc list now comes from Postgres (`/api/docs`) instead of a
// hand-maintained array — every row already reflects whatever
// sync-from-github.js last pulled from the docs repo (auto-discovered nested
// docs plus the still-flat Administrator Guide and admin-created docs).
// DOC_INDEX is populated in
// place (same array reference) so existing `.find()`/`.map()` call sites
// keep working once loadDocIndex() resolves; getDocIndex()/getNav() exist
// so React code can re-read it as state after that happens (see App.js).
export const DOC_INDEX = [];

let loadPromise = null;

function rowToEntry(row) {
  return {
    id: row.doc_id,
    path: row.github_path,
    title: row.title,
    product: row.product,
    category: row.category,
    order: row.display_order ?? 99,
    nav_group_order: Number.isFinite(row.nav_group_order) ? row.nav_group_order : 0,
    // Deliberately NOT coerced to [] here — null vs. a real (possibly
    // empty) array is the signal buildNav()/leafSortKey() use to tell "this
    // doc's nav placement comes from real folder discovery" apart from
    // "this doc is still flat/manually-categorized", per doc-discovery.js.
    parent_path: Array.isArray(row.parent_path) ? row.parent_path : null,
    tags: row.tags || [],
  };
}

export async function loadDocIndex() {
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/docs`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rows = await res.json();
      DOC_INDEX.length = 0;
      rows.forEach((row) => DOC_INDEX.push(rowToEntry(row)));
      return true;
    } catch {
      return false;
    }
  })();
  return loadPromise;
}

export function getDocIndex() {
  return DOC_INDEX;
}

// ── Navigation tree ───────────────────────────────────────────────────────────
// Builds real nested sections instead of a flattened product/category pair:
// each doc nests under its actual `parent_path` folder chain (e.g.
// ["3-ce-express-tools"], BELOW the invisible auto-discovery root — see
// doc-discovery.js) when it has one, or under a single synthetic level
// named after its flat `category` when it doesn't (the Administrator Guide
// and admin-created docs, which have no folder structure that encodes
// grouping).
//
// `parent_path` being a real array (even an empty one, for a doc sitting
// directly in the discovery root with no group folder) vs. null is exactly
// that distinction — NOT whether the array happens to be non-empty, since a
// root-level discovered doc legitimately has parent_path: [].
function leafSortKey(doc) {
  // Only derive from the filename when this doc actually came from folder
  // auto-discovery (it has a real parent_path) — a statically-configured
  // doc's filename prefix (e.g. training PDFs numbered 01, 02, 03...) has
  // nothing to do with any other section's numbering and would produce
  // false ties/misorderings against it. Those use their curated `order`
  // field instead, exactly as before this refactor.
  if (Array.isArray(doc.parent_path)) {
    const basename = (doc.path || '').split('/').pop() || '';
    const fromName = numericPrefixKey(basename);
    if (fromName.length) return fromName;
  }
  return [Number.isFinite(doc.order) ? doc.order : 99];
}

function navGroupOrder(doc) {
  return Number.isFinite(doc.nav_group_order) ? doc.nav_group_order : 0;
}

// Product entry points are always selected from the primary documentation
// group. This keeps product cards on the versioned guide even when the same
// product also has Training or an Administrator Guide in later nav groups.
// For recursively discovered guides, a page at the discovery root is the
// product's natural landing page; flat/manual docs fall back to their existing
// curated order.
export function getProductLandingDocId(product, docIndex = DOC_INDEX) {
  const mainDocs = docIndex.filter(
    (doc) => doc.product === product && navGroupOrder(doc) === 0
  );

  mainDocs.sort((a, b) => {
    const aIsRootPage = Array.isArray(a.parent_path) && a.parent_path.length === 0;
    const bIsRootPage = Array.isArray(b.parent_path) && b.parent_path.length === 0;
    if (aIsRootPage !== bIsRootPage) return aIsRootPage ? -1 : 1;

    return (
      compareKeys(leafSortKey(a), leafSortKey(b)) ||
      a.title.localeCompare(b.title) ||
      a.id.localeCompare(b.id)
    );
  });

  return mainDocs[0]?.id || null;
}

function getOrCreateFolder(parent, rawSegment, groupOrder) {
  let node = parent.children.find((c) => c.type === 'folder' && c.key === rawSegment);
  if (!node) {
    node = {
      type: 'folder',
      key: rawSegment,
      label: humanizeSegment(rawSegment),
      sortKey: numericPrefixKey(rawSegment),
      navGroupOrder: groupOrder,
      children: [],
    };
    parent.children.push(node);
  } else {
    node.navGroupOrder = Math.min(node.navGroupOrder, groupOrder);
  }
  return node;
}

function finalizeGroupOrder(node) {
  if (node.type === 'doc') return node.navGroupOrder;
  node.children.forEach((child) => {
    node.navGroupOrder = Math.min(node.navGroupOrder, finalizeGroupOrder(child));
  });
  return node.navGroupOrder;
}

// A folder that has no numeric prefix of its own (a synthetic category
// level, e.g. "Data Management") sorts by the lowest sort key among its own
// descendants instead — the same "category takes the position of its
// earliest item" rule the old flat nav used, generalized to any depth. A
// folder that DOES have its own numeric prefix is unaffected: that prefix
// is always <= anything nested under it, so this is a no-op for it.
function finalizeSortKeys(node) {
  if (node.type === 'doc') return node.sortKey;
  let effective = node.sortKey.length ? node.sortKey : [Infinity];
  node.children.forEach((child) => {
    effective = keyMin(effective, finalizeSortKeys(child));
  });
  node.sortKey = effective;
  return effective;
}

function sortTree(node) {
  if (node.type !== 'folder') return;
  node.children.forEach(sortTree);
  node.children.sort(
    (a, b) => a.navGroupOrder - b.navGroupOrder || compareKeys(a.sortKey, b.sortKey) || a.label.localeCompare(b.label)
  );
}

export function buildNav(docIndex) {
  const productNodes = new Map();

  docIndex.forEach((doc) => {
    if (!productNodes.has(doc.product)) {
      productNodes.set(doc.product, { type: 'folder', key: doc.product, navGroupOrder: Infinity, children: [] });
    }
    let cursor = productNodes.get(doc.product);

    const groupOrder = navGroupOrder(doc);
    const chain = Array.isArray(doc.parent_path) ? doc.parent_path : [doc.category];
    chain.forEach((rawSegment) => {
      cursor = getOrCreateFolder(cursor, rawSegment, groupOrder);
    });

    cursor.children.push({ type: 'doc', id: doc.id, label: doc.title, sortKey: leafSortKey(doc), navGroupOrder: groupOrder });
  });

  productNodes.forEach((node) => {
    node.children.forEach((child) => {
      finalizeSortKeys(child);
      finalizeGroupOrder(child);
    });
    sortTree(node);
  });

  const known = PRODUCT_ORDER.filter((p) => productNodes.has(p));
  const unknown = [...productNodes.keys()].filter((p) => !PRODUCT_ORDER.includes(p)).sort();

  return [...known, ...unknown].map((product) => {
    const node = productNodes.get(product);
    return { ...node, label: PRODUCT_LABELS[product] || product };
  });
}

export function getNav() {
  return buildNav(DOC_INDEX);
}

const cache = {};
let preloadStarted = false;

export function preloadAllDocs() {
  if (preloadStarted) return;
  preloadStarted = true;
  loadDocIndex().then(() => {
    DOC_INDEX.forEach((entry, i) => {
      setTimeout(() => { fetchDoc(entry.id).catch(() => {}); }, i * 60);
    });
  });
}

export async function fetchDoc(docId) {
  // Guards the case where a direct link (e.g. /docs/some-id opened fresh)
  // is loaded before the initial /api/docs fetch has resolved — cheap after
  // the first call since loadDocIndex() caches its own promise.
  await loadDocIndex();
  let entry = DOC_INDEX.find(d => d.id === docId);
  // Not found under this id — it may be an old, pre-cleanup id from a
  // bookmark or shared link (doc-discovery.js's id scheme has changed
  // before). Don't give up yet: the request below can still resolve it via
  // the backend's own legacy-id fallback (see GET /api/docs/:docId in
  // server.js) — only return null if that also comes back empty.
  // Always fetch live documentation so DB/source fixes are visible immediately.
  // if (cache[docId]) return cache[docId];
  try {
    const res = await fetch(`${API_BASE}/docs/${docId}`);
    if (!res.ok) {
      if (!entry) return null;
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    // The backend resolves an old id to the doc's real, current doc_id —
    // when that differs from what we requested, this was a legacy link;
    // fall back to the canonical entry's metadata and flag the mismatch so
    // the caller (loadDoc in App.js) can quietly fix the address bar.
    const canonicalId = data.doc_id;
    if (!entry) entry = DOC_INDEX.find(d => d.id === canonicalId) || rowToEntry(data);
    const doc = {
      ...entry,
      id: canonicalId,
      content: data.content,
      images: data.images || [],
      headings: data.headings || [],
      tags: data.tags || [],
      pdf_path: data.pdf_path,
      redirectedFrom: canonicalId !== docId ? docId : null,
    };
    cache[canonicalId] = doc;
    return doc;
  } catch (err) {
    if (!entry) return null;
    return {
      ...entry,
      content: `# ${entry.title}\n\n> ⚠️ **Backend not reachable.**\n>\n> Make sure the API server is running: \`npm start\` in the \`ce-backend\` folder.\n>\n> Expected at: \`${API_BASE}\`\n\n---\n\nFor help: [support@cellular-expert.com](mailto:support@cellular-expert.com)`,
    };
  }
}

function snippetAround(content, word) {
  if (!content) return '';
  const idx = content.toLowerCase().indexOf(word.toLowerCase());
  if (idx === -1) return '';
  const start = Math.max(0, idx - 40);
  const end = Math.min(content.length, idx + 80);
  let snippet = content.slice(start, end).replace(/\n/g, ' ').replace(/[#*`]/g, '');
  return (start > 0 ? '…' : '') + snippet.trim() + (end < content.length ? '…' : '');
}

export async function searchAPI(query) {
  const q = query.trim();
  if (!q) return [];
  try {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    return rows.map(r => {
      const entry = DOC_INDEX.find(d => d.id === r.doc_id);
      return {
        ...entry,
        score: r.rank,
        snippet: (r.snippet || '').replace(/<\/?b>/g, ''),
      };
    });
  } catch (err) {
    return [];
  }
}

// Synchronous fallback search (used while the async API call is in flight,
// or if the backend is briefly unreachable) — searches title/category/product
// plus whatever is already cached locally.
// Pulls out H2-H4 headings from a document's markdown content — same slug
// algorithm used by the article renderer's h.id, so a match here can link
// straight to that heading instead of just the top of the page.
function extractHeadingsFromContent(content) {
  if (!content) return [];
  const headings = [];
  content.split('\n').forEach((line) => {
    const m = line.match(/^(#{2,4})\s(.+)/);
    if (m) {
      headings.push({
        text: m[2].replace(/^\d+(\.\d+)*\.?\s+/, ''),
        id: m[2].toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-'),
      });
    }
  });
  return headings;
}

export function searchIndex(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const words = q.split(/\s+/).filter(w => w.length > 1);

  // "Does any actual word in this text start with the query?" — e.g. for
  // query "log", the word "login" qualifies but "topology" does not, even
  // though "topology" happens to contain the letters "l-o-g" in the middle
  // of "topology". Matching whole words instead of arbitrary substrings
  // avoids these false positives.
  const wordStartsWith = (text, w) =>
    text.split(/[^a-z0-9]+/).some((token) => token.startsWith(w));

  return DOC_INDEX
    .map(doc => {
      let score = 0;
      let snippet = '';
      let matchedHeadingId = null;
      let matchedHeadingText = null;
      const title = doc.title.toLowerCase();
      const category = doc.category.toLowerCase();
      const product = doc.product.toLowerCase();
      const content = cache[doc.id]?.content || '';
      const headings = content ? extractHeadingsFromContent(content) : [];

      words.forEach(w => {
        if (category === w)                    score += 30;
        else if (category.startsWith(w))        score += 20;
        else if (wordStartsWith(category, w))   score += 12;
        else if (category.includes(w))          score += 2;

        if (title.startsWith(w))                score += 18;
        else if (wordStartsWith(title, w))       score += 12;
        else if (title.includes(w))              score += 3;

        if (product === w)                      score += 12;
        else if (product.startsWith(w))         score += 8;
        else if (wordStartsWith(product, w))     score += 5;

        // A query matching an actual sub-heading inside the article (e.g.
        // searching "Prediction" and finding the "Prediction" section
        // buried inside a longer page) is a very strong, specific signal —
        // score it above generic body-text matches, and remember which
        // heading matched so the result can link straight to it.
        if (!matchedHeadingId) {
          const hit = headings.find((h) => wordStartsWith(h.text.toLowerCase(), w));
          if (hit) {
            score += 22;
            matchedHeadingId = hit.id;
            matchedHeadingText = hit.text;
          }
        }

        // Scanning full article content for a very short substring produces
        // mostly noise (e.g. "tr" inside "structure", "extract", "control").
        // 3 letters is usually enough to mean something on its own (e.g.
        // "log" as in "login") without being too noisy.
        if (content && w.length >= 3) {
          const occurrences = content.toLowerCase().split(w).length - 1;
          if (occurrences > 0) {
            score += Math.min(occurrences, 5);
            if (!snippet) snippet = snippetAround(content, w);
          }
        }
      });
      return { ...doc, score, snippet, matchedHeadingId, matchedHeadingText };
    })
    .filter(d => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

export { API_BASE, SERVER_BASE, toPortalUrl };
