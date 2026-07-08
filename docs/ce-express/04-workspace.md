---
id: ce-express-workspace
title: Workspaces
product: CE Express
version: "7.3"
category: Getting Started
order: 4
related:
  - ce-express-features
  - ce-express-geodata-sets
  - geodata-requirements
  - ce-express-admin-workspace
---

# Workspaces

> **Version:** CE Express v7.2

A **[workspace](#kw:creating-a-workspace:none)** is a project container in CE Express that holds all [network objects](#kw:object-types:ce-express-network-objects), geodata references, and settings for a specific planning area.

## What a Workspace Contains

- [Network objects](#kw:object-types:ce-express-network-objects) (sites, cells, links, repeaters, etc.)
- Geodata set reference (terrain, [clutter](#kw:clutter-classification-values:ce-express-geodata), buildings)
- Coordinate system ([EPSG](#kw:what-is-a-projected-[crs](#kw:check-crs:ce-express-geodata):ce-express-geodata) code)
- Visualization layers (external services, GIS layers)
- User group assignments
- [Calculation settings](#kw:calculation-settings:none) (EIRP, height references, [clutter](#kw:clutter-classification-values:ce-express-geodata) use)

Workspaces can be:
- Assigned to one or multiple user groups
- Used collaboratively by RF planners, engineers, and managers
- Reused as templates for similar geographic areas

## Switching Workspaces

Click the **Workspaces** tool in the left toolbar. The active [workspace](#kw:creating-a-workspace:none) name is shown.

- Click any [workspace](#kw:creating-a-workspace:none) to switch to it
- The map automatically zooms to the workspace extent
- Only objects defined for that workspace are visible

**Show only workspaces in view:** Enable this option to filter the list to workspaces visible in the current map viewport.

## Creating a Workspace

Click **New workspace** in the Workspaces panel.

### General Settings

| Field | Description |
|-------|-------------|
| **Workspace name** | Unique workspace identifier |
| **Coordinate system [EPSG](#kw:what-is-a-projected-[crs](#kw:check-crs:ce-express-geodata):ce-express-geodata)** | [EPSG](#kw:what-is-a-projected-[crs](#kw:check-crs:ce-express-geodata):ce-express-geodata) code of the [projected coordinate](#kw:what-is-a-projected-crs:ce-express-geodata) system. Default: 4326 ([WGS84](#kw:what-is-a-projected-crs:ce-express-geodata)). **Use a projected system ([UTM](#kw:what-is-a-projected-crs:ce-express-geodata), national grid) for accurate distance calculations.** |
| **Group** | Group workspaces by setting the same value for multiple workspaces |
| **Locked** | Prevents feature editing. Only admins can unlock. Use for archiving. |

### Extent Settings

Defines where the map zooms when the workspace loads:

| Field | Description |
|-------|-------------|
| **Draw on map** | Click on map to draw the extent rectangle |
| **Min. X / Min. Y** | Bottom-left corner (in workspace EPSG) |
| **Max. X / Max. Y** | Top-right corner (in workspace EPSG) |

### Coordinate Origin

Origin point from which coordinates are displayed in the UI. Global coordinates are always stored in the database regardless of this setting.

### Calculation Settings

| Setting | Options | Description |
|---------|---------|-------------|
| **Calculate EIRP** | Enabled/Disabled | Enabled: EIRP = Power − Misc. Loss + Antenna Gain. Disabled: Power value used as EIRP. |
| **Use [clutter](#kw:clutter-classification-values:ce-express-geodata)** | On/Off | Whether Clutter Loss is applied in predictions |
| **Transmitter height reference** | Elevation / Clutter height (buildings only) / Clutter height / Absolute | How absolute transmitter height is calculated |
| **Receiver height reference** | Same options | How absolute receiver height is calculated |
| **Geodata set** | Select from list | Geodata used in all calculations in this workspace |

### Extra Layers

Add external map layers:

| Field | Description |
|-------|-------------|
| **URL / Portal ItemID** | Direct URL or ArcGIS Portal Item ID |
| **Title** | Layer name in the layer list |
| **Opacity** | Layer transparency (0–100%) |
| **Visible** | Show/hide on load |
| **Group** | Assign to a layer group |

### Feature Naming Schemes

Automatic feature name setting based on existing features. For example: if naming scheme is "1,2,3..." and Cells 1, 2, 3 exist, the next cell placed will automatically be named "4".

## Editing a Workspace

Hover over a workspace item → click **Edit Workspace** to modify settings.

## Duplicating a Workspace

Hover over a workspace → click **Duplicate Workspace** to create a copy with all settings.

## Deleting a Workspace

Hover over a workspace → click **Delete Workspace**. 

> ⚠️ [Deleting a workspace](#kw:deleting-a-workspace:none) removes all objects associated with it. This action cannot be undone.

## Related Topics

- Geodata Sets →
- Geodata Requirements →
- [Creating a Workspace](#kw:creating-a-workspace:none) (Admin) →
- Features — [Adding Objects](#kw:adding-objects-manually:ce-express-network-objects) →
