---
id: ce-express-features
title: Features — Adding and Managing Network Objects
product: CE Express
version: "7.3"
category: Network Objects
order: 5
related:
  - ce-express-workspace
  - network-object-requirements
  - ce-express-rf-prediction
---

# Features Tool

The **Features** tool is used to import, add, select, and edit all network objects on the map.

Click the **Features** button in the left toolbar to open the tool.

## Importing Features

Click **Import features** to create objects from a file.

### Supported Formats

- **CSV** — comma-separated values
- **KMZ** — Google Earth format

### Import Steps

1. Click **Import features**
2. Select the **object type** (Site, Cell, Repeater, Mesh Node, etc.)
3. Select or drag-and-drop your CSV or KMZ file
4. Map columns using the **Mapping** feature if field names differ from CE format
5. Click **Import** — objects appear on the map automatically

### Column Mapping

Enable **Use mapping** to align your file's field names with CE database fields:

| Field | Description |
|-------|-------------|
| **Source** | Column name in your data file |
| **Fill** | Default value when the field is empty in the file |

**Mapping Presets:** Save frequently used mappings as presets → click **New mapping preset** → name it → apply next time automatically.

---

## Adding Features (Manual)

Click **Add features** → select object type → place on map.

Objects can be created:
- From **feature set templates** (pre-configured groups)
- From **zero** (define all parameters manually)

### Feature Set Templates

A feature set template saves a group of related features (e.g., a 3-sector site with typical parameters) so they can be placed with a single click.

**Quick Add:** If you have templates marked as favorites, they appear in the Quick Add section — drag and drop directly onto the map to place.

---

## Network Object Types

### Site

A physical tower or mast location.

**Required:**
- Site name (unique identifier)
- X coordinate (projected)
- Y coordinate (projected)

**Optional:**
- Height above terrain (m)

### Cell

A radio sector or cell on a site.

**Required:** Cell name, X, Y, Azimuth (0–360°, direction from North)

**Optional parameters:**

| Parameter | Unit | Description |
|-----------|------|-------------|
| Height | m | Height above terrain |
| Downtilt | deg | Mechanical tilt |
| El. Downtilt | deg | Electrical tilt |
| Frequency | MHz | Carrier frequency |
| Power | dBm | Transmit power |
| Misc. loss | dB | Cable and connector losses |
| Bandwidth | MHz | Required for 4G/5G. Use 0.015 for 2G/3G. |
| Noise figure | dB | Required for 4G/5G |
| Downlink duplex factor | 0–1 | For TDD (4G/5G). 0.7 = 70% DL, 30% UL. |
| Subcarrier spacing | kHz | Required for 4G/5G. Use 15 for 2G/3G. |
| Tx MIMO | — | 1, 2, 4, 8, 16, 32, or 64 |
| Rx MIMO | — | 1, 2, 4, 8, 16, 32, or 64 |
| Active antenna effect | dB | For massive MIMO. MIMO 32×32: use 6. MIMO 64×64: use 9. |
| Cell load | % | 0–100. Higher load = lower DL throughput. |
| Technology | — | 2G, 3G, 4G, or 5G |
| Duplex mode | FDD/TDD | Required for 4G/5G. Use FDD for 2G/3G. |
| Prediction model | — | Path loss model for this cell |
| Antenna | — | Antenna pattern from library |
| Site ID | — | Parent site reference |

**Color index:** Controls cell visualization color (None=blue, 1=red, 2=light green, 3=dark green, 4=light blue, 5=dark blue, 6=purple).

### Repeater

A signal repeater/booster.

**Required:** Name, X, Y, Azimuth

**Optional:** Height, Downtilt, Electrical tilt, Frequency (MHz), Power thresholds (1-2-3) and corresponding Power values (dBm), Misc loss, Bandwidth, Subcarrier spacing, Tx/Rx MIMO, Technology, Prediction model, Antenna

### Radar

**Required:** Name, X, Y

**Optional:** Height (m), Downtilt, Frequency (MHz), Power (dBm), Misc Loss (dB), View Angle (vertical field of view in degrees), Prediction model

### CPE (Customer Premises Equipment)

**Required:** Name, X, Y

**Optional:** Height, Azimuth, Antenna, Power (dBm), Misc loss (dB), Cell ID (parent cell), Throughput (Mb/s), Status, Notes

### Measurements

Drive-test or field measurement points.

**Required:** Field strength (dB), X, Y, Cell ID (binds measurement to a cell)

### Siren

Sound prediction source.

**Required:** Name, X, Y, Azimuth

**Optional:** Height (m), Downtilt, Frequency (MHz), Power (dBm), Misc loss (dB)

> ⚠️ Prediction model: **ISO9613 only** can be applied for sound loss calculations.

### Light

Lighting point source for lux calculations.

**Required:** Name, X, Y, Azimuth

**Optional:** Height (m), Downtilt, Antenna (light pattern)

### Mesh Node

Node in a wireless mesh network.

**Required:** Name, X, Y

**Optional:** Height (m), Frequency (MHz), Power (dBm), Misc Loss (dB), Prediction model, Antenna, Sensitivity, Max connections, Layer (priority), Group name, Status, Type

---

## Selecting Objects

Selection modes:

| Mode | How to Use |
|------|-----------|
| **Rectangle** | Click once → move mouse → click again to define area |
| **Single click** | Click directly on an object |
| **Radius** | Set distance → click map → selects all objects within radius |
| **Polygon** | Click vertices → double-click to close and select |
| **Polygon layer** | Choose a polygon layer → click on map → selects objects within polygon |

Selected objects are highlighted on the map and listed in the Features panel.

**Controls:**
- **Clear selection** — deselects all
- **Search** — filter the selected objects list
- **Show in table** — open the attribute table for selected objects
- **Show only selected features** — hide non-selected objects in the list

---

## Editing Objects

Hover over any object in the Features list → click to open the edit dialog on the right.

- **Accept** — saves all changes
- **Cancel** — discards changes

Hover over a feature item for quick actions:
- **View from perspective** — viewpoint from the cell's position
- **Highlight feature** — highlight on map
- **Duplicate feature** — create a copy
- **Delete feature** — remove from map and database

---

## Move / Duplicate / Delete / Publish Selected

Select objects on the map, then:

- **Move** — drag selected objects to new location → Accept to save
- **Duplicate** — copy objects, optionally to another workspace → Accept to save
- **Delete** — removes from map and database → Accept to confirm
- **Publish** — publish selected features as an ArcGIS Portal feature layer (select sharing: organization/public/groups)

---

## Related Topics

- [Network Object Requirements →](#network-object-requirements)
- [Importing Data (Training) →](#training-import-data)
- [RF Prediction →](#ce-express-rf-prediction)
- [Antenna Library →](#ce-express-antennas)
