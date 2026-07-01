-- ═══════════════════════════════════════════════════════════════════
-- Visual Assets — INSERT into document_images
-- Branch: poojaswi  |  Author: Pooja
-- Sources: ArcGIS Pro docs (screenshots) + Esri Calcite Icons (SVG icons)
-- Run this in pgAdmin → Query Tool, connected to cellular_expert_docs
-- ═══════════════════════════════════════════════════════════════════

-- ── CE PRO: ArcGIS Pro Screenshots ──────────────────────────────────────────
-- These match CE Pro docs because CE Pro runs inside ArcGIS Pro.

INSERT INTO document_images (doc_id, image_url, caption, section_anchor, display_order) VALUES
  ('ce-pro-tr-install',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/sign-in-window-F405D.png',
   'ArcGIS Pro sign-in prompt — appears the first time you open ArcGIS Pro',
   'activation', 1),

  ('ce-pro-tr-install',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/sign-in-menu-F8B91.png',
   'Sign-in menu in the top bar of an open ArcGIS Pro project',
   'activation', 2),

  ('ce-pro-tr-install',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/settings-page-8C3ED.png',
   'ArcGIS Pro Settings page — go to Project → Settings → Licensing to activate CE Desktop',
   'licensing', 3),

  ('ce-pro-tr-workspace',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/start-page-home-DC4BD.png',
   'ArcGIS Pro start page — Home tab showing New Project options',
   'creating-a-workspace', 1),

  ('ce-pro-tr-arch',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/arcgis-pro-project-3DC45.png',
   'ArcGIS Pro project with map view, Contents pane, and Catalog pane open',
   'interface-overview', 1),

  ('ce-pro-tr-arch',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/ribbon_context_tab_diagram-D53F0.png',
   'ArcGIS Pro ribbon — CE Pro tools appear as contextual tabs (Feature Layer, Labeling, Data)',
   'ribbon', 2),

  ('ce-pro-tr-arch',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/pane-overflow-menu-226FD.png',
   'Overflow menu for stacked panes — navigate between Contents, Catalog, and CE Pro panes',
   'panes', 3),

  ('ce-pro-tr-data',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/arcgis-pro-view-AFCF6.png',
   'Active map view — where CE Pro sites, cells, and prediction results are displayed',
   'map-view', 1),

  ('ce-pro-tr-data',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/contents-pane-catalog-pane-EDB2F.png',
   'Contents pane (layers) and Catalog pane (geodatabase) — core CE Pro data management panels',
   'contents-and-catalog', 2),

  ('ce-pro-tr-objects',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/pane-options-65B60.png',
   'Symbology pane — use to change how CE Pro network objects (sites, cells) look on the map',
   'symbology', 1),

  ('ce-pro-rcp',
   'https://doc.esri.com/en/arcgis-pro/latest/get-started/images/customize-ui-E4D73.png',
   'ArcGIS Pro customised layout — dock and arrange panes for an efficient CE Pro workspace',
   'workspace-layout', 1);


-- ── CE EXPRESS: Esri Calcite SVG Icons ───────────────────────────────────────
-- CE Express is a web app — ArcGIS Pro screenshots do not apply.
-- Using official open-source Esri Calcite icons as concept/section icons.

INSERT INTO document_images (doc_id, image_url, caption, section_anchor, display_order) VALUES
  ('ce-express-login',
   'https://raw.githubusercontent.com/Esri/calcite-ui-icons/master/icons/32/user-32.svg',
   'Login icon', 'login', 1),

  ('ce-express-overview',
   'https://raw.githubusercontent.com/Esri/calcite-ui-icons/master/icons/32/map-32.svg',
   'Map view icon', 'map-view', 1),

  ('ce-express-overview',
   'https://raw.githubusercontent.com/Esri/calcite-ui-icons/master/icons/32/magnifying-glass-32.svg',
   'Search icon', 'search', 2),

  ('ce-express-workspace',
   'https://raw.githubusercontent.com/Esri/calcite-ui-icons/master/icons/32/layers-32.svg',
   'Layers / workspace icon', 'workspace', 1),

  ('ce-express-geodata',
   'https://raw.githubusercontent.com/Esri/calcite-ui-icons/master/icons/32/globe-32.svg',
   'Geodata / globe icon', 'geodata', 1),

  ('ce-express-geodata',
   'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/image.svg',
   'Raster / DEM layer icon', 'dem-raster', 2),

  ('ce-express-network-objects',
   'https://raw.githubusercontent.com/Esri/calcite-ui-icons/master/icons/32/pin-32.svg',
   'Site / location pin icon', 'sites', 1),

  ('ce-express-network-objects',
   'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/radio.svg',
   'Cell tower / antenna icon', 'cells', 2),

  ('ce-express-rf-prediction',
   'https://raw.githubusercontent.com/Esri/calcite-ui-icons/master/icons/32/analysis-32.svg',
   'RF analysis / prediction icon', 'rf-prediction', 1),

  ('ce-express-profile',
   'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/activity.svg',
   'Line of sight / profile graph icon', 'profile-tool', 1),

  ('ce-express-tr-import',
   'https://raw.githubusercontent.com/Esri/calcite-ui-icons/master/icons/32/upload-32.svg',
   'Import / upload data icon', 'import-data', 1),

  ('ce-express-tr-import',
   'https://raw.githubusercontent.com/Esri/calcite-ui-icons/master/icons/32/download-32.svg',
   'Export / download data icon', 'export-data', 2),

  ('ce-express-tr-rf',
   'https://raw.githubusercontent.com/Esri/calcite-ui-icons/master/icons/32/measure-32.svg',
   'Measurement / calculation icon', 'prediction-steps', 1),

  ('ce-express-tr-models',
   'https://raw.githubusercontent.com/Esri/calcite-ui-icons/master/icons/32/filter-32.svg',
   'Filter / model selection icon', 'prediction-models', 1),

  ('ce-express-admin-guide',
   'https://raw.githubusercontent.com/Esri/calcite-ui-icons/master/icons/32/gear-32.svg',
   'Administration / settings icon', 'administration', 1);


-- ── CE PRO: ArcGIS Pro Inline Icons (16px) ───────────────────────────────────

INSERT INTO document_images (doc_id, image_url, caption, section_anchor, display_order) VALUES
  ('ce-pro-tr-install',
   'https://doc.esri.com/en/arcgis-pro/latest/icons/GearDefaultMonochrome16.png',
   'Settings tab icon — inline use next to Settings tab reference', 'licensing', 10),

  ('ce-pro-tr-install',
   'https://doc.esri.com/en/arcgis-pro/latest/icons/BookDefaultMonochrome16.png',
   'Learning Resources tab icon — inline use', 'learning-resources', 11),

  ('ce-pro-tr-install',
   'https://doc.esri.com/en/arcgis-pro/latest/icons/ArcGISLearnColor16.png',
   'ArcGIS Learn button icon — inline use next to Help → Learning Resources', 'learning-resources', 12),

  ('ce-pro-tr-workspace',
   'https://doc.esri.com/en/arcgis-pro/latest/icons/HomeDefaultMonochrome16.png',
   'Home tab icon — inline use next to Home tab reference', 'creating-a-workspace', 10),

  ('ce-pro-tr-workspace',
   'https://doc.esri.com/en/arcgis-pro/latest/icons/FolderOpenState16.png',
   'Open folder icon — inline use next to Open another project', 'creating-a-workspace', 11),

  ('ce-pro-tr-workspace',
   'https://doc.esri.com/en/arcgis-pro/latest/icons/List16.png',
   'List view icon — inline use on start page', 'creating-a-workspace', 12),

  ('ce-pro-tr-workspace',
   'https://doc.esri.com/en/arcgis-pro/latest/icons/Grid16.png',
   'Tiles/Grid view icon — inline use on start page', 'creating-a-workspace', 13),

  ('ce-pro-tr-arch',
   'https://doc.esri.com/en/arcgis-pro/latest/icons/Find16.png',
   'Find/Search icon — inline use next to command search reference', 'ribbon', 10),

  ('ce-pro-tr-arch',
   'https://doc.esri.com/en/arcgis-pro/latest/icons/Esri_BackButtonSmall.png',
   'Back button icon — inline use in multi-page pane navigation', 'panes', 11),

  ('ce-pro-tr-arch',
   'https://doc.esri.com/en/arcgis-pro/latest/icons/auto-hide-button12.png',
   'Auto-hide icon — inline use when describing how to auto-hide panes', 'panes', 12);
