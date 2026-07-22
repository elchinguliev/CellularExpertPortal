// useGithubDocs.js
// Fetches documentation markdown files directly from GitHub repository
// When a .md file is edited on GitHub, the site automatically reflects the changes

const GITHUB_RAW = 'https://raw.githubusercontent.com/elchinguliev/CellularExpertDocs/pooja';
const GITHUB_API = 'https://api.github.com/repos/elchinguliev/CellularExpertDocs';

// All known docs — structure matches the docs/ folder in GitHub
// To add a new doc: 1) add the .md file to GitHub  2) add its entry here
export const DOC_INDEX = [
  // CE Express — mirrors the CE Express User Guide v7.3 PDF's own table of contents.
  // Every numbered section/subsection in the PDF (120 total) gets its own page here, split
  // out of the old single 4,700-line file, so clicking a sidebar item shows only that section —
  // no more one giant scrollable document. Order follows the PDF's own section order.
  // CE Express — mirrors the CE Express User Guide v7.3 PDF's own table of contents.
  // Pure organizational headers with no content of their own in the source PDF (3.1, 3.2, 4,
  // 6.2, 7, 7.1, 8) are dropped as pages and used only as category labels below.
  { id:'ce-express-1-introduction', path:'docs/ce-express/user-guide/v73-sections/1-introduction.md', title:'Introduction', product:'CE Express', category:'Getting Started', order:1 },
  { id:'ce-express-2-ce-express-application', path:'docs/ce-express/user-guide/v73-sections/2-ce-express-application.md', title:'CE Express application', product:'CE Express', category:'Getting Started', order:2 },
  { id:'ce-express-2-1-log-in-to-the-express-network-data-management-application', path:'docs/ce-express/user-guide/v73-sections/2-1-log-in-to-the-express-network-data-management-application.md', title:'Log in to the Express Network Data Management application', product:'CE Express', category:'Getting Started', order:3 },
  { id:'ce-express-2-2-open-the-express-map-view', path:'docs/ce-express/user-guide/v73-sections/2-2-open-the-express-map-view.md', title:'Open the Express Map view', product:'CE Express', category:'Getting Started', order:4 },
  { id:'ce-express-2-3-log-out', path:'docs/ce-express/user-guide/v73-sections/2-3-log-out.md', title:'Log out', product:'CE Express', category:'Getting Started', order:5 },
  { id:'ce-express-3-map-view', path:'docs/ce-express/user-guide/v73-sections/3-map-view.md', title:'Map view', product:'CE Express', category:'Interface', order:6 },
  { id:'ce-express-3-1-1-workspaces', path:'docs/ce-express/user-guide/v73-sections/3-1-1-workspaces.md', title:'Workspaces', product:'CE Express', category:'Cellular Expert Express Tools', order:7 },
  { id:'ce-express-3-1-2-features', path:'docs/ce-express/user-guide/v73-sections/3-1-2-features.md', title:'Features', product:'CE Express', category:'Cellular Expert Express Tools', order:8 },
  { id:'ce-express-3-1-3-networks', path:'docs/ce-express/user-guide/v73-sections/3-1-3-networks.md', title:'Networks', product:'CE Express', category:'Cellular Expert Express Tools', order:9 },
  { id:'ce-express-3-1-4-layers', path:'docs/ce-express/user-guide/v73-sections/3-1-4-layers.md', title:'Layers', product:'CE Express', category:'Cellular Expert Express Tools', order:10 },
  { id:'ce-express-3-1-5-prediction-history', path:'docs/ce-express/user-guide/v73-sections/3-1-5-prediction-history.md', title:'Prediction history', product:'CE Express', category:'Cellular Expert Express Tools', order:11 },
  { id:'ce-express-3-1-6-antennas', path:'docs/ce-express/user-guide/v73-sections/3-1-6-antennas.md', title:'Antennas', product:'CE Express', category:'Cellular Expert Express Tools', order:12 },
  { id:'ce-express-3-1-7-geodata-sets', path:'docs/ce-express/user-guide/v73-sections/3-1-7-geodata-sets.md', title:'Geodata sets', product:'CE Express', category:'Cellular Expert Express Tools', order:13 },
  { id:'ce-express-3-1-8-feature-templates', path:'docs/ce-express/user-guide/v73-sections/3-1-8-feature-templates.md', title:'Feature templates', product:'CE Express', category:'Cellular Expert Express Tools', order:14 },
  { id:'ce-express-3-1-9-prediction-models', path:'docs/ce-express/user-guide/v73-sections/3-1-9-prediction-models.md', title:'Prediction models', product:'CE Express', category:'Cellular Expert Express Tools', order:15 },
  { id:'ce-express-3-1-10-settings', path:'docs/ce-express/user-guide/v73-sections/3-1-10-settings.md', title:'Settings', product:'CE Express', category:'Cellular Expert Express Tools', order:16 },
  { id:'ce-express-3-1-11-identify', path:'docs/ce-express/user-guide/v73-sections/3-1-11-identify.md', title:'Identify', product:'CE Express', category:'Cellular Expert Express Tools', order:17 },
  { id:'ce-express-3-1-12-measurement-tool', path:'docs/ce-express/user-guide/v73-sections/3-1-12-measurement-tool.md', title:'Measurement tool', product:'CE Express', category:'Cellular Expert Express Tools', order:18 },
  { id:'ce-express-3-1-13-network-statistics', path:'docs/ce-express/user-guide/v73-sections/3-1-13-network-statistics.md', title:'Network statistics', product:'CE Express', category:'Cellular Expert Express Tools', order:19 },
  { id:'ce-express-3-1-14-street-view', path:'docs/ce-express/user-guide/v73-sections/3-1-14-street-view.md', title:'Street view', product:'CE Express', category:'Cellular Expert Express Tools', order:20 },
  { id:'ce-express-3-1-15-feature-report', path:'docs/ce-express/user-guide/v73-sections/3-1-15-feature-report.md', title:'Feature report', product:'CE Express', category:'Cellular Expert Express Tools', order:21 },
  { id:'ce-express-3-1-16-profile', path:'docs/ce-express/user-guide/v73-sections/3-1-16-profile.md', title:'Profile', product:'CE Express', category:'Cellular Expert Express Tools', order:22 },
  { id:'ce-express-3-1-17-quick-rf-prediction', path:'docs/ce-express/user-guide/v73-sections/3-1-17-quick-rf-prediction.md', title:'Quick RF Prediction', product:'CE Express', category:'Cellular Expert Express Tools', order:23 },
  { id:'ce-express-3-1-18-rf-prediction', path:'docs/ce-express/user-guide/v73-sections/3-1-18-rf-prediction.md', title:'RF Prediction', product:'CE Express', category:'Cellular Expert Express Tools', order:24 },
  { id:'ce-express-3-1-19-3d-rf-prediction', path:'docs/ce-express/user-guide/v73-sections/3-1-19-3d-rf-prediction.md', title:'3D RF Prediction', product:'CE Express', category:'Cellular Expert Express Tools', order:25 },
  { id:'ce-express-3-1-20-visibility-prediction', path:'docs/ce-express/user-guide/v73-sections/3-1-20-visibility-prediction.md', title:'Visibility prediction', product:'CE Express', category:'Cellular Expert Express Tools', order:26 },
  { id:'ce-express-3-1-21-antenna-visibility-prediction', path:'docs/ce-express/user-guide/v73-sections/3-1-21-antenna-visibility-prediction.md', title:'Antenna visibility prediction', product:'CE Express', category:'Cellular Expert Express Tools', order:27 },
  { id:'ce-express-3-1-22-minimum-receiver-height', path:'docs/ce-express/user-guide/v73-sections/3-1-22-minimum-receiver-height.md', title:'Minimum receiver height', product:'CE Express', category:'Cellular Expert Express Tools', order:28 },
  { id:'ce-express-3-1-23-quick-minimum-receiver-height', path:'docs/ce-express/user-guide/v73-sections/3-1-23-quick-minimum-receiver-height.md', title:'Quick minimum receiver height', product:'CE Express', category:'Cellular Expert Express Tools', order:29 },
  { id:'ce-express-3-1-24-radar-prediction', path:'docs/ce-express/user-guide/v73-sections/3-1-24-radar-prediction.md', title:'Radar prediction', product:'CE Express', category:'Cellular Expert Express Tools', order:30 },
  { id:'ce-express-3-1-25-network-availability', path:'docs/ce-express/user-guide/v73-sections/3-1-25-network-availability.md', title:'Network availability', product:'CE Express', category:'Cellular Expert Express Tools', order:31 },
  { id:'ce-express-3-1-26-model-tuning', path:'docs/ce-express/user-guide/v73-sections/3-1-26-model-tuning.md', title:'Model Tuning', product:'CE Express', category:'Cellular Expert Express Tools', order:32 },
  { id:'ce-express-3-1-27-optimal-placement', path:'docs/ce-express/user-guide/v73-sections/3-1-27-optimal-placement.md', title:'Optimal placement', product:'CE Express', category:'Cellular Expert Express Tools', order:33 },
  { id:'ce-express-3-1-28-utilities', path:'docs/ce-express/user-guide/v73-sections/3-1-28-utilities.md', title:'Utilities', product:'CE Express', category:'Cellular Expert Express Tools', order:34 },
  { id:'ce-express-3-1-29-points-to-dxf', path:'docs/ce-express/user-guide/v73-sections/3-1-29-points-to-dxf.md', title:'Points to DXF', product:'CE Express', category:'Cellular Expert Express Tools', order:35 },
  { id:'ce-express-3-1-30-emf', path:'docs/ce-express/user-guide/v73-sections/3-1-30-emf.md', title:'EMF', product:'CE Express', category:'Cellular Expert Express Tools', order:36 },
  { id:'ce-express-3-1-31-audibility', path:'docs/ce-express/user-guide/v73-sections/3-1-31-audibility.md', title:'Audibility', product:'CE Express', category:'Cellular Expert Express Tools', order:37 },
  { id:'ce-express-3-1-32-lux-calculation', path:'docs/ce-express/user-guide/v73-sections/3-1-32-lux-calculation.md', title:'Lux calculation', product:'CE Express', category:'Cellular Expert Express Tools', order:38 },
  { id:'ce-express-3-1-33-geoclimatic-data', path:'docs/ce-express/user-guide/v73-sections/3-1-33-geoclimatic-data.md', title:'Geoclimatic data', product:'CE Express', category:'Cellular Expert Express Tools', order:39 },
  { id:'ce-express-3-1-34-spectrum-masks', path:'docs/ce-express/user-guide/v73-sections/3-1-34-spectrum-masks.md', title:'Spectrum masks', product:'CE Express', category:'Cellular Expert Express Tools', order:40 },
  { id:'ce-express-3-1-35-radios', path:'docs/ce-express/user-guide/v73-sections/3-1-35-radios.md', title:'Radios', product:'CE Express', category:'Cellular Expert Express Tools', order:41 },
  { id:'ce-express-3-1-36-frequency-plans', path:'docs/ce-express/user-guide/v73-sections/3-1-36-frequency-plans.md', title:'Frequency plans', product:'CE Express', category:'Cellular Expert Express Tools', order:42 },
  { id:'ce-express-3-1-37-link-prediction', path:'docs/ce-express/user-guide/v73-sections/3-1-37-link-prediction.md', title:'Link prediction', product:'CE Express', category:'Cellular Expert Express Tools', order:43 },
  { id:'ce-express-3-1-38-automatic-frequency-planning', path:'docs/ce-express/user-guide/v73-sections/3-1-38-automatic-frequency-planning.md', title:'Automatic frequency planning', product:'CE Express', category:'Cellular Expert Express Tools', order:44 },
  { id:'ce-express-3-1-39-link-hcm-fs-prediction', path:'docs/ce-express/user-guide/v73-sections/3-1-39-link-hcm-fs-prediction.md', title:'Link HCM-FS prediction', product:'CE Express', category:'Cellular Expert Express Tools', order:45 },
  { id:'ce-express-3-1-40-mesh-topology-builder', path:'docs/ce-express/user-guide/v73-sections/3-1-40-mesh-topology-builder.md', title:'Mesh topology builder', product:'CE Express', category:'Cellular Expert Express Tools', order:46 },
  { id:'ce-express-3-1-41-mesh-connectivity', path:'docs/ce-express/user-guide/v73-sections/3-1-41-mesh-connectivity.md', title:'Mesh connectivity', product:'CE Express', category:'Cellular Expert Express Tools', order:47 },
  { id:'ce-express-3-1-42-quick-mesh-connectivity', path:'docs/ce-express/user-guide/v73-sections/3-1-42-quick-mesh-connectivity.md', title:'Quick mesh connectivity', product:'CE Express', category:'Cellular Expert Express Tools', order:48 },
  { id:'ce-express-3-1-43-quick-hcm-fs-prediction', path:'docs/ce-express/user-guide/v73-sections/3-1-43-quick-hcm-fs-prediction.md', title:'Quick HCM-FS prediction', product:'CE Express', category:'Cellular Expert Express Tools', order:49 },
  { id:'ce-express-3-1-44-hcm-requests', path:'docs/ce-express/user-guide/v73-sections/3-1-44-hcm-requests.md', title:'HCM requests', product:'CE Express', category:'Cellular Expert Express Tools', order:50 },
  { id:'ce-express-3-2-1-search-bar', path:'docs/ce-express/user-guide/v73-sections/3-2-1-search-bar.md', title:'Search bar', product:'CE Express', category:'Map', order:51 },
  { id:'ce-express-3-2-2-zoom-in', path:'docs/ce-express/user-guide/v73-sections/3-2-2-zoom-in.md', title:'Zoom in', product:'CE Express', category:'Map', order:52 },
  { id:'ce-express-3-2-3-zoom-out', path:'docs/ce-express/user-guide/v73-sections/3-2-3-zoom-out.md', title:'Zoom out', product:'CE Express', category:'Map', order:53 },
  { id:'ce-express-3-2-4-fine-zoom', path:'docs/ce-express/user-guide/v73-sections/3-2-4-fine-zoom.md', title:'Fine zoom', product:'CE Express', category:'Map', order:54 },
  { id:'ce-express-3-2-5-compass', path:'docs/ce-express/user-guide/v73-sections/3-2-5-compass.md', title:'Compass', product:'CE Express', category:'Map', order:55 },
  { id:'ce-express-3-2-6-3d2d-button', path:'docs/ce-express/user-guide/v73-sections/3-2-6-3d2d-button.md', title:'3D/2D Button', product:'CE Express', category:'Map', order:56 },
  { id:'ce-express-3-2-7-legend', path:'docs/ce-express/user-guide/v73-sections/3-2-7-legend.md', title:'Legend', product:'CE Express', category:'Map', order:57 },
  { id:'ce-express-3-2-8-home', path:'docs/ce-express/user-guide/v73-sections/3-2-8-home.md', title:'Home', product:'CE Express', category:'Map', order:58 },
  { id:'ce-express-3-2-9-mini-calculation-task-window', path:'docs/ce-express/user-guide/v73-sections/3-2-9-mini-calculation-task-window.md', title:'Mini calculation task window', product:'CE Express', category:'Map', order:59 },
  { id:'ce-express-3-2-10-active-side-switch', path:'docs/ce-express/user-guide/v73-sections/3-2-10-active-side-switch.md', title:'Active side switch', product:'CE Express', category:'Map', order:60 },
  { id:'ce-express-3-2-11-quick-menu', path:'docs/ce-express/user-guide/v73-sections/3-2-11-quick-menu.md', title:'Quick menu', product:'CE Express', category:'Map', order:61 },
  { id:'ce-express-3-3-data-management-and-visualization-section', path:'docs/ce-express/user-guide/v73-sections/3-3-data-management-and-visualization-section.md', title:'Data management and visualization section', product:'CE Express', category:'Map & Table Views', order:62 },
  { id:'ce-express-3-4-calculation-section', path:'docs/ce-express/user-guide/v73-sections/3-4-calculation-section.md', title:'Calculation section', product:'CE Express', category:'Map & Table Views', order:63 },
  { id:'ce-express-3-5-maptable-view-modes', path:'docs/ce-express/user-guide/v73-sections/3-5-maptable-view-modes.md', title:'Map/table view modes', product:'CE Express', category:'Map & Table Views', order:64 },
  { id:'ce-express-3-5-1-map-view', path:'docs/ce-express/user-guide/v73-sections/3-5-1-map-view.md', title:'Map view', product:'CE Express', category:'Map & Table Views', order:65 },
  { id:'ce-express-3-5-2-display-data-table-full-screen', path:'docs/ce-express/user-guide/v73-sections/3-5-2-display-data-table-full-screen.md', title:'Display data table full screen', product:'CE Express', category:'Map & Table Views', order:66 },
  { id:'ce-express-3-5-3-split-window-vertically', path:'docs/ce-express/user-guide/v73-sections/3-5-3-split-window-vertically.md', title:'Split window vertically', product:'CE Express', category:'Map & Table Views', order:67 },
  { id:'ce-express-3-5-4-split-window-horizontally', path:'docs/ce-express/user-guide/v73-sections/3-5-4-split-window-horizontally.md', title:'Split window horizontally', product:'CE Express', category:'Map & Table Views', order:68 },
  { id:'ce-express-4-1-sites', path:'docs/ce-express/user-guide/v73-sections/4-1-sites.md', title:'Sites', product:'CE Express', category:'Database Structure', order:69 },
  { id:'ce-express-4-2-cells', path:'docs/ce-express/user-guide/v73-sections/4-2-cells.md', title:'Cells', product:'CE Express', category:'Database Structure', order:70 },
  { id:'ce-express-4-3-repeaters', path:'docs/ce-express/user-guide/v73-sections/4-3-repeaters.md', title:'Repeaters', product:'CE Express', category:'Database Structure', order:71 },
  { id:'ce-express-4-4-radars', path:'docs/ce-express/user-guide/v73-sections/4-4-radars.md', title:'Radars', product:'CE Express', category:'Database Structure', order:72 },
  { id:'ce-express-4-5-cpe', path:'docs/ce-express/user-guide/v73-sections/4-5-cpe.md', title:'CPE', product:'CE Express', category:'Database Structure', order:73 },
  { id:'ce-express-4-6-measurements', path:'docs/ce-express/user-guide/v73-sections/4-6-measurements.md', title:'Measurements', product:'CE Express', category:'Database Structure', order:74 },
  { id:'ce-express-4-7-workspace', path:'docs/ce-express/user-guide/v73-sections/4-7-workspace.md', title:'Workspace', product:'CE Express', category:'Database Structure', order:75 },
  { id:'ce-express-5-ce-express-api', path:'docs/ce-express/user-guide/v73-sections/5-ce-express-api.md', title:'CE Express API', product:'CE Express', category:'CE Express API', order:76 },
  { id:'ce-express-6-network-data-management', path:'docs/ce-express/user-guide/v73-sections/6-network-data-management.md', title:'Network Data Management', product:'CE Express', category:'Network Data Management', order:77 },
  { id:'ce-express-6-1-data-management-tools', path:'docs/ce-express/user-guide/v73-sections/6-1-data-management-tools.md', title:'Data management tools', product:'CE Express', category:'Data Management Tools', order:78 },
  { id:'ce-express-6-1-1-table-view', path:'docs/ce-express/user-guide/v73-sections/6-1-1-table-view.md', title:'Table view', product:'CE Express', category:'Data Management Tools', order:79 },
  { id:'ce-express-6-1-2-back', path:'docs/ce-express/user-guide/v73-sections/6-1-2-back.md', title:'Back', product:'CE Express', category:'Data Management Tools', order:80 },
  { id:'ce-express-6-1-3-sieve', path:'docs/ce-express/user-guide/v73-sections/6-1-3-sieve.md', title:'Sieve', product:'CE Express', category:'Data Management Tools', order:81 },
  { id:'ce-express-6-1-4-multiple-table-view', path:'docs/ce-express/user-guide/v73-sections/6-1-4-multiple-table-view.md', title:'Multiple table view', product:'CE Express', category:'Data Management Tools', order:82 },
  { id:'ce-express-6-1-5-view-attachments', path:'docs/ce-express/user-guide/v73-sections/6-1-5-view-attachments.md', title:'View attachments', product:'CE Express', category:'Data Management Tools', order:83 },
  { id:'ce-express-6-1-6-synchronize-changes', path:'docs/ce-express/user-guide/v73-sections/6-1-6-synchronize-changes.md', title:'Synchronize changes', product:'CE Express', category:'Data Management Tools', order:84 },
  { id:'ce-express-6-1-7-selectunselect-all', path:'docs/ce-express/user-guide/v73-sections/6-1-7-selectunselect-all.md', title:'Select/unselect all', product:'CE Express', category:'Data Management Tools', order:85 },
  { id:'ce-express-6-1-8-show-selectedshow-all', path:'docs/ce-express/user-guide/v73-sections/6-1-8-show-selectedshow-all.md', title:'Show selected/Show all', product:'CE Express', category:'Data Management Tools', order:86 },
  { id:'ce-express-6-1-9-move-record', path:'docs/ce-express/user-guide/v73-sections/6-1-9-move-record.md', title:'Move record', product:'CE Express', category:'Data Management Tools', order:87 },
  { id:'ce-express-6-1-10-copy-record', path:'docs/ce-express/user-guide/v73-sections/6-1-10-copy-record.md', title:'Copy record', product:'CE Express', category:'Data Management Tools', order:88 },
  { id:'ce-express-6-1-11-add-new-record', path:'docs/ce-express/user-guide/v73-sections/6-1-11-add-new-record.md', title:'Add new record', product:'CE Express', category:'Data Management Tools', order:89 },
  { id:'ce-express-6-1-12-ce-api', path:'docs/ce-express/user-guide/v73-sections/6-1-12-ce-api.md', title:'CE API', product:'CE Express', category:'Data Management Tools', order:90 },
  { id:'ce-express-6-1-13-export-selected', path:'docs/ce-express/user-guide/v73-sections/6-1-13-export-selected.md', title:'Export selected', product:'CE Express', category:'Data Management Tools', order:91 },
  { id:'ce-express-6-1-14-delete-record', path:'docs/ce-express/user-guide/v73-sections/6-1-14-delete-record.md', title:'Delete record', product:'CE Express', category:'Data Management Tools', order:92 },
  { id:'ce-express-6-1-15-remove-selected', path:'docs/ce-express/user-guide/v73-sections/6-1-15-remove-selected.md', title:'Remove selected', product:'CE Express', category:'Data Management Tools', order:93 },
  { id:'ce-express-6-2-1-import-export', path:'docs/ce-express/user-guide/v73-sections/6-2-1-import-export.md', title:'Import Export', product:'CE Express', category:'View Options & User Administration', order:94 },
  { id:'ce-express-6-2-2-settings', path:'docs/ce-express/user-guide/v73-sections/6-2-2-settings.md', title:'Settings', product:'CE Express', category:'View Options & User Administration', order:95 },
  { id:'ce-express-6-2-3-user-name-help-logout', path:'docs/ce-express/user-guide/v73-sections/6-2-3-user-name-help-logout.md', title:'User name/ Help/ Logout', product:'CE Express', category:'View Options & User Administration', order:96 },
  { id:'ce-express-6-3-table', path:'docs/ce-express/user-guide/v73-sections/6-3-table.md', title:'Table', product:'CE Express', category:'Network Data Management', order:97 },
  { id:'ce-express-6-4-view-options', path:'docs/ce-express/user-guide/v73-sections/6-4-view-options.md', title:'View Options', product:'CE Express', category:'Network Data Management', order:98 },
  { id:'ce-express-7-1-1-organization-of-single-and-multiple-tables', path:'docs/ce-express/user-guide/v73-sections/7-1-1-organization-of-single-and-multiple-tables.md', title:'Organization of single and multiple tables', product:'CE Express', category:'Page Setup & Navigation', order:99 },
  { id:'ce-express-7-1-2-organization-of-columns', path:'docs/ce-express/user-guide/v73-sections/7-1-2-organization-of-columns.md', title:'Organization of columns', product:'CE Express', category:'Page Setup & Navigation', order:100 },
  { id:'ce-express-7-1-3-navigation-across-tables', path:'docs/ce-express/user-guide/v73-sections/7-1-3-navigation-across-tables.md', title:'Navigation across tables', product:'CE Express', category:'Page Setup & Navigation', order:101 },
  { id:'ce-express-7-2-filtering-sorting-editing-and-linking-database-records', path:'docs/ce-express/user-guide/v73-sections/7-2-filtering-sorting-editing-and-linking-database-records.md', title:'Filtering, sorting, editing, and linking database records', product:'CE Express', category:'Filtering, Sorting & Linking Records', order:102 },
  { id:'ce-express-7-2-1-set-selected', path:'docs/ce-express/user-guide/v73-sections/7-2-1-set-selected.md', title:'Set selected', product:'CE Express', category:'Filtering, Sorting & Linking Records', order:103 },
  { id:'ce-express-7-2-2-add-link', path:'docs/ce-express/user-guide/v73-sections/7-2-2-add-link.md', title:'Add link', product:'CE Express', category:'Filtering, Sorting & Linking Records', order:104 },
  { id:'ce-express-7-3-adding-viewing-downloading-and-deleting-attachments', path:'docs/ce-express/user-guide/v73-sections/7-3-adding-viewing-downloading-and-deleting-attachments.md', title:'Adding, viewing, downloading and deleting attachments', product:'CE Express', category:'Database Organization', order:105 },
  { id:'ce-express-7-4-sieve', path:'docs/ce-express/user-guide/v73-sections/7-4-sieve.md', title:'Sieve', product:'CE Express', category:'Database Organization', order:106 },
  { id:'ce-express-7-5-ce-api', path:'docs/ce-express/user-guide/v73-sections/7-5-ce-api.md', title:'CE API', product:'CE Express', category:'Database Organization', order:107 },
  { id:'ce-express-7-6-import-csv', path:'docs/ce-express/user-guide/v73-sections/7-6-import-csv.md', title:'Import CSV', product:'CE Express', category:'Database Organization', order:108 },
  { id:'ce-express-8-1-export-selected', path:'docs/ce-express/user-guide/v73-sections/8-1-export-selected.md', title:'Export selected', product:'CE Express', category:'Exploring Data', order:109 },
  { id:'ce-express-8-2-pdf-report', path:'docs/ce-express/user-guide/v73-sections/8-2-pdf-report.md', title:'PDF report', product:'CE Express', category:'Exploring Data', order:110 },
  { id:'ce-express-8-3-file-browser', path:'docs/ce-express/user-guide/v73-sections/8-3-file-browser.md', title:'File browser', product:'CE Express', category:'Exploring Data', order:111 },
  { id:'ce-express-8-4-quick-references', path:'docs/ce-express/user-guide/v73-sections/8-4-quick-references.md', title:'Quick references', product:'CE Express', category:'Exploring Data', order:112 },
  { id:'ce-express-8-5-default-editing-and-manual-editing', path:'docs/ce-express/user-guide/v73-sections/8-5-default-editing-and-manual-editing.md', title:'Default editing and manual editing', product:'CE Express', category:'Exploring Data', order:113 },
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
  // NOTE: only the docs with no other home in the sidebar live here. Creating a Workspace,
  // RF Prediction, etc. are intentionally NOT duplicated here -- they're already linked
  // under CE Express (Getting Started / Network Objects / Calculations). No numbering in
  // the titles since the source-file numbers (01,05,07,09) have gaps and just look broken.
  { id:'training-import-data',          path:'docs/ce-express/training/05-import-data.md',           title:'Import Data',                    product:'Training',   category:'Training',          order:5  },
  { id:'training-mw-equipment',         path:'docs/ce-express/training/07-mw-equipment.md',          title:'MW Equipment',                   product:'Training',   category:'Training',          order:7  },
  { id:'training-preparing-geodata',    path:'docs/ce-express/training/09-preparing-geodata.md',     title:'Preparing Geodata',              product:'Training',   category:'Training',          order:9  },
];

// Navigation structure for the sidebar
export const NAV = {
  'CE Express': {
    'Getting Started':                     DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Getting Started'),
    'Interface':                           DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Interface'),
    'Cellular Expert Express Tools':       DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Cellular Expert Express Tools'),
    'Map':                                 DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Map'),
    'Map & Table Views':                   DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Map & Table Views'),
    'Database Structure':                  DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Database Structure'),
    'CE Express API':                      DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='CE Express API'),
    'Network Data Management':             DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Network Data Management'),
    'Data Management Tools':               DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Data Management Tools'),
    'View Options & User Administration':  DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='View Options & User Administration'),
    'Database Organization':               DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Database Organization'),
    'Page Setup & Navigation':             DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Page Setup & Navigation'),
    'Filtering, Sorting & Linking Records':DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Filtering, Sorting & Linking Records'),
    'Exploring Data':                      DOC_INDEX.filter(d => d.product==='CE Express' && d.category==='Exploring Data'),
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
