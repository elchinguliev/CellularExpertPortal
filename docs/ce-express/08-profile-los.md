---
id: ce-express-profile
title: Line of Sight and Profile Analysis
product: CE Express
version: "7.3"
category: Calculations
order: 8
related:
  - ce-express-rf-prediction
  - ce-express-radio-link
  - geodata-requirements
---

# [Line of Sight](https://www.google.com/search?q=Line+of+Sight+LOS+radio+propagation) and Profile Analysis

The **Profile** tool computes terrain cross-sections and checks whether two points have a clear radio path.

## Opening the Profile Tool

Click **Profile** in the left toolbar.

## Drawing a Profile

1. Click **Draw Profile** in the tool panel
2. Click two points on the map (start and end)
3. [CE Express](https://www.google.com/search?q=Cellular+Expert+CE+Express+web+platform) computes the terrain profile using the loaded [DEM](https://www.google.com/search?q=DEM+Digital+Elevation+Model+terrain)

Alternatively:
- Select two existing network objects → Profile is drawn between them
- Import profile endpoints from a file

## Profile Properties

Configure before drawing:

| Property | Description |
|----------|-------------|
| **Frequency (MHz)** | Affects [Fresnel zone](https://www.google.com/search?q=Fresnel+zone+radio+link+clearance) radius calculation |
| **K-factor** | Earth curvature correction. Default: 4/3 (standard atmosphere). Use 2/3 for worst-case diffraction. |
| **Antenna height A** | Height at start point (m AGL) |
| **Antenna height B** | Height at end point (m AGL) |
| **DEM source** | Terrain dataset to use |

## Profile Results

The profile chart shows:

| Element | Description |
|---------|-------------|
| **Terrain cross-section** | Elevation profile along the path |
| **Line of sight** | Direct path between antennas |
| **Fresnel zones** | 1st (and higher) Fresnel zone ellipses |
| **Earth bulge** | Earth curvature correction (based on K-factor) |
| **Obstacles** | Terrain or building obstructions |
| **Clearance** | Vertical clearance above terrain at critical points |

## Result Interpretation

| Indicator | Meaning |
|-----------|---------|
| 🟢 Green | Clear LOS — 1st Fresnel zone fully clear |
| 🟡 Yellow | Marginal — 1st Fresnel zone partially obstructed |
| 🔴 Red | Obstructed — direct path blocked |

> For microwave links, the 1st Fresnel zone should be **at least 60% clear** for acceptable performance.

## Profile Tools

- **Zoom** — zoom in/out on the profile chart
- **Pan** — pan along the profile
- **Measure** — measure distances and heights on the profile

## Exporting the Profile

Click **Export** (Profile Report) to generate a PDF report containing:
- Profile chart
- Fresnel zone analysis
- Link parameters summary
- Clearance table

## Settings

Configure display options:
- Show/hide Fresnel zones (1st, 2nd, nth)
- Color scheme
- Grid display

## Import

Import profile endpoints from coordinates ([CSV](https://www.google.com/search?q=CSV+comma-separated+values+file+format)) or from existing network objects.

## Related Topics

- [Radio Link Prediction →](#ce-express-radio-link)
- [RF Prediction →](#ce-express-rf-prediction)
- [Geodata Requirements →](#geodata-requirements)
