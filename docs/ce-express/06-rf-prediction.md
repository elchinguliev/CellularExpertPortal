---
id: ce-express-rf-prediction
title: RF Prediction
product: CE Express
version: "7.3"
category: Calculations
order: 6
related:
  - ce-express-quick-rf
  - ce-express-prediction-models
  - ce-express-geodata-sets
  - geodata-requirements
  - ce-express-prediction-history
---

# RF Prediction

[RF Prediction](#kw:what-rf-prediction-uses:none) calculates **map-based raster outputs** representing expected signal or radio performance across a coverage area.

## What RF Prediction Uses

Predictions are influenced by:
- **[Network objects](#kw:object-types:ce-express-network-objects)** — cells, sites, antennas (azimuth, tilt, height, power, frequency, technology)
- **Configuration parameters** — bandwidth, MIMO, duplex mode, losses
- **Geodata** — terrain elevation (DEM), [clutter](#kw:clutter-classification-values:ce-express-geodata)/land use, buildings
- **Equipment definitions** — [antenna patterns](#kw:importing-antenna-patterns:ce-express-antenna), propagation [models](#kw:31-models:ce-express-tr-models), calculation templates

## Prediction Types

| Output Type | Description |
|-------------|-------------|
| Coverage (signal level) | Received signal strength in dBm |
| Path Loss | Signal attenuation in dB |
| Best Server | Which cell provides the best signal at each point |
| Interference | Interference level across the area |
| [RSRP](#kw:typical-rsrp-thresholds:ce-express-rf-prediction) | Reference Signal Received Power (4G/5G) |
| RSRQ | Reference Signal Received Quality (4G/5G) |
| SINR | Signal-to-Interference-plus-Noise Ratio |
| DL Throughput | Downlink data rate estimate (Mb/s) |
| Visibility | Radio visibility (LOS/NLOS) |

## Quick RF Prediction vs Full RF Prediction

| Feature | Quick RF | Full RF |
|---------|----------|---------|
| Speed | Instant | Standard |
| DB impact | **Does not write** to database | Saves to [prediction history](#kw:44-step-4-prediction-history-and-result-management:ce-express-tr-rf) |
| Use case | What-if testing, parameter comparison | Final results, reporting, documentation |
| Object selection | Uses current object values | Uses saved database values |
| Batch processing | Single cell/group | Multiple networks |

→ See [Quick RF Prediction](#kw:quick-rf-prediction-vs-full-rf-prediction:none) for rapid testing.

## Running a Full RF Prediction

### Step 1: Select Cells

Select one or more cells using the Features tool or via a Network.

### Step 2: Open Prediction Tool

Click **[RF Prediction](#kw:what-rf-prediction-uses:none)** in the left toolbar.

### Step 3: Configure Parameters

**Prediction type:** Choose output (Coverage, Best Server, [RSRP](#kw:typical-rsrp-thresholds:ce-express-rf-prediction), RSRQ, SINR, Throughput, Interference, etc.)

**Resolution:** Controls calculation detail and speed:
| Resolution | Coverage Quality | Speed |
|-----------|-----------------|-------|
| 10 m | Highest | Slowest |
| 25 m | High | Moderate |
| 50 m | Medium | Fast |
| 100 m | Low | Fastest |

> Start with 50–100m for initial planning; use 10–25m for final detailed analysis.

**Radius:** Maximum prediction radius from each site (meters).

**Propagation model:** Select the model appropriate for your environment.
→ See Prediction [Models](#kw:31-models:ce-express-tr-models)

**Receiver height:** Height of the mobile receiver above ground (typically 1.5m for outdoor; custom for indoor, vehicle, rooftop).

### Step 4: Run

Click **Run** — a progress indicator appears. Results render as raster layers in the map when complete.

## Required Inputs

| Input | Required? | Notes |
|-------|-----------|-------|
| DEM (terrain) | **Mandatory** | Must cover the full prediction area with correct projection |
| [Clutter](#kw:clutter-classification-values:ce-express-geodata)/land use | Recommended | Significantly improves accuracy in mixed environments |
| 3D buildings | For urban micro / ray-tracing | Required for COST-231 W-I and ray-tracing models |
| [Antenna pattern](#kw:managing-the-antenna-library:ce-express-antenna) | **Mandatory** | Each cell must have an antenna assigned (.msi or .pln) |
| Propagation model | **Mandatory** | Configured in workspace or per-cell |

> If DEM does not cover the prediction area, the prediction will produce empty results. Check geodata coverage in Geodata Sets.

## Prediction Results

Results appear as raster layers in the map. From the [Prediction History](#kw:44-step-4-prediction-history-and-result-management:ce-express-tr-rf) panel:
- Toggle layers on/off
- Customize colour scales and thresholds
- [Compare](#kw:98-compare-predictions:ce-pro-rcp) multiple predictions
- Export results as **GeoTIFF** raster

## Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Empty/blank result | DEM not loaded or wrong projection | Check geodata set coverage and projection |
| No result layer | Antenna not assigned to cell | Assign [antenna pattern](#kw:managing-the-antenna-library:ce-express-antenna) in cell properties |
| Very slow prediction | Fine resolution over large area | Increase resolution to 50–100m; reduce radius |
| Out of memory | Large area at fine resolution | Split area, reduce radius, use coarser resolution |
| License error | Prediction module not licensed | Check License Manager — contact support |

→ See [Troubleshooting](#kw:common-issues:none) [RF Prediction](#kw:what-rf-prediction-uses:none)

## Related Topics

- [Quick RF Prediction](#kw:quick-rf-prediction-vs-full-rf-prediction:none) →
- Prediction Models →
- Geodata Requirements →
- Geodata Sets →
- Prediction History →
- Networks (Batch Prediction) →
