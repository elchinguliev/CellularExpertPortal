const GITHUB_RAW = 'https://raw.githubusercontent.com/elchinguliev/CellularExpertDocs/main';

export const DOC_INDEX = [
  // ── CE Express — Getting Started ────────────────────────────────────────────
  { id:'ce-express-overview',         path:'docs/ce-express/overview.md',                       title:'Overview',                        product:'CE Express', category:'Getting Started', order:1  },
  { id:'ce-express-login',            path:'docs/ce-express/login.md',                          title:'Logging In',                      product:'CE Express', category:'Getting Started', order:2  },
  { id:'ce-express-workspace',        path:'docs/ce-express/workspace.md',                      title:'Workspaces',                      product:'CE Express', category:'Getting Started', order:3  },
  { id:'ce-express-geodata',          path:'docs/ce-express/geodata.md',                        title:'Geodata & Rasters',               product:'CE Express', category:'Getting Started', order:4  },

  // ── CE Express — Network Objects ────────────────────────────────────────────
  { id:'ce-express-network-objects',  path:'docs/ce-express/network-objects.md',                title:'Network Objects',                 product:'CE Express', category:'Network Objects', order:5  },
  { id:'ce-express-antenna',          path:'docs/ce-express/antenna-patterns.md',               title:'Antenna Patterns',                product:'CE Express', category:'Network Objects', order:6  },

  // ── CE Express — Calculations ───────────────────────────────────────────────
  { id:'ce-express-rf-prediction',    path:'docs/ce-express/rf-prediction.md',                  title:'RF Prediction',                   product:'CE Express', category:'Calculations',    order:7  },
  { id:'ce-express-profile',          path:'docs/ce-express/profile-tool.md',                   title:'Path Profile & LoS',              product:'CE Express', category:'Calculations',    order:8  },
  { id:'ce-express-street-view',      path:'docs/ce-express/street-view.md',                    title:'Street View',                     product:'CE Express', category:'Calculations',    order:9  },

  // ── CE Express — Reference (numbered, hyperlinkli) ──────────────────────────

  // ── CE Express — Administration ─────────────────────────────────────────────

  // ── CE Express — User Guides ────────────────────────────────────────────────
  { id:'ce-express-user-guide',       path:'docs/ce-express/user-guide/user-guide-v7.3.md',     title:'User Guide v7.3',                 product:'CE Express', category:'User Guides',     order:30 },
  { id:'ce-express-admin-guide',      path:'docs/ce-express/user-guide/admin-guide-v7.2.md',    title:'Administrator Guide v7.2',        product:'CE Express', category:'User Guides',     order:31 },

  // ── CE Express — Training ───────────────────────────────────────────────────
  { id:'ce-express-tr-workspace',     path:'docs/ce-express/training/01-creating-workspace.md', title:'01 — Creating Workspace',         product:'CE Express', category:'Training',        order:40 },
  { id:'ce-express-tr-objects',       path:'docs/ce-express/training/02-create-objects.md',     title:'02 — Create Objects',             product:'CE Express', category:'Training',        order:41 },
  { id:'ce-express-tr-los',           path:'docs/ce-express/training/03-line-of-sight.md',      title:'03 — Line of Sight',              product:'CE Express', category:'Training',        order:42 },
  { id:'ce-express-tr-rf',            path:'docs/ce-express/training/04-rf-prediction.md',      title:'04 — RF Prediction',              product:'CE Express', category:'Training',        order:43 },
  { id:'ce-express-tr-import',        path:'docs/ce-express/training/05-import-data.md',        title:'05 — Import Data',                product:'CE Express', category:'Training',        order:44 },
  { id:'ce-express-tr-models',        path:'docs/ce-express/training/06-prediction-models.md',  title:'06 — Prediction Models',          product:'CE Express', category:'Training',        order:45 },
  { id:'ce-express-tr-mw-eq',         path:'docs/ce-express/training/07-mw-equipment.md',       title:'07 — MW Equipment',               product:'CE Express', category:'Training',        order:46 },
  { id:'ce-express-tr-mw-pred',       path:'docs/ce-express/training/08-mw-prediction.md',      title:'08 — MW Prediction',              product:'CE Express', category:'Training',        order:47 },
  { id:'ce-express-tr-geodata',       path:'docs/ce-express/training/09-preparing-geodata.md',  title:'09 — Preparing Geodata',          product:'CE Express', category:'Training',        order:48 },

  // ── CE Pro — User Guides ────────────────────────────────────────────────────
  { id:'ce-pro-rcp',                  path:'docs/ce-pro/rcp-user-guide.md',                     title:'RCP — Radio Coverage Planning',   product:'CE Pro',     category:'User Guides',     order:1  },
  { id:'ce-pro-rlp',                  path:'docs/ce-pro/rlp-user-guide.md',                     title:'RLP — Radio Link Planning',       product:'CE Pro',     category:'User Guides',     order:2  },
  { id:'ce-pro-indoor',               path:'docs/ce-pro/indoor-user-guide.md',                  title:'Indoor Planning',                 product:'CE Pro',     category:'User Guides',     order:3  },
  { id:'ce-pro-sound',                path:'docs/ce-pro/sound-user-guide.md',                   title:'Sound Propagation',               product:'CE Pro',     category:'User Guides',     order:4  },
  { id:'ce-pro-emf',                  path:'docs/ce-pro/emf-user-guide.md',                     title:'EMF Analysis',                    product:'CE Pro',     category:'User Guides',     order:5  },

  // ── CE Pro — Training ───────────────────────────────────────────────────────
  { id:'ce-pro-tr-install',           path:'docs/ce-pro/training/00-installation.md',           title:'00 — Installation',               product:'CE Pro',     category:'Training',        order:10 },
  { id:'ce-pro-tr-data',              path:'docs/ce-pro/training/01-data-types.md',             title:'01 — Data Types',                 product:'CE Pro',     category:'Training',        order:11 },
  { id:'ce-pro-tr-arch',              path:'docs/ce-pro/training/02-architecture.md',           title:'02 — Architecture',               product:'CE Pro',     category:'Training',        order:12 },
  { id:'ce-pro-tr-agenda',            path:'docs/ce-pro/training/03-agenda.md',                 title:'03 — Agenda',                     product:'CE Pro',     category:'Training',        order:13 },
  { id:'ce-pro-tr-workspace',         path:'docs/ce-pro/training/04-workspace.md',              title:'04 — Workspace',                  product:'CE Pro',     category:'Training',        order:14 },
  { id:'ce-pro-tr-los',               path:'docs/ce-pro/training/05-line-of-sight.md',          title:'05 — Line of Sight',              product:'CE Pro',     category:'Training',        order:15 },
  { id:'ce-pro-tr-objects',           path:'docs/ce-pro/training/06-objects.md',                title:'06 — Objects',                    product:'CE Pro',     category:'Training',        order:16 },
  { id:'ce-pro-tr-cell-pred',         path:'docs/ce-pro/training/07-cell-prediction.md',        title:'07 — Cell Prediction',            product:'CE Pro',     category:'Training',        order:17 },
  { id:'ce-pro-tr-models',            path:'docs/ce-pro/training/08-prediction-models.md',      title:'08 — Prediction Models',          product:'CE Pro',     category:'Training',        order:18 },
  { id:'ce-pro-tr-import',            path:'docs/ce-pro/training/09-importing-data.md',         title:'09 — Importing Data',             product:'CE Pro',     category:'Training',        order:19 },
  { id:'ce-pro-tr-rl',                path:'docs/ce-pro/training/10-rl-prediction.md',          title:'10 — RL Prediction',              product:'CE Pro',     category:'Training',        order:20 },

  // ── Geodata ─────────────────────────────────────────────────────────────────
  { id:'geodata-requirements',        path:'docs/geodata/geodata-requirements.md',              title:'Geodata Requirements',            product:'Both',       category:'Geodata',         order:1  },
  { id:'geodata-network-objects',     path:'docs/geodata/network-objects-requirements.md',      title:'Network Object Requirements',     product:'Both',       category:'Geodata',         order:2  },

  // ── Inventory3D ─────────────────────────────────────────────────────────────
  { id:'inventory3d-user-guide',      path:'docs/inventory3d/user-guide.md',                    title:'Inventory3D User Guide v4.6',     product:'Inventory3D',category:'User Guides',     order:1  },
];

export const NAV = {
  'CE Express': {
    'Getting Started': DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Getting Started'),
    'Network Objects': DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Network Objects'),
    'Calculations':    DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Calculations'),
    'User Guides':     DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='User Guides'),
    'Training':        DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Training'),
  },
  'CE Desktop Pro': {
    'User Guides': DOC_INDEX.filter(d => d.product==='CE Pro' && d.category==='User Guides'),
    'Training':    DOC_INDEX.filter(d => d.product==='CE Pro' && d.category==='Training'),
  },
  'Geodata & Data': {
    'Geodata': DOC_INDEX.filter(d => d.product==='Both'),
  },
  'Inventory3D': {
    'User Guides': DOC_INDEX.filter(d => d.product==='Inventory3D'),
  },
};

const cache = {};
let preloadStarted = false;

// Preload all docs in the background so full-text search works everywhere
export function preloadAllDocs() {
  if (preloadStarted) return;
  preloadStarted = true;
  // Stagger requests slightly to avoid hammering GitHub at once
  DOC_INDEX.forEach((entry, i) => {
    setTimeout(() => { fetchDoc(entry.id).catch(() => {}); }, i * 60);
  });
}

export async function fetchDoc(docId) {
  const entry = DOC_INDEX.find(d => d.id === docId);
  if (!entry) return null;
  if (cache[docId]) return cache[docId];
  try {
    const res = await fetch(`${GITHUB_RAW}/${entry.path}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let content = await res.text();
    if (content.startsWith('---')) {
      const parts = content.split('---');
      if (parts.length >= 3) content = parts.slice(2).join('---').trim();
    }
    const doc = { ...entry, content };
    cache[docId] = doc;
    return doc;
  } catch (err) {
    return {
      ...entry,
      content: `# ${entry.title}\n\n> ⚠️ **This page is not yet available on GitHub.**\n>\n> File: \`${entry.path}\`\n>\n> Upload it to [github.com/elchinguliev/CellularExpertDocs](https://github.com/elchinguliev/CellularExpertDocs)\n\n---\n\nFor help: [support@cellular-expert.com](mailto:support@cellular-expert.com)`,
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

// Synchronous search over title/category/product + whatever is cached so far.
// Call preloadAllDocs() once at app start so cache fills in the background —
// search quality improves automatically as more docs finish loading.
export function searchIndex(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const words = q.split(/\s+/).filter(w => w.length > 1);
  return DOC_INDEX
    .map(doc => {
      let score = 0;
      let snippet = '';
      const content = cache[doc.id]?.content || '';
      words.forEach(w => {
        if (doc.title.toLowerCase().includes(w))    score += 10;
        if (doc.category.toLowerCase().includes(w)) score += 4;
        if (doc.product.toLowerCase().includes(w))  score += 2;
        if (content) {
          const occurrences = content.toLowerCase().split(w.toLowerCase()).length - 1;
          if (occurrences > 0) {
            score += Math.min(occurrences, 5); // cap so one giant doc doesn't dominate
            if (!snippet) snippet = snippetAround(content, w);
          }
        }
      });
      return { ...doc, score, snippet };
    })
    .filter(d => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

export { GITHUB_RAW };
