# Workspaces

> **Version:** CE Express v7.2

A **[workspace](#kw:what-a-workspace-contains:none)** is the top-level project container in CE Express. Each [workspace](#kw:what-a-workspace-contains:none) links your [network objects](#kw:object-types:ce-express-network-objects) to a geodata folder (terrain and [clutter](#kw:clutter-classification-values:ce-express-geodata) rasters) and a set of prediction model settings. You must have a [workspace](#kw:what-a-workspace-contains:none) selected before you can view objects on the map or run RF predictions.

## What a Workspace Contains

- [Network objects](#kw:object-types:ce-express-network-objects) (sites, cells, repeaters) stored in the PostgreSQL database
- A reference to the **geodata folder** on the server (elevation.tif, [clutter](#kw:clutter-classification-values:ce-express-geodata) files)
- The **coordinate reference system ([CRS](#kw:check-crs:ce-express-geodata))** for that project area
- Assigned **prediction model** configurations

## Opening the Workspace Tool

Click the **Workspace** icon in the left toolbar of [Map View](#kw:switching-between-views:ce-express-login).

## Selecting a Workspace

1. Open the [Workspace tool](#kw:opening-the-workspace-tool:none).
2. Click on a workspace name to select it.
3. The map loads all [network objects](#kw:object-types:ce-express-network-objects) from that workspace.

> If no workspaces appear, contact your administrator — workspaces must be created and shared with your ArcGIS user account.

## Creating a New Workspace

1. Open the [Workspace tool](#kw:opening-the-workspace-tool:none).
2. Click **Create New Workspace**.
3. Fill in the fields:

| Field | Description |
|---|---|
| **Name** | A descriptive name for the project (e.g. "Vilnius 4G Q1 2025") |
| **Geodata folder** | Server path to the folder containing `elevation.tif` and optional [clutter](#kw:clutter-classification-values:ce-express-geodata) rasters |
| **Coordinate system** | Must match the [CRS](#kw:check-crs:ce-express-geodata) of your GeoTIFF rasters ([Projected CRS](#kw:what-is-a-projected-[crs](#kw:check-crs:ce-express-geodata):ce-express-geodata), not geographic/[WGS84](#kw:what-is-a-projected-crs:ce-express-geodata)) |

4. Click **Save**.

## Duplicating a Workspace

Duplicating is useful when you want to test changes without affecting an existing project.

1. Open the [Workspace tool](#kw:opening-the-workspace-tool:none).
2. Hover over the workspace you want to copy — three icons appear on the right.
3. Click the **Duplicate** icon (two overlapping pages).
4. Enter a name for the new workspace.
5. Click **OK**.

> If the new workspace does not appear immediately, refresh the page.

The duplicate inherits all settings from the original. Network objects are **not** copied — both workspaces read from the same database table. To work on a separate copy of the objects, use the Import/Export tools.

## Editing Workspace Settings

1. Hover over the workspace → click the **Settings** icon (gear).
2. Update the geodata folder path or coordinate system as needed.
3. Click **Save**.

## Deleting a Workspace

1. Hover over the workspace → click the **Delete** icon (bin).
2. Confirm deletion.

> [Deleting a workspace](#kw:deleting-a-workspace:none) does **not** delete the network objects in the database — only the workspace container and its settings are removed.

## Related Pages

- Geodata & Rasters — preparing elevation.tif and clutter files
- RF Prediction — prediction model settings
- Network Objects — managing sites and cells within a workspace
