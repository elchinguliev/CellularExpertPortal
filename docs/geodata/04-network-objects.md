---
id: network-object-requirements
title: Network Object Requirements
product: Both
category: Geodata
order: 4
related:
  - ce-express-features
  - geodata-requirements
---

# Requirements for CE Network Objects

CE network objects must meet minimum field requirements for successful import and use in calculations.

## Primary Data Structure

### Import from CSV File

- First row: **field names** (column headers)
- Subsequent rows: values
- Field names are **not case-sensitive** — CE includes a mapping function to align external names with CE database fields

### Import from ArcGIS Portal

- Point layer shared on ArcGIS Enterprise Portal or ArcGIS Online
- CE imports via Portal Item ID
- Field mapping is handled automatically via the CE mapping function

---

## Cells (Sectors)

### Minimum Requirements

| CE Field | Unit | Example | Description |
|----------|------|---------|-------------|
| `y` (Latitude) | Decimal degrees | 49.9993 | Y coordinate in WGS84 (for initial CSV import) |
| `x` (Longitude) | Decimal degrees | 33.6573 | X coordinate in WGS84 |
| `cell_` (Cell ID) | — | ABC_001 | Unique cell identifier |

### Optional Fields

| Field | Unit | Notes |
|-------|------|-------|
| **Height** | m AGL | Antenna height above ground |
| **Azimuth** | degrees | 0–360°, direction from North |
| **Mechanical tilt** | degrees | Physical antenna downtilt |
| **Electrical tilt** | degrees | Electronic beam tilt |
| **Frequency** | MHz | Carrier frequency |
| **Power** | dBm | Transmit power |
| **Antenna gain** | dBi | Peak antenna gain |
| **Losses** | dB | Cable, connector, combiner losses |
| **Bandwidth** | MHz | Channel bandwidth (required for 4G/5G) |
| **Subcarrier spacing** | kHz | SCS (required for 5G) |
| **TX MIMO** | — | Transmit antenna count (1,2,4,8,16,32,64) |
| **RX MIMO** | — | Receive antenna count |
| **Technology** | — | 2G, 3G, 4G, 5G, NB-IoT |
| **Antenna name** | — | Must match antenna in CE library |
| **Site ID** | — | Parent site identifier (links cell to site) |
| **Duplex mode** | FDD/TDD | Required for 4G/5G |

---

## Sites (Towers)

Sites are optional — cells can exist without explicit site records. Sites add:

| Field | Description |
|-------|-------------|
| **Site name** | Unique identifier |
| **Latitude / Longitude** | WGS84 decimal degrees |
| **Height** | Tower/mast height AGL (m) |
| **Type** | Monopole, Lattice, Rooftop, etc. |
| **Owner** | Network operator or tower company |
| **Address** | Physical address |

---

## Antenna Patterns

For each cell, an antenna pattern must be assigned from the CE antenna library.

### Antenna File Formats

| Format | Extension | Notes |
|--------|-----------|-------|
| MSI Planet | `.msi` | **Standard format — recommended** |
| Planet | `.pln` | Alternative format |

### Antenna File Requirements

An antenna file must include:
- **Horizontal pattern** (0–360° in 1° steps, dB relative to peak)
- **Vertical pattern** (−180° to +180° in 1° steps, dB relative to peak)
- **Peak gain** (dBi)
- **Frequency** (MHz)
- **Manufacturer** and **model name** (for library identification)

---

## Minimum Viable CSV for Import

### Sites CSV

```csv
Name,Latitude,Longitude,Height
SITE_001,51.5074,-0.1278,30
SITE_002,51.5200,-0.1150,25
```

### Cells CSV

```csv
CellName,Latitude,Longitude,Azimuth,Height,Technology,Frequency
CELL_001A,51.5074,-0.1278,0,25,4G,1800
CELL_001B,51.5074,-0.1278,120,25,4G,1800
CELL_001C,51.5074,-0.1278,240,25,4G,1800
```

---

## Related Topics

- [Features Tool — Adding Objects →](#ce-express-features)
- [Importing Data →](#training-import-data)
- [Geodata Requirements →](#geodata-requirements)
