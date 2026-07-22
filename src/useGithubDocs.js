// useGithubDocs.js
// Fetches documentation markdown files directly from GitHub repository
// When a .md file is edited on GitHub, the site automatically reflects the changes

const GITHUB_RAW = 'https://raw.githubusercontent.com/elchinguliev/CellularExpertDocs/pooja';
const GITHUB_API = 'https://api.github.com/repos/elchinguliev/CellularExpertDocs';

// All known docs — structure matches the docs/ folder in GitHub
// To add a new doc: 1) add the .md file to GitHub  2) add its entry here
export const DOC_INDEX = [
  // CE Express — Getting Started
  // NOTE: the old per-topic curated docs (docs/ce-express/01-18-*.md) were deleted from the
  // repo. Entries below are repointed at the surviving PDF-derived manual and the surviving
  // topic-level training docs (docs/ce-express/training/*.md) where a matching topic exists.
  { id:'ce-express-introduction',       path:'docs/ce-express/user-guide/user-guide-v7.3.md',       title:'Introduction to CE Express',                  product:'CE Express', category:'Getting Started',   order:1  },
  { id:'ce-express-login',              path:'docs/ce-express/user-guide/user-guide-v7.3.md',       title:'Logging In',                                  product:'CE Express', category:'Getting Started',   order:2, anchor:'21-log-in-to-the-express-network-data-management-application' },
  { id:'ce-express-map-view',           path:'docs/ce-express/user-guide/user-guide-v7.3.md',       title:'Map View Overview',                           product:'CE Express', category:'Interface',         order:3, anchor:'3-map-view' },
  { id:'ce-express-workspace',          path:'docs/ce-express/training/01-creating-workspace.md',   title:'Workspaces',                                  product:'CE Express', category:'Getting Started',   order:4  },
  // CE Express — Network Objects
  { id:'ce-express-features',           path:'docs/ce-express/training/02-create-objects.md',       title:'Features — Network Objects',  product:'CE Express', category:'Network Objects',    order:5  },
  // CE Express — Tools
  { id:'ce-express-layers',             path:'docs/ce-express/user-guide/user-guide-v7.3.md',       title:'Layers',                      product:'CE Express', category:'Tools',              order:11, anchor:'314-layers' },
  { id:'ce-express-prediction-history', path:'docs/ce-express/user-guide/user-guide-v7.3.md',       title:'Prediction History',          product:'CE Express', category:'Tools',              order:12, anchor:'315-prediction-history' },
  { id:'ce-express-antennas',           path:'docs/ce-express/user-guide/user-guide-v7.3.md',       title:'Antennas',                    product:'CE Express', category:'Tools',              order:13, anchor:'316-antennas' },
  { id:'ce-express-feature-templates',  path:'docs/ce-express/user-guide/user-guide-v7.3.md',       title:'Feature Templates',           product:'CE Express', category:'Tools',              order:14, anchor:'318-feature-templates' },
  { id:'ce-express-radios',             path:'docs/ce-express/user-guide/user-guide-v7.3.md',       title:'Radios',                      product:'CE Express', category:'Tools',              order:18, anchor:'3135-radios' },
  // CE Express — Calculations
  { id:'ce-express-rf-prediction',      path:'docs/ce-express/training/04-rf-prediction.md',        title:'RF Prediction',               product:'CE Express', category:'Calculations',       order:6  },
  { id:'ce-express-prediction-models',  path:'docs/ce-express/training/06-prediction-models.md',    title:'Prediction Models',           product:'CE Express', category:'Calculations',       order:7  },
  { id:'ce-express-profile',            path:'docs/ce-express/training/03-line-of-sight.md',        title:'Line of Sight & Profile',     product:'CE Express', category:'Calculations',       order:8  },
  { id:'ce-express-radio-link',         path:'docs/ce-express/training/08-mw-prediction.md',        title:'Radio Link (Microwave)',       product:'CE Express', category:'Calculations',       order:9  },
  { id:'ce-express-visibility',         path:'docs/ce-express/user-guide/user-guide-v7.3.md',title:'Visibility Prediction',      product:'CE Express', category:'Calculations',       order:15, anchor:'3120-visibility-prediction' },
  { id:'ce-express-radar',              path:'docs/ce-express/user-guide/user-guide-v7.3.md',    title:'Radar Prediction',            product:'CE Express', category:'Calculations',       order:16, anchor:'3124-radar-prediction' },
  { id:'ce-express-model-tuning',       path:'docs/ce-express/user-guide/user-guide-v7.3.md',        title:'Model Tuning',                product:'CE Express', category:'Calculations',       order:17, anchor:'3126-model-tuning' },
  // CE Express — Network Management
  { id:'ce-express-networks',           path:'docs/ce-express/user-guide/user-guide-v7.3.md',            title:'Networks — Batch Prediction', product:'CE Express', category:'Network Management', order:10, anchor:'313-networks' },
  // CE Pro — Getting Started
  { id:'ce-pro-installation',           path:'docs/ce-pro/training/00-installation.md',   title:'Installation & Activation',                   product:'CE Pro',     category:'Getting Started',   order:0  },
  { id:'ce-pro-data-types',             path:'docs/ce-pro/training/01-data-types.md',     title:'Data Types & Geodata Layers',                 product:'CE Pro',     category:'Getting Started',   order:1  },
  { id:'ce-pro-architecture',           path:'docs/ce-pro/training/02-architecture.md',   title:'CE Pro Architecture',                         product:'CE Pro',     category:'Getting Started',   order:2  },
  { id:'ce-pro-workspace',              path:'docs/ce-pro/training/04-workspace.md',       title:'Creating Workspace',                          product:'CE Pro',     category:'Getting Started',   order:4  },
  { id:'ce-pro-objects',                path:'docs/ce-pro/training/06-objects.md',         title:'Creating Objects',                            product:'CE Pro',     category:'Getting Started',   order:6  },
  { id:'ce-pro-importing-data',         path:'docs/ce-pro/training/09-importing-data.md',  title:'Importing Data',                              product:'CE Pro',     category:'Getting Started',   order:9  },
  // CE Pro — Calculations
  { id:'ce-pro-line-of-sight',          path:'docs/ce-pro/training/05-line-of-sight.md',        title:'Line of Sight & Profile',        product:'CE Pro', category:'Calculations', order:5  },
  { id:'ce-pro-cell-prediction',        path:'docs/ce-pro/training/07-cell-prediction.md',       title:'Cell Prediction',                product:'CE Pro', category:'Calculations', order:7  },
  { id:'ce-pro-prediction-models',      path:'docs/ce-pro/training/08-prediction-models.md',     title:'Prediction Models',              product:'CE Pro', category:'Calculations', order:8  },
  { id:'ce-pro-rl-prediction',          path:'docs/ce-pro/training/10-rl-prediction.md',         title:'RL / Microwave Link Prediction',  product:'CE Pro', category:'Calculations', order:10 },
  // NOTE: FWA/Quick/Radar/Visibility/Compare were curated from the RCP PDF and were deleted;
  // repointed at the surviving full RCP manual. EMF/Indoor/Sound repointed at their own surviving guides.
  { id:'ce-pro-fwa-prediction',         path:'docs/ce-pro/rcp-user-guide.md',        title:'FWA RF Prediction',              product:'CE Pro', category:'Calculations', order:12, anchor:'94-fwa-rf-prediction' },
  { id:'ce-pro-quick-prediction',       path:'docs/ce-pro/rcp-user-guide.md',      title:'Quick Prediction',               product:'CE Pro', category:'Calculations', order:13, anchor:'95-quick-prediction' },
  { id:'ce-pro-radar-prediction',       path:'docs/ce-pro/rcp-user-guide.md',      title:'Radar Prediction',               product:'CE Pro', category:'Calculations', order:14, anchor:'96-radar-prediction' },
  { id:'ce-pro-visibility-prediction',  path:'docs/ce-pro/rcp-user-guide.md', title:'Visibility Prediction',          product:'CE Pro', category:'Calculations', order:15, anchor:'97-visibility-prediction' },
  { id:'ce-pro-compare-predictions',    path:'docs/ce-pro/rcp-user-guide.md',   title:'Compare Predictions',            product:'CE Pro', category:'Calculations', order:16, anchor:'98-compare-predictions' },
  { id:'ce-pro-emf-calculation',        path:'docs/ce-pro/emf-user-guide.md',       title:'EMF Calculation',                product:'CE Pro', category:'Calculations', order:17 },
  { id:'ce-pro-indoor-coverage',        path:'docs/ce-pro/indoor-user-guide.md',       title:'Indoor Coverage Prediction',     product:'CE Pro', category:'Calculations', order:18 },
  { id:'ce-pro-sound-prediction',       path:'docs/ce-pro/sound-user-guide.md',      title:'Sound Level Prediction',         product:'CE Pro', category:'Calculations', order:19 },
  // CE Pro — User Guides
  { id:'ce-pro-rcp-guide',              path:'docs/ce-pro/rcp-user-guide.md',              title:'RCP User Guide',                              product:'CE Pro',     category:'User Guides',        order:20 },
  { id:'ce-pro-rlp-guide',              path:'docs/ce-pro/rlp-user-guide.md',              title:'RLP User Guide',                              product:'CE Pro',     category:'User Guides',        order:21 },
  { id:'ce-pro-emf-guide',              path:'docs/ce-pro/emf-user-guide.md',              title:'EMF User Guide',                              product:'CE Pro',     category:'User Guides',        order:22 },
  { id:'ce-pro-indoor-guide',           path:'docs/ce-pro/indoor-user-guide.md',           title:'Indoor User Guide',                           product:'CE Pro',     category:'User Guides',        order:23 },
  { id:'ce-pro-sound-guide',            path:'docs/ce-pro/sound-user-guide.md',            title:'Sound User Guide',                            product:'CE Pro',     category:'User Guides',        order:24 },
  // Geodata
  // NOTE: 01-04 curated files were deleted; repointed at the surviving raw geodata manuals
  // (which contain the DTM/clutter sections directly, just not split into separate files).
  { id:'geodata-requirements',          path:'docs/geodata/geodata-requirements.md',               title:'Geodata Requirements Overview',               product:'Both',       category:'Geodata',           order:1  },
  { id:'geodata-dem',                   path:'docs/geodata/geodata-requirements.md',                    title:'Digital Terrain Model (DEM/DTM)',             product:'Both',       category:'Geodata',           order:2, anchor:'21-digital-terrain-model-dtm-grid-mandatory' },
  { id:'geodata-clutter',               path:'docs/geodata/geodata-requirements.md',                title:'Clutter Classes & Heights',                   product:'Both',       category:'Geodata',           order:3, anchor:'22-clutter-classes-grid-optional' },
  { id:'network-object-requirements',   path:'docs/geodata/network-objects-requirements.md',        title:'Network Object Requirements',                 product:'Both',       category:'Geodata',           order:4  },
  // Training
  // NOTE: the curated duplicates under docs/training/ were deleted; repointed at the
  // surviving originals under docs/ce-express/training/ (same content, different path).
  { id:'training-ce-express-workspace', path:'docs/ce-express/training/01-creating-workspace.md',  title:'Training 01: Creating a Workspace',           product:'Training',   category:'Training',          order:1  },
  { id:'training-rf-prediction',        path:'docs/ce-express/training/04-rf-prediction.md',         title:'Training 04: RF Prediction',                  product:'Training',   category:'Training',          order:4  },
];

// Navigation structure for the sidebar
export const NAV = {
  'CE Express': {
    'Getting Started':    DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Getting Started'),
    'Interface':          DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Interface'),
    'Network Objects':    DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Network Objects'),
    'Tools':              DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Tools'),
    'Calculations':       DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Calculations'),
    'Network Management': DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Network Management'),
  },
  'CE Desktop Pro': {
    'Getting Started': DOC_INDEX.filter(d => d.product==='CE Pro' && d.category==='Getting Started'),
    'Calculations':    DOC_INDEX.filter(d => d.product==='CE Pro' && d.category==='Calculations'),
    'User Guides':     DOC_INDEX.filter(d => d.product==='CE Pro' && d.category==='User Guides'),
  },
  'Geodata & Data': {
    'Geodata': DOC_INDEX.filter(d => d.product==='Both'),
  },
  'Training': {
    'Training Modules': DOC_INDEX.filter(d => d.product==='Training'),
  },
};

// Cache so we don't re-fetch the same file every time
const cache = {};

// Resolve a relative path (e.g. "../../assets/images/foo.png") against the
// directory of a doc's own path (e.g. "docs/ce-express/user-guide/x.md"),
// the same way a browser would resolve a relative URL.
function resolveRelativePath(basePath, relPath) {
  const baseDir = basePath.split('/').slice(0, -1);
  const result = [...baseDir];
  for (const part of relPath.split('/')) {
    if (part === '..') result.pop();
    else if (part === '.' || part === '') continue;
    else result.push(part);
  }
  return result.join('/');
}

// Markdown image sources are written relative to each doc's own file (as they
// were laid out in the GitHub repo). The browser has no notion of that folder
// structure, so relative paths like ../../assets/images/x.png resolve against
// the *page* URL and silently 404. Rewrite them to absolute GitHub raw URLs.
function resolveImagePaths(content, docPath) {
  return content.replace(/(!\[[^\]]*\]\()([^)]+)(\))/g, (match, pre, src, post) => {
    if (/^([a-z]+:)?\/\//i.test(src)) return match; // already absolute
    const resolved = resolveRelativePath(docPath, src);
    return `${pre}${GITHUB_RAW}/${resolved}${post}`;
  });
}

/**
 * Fetch a single markdown file from GitHub raw content
 * Falls back to a friendly error message if the file doesn't exist yet
 */
export async function fetchDoc(docId) {
  const entry = DOC_INDEX.find(d => d.id === docId);
  if (!entry) return null;

  if (cache[docId]) return cache[docId];

  try {
    const url = `${GITHUB_RAW}/${entry.path}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.text();

    // Strip frontmatter (--- ... ---)
    let content = raw;
    if (raw.startsWith('---')) {
      const parts = raw.split('---');
      if (parts.length >= 3) content = parts.slice(2).join('---').trim();
    }

    content = resolveImagePaths(content, entry.path);

    const doc = { ...entry, content };
    cache[docId] = doc;
    return doc;
  } catch (err) {
    console.error('Failed to fetch doc:', docId, err);
    return {
      ...entry,
      content: `# ${entry.title}\n\n> ⚠️ **This page is not yet available.**\n>\n> The file \`${entry.path}\` has not been uploaded to GitHub yet.\n>\n> **To fix this:** Upload the \`${entry.path}\` file to:\n> [github.com/elchinguliev/CellularExpertDocs](https://github.com/elchinguliev/CellularExpertDocs)\n\n---\n\nFor assistance, contact [support@cellular-expert.com](mailto:support@cellular-expert.com)`,
    };
  }
}

/**
 * Search across all docs — fetches content on demand
 * For performance, searches title/category first without fetching content
 */
export function searchIndex(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const words = q.split(/\s+/).filter(w => w.length > 1);
  return DOC_INDEX
    .map(doc => {
      let score = 0;
      words.forEach(w => {
        if (doc.title.toLowerCase().includes(w))    score += 8;
        if (doc.category.toLowerCase().includes(w)) score += 4;
        if (doc.product.toLowerCase().includes(w))  score += 2;
        // Also search cached content if available
        if (cache[doc.id]?.content?.toLowerCase().includes(w)) score += 1;
      });
      return { ...doc, score };
    })
    .filter(d => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

export { GITHUB_RAW, GITHUB_API };
