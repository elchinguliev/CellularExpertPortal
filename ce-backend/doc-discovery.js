// doc-discovery.js
//
// Walks the CellularExpertDocs GitHub repo and turns whatever nested folder
// structure it finds under each configured root into the same shape
// sync-from-github.js already expects from doc-index.json — so a new file,
// a rename, or a folder move on GitHub needs zero changes here.
//
// Only ONE thing stays hand-configured: which root folders are actually
// organized into real nested sections (AUTO_DISCOVER_ROOTS below). Anywhere
// else in the docs repo still uses flat, hand-grouped files (Geodata,
// Inventory3D, the administrator guide) — those have no folder signal to
// derive a category or reading order from, so they stay listed explicitly in
// doc-index.json until they get the same folder treatment. Add a root here
// and its whole subtree — at any depth — starts showing up with no further
// code change.
//
// A root's own folder is normally a structural/version container, not
// something a reader should ever see as a nav item — it's stripped out of
// `parent_path` (the real, visible nesting) and folded into the id/route
// instead as a version token (see idFromParts below). A root can opt into a
// visible `navPath` instead (for a non-version type such as Training).
// Folders below the root always stay in parent_path untouched, at whatever
// depth they're nested.

const GITHUB_RAW = process.env.GITHUB_RAW_BASE || '';
const ghMatch = GITHUB_RAW.match(/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)/);
const GH_OWNER = ghMatch?.[1];
const GH_REPO = ghMatch?.[2];
const GH_BRANCH = ghMatch?.[3] || 'main';

const AUTO_DISCOVER_ROOTS = [
  { product: 'CE Express', rootPath: 'docs/ce-express/v7.3', navGroupOrder: 0 },
  { product: 'CE Express', rootPath: 'docs/ce-express/training', navPath: ['training'], navGroupOrder: 1 },
  { product: 'CE Pro', rootPath: 'docs/ce-pro/v5.0', navGroupOrder: 0 },
  { product: 'CE Pro', rootPath: 'docs/ce-pro/training', navPath: ['training'], navGroupOrder: 1 },
];

// Small acronym allowlist so filename-derived titles read naturally
// ("ce-express-api" -> "CE Express API" instead of "Ce Express Api").
// Anything not listed here just gets Title Case, which is right for the
// vast majority of real filenames. A document can always override this by
// starting its markdown with `---\ntitle: Something Nicer\n---`.
const ACRONYMS = {
  ce: 'CE', rf: 'RF', api: 'API', dxf: 'DXF', emf: 'EMF', hcm: 'HCM', mw: 'MW',
  fs: 'FS', gis: 'GIS', pdf: 'PDF', dem: 'DEM', csv: 'CSV', cpe: 'CPE',
  rcp: 'RCP', rlp: 'RLP', rl: 'RL', sat: 'SAT', fwa: 'FWA', wifi: 'WiFi',
  gsm: 'GSM', cdma: 'CDMA', lte: 'LTE', cbrs: 'CBRS',
  '2g': '2G', '3g': '3G', '4g': '4G', '5g': '5G', '3d': '3D',
};

function stripExt(rawName) {
  return rawName.replace(/\.md$/i, '');
}

// Numeric prefixes ("3-", "3-1-", "3-1-31-") exist purely to control
// ordering and never belong in a title, id, or URL.
function stripNumericPrefix(stem) {
  return stem.replace(/^(\d+-)+/, '') || stem;
}

function humanizeSegment(rawName) {
  const stem = stripExt(rawName);
  // "v73-sections" / "v73-section" -> "v7.3" — used only for the version
  // token in an id/route; a version folder itself is never shown in nav
  // (see discoverDocs below), so this path mostly matters for logging/debug.
  const versionMatch = stem.match(/^v(\d)(\d)(?:-sections?)?$/i);
  if (versionMatch) return `v${versionMatch[1]}.${versionMatch[2]}`;

  const withoutPrefix = stripNumericPrefix(stem);
  const words = withoutPrefix.split(/[-_]+/).filter(Boolean);
  if (words.length === 0) return stem;
  return words
    .map((w) => ACRONYMS[w.toLowerCase()] || w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// kebab-case, numeric ordering prefix stripped — used for the clean id/URL.
function slugifyClean(rawName) {
  const stripped = stripNumericPrefix(stripExt(rawName));
  return stripped
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// kebab-case, numeric prefix KEPT — this is the pre-cleanup id scheme
// (ce-express-v73-3-1-31-audibility). Kept only so server.js can recognize
// an old-style bookmarked URL and redirect it to the doc's current clean id
// — never used to generate a new link.
function slugifyKeepDigits(rawName) {
  return stripExt(rawName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function productSlug(product) {
  return slugifyClean(product);
}

function rootInfo(rootPath) {
  const rootFolderName = rootPath.split('/').filter(Boolean).pop();
  const rootSlug = slugifyClean(rootFolderName).replace(/-sections?$/, '');
  return { rootFolderName, rootSlug };
}

// docs/ce-express/.../v73-sections/3-ce-express-tools/3-1-31-audibility.md
// -> { middleFolders: ['3-ce-express-tools'], filename: '3-1-31-audibility.md' }
function splitRelPath(githubPath, rootPath) {
  const prefix = rootPath.replace(/\/+$/, '') + '/';
  if (!githubPath.startsWith(prefix)) return null;
  const segments = githubPath.slice(prefix.length).split('/');
  const filename = segments.pop();
  return { middleFolders: segments, filename };
}

function isHiddenPath({ middleFolders, filename }) {
  return [...middleFolders, filename].some((segment) => segment.startsWith('_'));
}

// product: ce-express, version: v73, parent: [ce-express-tools], page: audibility
// -> ce-express-v73-ce-express-tools-audibility
function idFromParts(product, rootSlug, middleFolders, filename, slugify) {
  const idSuffix = [...middleFolders.map(slugify), slugify(filename)].join('-');
  return `${productSlug(product)}-${rootSlug}-${idSuffix}`;
}

// The exact id scheme this module produced before ids were cleaned up
// (numeric prefixes kept). Recomputed purely from `product` + `github_path`
// — nothing needs to be persisted for this — so server.js can fall back to
// it when a requested doc_id isn't found under the current scheme, and
// redirect the browser to the real one. Returns null if the path isn't
// under any auto-discovered root.
function legacyIdFromGithubPath(product, githubPath) {
  for (const root of AUTO_DISCOVER_ROOTS) {
    if (root.product !== product) continue;
    const split = splitRelPath(githubPath, root.rootPath);
    if (!split) continue;
    const { rootSlug } = rootInfo(root.rootPath);
    return idFromParts(product, rootSlug, split.middleFolders, split.filename, slugifyKeepDigits);
  }
  return null;
}

async function fetchRepoTree() {
  if (!GH_OWNER || !GH_REPO) {
    console.log('  ⚠️  GITHUB_RAW_BASE not set to a raw.githubusercontent.com URL — skipping auto-discovery.');
    return [];
  }
  const url = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/git/trees/${GH_BRANCH}?recursive=1`;
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) {
    console.log(`  ⚠️  GitHub tree API returned HTTP ${res.status} — skipping auto-discovery this run.`);
    return [];
  }
  const data = await res.json();
  if (data.truncated) {
    console.log('  ⚠️  GitHub tree response was truncated — some deeply-nested files may be missing.');
  }
  return data.tree || [];
}

// Builds one doc-index-shaped entry per discovered .md file.
//
// parent_path is the root-relative folder chain BELOW the root itself (the
// root folder, e.g. "v73-sections", is deliberately excluded — it's a
// structural/version container, not a visible nav group). A file sitting
// directly in the root gets parent_path: [] and attaches straight to the
// product level in the sidebar; a file under one or more subfolders keeps
// every one of those folders as a real, unflattened nesting level. This is
// what src/useGithubDocs.js's buildNav() walks to build the sidebar tree —
// see its `Array.isArray(doc.parent_path)` check for how an (intentionally)
// empty array here is told apart from "no parent_path at all" (the
// still-flat/manually-categorized products).
//
// `order` is left as a coarse fallback (its own leading number) — the
// frontend derives real sibling order directly from the raw path segments
// (folder names and filename), which preserves full precision (e.g. 1..44)
// without needing an encoding scheme here.
async function discoverDocs() {
  const tree = await fetchRepoTree();
  const files = tree.filter((n) => n.type === 'blob' && n.path.toLowerCase().endsWith('.md'));

  const entries = [];
  for (const root of AUTO_DISCOVER_ROOTS) {
    const { rootFolderName, rootSlug } = rootInfo(root.rootPath);
    const matches = files.filter((f) => {
      const split = splitRelPath(f.path, root.rootPath);
      return split && !isHiddenPath(split);
    });

    for (const f of matches) {
      const { middleFolders, filename } = splitRelPath(f.path, root.rootPath);
      const id = idFromParts(root.product, rootSlug, middleFolders, filename, slugifyClean);
      const leadingNumber = filename.match(/^(\d+)/);
      // Purely a display/search-badge value, not used for nav placement
      // (parent_path is authoritative there) — falls back to the version
      // label when a doc sits directly in the root with no group folder.
      const lastFolder = middleFolders[middleFolders.length - 1] || rootFolderName;

      entries.push({
        id,
        path: f.path,
        title: humanizeSegment(filename),
        product: root.product,
        category: humanizeSegment(lastFolder),
        parent_path: [...(root.navPath || []), ...middleFolders],
        nav_group_order: root.navGroupOrder ?? 0,
        order: leadingNumber ? Number(leadingNumber[1]) : 99,
      });
    }
  }
  return entries;
}

module.exports = { discoverDocs, humanizeSegment, legacyIdFromGithubPath, AUTO_DISCOVER_ROOTS };
