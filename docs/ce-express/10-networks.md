---
id: ce-express-networks
title: Networks — Batch Management and Prediction
product: CE Express
version: "7.3"
category: Network Management
order: 10
related:
  - ce-express-rf-prediction
  - ce-express-features
---

# Networks Tool

> **Version:** CE Express v7.2

The **Networks** tool allows management of multiple objects grouped together — enabling batch predictions, attribute tracking, and calculation without manual selection each time.

## What a Network Shows

For each network item:

| Info | Description |
|------|-------------|
| **Feature type** | Type of objects in the network (Cells, Sites, etc.) |
| **Feature count** | Total number of objects |
| **Uncalculated features** | Objects not yet added to a calculation |
| **Calculation status** | Current [batch prediction](#kw:running-batch-predictions:none) status |
| **Last calculated** | Timestamp of last calculation run |

## Creating a Network

Click **New network**:

| Field | Description |
|-------|-------------|
| **Network name** | Identifier for this network |
| **Feature type** | Type of objects to group (Cells, Repeaters, etc.) |
| **Feature filter** | By attribute or From selection |

**Filter options:**
- **By attribute** — filter features by a specific attribute value (e.g., Technology = "4G")
- **From selection** — include currently selected objects on the map

## Running Batch Predictions

Select a network → click **Calculate** → predictions run for all objects in the network without manual selection.

## Managing Results

From the Results section of a network:
- **Open** — display the prediction result layer on the map
- **Export** — save result as GeoTIFF raster
- Toggle result layers on/off

## Network Publishing Settings

Configure automatic publishing when the network is recalculated:
1. Open the calculation result layer → configure colour band values
2. Enable **auto-publish** in publishing settings
3. When the network recalculates, results are automatically published to ArcGIS Portal+Portal+enterprise+GIS) as a feature layer

## Editing a Network

Hover over a network item → **Edit Network** to modify parameters.

## Deleting a Network

Hover → **Delete Network**. Only the network definition is deleted — objects remain in the database.

## Related Topics

- RF Prediction →
- [Prediction History](#kw:44-step-4-prediction-history-and-result-management:ce-express-tr-rf) →
- Features Tool →
