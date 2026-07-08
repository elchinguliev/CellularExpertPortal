-- ═══════════════════════════════════════════════════════════════════
-- Visual Assets v2 — INSERT into document_images
-- Branch: poojaswi  |  Author: Pooja
-- Covers all NEW docs added in the full documentation push
-- Sources: ArcGIS Pro screenshots (CE Pro) + Calcite icons + Feather icons (CE Express)
-- Run AFTER seed-images.sql in pgAdmin → Query Tool
-- ═══════════════════════════════════════════════════════════════════


-- ── CE PRO Training: Missing pages ───────────────────────────────────────────

INSERT INTO document_images (doc_id, image_url, caption, section_anchor, display_order) VALUES

  -- 03. Agenda
  ('ce-pro-tr-agenda',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/arcgis-pro-project-3DC45.png',
   'ArcGIS Pro project view — the main training environment used throughout the CE Desktop course',
   'training-environment', 1),

  -- 05. Line of Sight / Profile
  ('ce-pro-tr-los',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/arcgis-pro-view-AFCF6.png',
   'Active map view — terrain and CE Pro line-of-sight / profile results displayed here',
   'los-results', 1),

  ('ce-pro-tr-los',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/contents-pane-catalog-pane-EDB2F.png',
   'Contents pane showing DEM, clutter, and obstacle layers required for LOS calculation',
   'geodata-layers', 2),

  -- 07. Cell Prediction
  ('ce-pro-tr-prediction',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/arcgis-pro-view-AFCF6.png',
   'Map view showing CE Pro cell prediction coverage raster results',
   'prediction-results', 1),

  ('ce-pro-tr-prediction',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/pane-options-65B60.png',
   'CE Pro cell prediction configuration pane — set parameters before running a prediction',
   'prediction-config', 2),

  -- 08. Prediction Models
  ('ce-pro-tr-models',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/arcgis-pro-view-AFCF6.png',
   'Map view showing prediction model output — coverage raster on the active map',
   'model-output', 1),

  ('ce-pro-tr-models',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/ribbon_context_tab_diagram-D53F0.png',
   'CE Pro ribbon — select prediction model from the contextual CE Desktop tab',
   'model-selection', 2),

  -- 09. Importing Data
  ('ce-pro-tr-import',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/contents-pane-catalog-pane-EDB2F.png',
   'Contents and Catalog pane — imported network objects appear as feature classes in the geodatabase',
   'import-result', 1),

  -- 10. RL / MW Prediction
  ('ce-pro-tr-rl',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/arcgis-pro-view-AFCF6.png',
   'Map view showing MW link paths and RL prediction results on the active map',
   'rl-results', 1),

  ('ce-pro-tr-rl',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/customize-ui-E4D73.png',
   'Customised ArcGIS Pro layout — recommended pane arrangement for RL / MW planning',
   'workspace-layout', 2);


-- ── CE PRO Training: Inline icons (16px) for new pages ───────────────────────

INSERT INTO document_images (doc_id, image_url, caption, section_anchor, display_order) VALUES

  -- LOS inline icons
  ('ce-pro-tr-los',
   'https://doc.esri.com/en/arcgis-pro/latest/icons/Find16.png',
   'Find / Search icon — inline use when referencing the command search in the ribbon',
   'ribbon', 10),

  ('ce-pro-tr-los',
   'https://doc.esri.com/en/arcgis-pro/latest/icons/GearDefaultMonochrome16.png',
   'Settings icon — inline use when referencing CE Pro LOS settings panel',
   'los-settings', 11),

  -- Cell Prediction inline icons
  ('ce-pro-tr-prediction',
   'https://doc.esri.com/en/arcgis-pro/latest/icons/Find16.png',
   'Find / Search icon — inline use when referencing the command search in the ribbon',
   'ribbon', 10),

  -- Importing Data inline icons
  ('ce-pro-tr-import',
   'https://doc.esri.com/en/arcgis-pro/latest/icons/FolderOpenState16.png',
   'Open folder icon — inline use when referencing the file browser during import',
   'import-steps', 10),

  ('ce-pro-tr-import',
   'https://doc.esri.com/en/arcgis-pro/latest/icons/List16.png',
   'List icon — inline use when selecting objects from the import list',
   'import-steps', 11);


-- ── CE PRO User Guides: New guides ───────────────────────────────────────────

INSERT INTO document_images (doc_id, image_url, caption, section_anchor, display_order) VALUES

  -- RLP User Guide
  ('ce-pro-rlp',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/arcgis-pro-view-AFCF6.png',
   'Map view showing RLP (Radio Link Planning) prediction results and MW link paths',
   'rlp-map-view', 1),

  ('ce-pro-rlp',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/customize-ui-E4D73.png',
   'Customised ArcGIS Pro layout — recommended pane arrangement for RLP workflow',
   'workspace-layout', 2),

  -- EMF User Guide
  ('ce-pro-emf',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/arcgis-pro-view-AFCF6.png',
   'Map view showing CE Desktop EMF (Electromagnetic Field) calculation results',
   'emf-results', 1),

  ('ce-pro-emf',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/pane-options-65B60.png',
   'Symbology pane — configure EMF result layer display and colour ramp on the map',
   'symbology', 2),

  -- Sound User Guide
  ('ce-pro-sound',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/arcgis-pro-view-AFCF6.png',
   'Map view showing CE Desktop Sound propagation calculation results',
   'sound-results', 1),

  ('ce-pro-sound',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/contents-pane-catalog-pane-EDB2F.png',
   'Contents pane showing Sound prediction output layers in the geodatabase',
   'sound-layers', 2),

  -- Indoor User Guide
  ('ce-pro-indoor',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/arcgis-pro-view-AFCF6.png',
   'Map view showing CE Desktop Indoor coverage prediction results',
   'indoor-results', 1),

  ('ce-pro-indoor',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/pane-options-65B60.png',
   'Symbology pane — configure indoor layer display colours on the map',
   'symbology', 2),

  ('ce-pro-indoor',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/customize-ui-E4D73.png',
   'Customised ArcGIS Pro layout — recommended pane arrangement for indoor planning',
   'workspace-layout', 3);


-- ── CE EXPRESS Training: Missing pages ───────────────────────────────────────
-- CE Express is a web app — using Calcite icons (jsDelivr) and Feather icons

INSERT INTO document_images (doc_id, image_url, caption, section_anchor, display_order) VALUES

  -- 01. Creating Workspace (training)
  ('ce-express-tr-workspace',
   'https://cdn.jsdelivr.net/npm/@esri/calcite-ui-icons/icons/layers-32.svg',
   'Layers / workspace icon — represents the new workspace created in this exercise',
   'workspace', 1),

  ('ce-express-tr-workspace',
   'https://cdn.jsdelivr.net/npm/@esri/calcite-ui-icons/icons/globe-32.svg',
   'Geodata / globe icon — assign geodata layers when setting up a new workspace',
   'geodata-setup', 2),

  -- 02. Create Objects (training)
  ('ce-express-tr-objects',
   'https://cdn.jsdelivr.net/npm/@esri/calcite-ui-icons/icons/pin-32.svg',
   'Site / location pin icon — create new sites on the map in this exercise',
   'create-site', 1),

  ('ce-express-tr-objects',
   'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/radio.svg',
   'Cell / antenna icon — add cells to sites during the Create Objects exercise',
   'create-cell', 2),

  ('ce-express-tr-objects',
   'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/copy.svg',
   'Duplicate / copy icon — duplicate existing network objects in CE Express',
   'duplicate-objects', 3),

  -- 03. Line of Sight (training)
  ('ce-express-tr-los',
   'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/activity.svg',
   'Line of sight / profile graph icon — used in the LOS training exercise',
   'los-tool', 1),

  ('ce-express-tr-los',
   'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/eye.svg',
   'Visibility icon — check whether a clear line of sight exists between two points',
   'visibility-analysis', 2),

  ('ce-express-tr-los',
   'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/navigation.svg',
   'Navigation / path icon — draw a profile path between two locations on the map',
   'draw-path', 3),

  -- 07. MW Equipment (training)
  ('ce-express-tr-mw-equipment',
   'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/radio.svg',
   'MW / radio equipment icon — represents microwave radio equipment in CE Express',
   'mw-equipment', 1),

  ('ce-express-tr-mw-equipment',
   'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/link.svg',
   'Link icon — create MW links between two sites in CE Express',
   'mw-links', 2),

  ('ce-express-tr-mw-equipment',
   'https://cdn.jsdelivr.net/npm/@esri/calcite-ui-icons/icons/upload-32.svg',
   'Import / upload icon — import MW equipment data from a file into CE Express',
   'import-equipment', 3),

  -- 08. MW / RL Prediction (training)
  ('ce-express-tr-mw-prediction',
   'https://cdn.jsdelivr.net/npm/@esri/calcite-ui-icons/icons/analysis-32.svg',
   'RF / MW analysis icon — run a microwave link prediction in CE Express',
   'mw-prediction', 1),

  ('ce-express-tr-mw-prediction',
   'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/zap.svg',
   'Power / signal icon — view MW link power budget and signal levels',
   'power-budget', 2),

  ('ce-express-tr-mw-prediction',
   'https://cdn.jsdelivr.net/npm/@esri/calcite-ui-icons/icons/measure-32.svg',
   'Measurement icon — set MW prediction parameters: distance, frequency, antenna height',
   'prediction-parameters', 3),

  -- 09. Preparing Geodata (training)
  ('ce-express-tr-geodata',
   'https://cdn.jsdelivr.net/npm/@esri/calcite-ui-icons/icons/globe-32.svg',
   'Geodata / globe icon — prepare and upload terrain and clutter data for CE Express',
   'geodata-preparation', 1),

  ('ce-express-tr-geodata',
   'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/image.svg',
   'Raster / DEM icon — convert and prepare DEM raster files for use in predictions',
   'dem-preparation', 2),

  ('ce-express-tr-geodata',
   'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/layers.svg',
   'Layers icon — organise clutter and terrain layers in the correct projection',
   'layer-organisation', 3);


-- ── CE EXPRESS User Guide ─────────────────────────────────────────────────────

INSERT INTO document_images (doc_id, image_url, caption, section_anchor, display_order) VALUES

  ('ce-express-user-guide',
   'https://cdn.jsdelivr.net/npm/@esri/calcite-ui-icons/icons/map-32.svg',
   'Map view icon — the main CE Express map interface described in the user guide',
   'map-view', 1),

  ('ce-express-user-guide',
   'https://cdn.jsdelivr.net/npm/@esri/calcite-ui-icons/icons/layers-32.svg',
   'Layers / workspace icon — workspace and layer management section of the user guide',
   'workspace', 2),

  ('ce-express-user-guide',
   'https://cdn.jsdelivr.net/npm/@esri/calcite-ui-icons/icons/analysis-32.svg',
   'RF analysis icon — RF prediction and analysis section of the user guide',
   'rf-prediction', 3),

  ('ce-express-user-guide',
   'https://cdn.jsdelivr.net/npm/@esri/calcite-ui-icons/icons/pin-32.svg',
   'Network objects icon — sites and cells management section',
   'network-objects', 4),

  ('ce-express-user-guide',
   'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/activity.svg',
   'Profile / LOS icon — line of sight and profile tool section of the user guide',
   'profile-los', 5),

  ('ce-express-user-guide',
   'https://cdn.jsdelivr.net/npm/@esri/calcite-ui-icons/icons/gear-32.svg',
   'Settings icon — system settings and configuration section of the user guide',
   'settings', 6);


-- ── INVENTORY3D User Guide ────────────────────────────────────────────────────

INSERT INTO document_images (doc_id, image_url, caption, section_anchor, display_order) VALUES

  ('inventory3d-guide',
   'https://cdn.jsdelivr.net/npm/@esri/calcite-ui-icons/icons/map-32.svg',
   'Map view icon — Inventory3D displays network objects in a 3D map view',
   'map-view', 1),

  ('inventory3d-guide',
   'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/layers.svg',
   'Layers icon — 3D layers and network objects in Inventory3D',
   'layers', 2),

  ('inventory3d-guide',
   'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/package.svg',
   'Inventory / package icon — manage and view network inventory items in Inventory3D',
   'inventory', 3),

  ('inventory3d-guide',
   'https://cdn.jsdelivr.net/npm/@esri/calcite-ui-icons/icons/pin-32.svg',
   'Site / location icon — browse and inspect site locations in Inventory3D',
   'sites', 4);


-- ── DATA REQUIREMENTS ─────────────────────────────────────────────────────────

INSERT INTO document_images (doc_id, image_url, caption, section_anchor, display_order) VALUES

  -- Geodata Requirements
  ('ce-geodata-requirements',
   'https://cdn.jsdelivr.net/npm/@esri/calcite-ui-icons/icons/globe-32.svg',
   'Geodata / globe icon — overview of CE geodata format and coverage requirements',
   'geodata-overview', 1),

  ('ce-geodata-requirements',
   'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/image.svg',
   'Raster / DEM icon — DEM and clutter raster format requirements (GeoTIFF, resolution)',
   'raster-requirements', 2),

  ('ce-geodata-requirements',
   'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/layers.svg',
   'Layers icon — required layer types: DTM, clutter, obstacles and their projections',
   'layer-requirements', 3),

  -- Network Object Requirements
  ('ce-network-objects-requirements',
   'https://cdn.jsdelivr.net/npm/@esri/calcite-ui-icons/icons/pin-32.svg',
   'Site / location icon — required fields for network site objects',
   'site-requirements', 1),

  ('ce-network-objects-requirements',
   'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/radio.svg',
   'Cell / antenna icon — required fields for cell and antenna objects',
   'cell-requirements', 2),

  ('ce-network-objects-requirements',
   'https://cdn.jsdelivr.net/npm/@esri/calcite-ui-icons/icons/filter-32.svg',
   'Filter / data requirements icon — field mapping and mandatory data format requirements',
   'field-mapping', 3);
