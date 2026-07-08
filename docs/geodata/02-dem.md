---
id: geodata-dem
title: Digital Terrain Model (DEM/DTM)
product: Both
category: Geodata
order: 2
related:
  - geodata-requirements
  - geodata-clutter
  - ce-express-geodata-sets
---

# Digital Terrain Model (DEM / DTM)

The Digital Terrain Model ([DEM](#kw:checking-your-dem:none) or [DTM](#kw:checking-your-dem:none)) provides **terrain elevation data** used in all RF propagation calculations. It is the **single most important geodata input** in CE Express.

## Requirements

### Format

Supported raster formats:
- **[GeoTIFF](#kw:checking-your-[dem](#kw:checking-your-dem:none):none):none)** (.tif, .tiff) — **recommended**
- ERDAS Imagine (.img)
- ASCII Grid (.asc)
- ArcGIS Grid format
- Any GDAL-supported raster format

### Resolution

| Area Type | Minimum [Resolution](#kw:resolution:none) | Recommended |
|-----------|-------------------|-------------|
| Rural / Open | 30 m | 20 m |
| Suburban | 20 m | 10 m |
| Urban macro | 10 m | 5 m |
| Urban micro / small cells | 5 m | 1–2 m |

> Higher [resolution](#kw:resolution:none) = more accurate predictions, but slower calculation time and larger file size.

### Coordinate System (Projection)

- **Must use a [projected coordinate](#kw:coordinate-system-projection:none) system** (e.g., [UTM](#kw:coordinate-system-projection:none) Zone XX, ETRS89/TM, national grids)
- **Do NOT use geographic coordinates ([WGS84](#kw:coordinate-system-projection:none) [EPSG](#kw:coordinate-system-projection:none):4326)**
- Must exactly match the **workspace [EPSG](#kw:coordinate-system-projection:none) code**

### Pixel Type

- **32-bit float** (recommended) — supports fractional elevation values
- 16-bit integer — acceptable for lower precision needs
- **Do NOT use 8-bit** — insufficient range for elevation values

### NoData Value

- Set a proper [NoData](#kw:nodata-value:none) value (typically -9999 or -32768)
- Do NOT use 0 as [NoData](#kw:nodata-value:none) if the coverage area includes sea level or below-sea-level terrain
- [NoData](#kw:nodata-value:none) areas within the prediction radius will produce empty results

### Raster Name

- Use descriptive, unique filenames
- Avoid special characters and spaces: use underscores (`terrain_utm35n_2m.tif`)
- The file name becomes the dataset identifier in CE Express

## Vertical Accuracy

| Application | Required [Vertical Accuracy](#kw:vertical-accuracy:none) |
|-------------|--------------------------|
| Rural macro planning | ≤ 10 m |
| Suburban macro | ≤ 5 m |
| Urban macro | ≤ 2 m |
| Urban micro / indoor | ≤ 1 m |

## Checking Your DEM

Before loading into CE Express, verify:

```bash
# Check projection, resolution, NoData (using GDAL)
gdalinfo your_dem.tif

# Key fields to check:
# - Coordinate System: should be projected (not GEOGCS)
# - Pixel Size: resolution in map units
# - NoData Value: should be set
# - Min/Max: should reflect realistic elevation range
```

## Multi-Resolution Support

CE Express supports **multi-[resolution](#kw:resolution:none) datasets** — you can load different [DEM](#kw:checking-your-dem:none) resolutions for different areas. CE automatically selects the appropriate resolution for each calculation area.

## Related Topics

- Geodata Overview →
- [Clutter Classes](#kw:[clutter](#kw:clutter-classification-values:ce-express-geodata)-classification-values:ce-express-geodata) →
- Loading Geodata in CE Express →
