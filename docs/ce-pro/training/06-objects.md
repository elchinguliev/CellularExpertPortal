# 06. Creating Objects

> **Version:** CE Pro v4.9

> **Version:** CE Pro v4.9

## Overview

CE Pro objects (Cells, Sites, Links, etc.) are stored as feature classes in the Workspace geodatabase. You can create them in three ways: import from file, create manually on the map, or duplicate existing objects.

---

## Methods for Creating Objects

| Method | Best For |
|---|---|
| Import from text/CSV | Bulk creation from existing network data |
| Add Object tool (manual) | One-off additions directly on the map |
| Duplicate existing object | Copying an object with similar parameters |
| Move existing object | Relocating a cell or site to a new position |

---

## Manual Creation — Steps to Create a Cell

### Step 1 — Define Location

Choose one of these coordinate input methods:

- **Projected coordinate system** — enter X and Y values in metres
- **Geographic coordinate system** — enter Latitude and Longitude in decimal degrees
- **Click on map** — click the desired point; coordinates are filled automatically

If placing by map click, also define the **Azimuth** (direction from north, 0–360°).

### Step 2 — Define Name

The **Cell Name** must be unique within the project. It is also used as the Best Server identifier in prediction outputs.

### Step 3 — Choose Template or Fill Parameters Manually

- **Template**: select a pre-configured template that auto-fills standard RF parameters (frequency, power, antenna, etc.)
- **Manual**: fill in each parameter individually

---

## Templates

Templates speed up object creation by pre-populating common parameter sets.

- Managed under **CE Desktop → Template Manager**
- Can be stored in the workspace or in a shared table
- Once applied, individual parameters can still be overridden per object

---

## Creating a Cell — Key Parameters

| Parameter | Field Name | Unit | Example |
|---|---|---|---|
| Cell name | cell_name | text | `5GCell_001` |
| Site name | site_name | text | `Site_Vilnius_01` |
| Latitude | latitude | decimal degrees | `54.6872` |
| Longitude | longitude | decimal degrees | `25.2797` |
| Height above ground | height | metres | `30` |
| Azimuth | azimuth | degrees | `120` |
| Mechanical tilt | tilt | degrees | `2` |
| Frequency | frequency | MHz | `3500` |
| Power | power | dBm | `40` |
| Antenna gain | antenna_gain | dBi | `18.2` |
| Misc. loss | misc_loss | dB | `1` |
| Technology | technology | text | `5G` |

> **Note:** RF prediction does **not** require a Site object — a Cell can exist independently. Sites are used for grouping and visual organisation.

---

## Creating a Site

1. Click **Add Object → Site**
2. Place the site on the map or enter coordinates
3. Enter a unique **Site Name**
4. Optionally link existing cells to this site via the **site_name** field on each cell

---

## Creating a Link (Microwave / RL)

1. Click **Add Object → Link**
2. Click the **start point** (Tx site) on the map
3. Click the **end point** (Rx site) on the map
4. Enter link parameters: frequency, Tx power, antenna types, feeder losses
5. Click **Create**

---

## Duplicating Objects

1. Select one or more objects on the map
2. Right-click → **Duplicate**
3. The duplicate is placed at the same location with all parameters copied
4. Move it to the new position and update the name

---

## Moving Objects

1. Select the object on the map
2. Click **Move Object** in the CE toolbar, or drag the object directly
3. The coordinates are updated automatically in the attribute table

---

## Import from Text / CSV

For bulk import:

1. Click **CE Desktop → Import → From Text**
2. Select your CSV file (must include at minimum: cell_name, latitude, longitude)
3. Map CSV columns to CE field names
4. Click **Import**

See `C:\CE_Course\0. Descriptions\2. Import.pdf` for the full field mapping reference.

---

**Exercise:** `C:\CE_Course\0. Descriptions\3. Create Objects.pdf`

**Contact:** info@cellular-expert.com | +370 5 2150575 | www.cellular-expert.com
