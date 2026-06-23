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

A **workspace** is a project container in [CE Express](https://www.google.com/search?q=Cellular+Expert+CE+Express+web+platform) that holds all network objects, geodata references, and settings for a specific planning area.

## What a Workspace Contains

- Network objects (sites, cells, links, repeaters, etc.)
- Geodata set reference (terrain, [clutter](https://www.google.com/search?q=clutter+land+use+classification+radio+planning), buildings)
- Coordinate system ([EPSG](https://www.google.com/search?q=EPSG+coordinate+reference+system+code) code)
- Visualization layers (external services, [GIS](https://www.google.com/search?q=GIS+Geographic+Information+System) layers)
- User group assignments
- Calculation settings ([EIRP](https://www.google.com/search?q=EIRP+Effective+Isotropic+Radiated+Power), height references, clutter use)

Workspaces can be:
- Assigned to one or multiple user groups
- Used collaboratively by RF planners, engineers, and managers
- Reused as templates for similar geographic areas

## Switching Workspaces

Click the **Workspaces** tool in the left toolbar. The active workspace name is shown.

- Click any workspace to switch to it
- The map automatically zooms to the workspace extent
- Only objects defined for that workspace are visible

**Show only workspaces in view:** Enable this option to filter the list to workspaces visible in the current map viewport.

## Creating a Workspace

Click **New workspace** in the Workspaces panel.

### General Settings

| Field | Description |
|-------|-------------|
| **Workspace name** | Unique workspace identifier |
| **Coordinate system EPSG** | EPSG code of the projected coordinate system. Default: 4326 ([WGS84](https://www.google.com/search?q=WGS84+geographic+coordinate+system+EPSG+4326)). **Use a projected system ([UTM](https://www.google.com/search?q=UTM+Universal+Transverse+Mercator+projection), national grid) for accurate distance calculations.** |
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
| **Use clutter** | On/Off | Whether Clutter Loss is applied in predictions |
| **Transmitter height reference** | Elevation / Clutter height (buildings only) / Clutter height / Absolute | How absolute transmitter height is calculated |
| **Receiver height reference** | Same options | How absolute receiver height is calculated |
| **Geodata set** | Select from list | Geodata used in all calculations in this workspace |

### Extra Layers

Add external map layers:

| Field | Description |
|-------|-------------|
| **URL / Portal ItemID** | Direct URL or [ArcGIS Portal](https://www.google.com/search?q=ArcGIS+Portal+enterprise+GIS) Item ID |
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

> ⚠️ Deleting a workspace removes all objects associated with it. This action cannot be undone.

## Related Topics

- [Geodata Sets →](#ce-express-geodata-sets)
- [Geodata Requirements →](#geodata-requirements)
- [Creating a Workspace (Admin) →](#ce-express-admin-workspace)
- [Features — Adding Objects →](#ce-express-features)
