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

> **Version:** CE Express v7.2

Cellular Expert Express (CE Express) is a **web-based** telecommunication network planning, optimization, and [data management](#kw:31-data-management-tools:inventory3d-user-guide) solution built on **Esri ArcGIS Enterprise**.

CE Express is the merged **Inventory 3D** and **Cellular Expert Express** solution in one product:
- **Inventory 3D** — [data management](#kw:31-data-management-tools:inventory3d-user-guide) (sites, assets, equipment inventory)
- **CE Express** — network planning, RF calculations, optimization, analysis

From a desktop, laptop, or tablet with internet access, users connect to a central server and can edit database records, manage [network objects](#kw:object-types:ce-express-network-objects), and run RF calculations — **without installing any local GIS software**.

## Key Capabilities

| Capability | Description |
|-----------|-------------|
| RF Coverage Prediction | Signal level, [RSRP](#kw:typical-rsrp-thresholds:ce-express-rf-prediction), RSRQ, SINR, throughput maps |
| 3D RF Prediction | Full 3D propagation with building data |
| [Quick RF Prediction](#kw:quick-rf-prediction:ce-express-rf-prediction) | Rapid what-if testing without DB changes |
| Microwave / Radio Link | Link budgets, path profiles, rain fade, availability |
| Network Optimization | Best server, interference, C/I analysis |
| Mesh Network Planning | Connectivity, automatic frequency planning |
| [Line of Sight](#kw:running-a-profile:ce-express-profile) / Profile | Terrain cross-sections, Fresnel zones |
| [Visibility Prediction](#kw:43-step-3-visibility-prediction-pointtoarea-analysis:ce-express-tr-los) | Radar and antenna visibility analysis |
| Indoor Planning | In-building signal propagation |
| Sound Propagation | Siren audibility, acoustic analysis (ISO9613) |
| Light / Lux Prediction | Lighting design calculations |
| EMF Analysis | Electromagnetic field compliance |
| Model Tuning | Calibrate propagation [models](#kw:31-models:ce-express-tr-models) against drive-test data |
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

> CE Express is **not** intended to replicate CE Desktop Pro feature-for-feature. It provides a simplified, task-oriented interface for shared workflows.

## Supported Browsers

- **Google Chrome** (recommended — latest version)
- Mozilla Firefox
- Microsoft Edge

> All communication uses **HTTPS only**. HTTP is not supported.

## Related Topics

- Logging In →
- [Map View](#kw:switching-between-views:ce-express-login) Overview →
- Creating Workspaces →
- System Requirements (Admin) →
