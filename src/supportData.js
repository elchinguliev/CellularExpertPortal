// ── Knowledge Base ─────────────────────────────────────────────────────────
export const KB = [
  { id:'ws-express', tags:['workspace','create','express','server','project'], title:'Creating a Workspace — CE Express',
    answer:`To create a workspace in CE Express:\n1. Log in → click **Workspaces** tool in left toolbar\n2. Click **New workspace**\n3. Enter workspace name, EPSG coordinate system code (e.g. 32635 for UTM35N), and draw the extent on the map\n4. Select your **Geodata set** (DEM + clutter)\n5. Click **Save**\n\nThe map zooms to the workspace extent and only objects in this workspace will be visible.\n\n→ See full docs: [Workspaces](#ce-express-workspace)` },

  { id:'ws-pro', tags:['workspace','create','pro','desktop','arcgis'], title:'Creating a Workspace — CE Desktop Pro',
    answer:`To create a workspace in CE Desktop (Pro):\n1. Open ArcGIS Pro → CE toolbar → **Workspace Tool**\n2. Click **Create Workspace**\n3. Choose or create a File Geodatabase (.gdb)\n4. Enter workspace name\n5. Browse to your **geodata folder** (DEM, clutter, antennas)\n6. Select **projected coordinate system** (UTM or national grid — NOT WGS84)\n7. Click **Create**\n\n⚠️ Always use a projected coordinate system — geographic (lat/lon) will give inaccurate distance calculations.\n\n→ See full docs: [CE Pro Workspace](#ce-pro-workspace)` },

  { id:'rf-run', tags:['rf','prediction','run','coverage','how to','required'], title:'Running RF Prediction',
    answer:`To run RF Prediction in CE Express:\n1. Select cells on the map (Features tool → Select)\n2. Click **RF Prediction** in the left toolbar\n3. Set: Prediction type (Coverage, Best Server, RSRP, SINR...), Resolution (50m recommended to start), Radius, Propagation model\n4. Click **Run** → results appear as a raster layer\n\n**Required inputs:**\n- DEM/terrain raster covering the prediction area (mandatory)\n- Antenna pattern (.msi or .pln) assigned to each cell (mandatory)\n- Clutter/land-use raster (recommended)\n\n→ Full guide: [RF Prediction](#ce-express-rf-prediction)` },

  { id:'rf-required', tags:['required','rf','prediction','what','need','inputs'], title:'What is Required to Run RF Prediction?',
    answer:`**Mandatory:**\n- DEM (terrain elevation raster) covering the full prediction area\n- Correct projection matching the workspace EPSG\n- Antenna pattern (.msi or .pln) assigned to each cell\n- At least one propagation model configured\n\n**Strongly recommended:**\n- Clutter/land-use raster (improves accuracy significantly)\n\n**For urban / ray-tracing:**\n- 3D building data (LoD1 height polygons or full 3D mesh)\n\n→ Full guide: [RF Prediction](#ce-express-rf-prediction) | [Geodata Requirements](#geodata-requirements)` },

  { id:'prop-models', tags:['propagation','model','okumura','cost231','ray tracing','which'], title:'Propagation Models Available',
    answer:`CE Express/Pro includes these propagation models:\n\n| Model | Frequency | Best For |\n|-------|-----------|----------|\n| Okumura-Hata | 150–1500 MHz | Rural/suburban macro |\n| COST-231 Hata | Up to 2 GHz | Urban/suburban macro |\n| COST-231 W-I | 800MHz–2GHz | Dense urban micro |\n| SPM | Configurable | General, can be tuned |\n| Ray Tracing 3D | Any | Highest accuracy, needs 3D buildings |\n| CE Custom | Any | Tuned against drive-test data |\n\nCE evaluates LOS/NLOS1/NLOS per pixel and applies the most appropriate model.\n\n→ Full guide: [Prediction Models](#ce-express-prediction-models)` },

  { id:'install-pro', tags:['install','installation','activate','activation','ce pro','desktop','arcgis pro'], title:'Installing CE Desktop Pro',
    answer:`**Installation order (important!):**\n1. Install **ArcGIS Pro** first (v2.8 or later)\n2. Run **CE Desktop installer** as Administrator\n\n**Activation:**\n1. Open ArcGIS Pro → **Project → Settings → Licensing**\n2. Enable the **CE Desktop** extension\n3. A User Key is generated → send it to support@cellular-expert.com\n4. You receive an activation file → apply it in License Manager\n\n**For upgrades:** Uninstall old CE version first, then install new one.\n\n→ Full guide: [Installation](#ce-pro-installation)` },

  { id:'install-express', tags:['install','express','server','admin','prerequisites'], title:'Installing CE Express (Server)',
    answer:`CE Express server requirements:\n- Windows Server 2016/2019/2022 (or Ubuntu 20.04+)\n- ArcGIS Server 10.9.1+\n- PostgreSQL 13+ with PostGIS\n- PHP 7.4+\n- IIS (Windows) or Nginx (Linux)\n- Min 16 GB RAM, 8 CPU cores, 500 GB storage\n\n→ Full installation guide: [CE Express Installation](#ce-express-admin-installation)` },

  { id:'geodata', tags:['geodata','dem','terrain','clutter','data','format','requirements'], title:'Geodata Requirements',
    answer:`CE requires these GIS datasets:\n\n**DEM/Terrain (mandatory):**\n- Format: GeoTIFF (.tif) recommended\n- Resolution: 5–30m (finer = more accurate but slower)\n- Must use projected coordinate system (NOT WGS84 lat/lon)\n- Must match workspace EPSG code\n\n**Clutter/Land-use (recommended):**\n- Same raster formats, 8-bit or 16-bit integer classification\n- Categories: Open, Rural, Forest, Suburban, Urban, Dense Urban, Water\n\n**Buildings (for urban/ray-tracing):**\n- Vector polygons with height attribute (LoD1) or 3D mesh (LoD2)\n\n→ Full guide: [Geodata Requirements](#geodata-requirements)` },

  { id:'import', tags:['import','csv','data','network','bulk','excel'], title:'Importing Network Data (CSV)',
    answer:`To import sites and cells from CSV:\n1. Features tool → click **Import features**\n2. Select object type (Site or Cell)\n3. Drag & drop your CSV file\n4. Use **Column Mapping** to match your column names to CE fields\n5. Click **Import** — objects appear on map immediately\n\n**Minimum CSV for cells:**\n\`\`\`\nCellName,Latitude,Longitude,Azimuth,Height,Technology\nCELL001,51.5074,-0.1278,0,25,4G\n\`\`\`\n\nSupported formats: CSV, KMZ\n\n→ Full guide: [Network Object Requirements](#network-object-requirements)` },

  { id:'license', tags:['license','activation','error','expired','key'], title:'License Issues',
    answer:`Common license issues and fixes:\n\n**"License not found":**\n- CE not activated → send User Key to support@cellular-expert.com\n- License Manager → verify CE extension is enabled\n\n**"License expired":**\n- Contact sales for renewal: info@cellular-expert.com\n\n**"License server unreachable" (floating license):**\n- Check firewall: port 27000 TCP/UDP must be open between client and license server\n- Ensure License Server service is running\n\n**For offline activation:**\n- Generate activation request file → send to support → apply response file\n\n→ [Troubleshooting](#troubleshooting)` },

  { id:'los', tags:['line of sight','los','profile','terrain','fresnel'], title:'Line of Sight / Profile Analysis',
    answer:`To run a profile/LOS analysis in CE Express:\n1. Click **Profile** tool in the left toolbar\n2. Click **Draw Profile** → click two points on the map\n3. Set frequency and K-factor (default 4/3 for standard atmosphere)\n4. CE computes the terrain cross-section using the loaded DEM\n\n**Result colours:**\n- 🟢 Green = clear LOS\n- 🟡 Yellow = marginal (Fresnel partially blocked)\n- 🔴 Red = obstructed\n\nFor microwave links, the 1st Fresnel zone should be at least 60% clear.\n\n→ Full guide: [Profile & LOS](#ce-express-profile)` },

  { id:'mw-link', tags:['microwave','mw','backhaul','radio link','point to point'], title:'Microwave / Radio Link Planning',
    answer:`To plan a microwave link in CE Express:\n1. Select two sites on the map → right-click → **Create Link**\n2. Set frequency (GHz), polarisation, assign antennas and radio model\n3. Run **Profile** to check LOS and Fresnel zone clearance\n4. Run **Link Prediction** → view RSL, fade margin, availability (%)\n\nCE uses ITU-R P-series models for atmospheric absorption, rain fade, and multipath fading.\n\n→ Full guide: [Radio Link Prediction](#ce-express-radio-link)` },
];

export function findAnswer(query) {
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(w => w.length > 2);
  let best = null, bestScore = 0;
  KB.forEach(item => {
    let score = 0;
    words.forEach(w => {
      if (item.title.toLowerCase().includes(w)) score += 6;
      item.tags.forEach(t => { if (t.includes(w) || w.includes(t)) score += 4; });
      if (item.answer.toLowerCase().includes(w)) score += 1;
    });
    if (score > bestScore) { bestScore = score; best = item; }
  });
  return bestScore >= 4 ? best : null;
}

// ── Suggested questions ─────────────────────────────────────────────────────
export const SUGGESTED = [
  { label:'How to create a project in CE Desktop (Pro)?',  query:'how to create workspace CE Pro desktop' },
  { label:'How to create a project in CE Server-Express?', query:'how to create workspace CE Express server' },
  { label:'What is required to run RF prediction?',        query:'what is required to run RF prediction' },
  { label:'What propagation models are available?',        query:'what propagation models available' },
  { label:'How to import network data from CSV?',          query:'how to import network data csv' },
  { label:'License activation & troubleshooting',          query:'license activation error troubleshoot' },
  { label:'Geodata requirements (DEM, clutter)',            query:'geodata requirements dem clutter terrain' },
  { label:'Microwave / backhaul link planning',            query:'microwave radio link planning backhaul' },
];

// ── Seed data ────────────────────────────────────────────────────────────────
export const SEED_USERS = [
  { id:'u1', name:'Admin User',    email:'admin@cellular-expert.com', role:'admin', company:'Cellular Expert', product:'Both',       joined:'2024-01-15', avatar:'AU' },
  { id:'u2', name:'John Smith',    email:'john@telecom.com',          role:'user',  company:'TelecomCorp',     product:'CE Pro',      joined:'2024-03-10', avatar:'JS' },
  { id:'u3', name:'Anna Müller',   email:'anna@netprovider.de',       role:'user',  company:'NetProvider GmbH',product:'CE Express',  joined:'2024-05-22', avatar:'AM' },
  { id:'u4', name:'Riku Virtanen', email:'riku@cellular-expert.com',  role:'agent', company:'Cellular Expert', product:'Both',        joined:'2024-02-01', avatar:'RV' },
  { id:'u5', name:'Marta Kowalski',email:'marta@planner.pl',          role:'user',  company:'RadioPlan Sp.',   product:'CE Pro',      joined:'2025-01-08', avatar:'MK' },
];

export const SEED_TICKETS = [
  { id:'T-001', userId:'u2', title:'RF prediction returns empty raster', product:'CE Pro', category:'Bug', priority:'High', status:'Open', created:'2025-06-10', updated:'2025-06-11', assignedTo:'u4',
    messages:[
      { from:'u2', text:'When I run RF prediction the result raster appears in layers but the map shows nothing. DEM is loaded.', time:'2025-06-10 09:14' },
      { from:'u4', text:'Does the DEM projection match the workspace coordinate system? Please check EPSG codes.', time:'2025-06-10 11:32' },
      { from:'u2', text:'DEM is EPSG:3857 but workspace is EPSG:32635. Could that be it?', time:'2025-06-10 13:05' },
    ]},
  { id:'T-002', userId:'u3', title:'CE Express users cannot log in after server restart', product:'CE Express', category:'Incident', priority:'Critical', status:'Resolved', created:'2025-06-08', updated:'2025-06-09', assignedTo:'u4',
    messages:[
      { from:'u3', text:'After restarting the CE Express server none of our users can log in.', time:'2025-06-08 08:00' },
      { from:'u4', text:'Check Windows Services — ensure the CE Express Service is running and set to auto-start.', time:'2025-06-08 08:30' },
      { from:'u3', text:'Fixed! The service was stopped. Thank you for the quick response.', time:'2025-06-08 09:00' },
    ]},
  { id:'T-003', userId:'u5', title:'How to import Nokia NetAct export to CE Pro?', product:'CE Pro', category:'Question', priority:'Normal', status:'Closed', created:'2025-06-05', updated:'2025-06-06', assignedTo:'u4',
    messages:[
      { from:'u5', text:"We have a Nokia NetAct CSV export. What's the correct import method in CE Pro?", time:'2025-06-05 14:22' },
      { from:'u4', text:'CE Pro → Data → Import → select Nokia NetAct template → map columns → Import. The wizard handles the field mapping automatically.', time:'2025-06-05 16:00' },
    ]},
  { id:'T-004', userId:'u2', title:'License server not reachable from remote office', product:'CE Pro', category:'Bug', priority:'High', status:'In Progress', created:'2025-06-12', updated:'2025-06-12', assignedTo:'u4',
    messages:[
      { from:'u2', text:'Engineers in remote office cannot reach the license server. Port 27000 seems blocked by firewall.', time:'2025-06-12 07:30' },
      { from:'u4', text:'Please ask your network team to open TCP/UDP port 27000 between the remote office and the license server IP. Also check that the FlexLM service is running on the server.', time:'2025-06-12 10:15' },
    ]},
];

export const AGENTS = [
  { id:'u4', name:'Riku Virtanen', avatar:'RV', resolved:24, avgResponse:'1.8h', open:3, satisfaction:4.8, thisMonth:12 },
  { id:'a2', name:'Liina Mäkinen', avatar:'LM', resolved:18, avgResponse:'2.4h', open:2, satisfaction:4.6, thisMonth:9  },
  { id:'a3', name:'Tomas Bergs',   avatar:'TB', resolved:31, avgResponse:'1.2h', open:5, satisfaction:4.9, thisMonth:16 },
];

export const SUPPORT_EMAIL = 'support@cellular-expert.com';
