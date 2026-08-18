const API_BASE = 'http://localhost:4000/api';
const SERVER_BASE = 'http://localhost:4000'; // used for /downloads/... static PDF files

export const DOC_INDEX = [
  { id:'ce-express-admin-guide', path:'docs/ce-express/user-guide/admin-guide-v7.2.md', title:'Administrator Guide', product:'CE Express', category:'Administrator Guide', order:1000 },
  { id:'ce-express-tr-workspace', path:'docs/ce-express/training/01-creating-workspace.md', title:'— Creating Workspace', product:'CE Express', category:'Training', order:900 },
  { id:'ce-express-tr-objects', path:'docs/ce-express/training/02-create-objects.md', title:'— Create Objects', product:'CE Express', category:'Training', order:901 },
  { id:'ce-express-tr-los', path:'docs/ce-express/training/03-line-of-sight.md', title:'— Line of Sight', product:'CE Express', category:'Training', order:902 },
  { id:'ce-express-tr-rf', path:'docs/ce-express/training/04-rf-prediction.md', title:'— RF Prediction', product:'CE Express', category:'Training', order:903 },
  { id:'ce-express-tr-import', path:'docs/ce-express/training/05-import-data.md', title:'— Import Data', product:'CE Express', category:'Training', order:904 },
  { id:'ce-express-tr-models', path:'docs/ce-express/training/06-prediction-models.md', title:'— Prediction Models', product:'CE Express', category:'Training', order:905 },
  { id:'ce-express-tr-mw-eq', path:'docs/ce-express/training/07-mw-equipment.md', title:'— MW Equipment', product:'CE Express', category:'Training', order:906 },
  { id:'ce-express-tr-mw-pred', path:'docs/ce-express/training/08-mw-prediction.md', title:'— MW Prediction', product:'CE Express', category:'Training', order:907 },
  { id:'ce-express-tr-geodata', path:'docs/ce-express/training/09-preparing-geodata.md', title:'— Preparing Geodata', product:'CE Express', category:'Training', order:908 },
  { id:'ce-pro-tr-install', path:'docs/ce-pro/training/pdf/0-installation.md', title:'— Installation', product:'CE Pro', category:'Training', order:1100 },
  { id:'ce-pro-tr-data', path:'docs/ce-pro/training/pdf/00-data-types.md', title:'— Data Types', product:'CE Pro', category:'Training', order:1101 },
  { id:'ce-pro-tr-arch', path:'docs/ce-pro/training/pdf/000-architecture.md', title:'— Architecture', product:'CE Pro', category:'Training', order:1102 },
  { id:'ce-pro-tr-agenda', path:'docs/ce-pro/training/pdf/0000-agenda.md', title:'— Agenda', product:'CE Pro', category:'Training', order:1103 },
  { id:'ce-pro-tr-workspace', path:'docs/ce-pro/training/doc/01-workspace.md', title:'— Workspace', product:'CE Pro', category:'Training', order:1104 },
  { id:'ce-pro-tr-los', path:'docs/ce-pro/training/doc/02-line-of-sight.md', title:'— Line of Sight', product:'CE Pro', category:'Training', order:1105 },
  { id:'ce-pro-tr-objects', path:'docs/ce-pro/training/doc/03-objects.md', title:'— Objects', product:'CE Pro', category:'Training', order:1106 },
  { id:'ce-pro-tr-cell-pred', path:'docs/ce-pro/training/doc/04-cell-prediction.md', title:'— Cell Prediction', product:'CE Pro', category:'Training', order:1107 },
  { id:'ce-pro-tr-models', path:'docs/ce-pro/training/doc/05-prediction-models.md', title:'— Prediction Models', product:'CE Pro', category:'Training', order:1108 },
  { id:'ce-pro-tr-import', path:'docs/ce-pro/training/doc/06-importing-data.md', title:'— Importing Data', product:'CE Pro', category:'Training', order:1109 },
  { id:'ce-pro-tr-rl', path:'docs/ce-pro/training/doc/07-rl-prediction.md', title:'— RL Prediction', product:'CE Pro', category:'Training', order:1110 },
  { id:'geodata-requirements', path:'docs/geodata/geodata-requirements.md', title:'Geodata Requirements', product:'Both', category:'Geodata Requirements', order:100 },
  { id:'geodata-network-objects', path:'docs/geodata/network-objects-requirements.md', title:'Network Object Requirements', product:'Both', category:'Network Object Requirements', order:200 },
  { id:'inventory3d-user-guide', path:'docs/inventory3d/user-guide.md', title:'Inventory3D User Guide v4.6', product:'Inventory3D', category:'User Guides', order:1 },
  { id:'ce-express-v73-3-1-1-workspaces', path:'docs/ce-express/user-guide/v73-sections/3-1-1-workspaces.md', title:'Workspaces', product:'CE Express', category:'Express Tools', order:301 },
  { id:'ce-express-v73-3-1-2-features', path:'docs/ce-express/user-guide/v73-sections/3-1-2-features.md', title:'Features', product:'CE Express', category:'Express Tools', order:302 },
  { id:'ce-express-v73-3-1-3-networks', path:'docs/ce-express/user-guide/v73-sections/3-1-3-networks.md', title:'Networks', product:'CE Express', category:'Express Tools', order:303 },
  { id:'ce-express-v73-3-1-4-layers', path:'docs/ce-express/user-guide/v73-sections/3-1-4-layers.md', title:'Layers', product:'CE Express', category:'Express Tools', order:304 },
  { id:'ce-express-v73-3-1-5-prediction-history', path:'docs/ce-express/user-guide/v73-sections/3-1-5-prediction-history.md', title:'Prediction history', product:'CE Express', category:'Express Tools', order:305 },
  { id:'ce-express-v73-3-1-6-antennas', path:'docs/ce-express/user-guide/v73-sections/3-1-6-antennas.md', title:'Antennas', product:'CE Express', category:'Express Tools', order:306 },
  { id:'ce-express-v73-3-1-7-geodata-sets', path:'docs/ce-express/user-guide/v73-sections/3-1-7-geodata-sets.md', title:'Geodata sets', product:'CE Express', category:'Express Tools', order:307 },
  { id:'ce-express-v73-3-1-8-feature-templates', path:'docs/ce-express/user-guide/v73-sections/3-1-8-feature-templates.md', title:'Feature templates', product:'CE Express', category:'Express Tools', order:308 },
  { id:'ce-express-v73-3-1-9-prediction-models', path:'docs/ce-express/user-guide/v73-sections/3-1-9-prediction-models.md', title:'Prediction models', product:'CE Express', category:'Express Tools', order:309 },
  { id:'ce-express-v73-3-1-10-settings', path:'docs/ce-express/user-guide/v73-sections/3-1-10-settings.md', title:'Settings', product:'CE Express', category:'Express Tools', order:310 },
  { id:'ce-express-v73-3-1-11-identify', path:'docs/ce-express/user-guide/v73-sections/3-1-11-identify.md', title:'Identify', product:'CE Express', category:'Express Tools', order:311 },
  { id:'ce-express-v73-3-1-12-measurement-tool', path:'docs/ce-express/user-guide/v73-sections/3-1-12-measurement-tool.md', title:'Measurement tool', product:'CE Express', category:'Express Tools', order:312 },
  { id:'ce-express-v73-3-1-13-network-statistics', path:'docs/ce-express/user-guide/v73-sections/3-1-13-network-statistics.md', title:'Network statistics', product:'CE Express', category:'Express Tools', order:313 },
  { id:'ce-express-v73-3-1-14-street-view', path:'docs/ce-express/user-guide/v73-sections/3-1-14-street-view.md', title:'Street view', product:'CE Express', category:'Express Tools', order:314 },
  { id:'ce-express-v73-3-1-15-feature-report', path:'docs/ce-express/user-guide/v73-sections/3-1-15-feature-report.md', title:'Feature report', product:'CE Express', category:'Express Tools', order:315 },
  { id:'ce-express-v73-3-1-16-profile', path:'docs/ce-express/user-guide/v73-sections/3-1-16-profile.md', title:'Profile', product:'CE Express', category:'Express Tools', order:316 },
  { id:'ce-express-v73-3-1-17-quick-rf-prediction', path:'docs/ce-express/user-guide/v73-sections/3-1-17-quick-rf-prediction.md', title:'Quick RF Prediction', product:'CE Express', category:'Express Tools', order:317 },
  { id:'ce-express-v73-3-1-18-rf-prediction', path:'docs/ce-express/user-guide/v73-sections/3-1-18-rf-prediction.md', title:'RF Prediction', product:'CE Express', category:'Express Tools', order:318 },
  { id:'ce-express-v73-3-1-19-3d-rf-prediction', path:'docs/ce-express/user-guide/v73-sections/3-1-19-3d-rf-prediction.md', title:'3D RF Prediction', product:'CE Express', category:'Express Tools', order:319 },
  { id:'ce-express-v73-3-1-20-visibility-prediction', path:'docs/ce-express/user-guide/v73-sections/3-1-20-visibility-prediction.md', title:'Visibility prediction', product:'CE Express', category:'Express Tools', order:320 },
  { id:'ce-express-v73-3-1-21-antenna-visibility-prediction', path:'docs/ce-express/user-guide/v73-sections/3-1-21-antenna-visibility-prediction.md', title:'Antenna visibility prediction', product:'CE Express', category:'Express Tools', order:321 },
  { id:'ce-express-v73-3-1-22-minimum-receiver-height', path:'docs/ce-express/user-guide/v73-sections/3-1-22-minimum-receiver-height.md', title:'Minimum receiver height', product:'CE Express', category:'Express Tools', order:322 },
  { id:'ce-express-v73-3-1-23-quick-minimum-receiver-height', path:'docs/ce-express/user-guide/v73-sections/3-1-23-quick-minimum-receiver-height.md', title:'Quick minimum receiver height', product:'CE Express', category:'Express Tools', order:323 },
  { id:'ce-express-v73-3-1-24-radar-prediction', path:'docs/ce-express/user-guide/v73-sections/3-1-24-radar-prediction.md', title:'Radar prediction', product:'CE Express', category:'Express Tools', order:324 },
  { id:'ce-express-v73-3-1-25-network-availability', path:'docs/ce-express/user-guide/v73-sections/3-1-25-network-availability.md', title:'Network availability', product:'CE Express', category:'Express Tools', order:325 },
  { id:'ce-express-v73-3-1-26-model-tuning', path:'docs/ce-express/user-guide/v73-sections/3-1-26-model-tuning.md', title:'Model Tuning', product:'CE Express', category:'Express Tools', order:326 },
  { id:'ce-express-v73-3-1-27-optimal-placement', path:'docs/ce-express/user-guide/v73-sections/3-1-27-optimal-placement.md', title:'Optimal placement', product:'CE Express', category:'Express Tools', order:327 },
  { id:'ce-express-v73-3-1-28-utilities', path:'docs/ce-express/user-guide/v73-sections/3-1-28-utilities.md', title:'Utilities', product:'CE Express', category:'Express Tools', order:328 },
  { id:'ce-express-v73-3-1-29-points-to-dxf', path:'docs/ce-express/user-guide/v73-sections/3-1-29-points-to-dxf.md', title:'Points to DXF', product:'CE Express', category:'Express Tools', order:329 },
  { id:'ce-express-v73-3-1-30-emf', path:'docs/ce-express/user-guide/v73-sections/3-1-30-emf.md', title:'EMF', product:'CE Express', category:'Express Tools', order:330 },
  { id:'ce-express-v73-3-1-31-audibility', path:'docs/ce-express/user-guide/v73-sections/3-1-31-audibility.md', title:'Audibility', product:'CE Express', category:'Express Tools', order:331 },
  { id:'ce-express-v73-3-1-32-lux-calculation', path:'docs/ce-express/user-guide/v73-sections/3-1-32-lux-calculation.md', title:'Lux calculation', product:'CE Express', category:'Express Tools', order:332 },
  { id:'ce-express-v73-3-1-33-geoclimatic-data', path:'docs/ce-express/user-guide/v73-sections/3-1-33-geoclimatic-data.md', title:'Geoclimatic data', product:'CE Express', category:'Express Tools', order:333 },
  { id:'ce-express-v73-3-1-34-spectrum-masks', path:'docs/ce-express/user-guide/v73-sections/3-1-34-spectrum-masks.md', title:'Spectrum masks', product:'CE Express', category:'Express Tools', order:334 },
  { id:'ce-express-v73-3-1-35-radios', path:'docs/ce-express/user-guide/v73-sections/3-1-35-radios.md', title:'Radios', product:'CE Express', category:'Express Tools', order:335 },
  { id:'ce-express-v73-3-1-36-frequency-plans', path:'docs/ce-express/user-guide/v73-sections/3-1-36-frequency-plans.md', title:'Frequency plans', product:'CE Express', category:'Express Tools', order:336 },
  { id:'ce-express-v73-3-1-37-link-prediction', path:'docs/ce-express/user-guide/v73-sections/3-1-37-link-prediction.md', title:'Link prediction', product:'CE Express', category:'Express Tools', order:337 },
  { id:'ce-express-v73-3-1-38-automatic-frequency-planning', path:'docs/ce-express/user-guide/v73-sections/3-1-38-automatic-frequency-planning.md', title:'Automatic frequency planning', product:'CE Express', category:'Express Tools', order:338 },
  { id:'ce-express-v73-3-1-39-link-hcm-fs-prediction', path:'docs/ce-express/user-guide/v73-sections/3-1-39-link-hcm-fs-prediction.md', title:'Link HCM-FS prediction', product:'CE Express', category:'Express Tools', order:339 },
  { id:'ce-express-v73-3-1-40-mesh-topology-builder', path:'docs/ce-express/user-guide/v73-sections/3-1-40-mesh-topology-builder.md', title:'Mesh topology builder', product:'CE Express', category:'Express Tools', order:340 },
  { id:'ce-express-v73-3-1-41-mesh-connectivity', path:'docs/ce-express/user-guide/v73-sections/3-1-41-mesh-connectivity.md', title:'Mesh connectivity', product:'CE Express', category:'Express Tools', order:341 },
  { id:'ce-express-v73-3-1-42-quick-mesh-connectivity', path:'docs/ce-express/user-guide/v73-sections/3-1-42-quick-mesh-connectivity.md', title:'Quick mesh connectivity', product:'CE Express', category:'Express Tools', order:342 },
  { id:'ce-express-v73-3-1-43-quick-hcm-fs-prediction', path:'docs/ce-express/user-guide/v73-sections/3-1-43-quick-hcm-fs-prediction.md', title:'Quick HCM-FS prediction', product:'CE Express', category:'Express Tools', order:343 },
  { id:'ce-express-v73-3-1-44-hcm-requests', path:'docs/ce-express/user-guide/v73-sections/3-1-44-hcm-requests.md', title:'HCM requests', product:'CE Express', category:'Express Tools', order:344 },
  { id:'ce-express-overview-merged', path:'docs/ce-express/user-guide/sections/overview.md', title:'Overview / Getting Started', product:'CE Express', category:'Getting Started', order:100 },
  { id:'ce-express-map-view-overview', path:'docs/ce-express/user-guide/sections/map-view-overview.md', title:'Map View Overview', product:'CE Express', category:'Map View', order:200 },
  { id:'ce-express-map', path:'docs/ce-express/user-guide/sections/map.md', title:'Map', product:'CE Express', category:'Map View', order:201 },
  { id:'ce-express-v73-3-5-maptable-view-modes', path:'docs/ce-express/user-guide/v73-sections/3-5-maptable-view-modes.md', title:'Map / Table View Modes', product:'CE Express', category:'Map View', order:202 },
  { id:'ce-express-v73-3-5-1-map-view', path:'docs/ce-express/user-guide/v73-sections/3-5-1-map-view.md', title:'Map View', product:'CE Express', category:'Map View', order:203 },
  { id:'ce-express-v73-3-5-2-display-data-table-full-screen', path:'docs/ce-express/user-guide/v73-sections/3-5-2-display-data-table-full-screen.md', title:'Display Data Table Full Screen', product:'CE Express', category:'Map View', order:204 },
  { id:'ce-express-v73-3-5-3-split-window-vertically', path:'docs/ce-express/user-guide/v73-sections/3-5-3-split-window-vertically.md', title:'Split Window Vertically', product:'CE Express', category:'Map View', order:205 },
  { id:'ce-express-v73-3-5-4-split-window-horizontally', path:'docs/ce-express/user-guide/v73-sections/3-5-4-split-window-horizontally.md', title:'Split Window Horizontally', product:'CE Express', category:'Map View', order:206 },
  { id:'ce-express-v73-4-database-structure', path:'docs/ce-express/user-guide/v73-sections/4-database-structure.md', title:'Database Structure', product:'CE Express', category:'Database Structure', order:400 },
  { id:'ce-express-v73-4-1-sites', path:'docs/ce-express/user-guide/v73-sections/4-1-sites.md', title:'Sites', product:'CE Express', category:'Database Structure', order:401 },
  { id:'ce-express-v73-4-2-cells', path:'docs/ce-express/user-guide/v73-sections/4-2-cells.md', title:'Cells', product:'CE Express', category:'Database Structure', order:402 },
  { id:'ce-express-v73-4-3-repeaters', path:'docs/ce-express/user-guide/v73-sections/4-3-repeaters.md', title:'Repeaters', product:'CE Express', category:'Database Structure', order:403 },
  { id:'ce-express-v73-4-4-radars', path:'docs/ce-express/user-guide/v73-sections/4-4-radars.md', title:'Radars', product:'CE Express', category:'Database Structure', order:404 },
  { id:'ce-express-v73-4-5-cpe', path:'docs/ce-express/user-guide/v73-sections/4-5-cpe.md', title:'CPE', product:'CE Express', category:'Database Structure', order:405 },
  { id:'ce-express-v73-4-6-measurements', path:'docs/ce-express/user-guide/v73-sections/4-6-measurements.md', title:'Measurements', product:'CE Express', category:'Database Structure', order:406 },
  { id:'ce-express-v73-4-7-workspace', path:'docs/ce-express/user-guide/v73-sections/4-7-workspace.md', title:'Workspace', product:'CE Express', category:'Database Structure', order:407 },
  { id:'ce-express-api-merged', path:'docs/ce-express/user-guide/sections/ce-express-api.md', title:'CE Express API', product:'CE Express', category:'CE Express API', order:500 },
  { id:'ce-express-network-data-management-merged', path:'docs/ce-express/user-guide/sections/network-data-management.md', title:'Network Data Management', product:'CE Express', category:'Network Data Management', order:600 },
  { id:'ce-express-database-organization-merged', path:'docs/ce-express/user-guide/sections/database-organization.md', title:'Database Organization', product:'CE Express', category:'Database Organization', order:700 },
  { id:'ce-express-v73-8-1-export-selected', path:'docs/ce-express/user-guide/v73-sections/8-1-export-selected.md', title:'Export selected', product:'CE Express', category:'Exploring Data', order:801 },
  { id:'ce-express-v73-8-2-pdf-report', path:'docs/ce-express/user-guide/v73-sections/8-2-pdf-report.md', title:'PDF Report', product:'CE Express', category:'Exploring Data', order:802 },
  { id:'ce-express-v73-8-3-file-browser', path:'docs/ce-express/user-guide/v73-sections/8-3-file-browser.md', title:'File browser', product:'CE Express', category:'Exploring Data', order:803 },
  { id:'ce-express-v73-8-4-quick-references', path:'docs/ce-express/user-guide/v73-sections/8-4-quick-references.md', title:'Quick references', product:'CE Express', category:'Exploring Data', order:804 },
  { id:'ce-express-v73-8-5-default-editing-and-manual-editing', path:'docs/ce-express/user-guide/v73-sections/8-5-default-editing-and-manual-editing.md', title:'Default editing and manual editing', product:'CE Express', category:'Exploring Data', order:805 },
  { id:'ce-pro-overview', path:'docs/ce-pro/overview.md', title:'Overview / Getting Started', product:'CE Pro', category:'Getting Started', order:100 },
  { id:'ce-pro-geographic-data', path:'docs/ce-pro/geographic-data.md', title:'Geographic Data', product:'CE Pro', category:'Geographic Data', order:200 },
  { id:'ce-pro-workspace-merged', path:'docs/ce-pro/workspace.md', title:'Workspace', product:'CE Pro', category:'Workspace', order:300 },
  { id:'ce-pro-indoor-workspace', path:'docs/ce-pro/indoor-workspace.md', title:'Indoor Workspace', product:'CE Pro', category:'Workspace', order:301 },
  { id:'ce-pro-dm-network-objects', path:'docs/ce-pro/data-management-network-objects.md', title:'Network Objects', product:'CE Pro', category:'Data Management', order:400 },
  { id:'ce-pro-dm-object-editor', path:'docs/ce-pro/data-management-object-editor.md', title:'Object Editor', product:'CE Pro', category:'Data Management', order:401 },
  { id:'ce-pro-dm-clutter-classes', path:'docs/ce-pro/data-management-clutter-classes.md', title:'Clutter Classes', product:'CE Pro', category:'Data Management', order:402 },
  { id:'ce-pro-dm-antenna-viewer', path:'docs/ce-pro/data-management-antenna-viewer.md', title:'Antenna Viewer', product:'CE Pro', category:'Data Management', order:403 },
  { id:'ce-pro-dm-prediction-model-manager', path:'docs/ce-pro/data-management-prediction-model-manager.md', title:'Prediction Model Manager', product:'CE Pro', category:'Data Management', order:404 },
  { id:'ce-pro-dm-template-manager', path:'docs/ce-pro/data-management-template-manager.md', title:'Template Manager', product:'CE Pro', category:'Data Management', order:405 },
  { id:'ce-pro-dm-import-export', path:'docs/ce-pro/data-management-import-export.md', title:'Import / Export', product:'CE Pro', category:'Data Management', order:406 },
  { id:'ce-pro-dm-radio-frequency-data', path:'docs/ce-pro/data-management-radio-frequency-data.md', title:'Radio / Frequency Data', product:'CE Pro', category:'Data Management', order:407 },
  { id:'ce-pro-profile-merged', path:'docs/ce-pro/profile.md', title:'Profile', product:'CE Pro', category:'Profile', order:500 },
  { id:'ce-pro-coverage-prediction-overview', path:'docs/ce-pro/coverage-prediction-overview.md', title:'Coverage Prediction Overview', product:'CE Pro', category:'Coverage Prediction', order:600 },
  { id:'ce-pro-rcp-coverage-tools', path:'docs/ce-pro/rcp-coverage-tools.md', title:'RCP Coverage Tools', product:'CE Pro', category:'Coverage Prediction', order:601 },
  { id:'ce-pro-rlp-mesh-networks', path:'docs/ce-pro/rlp-mesh-networks.md', title:'Mesh Networks', product:'CE Pro', category:'RLP Tools', order:700 },
  { id:'ce-pro-rlp-radio-links', path:'docs/ce-pro/rlp-radio-links.md', title:'Radio Links', product:'CE Pro', category:'RLP Tools', order:701 },
  { id:'ce-pro-emf-tools', path:'docs/ce-pro/emf-tools.md', title:'EMF Tools', product:'CE Pro', category:'EMF Tools', order:800 },
  { id:'ce-pro-about', path:'docs/ce-pro/about.md', title:'About', product:'CE Pro', category:'About', order:1200 },
  { id:'ce-pro-technical-support', path:'docs/ce-pro/technical-support.md', title:'Technical Support', product:'CE Pro', category:'Technical Support', order:1300 },
  { id:'ce-pro-indoor-tools', path:'docs/ce-pro/indoor-tools.md', title:'Indoor Tools', product:'CE Pro', category:'Indoor Tools', order:900 },
  { id:'ce-pro-sound-tools', path:'docs/ce-pro/sound-tools.md', title:'Sound Tools', product:'CE Pro', category:'Sound Tools', order:1000 },
];

// Friendlier display names for known products. Anything not listed here
// (i.e. a brand new product) just uses its raw product string as the
// section label — so a new product shows up automatically with no code
// change required here.
const PRODUCT_LABELS = {
  'CE Express': 'CE Express',
  'CE Pro': 'CE Desktop Pro',
  'Both': 'Geodata & Data',
  'Inventory3D': 'Inventory3D',
};
// Preferred product ordering in the sidebar; anything not listed here is
// appended afterwards, alphabetically.
const PRODUCT_ORDER = ['CE Express', 'CE Pro', 'Both', 'Inventory3D'];

function buildNav(docIndex) {
  const products = Array.from(new Set(docIndex.map((d) => d.product)));
  products.sort((a, b) => {
    const ia = PRODUCT_ORDER.indexOf(a);
    const ib = PRODUCT_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  const nav = {};
  products.forEach((product) => {
    const label = PRODUCT_LABELS[product] || product;
    const categories = {};
    docIndex
      .filter((d) => d.product === product)
      .forEach((d) => {
        if (!categories[d.category]) categories[d.category] = [];
        categories[d.category].push(d);
      });
    Object.values(categories).forEach((list) =>
      list.sort((a, b) => (a.order || 0) - (b.order || 0))
    );
    // Categories themselves are ordered by the lowest `order` value among
    // their items — so where a category shows up in the sidebar follows the
    // same numbering used for the pages inside it, instead of just "whatever
    // order they happened to appear in DOC_INDEX".
    const orderedCategories = {};
    Object.keys(categories)
      .sort((a, b) => categories[a][0].order - categories[b][0].order)
      .forEach((cat) => {
        orderedCategories[cat] = categories[cat];
      });
    nav[label] = orderedCategories;
  });
  return nav;
}

export const NAV = buildNav(DOC_INDEX);

// Admin-created pages (added via the admin panel, POST /api/docs) live only
// in Postgres — they were never part of the GitHub-synced static DOC_INDEX
// above. Call this once when the app loads to pull in anything the admin
// has added since, merging it into DOC_INDEX (same array reference, so
// existing lookups like fetchDoc's `.find()` pick it up automatically).
// Returns true if anything new was found, so the caller can trigger a re-render.
export async function syncLiveDocs() {
  try {
    const res = await fetch(`${API_BASE}/docs`);
    if (!res.ok) return false;
    const rows = await res.json();
    const knownIds = new Set(DOC_INDEX.map((d) => d.id));
    let changed = false;
    rows.forEach((row) => {
      if (!knownIds.has(row.doc_id)) {
        DOC_INDEX.push({
          id: row.doc_id,
          path: row.github_path,
          title: row.title,
          product: row.product,
          category: row.category,
          order: row.display_order ?? 99,
        });
        knownIds.add(row.doc_id);
        changed = true;
      }
    });
    return changed;
  } catch {
    return false;
  }
}

export function getNav() {
  return buildNav(DOC_INDEX);
}

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

export { API_BASE, SERVER_BASE };
