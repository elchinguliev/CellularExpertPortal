# RF Prediction

[RF Prediction](#kw:running-a-full-rf-prediction:none) calculates radio coverage for a set of cells across a defined area. The output is a set of raster layers — [RSRP](#kw:typical-rsrp-thresholds:none), SINR, throughput, and best server — that can be displayed on the map and published to ArcGIS Portal.

## Prerequisites

Before running a prediction, make sure you have:

1. ✅ A **workspace** selected with a valid geodata folder path
2. ✅ `elevation.tif` in the geodata folder ([Projected CRS](#kw:what-is-a-projected-[crs](#kw:check-crs:ce-express-geodata):ce-express-geodata), [NoData](#kw:check-and-set-nodata-value:ce-express-geodata) = -9999)
3. ✅ At least one **cell** with latitude, longitude, and cell_name defined
4. ✅ A **prediction model** configured for the target technology (4G or 5G)
5. ✅ (Recommended) **[Antenna patterns](#kw:importing-antenna-patterns:ce-express-antenna)** assigned to cells

> See Geodata, [Network Objects](#kw:object-types:ce-express-network-objects), and [Antenna Patterns](#kw:importing-antenna-patterns:ce-express-antenna) if any of these are not yet set up.

## Running a Full RF Prediction

### Step 1 — Select Cells

1. Open the **Features** tool (or use the Rectangle Selection tool on the map).
2. Select the cells you want to include in the prediction.
3. Click **Show in Table → Cells** to confirm your selection.

### Step 2 — Open RF Prediction

Click the **[RF Prediction](#kw:running-a-full-rf-prediction:none)** tool in the left toolbar.

### Step 3 — Configure Parameters

| Parameter | Description | Recommendation |
|---|---|---|
| **Technology** | 4G (LTE) or 5G (NR) | Match your cell technology |
| **Resolution** | Pixel size in metres | 50–100 m for quick checks; 10–25 m for final results |
| **Best server count** | How many best servers to calculate per pixel | Minimum 3; use 5 for interference analysis |
| **Prediction model** | The propagation formula to use | Select the model configured for your area |

### Step 4 — Calculate

Click **Calculate**. The prediction job is submitted to the CE Express server.

Monitor progress in **[Prediction History](#kw:44-step-4-prediction-history-and-result-management:ce-express-tr-rf)** (panel at the bottom of the screen):
- 🟡 Yellow = calculating
- 🟢 Green = complete
- 🔴 Red = error

## Quick RF Prediction

Quick RF is a fast, single-cell field strength preview. Use it for a rapid sanity check without running a full job.

1. Open the **[Quick RF Prediction](#kw:quick-rf-prediction:none)** tool.
2. Set **Resolution** to 1 for best quality.
3. Hold **CTRL** and click on a cell — the prediction runs instantly.
4. View results in **Layers → [Prediction results](#kw:viewing-results:none)**.

> Quick RF calculates field strength only. For [RSRP](#kw:typical-rsrp-thresholds:none), SINR, throughput, and multi-cell best server analysis, use the full [RF Prediction](#kw:running-a-full-rf-prediction:none) tool.

## Prediction Outputs

| Output Layer | Unit | Description |
|---|---|---|
| [RSRP](#kw:typical-rsrp-thresholds:none) (1st–5th server) | dBm | Reference Signal Received Power per best server |
| Best Server ID (1st–5th) | Cell ID | Which cell is strongest at each point |
| RSSI | dBm | Total received power including interference |
| RSRQ | dB | Signal quality relative to total received power |
| RS-SINR | dB | Signal-to-Interference-plus-Noise Ratio |
| Downlink Throughput | Mbps | Estimated DL data rate |
| Uplink Field Strength | dBm | Uplink signal level |
| UL SINR | dB | Uplink signal quality |
| UL Throughput | Mbps | Estimated UL data rate |
| Total DL Throughput | Mbps | Combined throughput from all best servers |

## Typical RSRP Thresholds

| RSRP (dBm) | Quality |
|---|---|
| > −80 | Excellent |
| −80 to −90 | Good |
| −90 to −100 | Fair |
| −100 to −110 | Poor (marginal outdoor) |
| < −110 | Very poor / no coverage |

## Viewing Results

1. In **[Prediction History](#kw:44-step-4-prediction-history-and-result-management:ce-express-tr-rf)**, click the completed result row to load it on the map.
2. In the **Layers** panel, toggle between RSRP, SINR, Best Server, and Throughput views.
3. Click any point on the map to see the exact predicted value at that location.

## Prediction Models

Prediction [models](#kw:31-models:ce-express-tr-models) define how path loss is calculated. Go to the **Prediction [Models](#kw:31-models:ce-express-tr-models)** tool to configure:

- Propagation formula (e.g. Okumura-Hata, Cost231, 3GPP)
- Frequency and band
- [Clutter](#kw:clutter-classification-values:ce-express-geodata) loss coefficients (requires `clutterClasses.tif`)
- Diffraction and morphology settings

Each model is assigned to a workspace. You can have different models for different project areas.

## Related Pages

- Quick Start Guide
- Publishing to Portal — sharing results with your team
- Geodata & Rasters
- [Troubleshooting](#kw:troubleshooting-login-issues:ce-express-login)
