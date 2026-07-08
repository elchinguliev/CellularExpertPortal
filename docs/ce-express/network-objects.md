# Network Objects

> **Version:** CE Express v7.2

[Network objects](#kw:object-types:none) are the radio infrastructure elements managed in CE Express: **sites**, **cells**, and **repeaters**. All objects are stored in the PostgreSQL database and are visible on the map when a workspace is selected.

## Object Types

| Type | Description |
|---|---|
| **Site** | A physical location (tower, rooftop, pole) that hosts one or more cells |
| **Cell** | A single radio sector — one antenna with defined position, direction, frequency, and power |
| **Repeater** | A signal booster that receives and retransmits a cell's signal |

## Required Cell Attributes

| Attribute | Description |
|---|---|
| `cell_name` | Unique identifier for the cell |
| `latitude` | [WGS84](#kw:what-is-a-projected-[crs](#kw:check-crs:ce-express-geodata):ce-express-geodata) decimal degrees (e.g. 54.6872) |
| `longitude` | [WGS84](#kw:what-is-a-projected-[crs](#kw:check-crs:ce-express-geodata):ce-express-geodata) decimal degrees (e.g. 25.2797) |

## Common Optional Attributes

| Attribute | Description |
|---|---|
| `site_name` | Parent site name |
| `height` | Antenna height above ground (metres) |
| `azimuth` | Horizontal direction the antenna faces (0–360°, clockwise from north) |
| `tilt` | Vertical downtilt angle (degrees) |
| `frequency_mhz` | Operating frequency in MHz (e.g. 1800, 2100, 3500) |
| `power_dbm` | Transmit power in dBm |
| `technology` | Radio technology: `2G`, `3G`, `4G`, or `5G` |
| `antenna_pattern` | Name of the assigned [antenna pattern](#kw:managing-the-antenna-library:ce-express-antenna) file |

## Adding Objects Manually

1. Open **Network [Data Management](#kw:31-data-management-tools:inventory3d-user-guide)** (button in top toolbar).
2. Click **Add New Record**.
3. Fill in `cell_name`, `latitude`, and `longitude` (minimum required).
4. Fill in any additional attributes.
5. Click **Save**.
6. Click **Synchronize Changes** to push to the database and display on the map.

## Importing Objects from CSV

Bulk import is the fastest way to add many cells at once.

1. Open **Network [Data Management](#kw:31-data-management-tools:inventory3d-user-guide)**.
2. Click **Import**.
3. Select your CSV file. The file must have a header row with column names matching CE Express field names.
4. Map any columns that don't match automatically.
5. Click **Import**.
6. Click **Synchronize Changes** to confirm.

### CSV Template

Minimum required columns:
```
cell_name,latitude,longitude
```

Full template:
```
cell_name,site_name,latitude,longitude,height,azimuth,tilt,frequency_mhz,power_dbm,technology,antenna_pattern
SITE01_A,SITE01,54.6872,25.2797,30,0,3,1800,43,4G,
SITE01_B,SITE01,54.6872,25.2797,30,120,3,1800,43,4G,
SITE01_C,SITE01,54.6872,25.2797,30,240,3,1800,43,4G,
```

> Download the template from the Downloads page.

## Editing Objects

### On the Map

Click an object to select it. Its attributes appear in the side panel where you can edit them inline.

### In the Table

Switch to Network Data Management, find the row, and click any cell to edit it. Click **Synchronize Changes** when done.

## Moving an Object

1. Select the object on the map.
2. Click the **Move** tool in the toolbar.
3. Click the new position on the map — a yellow dot marks it and coordinates update automatically.
   - Alternatively, type new latitude/longitude values directly.
4. Click **Accept** to confirm.

## Duplicating Objects

1. Select the objects to duplicate (use Rectangle Selection for multiple).
2. Click **Duplicate selected objects**.
3. Choose the target workspace from the dropdown.
4. Set the new position by clicking the map or entering coordinates.
5. Click **Accept**.

## Deleting Objects

Select the object → right-click → **Delete**, or select the row in Network Data Management and click **Delete Record**.

> In Inventory3D, permanent deletion requires the **Delete Object Permanently** admin function. Standard deletion in CE Express moves objects to a soft-deleted state.

## Selecting Multiple Objects

Use the **Rectangle Selection** tool to draw a box on the map and select all objects within it. Then use **Show In Table → Cells** to view and bulk-edit their attributes.

## Related Pages

- [Antenna Patterns](#kw:importing-antenna-patterns:ce-express-antenna) — assigning patterns to cells
- RF Prediction — running predictions on selected cells
- Workspaces — workspace and database overview
