# CE Express — Overview

> **Version:** CE Express v7.2

CE Express is a **web-based radio network planning and optimisation** application built on top of **ArcGIS Enterprise**. It runs entirely in a browser — no desktop software is required for end users.

## What CE Express Does

CE Express brings together all of the tools a radio network engineer needs into a single map-based interface:

- **[Network object](#kw:object-types:ce-express-network-objects) management** — create, edit, import, and organise sites, cells, and repeaters
- **RF prediction** — calculate [RSRP](#kw:typical-rsrp-thresholds:ce-express-rf-prediction), SINR, throughput, and best-server coverage for 4G and 5G networks
- **Path profile analysis** — check [line-of-sight](#kw:running-a-profile:ce-express-profile) clearance and link budgets between two points
- **[Street View](#kw:navigating-street-view:ce-express-street-view)** — verify antenna positions and surroundings at ground level
- **[Antenna pattern](#kw:managing-the-antenna-library:ce-express-antenna) management** — import and assign vendor [antenna patterns](#kw:importing-antenna-patterns:ce-express-antenna) (.msi / .txt) to cells
- **Workspace management** — organise projects by workspace, each with its own geodata and prediction settings
- **ArcGIS Portal publishing** — share [prediction results](#kw:viewing-results:ce-express-rf-prediction) as hosted feature layers with your organisation

## Architecture

CE Express is deployed on a Windows Server running **ArcGIS Enterprise**. The backend handles all heavy computation (RF predictions, database queries). Users access CE Express through the ArcGIS Enterprise portal using their ArcGIS credentials.

```
Browser (user)
    │
    ▼
ArcGIS Enterprise Portal
    │
    ▼
CE Express Web Application
    │
    ├── PostgreSQL Database  (network objects, prediction results)
    ├── Geodata Folder       (elevation.tif, clutter rasters)
    └── Antenna Library      (.msi pattern files)
```

## Key Concepts

| Concept | Description |
|---|---|
| **Workspace** | A project container — links your [network objects](#kw:object-types:ce-express-network-objects) to a geodata folder and prediction model settings |
| **Cell** | A single radio sector: one antenna with defined position, azimuth, tilt, frequency, and power |
| **Site** | A physical location (tower, rooftop) that hosts one or more cells |
| **Geodata** | GeoTIFF raster files (elevation, [clutter](#kw:clutter-classification-values:ce-express-geodata)) used as terrain input for predictions |
| **Prediction** | A calculated coverage output: [RSRP](#kw:typical-rsrp-thresholds:ce-express-rf-prediction), SINR, throughput rasters for a selected set of cells |

## Related Pages

- Logging In — how to access CE Express
- Workspaces — creating and configuring workspaces
- RF Prediction — running coverage predictions
- System Requirements — server and hardware requirements
