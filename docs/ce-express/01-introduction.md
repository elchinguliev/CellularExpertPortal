---
id: ce-express-introduction
title: Introduction to CE Express
product: CE Express
version: "7.3"
category: Getting Started
order: 1
related:
  - ce-express-login
  - ce-express-workspace
  - geodata-requirements
---

# Introduction to Cellular Expert Express

Cellular Expert Express ([CE Express](https://www.google.com/search?q=Cellular+Expert+CE+Express+web+platform)) is a **web-based** telecommunication network planning, optimization, and data management solution built on **Esri [ArcGIS](https://www.google.com/search?q=ArcGIS+Esri+GIS+platform) Enterprise**.

CE Express is the merged **Inventory 3D** and **Cellular Expert Express** solution in one product:
- **Inventory 3D** — data management (sites, assets, equipment inventory)
- **CE Express** — network planning, RF calculations, optimization, analysis

From a desktop, laptop, or tablet with internet access, users connect to a central server and can edit database records, manage network objects, and run RF calculations — **without installing any local GIS software**.

## Key Capabilities

| Capability | Description |
|-----------|-------------|
| RF Coverage Prediction | Signal level, [RSRP](https://www.google.com/search?q=RSRP+Reference+Signal+Received+Power+LTE+4G), [RSRQ](https://www.google.com/search?q=RSRQ+Reference+Signal+Received+Quality+LTE+4G), [SINR](https://www.google.com/search?q=SINR+Signal+to+Interference+Noise+Ratio), throughput maps |
| 3D RF Prediction | Full 3D propagation with building data |
| Quick RF Prediction | Rapid what-if testing without DB changes |
| Microwave / Radio Link | Link budgets, path profiles, [rain fade](https://www.google.com/search?q=rain+fade+attenuation+microwave+link), availability |
| Network Optimization | Best server, interference, C/I analysis |
| Mesh Network Planning | Connectivity, automatic frequency planning |
| [Line of Sight](https://www.google.com/search?q=Line+of+Sight+LOS+radio+propagation) / Profile | Terrain cross-sections, Fresnel zones |
| Visibility Prediction | Radar and antenna visibility analysis |
| Indoor Planning | In-building signal propagation |
| Sound Propagation | Siren audibility, acoustic analysis ([ISO9613](https://www.google.com/search?q=ISO+9613+acoustic+propagation+standard)) |
| Light / Lux Prediction | Lighting design calculations |
| EMF Analysis | Electromagnetic field compliance |
| Model Tuning | Calibrate propagation models against drive-test data |
| Optimal Placement | Find best site locations automatically |

## Architecture

```
User Browser (Chrome recommended)
       ↓  HTTPS only
CE Express Web Server (Windows Server / Linux)
       ↓
ArcGIS Enterprise (Portal + Server)
       ↓
PostgreSQL + PostGIS Database
       ↓
CE Calculation Engine (multi-threaded C++, optional GPU)
```

> CE Express is **not** intended to replicate [CE Desktop](https://www.google.com/search?q=Cellular+Expert+CE+Desktop+ArcGIS+Pro) Pro feature-for-feature. It provides a simplified, task-oriented interface for shared workflows.

## Supported Browsers

- **Google Chrome** (recommended — latest version)
- Mozilla Firefox
- Microsoft Edge

> All communication uses **HTTPS only**. HTTP is not supported.

## Related Topics

- [Logging In →](#ce-express-login)
- [Map View Overview →](#ce-express-map-view)
- [Creating Workspaces →](#ce-express-workspace)
- [System Requirements (Admin) →](#ce-express-admin-requirements)
