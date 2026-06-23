// useGithubDocs.js
// Fetches documentation markdown files directly from GitHub repository
// When a .md file is edited on GitHub, the site automatically reflects the changes

const GITHUB_RAW = 'https://raw.githubusercontent.com/elchinguliev/CellularExpertDocs/main';
const GITHUB_API = 'https://api.github.com/repos/elchinguliev/CellularExpertDocs';

// All known docs — structure matches the docs/ folder in GitHub
// To add a new doc: 1) add the .md file to GitHub  2) add its entry here
export const DOC_INDEX = [
  // CE Express — Getting Started
  { id:'ce-express-introduction',       path:'docs/ce-express/01-introduction.md',       title:'Introduction to CE Express',                  product:'CE Express', category:'Getting Started',   order:1  },
  { id:'ce-express-login',              path:'docs/ce-express/02-login.md',               title:'Logging In',                                  product:'CE Express', category:'Getting Started',   order:2  },
  { id:'ce-express-map-view',           path:'docs/ce-express/03-map-view.md',            title:'Map View Overview',                           product:'CE Express', category:'Interface',         order:3  },
  { id:'ce-express-workspace',          path:'docs/ce-express/04-workspace.md',           title:'Workspaces',                                  product:'CE Express', category:'Getting Started',   order:4  },
  // CE Express — Network Objects
  { id:'ce-express-features',           path:'docs/ce-express/05-features.md',            title:'Features — Network Objects',                  product:'CE Express', category:'Network Objects',   order:5  },
  // CE Express — Calculations
  { id:'ce-express-rf-prediction',      path:'docs/ce-express/06-rf-prediction.md',       title:'RF Prediction',                               product:'CE Express', category:'Calculations',      order:6  },
  { id:'ce-express-prediction-models',  path:'docs/ce-express/07-prediction-models.md',   title:'Prediction Models',                           product:'CE Express', category:'Calculations',      order:7  },
  { id:'ce-express-profile',            path:'docs/ce-express/08-profile-los.md',         title:'Line of Sight & Profile',                     product:'CE Express', category:'Calculations',      order:8  },
  { id:'ce-express-radio-link',         path:'docs/ce-express/09-radio-link.md',          title:'Radio Link (Microwave)',                       product:'CE Express', category:'Calculations',      order:9  },
  // CE Express — Network Management
  { id:'ce-express-networks',           path:'docs/ce-express/10-networks.md',            title:'Networks — Batch Prediction',                 product:'CE Express', category:'Network Management', order:10 },
  // CE Express — Administration
  { id:'ce-express-admin-requirements', path:'docs/ce-express/admin-01-requirements.md',  title:'System Requirements',                         product:'CE Express', category:'Administration',    order:20 },
  { id:'ce-express-admin-installation', path:'docs/ce-express/admin-02-installation.md',  title:'Installation Guide',                          product:'CE Express', category:'Administration',    order:21 },
  { id:'ce-express-admin-user-management', path:'docs/ce-express/admin-03-user-management.md', title:'User Management',                        product:'CE Express', category:'Administration',    order:22 },
  // CE Pro
  { id:'ce-pro-introduction',           path:'docs/ce-pro/01-introduction.md',            title:'Introduction to CE Desktop Pro',              product:'CE Pro',     category:'Getting Started',   order:1  },
  { id:'ce-pro-installation',           path:'docs/ce-pro/02-installation.md',            title:'Installation & Activation',                   product:'CE Pro',     category:'Getting Started',   order:2  },
  { id:'ce-pro-workspace',              path:'docs/ce-pro/03-workspace.md',               title:'Creating Workspaces',                         product:'CE Pro',     category:'Getting Started',   order:3  },
  // Geodata
  { id:'geodata-requirements',          path:'docs/geodata/01-overview.md',               title:'Geodata Requirements Overview',               product:'Both',       category:'Geodata',           order:1  },
  { id:'geodata-dem',                   path:'docs/geodata/02-dem.md',                    title:'Digital Terrain Model (DEM/DTM)',             product:'Both',       category:'Geodata',           order:2  },
  { id:'geodata-clutter',               path:'docs/geodata/03-clutter.md',                title:'Clutter Classes & Heights',                   product:'Both',       category:'Geodata',           order:3  },
  { id:'network-object-requirements',   path:'docs/geodata/04-network-objects.md',        title:'Network Object Requirements',                 product:'Both',       category:'Geodata',           order:4  },
  // Training
  { id:'training-ce-express-workspace', path:'docs/training/01-ce-express-workspace.md',  title:'Training 01: Creating a Workspace',           product:'Training',   category:'Training',          order:1  },
  { id:'training-rf-prediction',        path:'docs/training/04-rf-prediction.md',         title:'Training 04: RF Prediction',                  product:'Training',   category:'Training',          order:4  },
];

// Navigation structure for the sidebar
export const NAV = {
  'CE Express': {
    'Getting Started':    DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Getting Started'),
    'Interface':          DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Interface'),
    'Network Objects':    DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Network Objects'),
    'Calculations':       DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Calculations'),
    'Network Management': DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Network Management'),
    'Administration':     DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Administration'),
  },
  'CE Desktop Pro': {
    'Getting Started': DOC_INDEX.filter(d => d.product==='CE Pro'),
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
