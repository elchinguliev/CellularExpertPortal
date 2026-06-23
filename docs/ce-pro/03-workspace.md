---
id: ce-pro-workspace
title: Creating and Managing Workspaces
product: CE Pro
version: "4.9"
category: Getting Started
order: 3
related:
  - ce-pro-geodata
  - ce-pro-objects
  - geodata-requirements
---

# Workspaces in CE Desktop Pro

A CE Desktop **workspace** is an ArcGIS Pro project (`.aprx`) linked to a CE geodatabase containing all network objects, geodata references, and calculation results.

## Workspace Tool

Access via **CE toolbar → Workspace Tool**.

The Workspace Table shows all workspaces in the current geodatabase:

| Column | Description |
|--------|-------------|
| Name | Workspace name |
| Coordinate System | Projected CS used in this workspace |
| Created | Creation date |
| Modified | Last modification date |

## Creating a Workspace

Click **Create Workspace** in the Workspace Tool.

### Step 1: Workspace Path

Choose the **File Geodatabase** (.gdb) location:
- **New geodatabase:** Click Browse → choose folder → enter GDB name → CE creates the schema
- **Existing geodatabase:** Browse to existing `.gdb` → adds a new workspace

For **Enterprise Geodatabase** (multi-user):
- Enter the database connection string
- Requires SDE connection file or direct connection parameters

### Step 2: Workspace Name

Enter a descriptive name. Avoid special characters.

### Step 3: Geodata Folder Path

Browse to the folder containing your geodata files (DEM, clutter, buildings, antennas). CE scans this folder and lists available datasets.

### Step 4: Coordinate System

⚠️ **Critical — choose carefully:**
- Must be a **projected coordinate system** (UTM, national grid)
- Must match your geodata projection
- Cannot be changed after objects are created

Click **Select Coordinate System** → browse or search for EPSG code (e.g., search "UTM Zone 35N" → EPSG:32635).

### Step 5: Local Scene (Optional)

Enable **Also create Local Scene** to add a 3D scene view alongside the 2D map. Required for 3D RF prediction visualization.

### Step 6: Create

Click **Create** → CE builds the workspace schema:
- Feature classes: Sites, Cells, Links, Radars, Repeaters, CPE, Measurements
- Prediction result tables and raster catalogs
- Antenna library table
- Workspace settings table

## Opening a Workspace

Workspace Tool → **Open Workspace** → select from table → click Open.

The workspace is added as a layer group in the ArcGIS Pro map.

## Removing a Workspace

Workspace Tool → **Remove Workspace** → select → Remove.

> This removes the workspace from the current project view. The geodatabase data is **not deleted**.

## Workspace Upgrade

When upgrading CE Desktop, existing workspaces may need schema upgrades:

Workspace Tool → **Workspace Upgrade** → select workspace → click Upgrade.

Always **back up** your geodatabase before upgrading.

## Workspace Properties

View and edit workspace settings:

| Property | Description |
|----------|-------------|
| Name | Workspace display name |
| Coordinate System | Read-only after creation |
| Geodata folder | Path to geodata files |
| Calculation settings | Default resolution, prediction radius |
| Display settings | Symbol sizes, label settings |

## CE Express Connection

CE Desktop can connect to a CE Express server to sync network objects:

1. Workspace Tool → **CE Express Connection** → **Properties**
2. Enter CE Express URL and credentials
3. Sync objects between desktop workspace and server workspace

---

## Best Practices

- Always use a **projected coordinate system** matching your geodata
- Store the geodatabase on a **local SSD** for best performance (not a network drive)
- Use a **separate geodatabase per project** or per geographic area
- Back up `.gdb` regularly — use copy/paste or ArcGIS backup tools

## Related Topics

- [Geographic Data in CE Desktop →](#ce-pro-geodata)
- [Adding Network Objects →](#ce-pro-objects)
- [Geodata Requirements →](#geodata-requirements)
