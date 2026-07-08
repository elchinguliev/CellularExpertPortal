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

# Line of Sight and Profile Analysis

> **Version:** CE Express v7.2

The **Profile** tool computes terrain cross-sections and checks whether two points have a clear radio path.

## Opening the Profile Tool

Click **Profile** in the left toolbar.

## Drawing a Profile

1. Click **Draw Profile** in the tool panel
2. Click two points on the map (start and end)
3. CE Express computes the [terrain profile](#kw:profile-results:none) using the loaded DEM

Alternatively:
- Select two existing [network objects](#kw:object-types:ce-express-network-objects) → Profile is drawn between them
- Import profile endpoints from a file

## Profile Properties

Configure before drawing:

| Property | Description |
|----------|-------------|
| **Frequency (MHz)** | Affects [Fresnel zone](#kw:fresnel-zone-clearance:ce-express-profile) radius calculation |
| **K-factor** | Earth curvature correction. Default: 4/3 (standard atmosphere). Use 2/3 for worst-case diffraction. |
| **Antenna height A** | Height at start point (m AGL) |
| **Antenna height B** | Height at end point (m AGL) |
| **DEM source** | Terrain dataset to use |

## Profile Results

The profile chart shows:

| Element | Description |
|---------|-------------|
| **Terrain cross-section** | Elevation profile along the path |
| **[Line of sight](#kw:drawing-a-profile:none)** | Direct path between antennas |
| **Fresnel zones** | 1st (and higher) [Fresnel zone](#kw:fresnel-zone-clearance:ce-express-profile) ellipses |
| **Earth bulge** | Earth curvature correction (based on K-factor) |
| **Obstacles** | Terrain or building obstructions |
| **Clearance** | Vertical clearance above terrain at critical points |

## Result Interpretation

| Indicator | Meaning |
|-----------|---------|
| 🟢 Green | Clear LOS — 1st [Fresnel zone](#kw:fresnel-zone-clearance:ce-express-profile) fully clear |
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

Import profile endpoints from coordinates (CSV) or from existing [network objects](#kw:object-types:ce-express-network-objects).

## Related Topics

- Radio Link Prediction →
- RF Prediction →
- Geodata Requirements →
