---
id: training-rf-prediction
title: "Training 04: RF Prediction and Scenario Analysis"
product: CE Express
category: Training
order: 4
related:
  - ce-express-rf-prediction
  - ce-express-quick-rf
  - ce-express-prediction-models
  - ce-express-prediction-history
---

# Training Module 04 — RF Prediction and Scenario Analysis

**Duration:** ~2 hours | **Level:** Intermediate

## Objectives

By the end of this module, you will be able to:

- Run **Quick RF Predictions** for what-if testing
- Run **full RF Predictions** for one or [multiple cells](#kw:47-step-7-rf-prediction-for-multiple-cells:ce-express-tr-rf)
- Understand how geodata influences prediction calculations
- Visualize and customize [prediction results](#kw:viewing-results:ce-express-rf-prediction)
- [Compare](#kw:98-compare-predictions:ce-pro-rcp) multiple [prediction outputs](#kw:prediction-outputs:ce-express-rf-prediction)
- Use Networks for batch predictions

## Key Concepts

### What Is an RF Prediction?

An [RF prediction](#kw:what-is-an-rf-prediction:none) produces **map-based raster outputs** representing expected signal or performance. These are influenced by:

- [Network objects](#kw:object-types:ce-express-network-objects) (cells, sites, antennas — azimuth, tilt, height, power, frequency)
- Geodata (terrain elevation, [clutter](#kw:clutter-classification-values:ce-express-geodata)/land use, obstacles)
- Equipment definitions ([antenna patterns](#kw:importing-antenna-patterns:ce-express-antenna), propagation [models](#kw:31-models:ce-express-tr-models), calculation templates)

**→ Full documentation: [RF Prediction](#kw:what-is-an-rf-prediction:none) →**

### Quick Prediction vs Full RF Prediction

| Feature | Quick RF | Full RF |
|---------|----------|---------|
| Speed | Instant | Standard |
| DB impact | No changes to database | Saves to [prediction history](#kw:44-step-4-prediction-history-and-result-management:ce-express-tr-rf) |
| Use case | What-if, parameter comparison | Final results, reporting |

## Exercise 1 — Quick RF Prediction

1. Select a cell on the map (single click)
2. Click **[Quick RF Prediction](#kw:quick-rf-prediction:ce-express-rf-prediction)** in the left toolbar
3. Change the azimuth to 90° in the Quick RF panel
4. Click **Run** — result appears immediately on the map
5. Change azimuth to 180° → **Run** again
6. [Compare](#kw:98-compare-predictions:ce-pro-rcp) the two results

**Observe:** The database has NOT been changed. This is for testing only.

## Exercise 2 — Full RF Prediction

1. Select 3 cells on the map (use Rectangle selection)
2. Click **[RF Prediction](#kw:what-is-an-rf-prediction:none)** in the left toolbar
3. Set parameters:
   - Prediction type: **Coverage (signal level)**
   - Resolution: **50 m**
   - Radius: **15 km**
   - Propagation model: **COST-231 Hata**
4. Click **Run**
5. Wait for the prediction to complete (watch the progress bar)
6. View results in the [Prediction History](#kw:44-step-4-prediction-history-and-result-management:ce-express-tr-rf) panel

**→ Prediction [models](#kw:31-models:ce-express-tr-models) documentation: Prediction Models →**

## Exercise 3 — Best Server Prediction

1. Select all cells in an area (use Polygon selection)
2. [RF Prediction](#kw:what-is-an-rf-prediction:none) → Prediction type: **[Best Server](#kw:exercise-3-best-server-prediction:none)**
3. Resolution: **50 m** | Radius: **20 km**
4. Click **Run**
5. Observe which cell "wins" each area

## Exercise 4 — Network-Based Prediction

1. Click **Networks** tool in the left toolbar
2. Click **New network**
3. Name: `Training_4G_Network`
4. Feature type: **Cells**
5. Filter by attribute: Technology = **4G**
6. Click **Save**
7. In the network item → click **Calculate**
8. All 4G cells are calculated automatically

**→ Networks documentation: Networks Tool →**

## Exercise 5 — Comparing Predictions

1. Open **Prediction History**
2. Enable two different [prediction results](#kw:viewing-results:ce-express-rf-prediction)
3. Use the **opacity slider** to switch between them
4. Click **Compare** to view side-by-side statistics

## Exercise 6 — Exporting Results

1. In Prediction History → select a result layer
2. Click **Export** → save as GeoTIFF
3. The raster file can be used in other GIS software or shared with clients

## Related Documentation

- **[RF Prediction](#kw:what-is-an-rf-prediction:none):** [RF Prediction](#kw:what-is-an-rf-prediction:none) →
- **Quick RF:** [Quick RF Prediction](#kw:quick-rf-prediction:ce-express-rf-prediction) →
- **Prediction Models:** Prediction Models →
- **[Troubleshooting](#kw:troubleshooting-login-issues:ce-express-login):** RF Prediction [Troubleshooting](#kw:troubleshooting-login-issues:ce-express-login) →
