const API_BASE = 'http://localhost:4000/api';
const SERVER_BASE = 'http://localhost:4000'; // used for /downloads/... static PDF files

export const DOC_INDEX = [
  // ── CE Express — Getting Started ────────────────────────────────────────────
  { id:'ce-express-overview',         path:'docs/ce-express/overview.md',                       title:'Overview',                        product:'CE Express', category:'Getting Started', order:1  },
  { id:'ce-express-login',            path:'docs/ce-express/login.md',                          title:'Logging In',                      product:'CE Express', category:'Getting Started', order:2  },
  { id:'ce-express-workspace',        path:'docs/ce-express/workspace.md',                      title:'Workspaces',                      product:'CE Express', category:'Getting Started', order:3  },
  { id:'ce-express-geodata',          path:'docs/ce-express/geodata.md',                        title:'Geodata & Rasters',               product:'CE Express', category:'Getting Started', order:4  },
  { id:'ce-express-network-objects',  path:'docs/ce-express/network-objects.md',                title:'Network Objects',                 product:'CE Express', category:'Network Objects', order:5  },
  { id:'ce-express-antenna',          path:'docs/ce-express/antenna-patterns.md',               title:'Antenna Patterns',                product:'CE Express', category:'Network Objects', order:6  },
  { id:'ce-express-rf-prediction',    path:'docs/ce-express/rf-prediction.md',                  title:'RF Prediction',                   product:'CE Express', category:'Calculations',    order:7  },
  { id:'ce-express-profile',          path:'docs/ce-express/profile-tool.md',                   title:'Path Profile & LoS',              product:'CE Express', category:'Calculations',    order:8  },
  { id:'ce-express-street-view',      path:'docs/ce-express/street-view.md',                    title:'Street View',                     product:'CE Express', category:'Calculations',    order:9  },
  { id:'ce-express-introduction',     path:'docs/ce-express/01-introduction.md',                title:'Introduction (Detailed)',          product:'CE Express', category:'Reference',       order:10 },
  { id:'ce-express-map-view',         path:'docs/ce-express/03-map-view.md',                    title:'Map View',                        product:'CE Express', category:'Reference',       order:11 },
  { id:'ce-express-features',         path:'docs/ce-express/05-features.md',                    title:'Features Tool',                   product:'CE Express', category:'Reference',       order:12 },
  { id:'ce-express-prediction-models',path:'docs/ce-express/07-prediction-models.md',           title:'Prediction Models',               product:'CE Express', category:'Reference',       order:13 },
  { id:'ce-express-radio-link',       path:'docs/ce-express/09-radio-link.md',                  title:'Radio Link (Microwave)',           product:'CE Express', category:'Reference',       order:14 },
  { id:'ce-express-networks',         path:'docs/ce-express/10-networks.md',                    title:'Networks — Batch Prediction',     product:'CE Express', category:'Reference',       order:15 },
  { id:'ce-express-layers',               path:'docs/ce-express/11-layers.md',               title:'Layers',                product:'CE Express', category:'Reference', order:16 },
  { id:'ce-express-prediction-history',   path:'docs/ce-express/12-prediction-history.md',   title:'Prediction History',    product:'CE Express', category:'Reference', order:17 },
  { id:'ce-express-antennas',             path:'docs/ce-express/13-antennas.md',              title:'Antennas',              product:'CE Express', category:'Reference', order:18 },
  { id:'ce-express-feature-templates',    path:'docs/ce-express/14-feature-templates.md',    title:'Feature Templates',     product:'CE Express', category:'Reference', order:19 },
  { id:'ce-express-visibility-prediction',path:'docs/ce-express/15-visibility-prediction.md',title:'Visibility Prediction', product:'CE Express', category:'Reference', order:20 },
  { id:'ce-express-radar-prediction',     path:'docs/ce-express/16-radar-prediction.md',     title:'Radar Prediction',      product:'CE Express', category:'Reference', order:21 },
  { id:'ce-express-model-tuning',         path:'docs/ce-express/17-model-tuning.md',         title:'Model Tuning',          product:'CE Express', category:'Reference', order:22 },
  { id:'ce-express-radios',               path:'docs/ce-express/18-radios.md',               title:'Radios',                product:'CE Express', category:'Reference', order:23 },
  { id:'ce-express-admin-requirements',path:'docs/ce-express/admin-01-requirements.md',         title:'System Requirements',             product:'CE Express', category:'Administration',  order:20 },
  { id:'ce-express-admin-installation',path:'docs/ce-express/admin-02-installation.md',         title:'Installation Guide',              product:'CE Express', category:'Administration',  order:21 },
  { id:'ce-express-admin-users',      path:'docs/ce-express/admin-03-user-management.md',       title:'User Management',                 product:'CE Express', category:'Administration',  order:22 },
  { id:'ce-express-user-guide',       path:'docs/ce-express/user-guide/user-guide-v7.3.md',     title:'User Guide v7.3',                 product:'CE Express', category:'User Guides',     order:30 },
  { id:'ce-express-admin-guide',      path:'docs/ce-express/user-guide/admin-guide-v7.2.md',    title:'Administrator Guide v7.2',        product:'CE Express', category:'User Guides',     order:31 },
  { id:'ce-express-tr-workspace',     path:'docs/ce-express/training/01-creating-workspace.md', title:'01 — Creating Workspace',         product:'CE Express', category:'Training',        order:40 },
  { id:'ce-express-tr-objects',       path:'docs/ce-express/training/02-create-objects.md',     title:'02 — Create Objects',             product:'CE Express', category:'Training',        order:41 },
  { id:'ce-express-tr-los',           path:'docs/ce-express/training/03-line-of-sight.md',      title:'03 — Line of Sight',              product:'CE Express', category:'Training',        order:42 },
  { id:'ce-express-tr-rf',            path:'docs/ce-express/training/04-rf-prediction.md',      title:'04 — RF Prediction',              product:'CE Express', category:'Training',        order:43 },
  { id:'ce-express-tr-import',        path:'docs/ce-express/training/05-import-data.md',        title:'05 — Import Data',                product:'CE Express', category:'Training',        order:44 },
  { id:'ce-express-tr-models',        path:'docs/ce-express/training/06-prediction-models.md',  title:'06 — Prediction Models',          product:'CE Express', category:'Training',        order:45 },
  { id:'ce-express-tr-mw-eq',         path:'docs/ce-express/training/07-mw-equipment.md',       title:'07 — MW Equipment',               product:'CE Express', category:'Training',        order:46 },
  { id:'ce-express-tr-mw-pred',       path:'docs/ce-express/training/08-mw-prediction.md',      title:'08 — MW Prediction',              product:'CE Express', category:'Training',        order:47 },
  { id:'ce-express-tr-geodata',       path:'docs/ce-express/training/09-preparing-geodata.md',  title:'09 — Preparing Geodata',          product:'CE Express', category:'Training',        order:48 },
  { id:'ce-pro-rcp',                  path:'docs/ce-pro/rcp-user-guide.md',                     title:'RCP — Radio Coverage Planning',   product:'CE Pro',     category:'User Guides',     order:1  },
  { id:'ce-pro-rlp',                  path:'docs/ce-pro/rlp-user-guide.md',                     title:'RLP — Radio Link Planning',       product:'CE Pro',     category:'User Guides',     order:2  },
  { id:'ce-pro-indoor',               path:'docs/ce-pro/indoor-user-guide.md',                  title:'Indoor Planning',                 product:'CE Pro',     category:'User Guides',     order:3  },
  { id:'ce-pro-sound',                path:'docs/ce-pro/sound-user-guide.md',                   title:'Sound Propagation',               product:'CE Pro',     category:'User Guides',     order:4  },
  { id:'ce-pro-emf',                  path:'docs/ce-pro/emf-user-guide.md',                     title:'EMF Analysis',                    product:'CE Pro',     category:'User Guides',     order:5  },
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
  { id:'ce-pro-tr-fwa',        path:'docs/ce-pro/training/12-fwa-prediction.md',        title:'11 — FWA RF Prediction',         product:'CE Pro', category:'Training', order:21 },
  { id:'ce-pro-tr-quick',      path:'docs/ce-pro/training/13-quick-prediction.md',      title:'12 — Quick Prediction',          product:'CE Pro', category:'Training', order:22 },
  { id:'ce-pro-tr-radar',      path:'docs/ce-pro/training/14-radar-prediction.md',      title:'13 — Radar Prediction',          product:'CE Pro', category:'Training', order:23 },
  { id:'ce-pro-tr-visibility', path:'docs/ce-pro/training/15-visibility-prediction.md', title:'14 — Visibility Prediction',     product:'CE Pro', category:'Training', order:24 },
  { id:'ce-pro-tr-compare',    path:'docs/ce-pro/training/16-compare-predictions.md',   title:'15 — Compare Predictions',       product:'CE Pro', category:'Training', order:25 },
  { id:'ce-pro-tr-emf-calc',   path:'docs/ce-pro/training/17-emf-calculation.md',       title:'16 — EMF Calculation',           product:'CE Pro', category:'Training', order:26 },
  { id:'ce-pro-tr-indoor-cov', path:'docs/ce-pro/training/18-indoor-coverage.md',       title:'17 — Indoor Coverage Prediction', product:'CE Pro', category:'Training', order:27 },
  { id:'ce-pro-tr-sound-pred', path:'docs/ce-pro/training/19-sound-prediction.md',      title:'18 — Sound Level Prediction',     product:'CE Pro', category:'Training', order:28 },
  { id:'geodata-requirements',        path:'docs/geodata/geodata-requirements.md',              title:'Geodata Requirements',            product:'Both',       category:'Geodata',         order:1  },
  { id:'geodata-network-objects',     path:'docs/geodata/network-objects-requirements.md',      title:'Network Object Requirements',     product:'Both',       category:'Geodata',         order:2  },
  { id:'inventory3d-user-guide',      path:'docs/inventory3d/user-guide.md',                    title:'Inventory3D User Guide v4.6',     product:'Inventory3D',category:'User Guides',     order:1  },
];

export const NAV = {
  'CE Express': {
    'Getting Started': DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Getting Started'),
    'Network Objects': DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Network Objects'),
    'Calculations':    DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Calculations'),
    'Reference':       DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Reference'),
    'Administration':  DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Administration'),
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

export function preloadAllDocs() {
  if (preloadStarted) return;
  preloadStarted = true;
  DOC_INDEX.forEach((entry, i) => {
    setTimeout(() => { fetchDoc(entry.id).catch(() => {}); }, i * 60);
  });
}

export async function fetchDoc(docId) {
  const entry = DOC_INDEX.find(d => d.id === docId);
  if (!entry) return null;
  if (cache[docId]) return cache[docId];
  try {
    const res = await fetch(`${API_BASE}/docs/${docId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
   const doc = {
      ...entry,
      content: data.content,
      images: data.images || [],
      headings: data.headings || [],
      tags: data.tags || [],
      pdf_path: data.pdf_path,
    };
    cache[docId] = doc;
    return doc;
  } catch (err) {
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
            score += Math.min(occurrences, 5);
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

export { API_BASE, SERVER_BASE };