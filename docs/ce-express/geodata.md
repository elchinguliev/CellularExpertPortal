# Geodata & Rasters

CE Express uses raster files to model terrain and land use when calculating RF predictions. These files must be prepared and placed on the CE Express server before running any predictions.

## Required Files

| File | Required | Description |
|---|---|---|
| `elevation.tif` | **Yes** | Digital Terrain Model (DTM) — ground elevation in metres |
| `clutterClasses.tif` | No | Land use classification (urban, suburban, forest, water, etc.) |
| `clutterHeight.tif` | No | Height of [clutter](#kw:clutter-classification-values:none) above terrain (buildings, trees) in metres |

## Format Requirements

All raster files must meet the following specification:

- **Format**: GeoTIFF (`.tif`)
- **Coordinate Reference System**: [Projected CRS](#kw:what-is-a-projected-[crs](#kw:check-crs:none):none) (e.g. [UTM](#kw:what-is-a-projected-[crs](#kw:check-crs:none):none), national grid) — **not** geographic [WGS84](#kw:what-is-a-projected-[crs](#kw:check-crs:none):none) ([EPSG](#kw:what-is-a-projected-crs:none):4326)
- **[NoData](#kw:check-and-set-nodata-value:none) value**: `-9999`
- **All files in the same CRS** as each other and as the workspace setting

> ⚠️ If any file uses a different CRS or [NoData](#kw:check-and-set-nodata-value:none) value, predictions will fail or produce incorrect results.

## What is a Projected CRS?

A **[Projected CRS](#kw:what-is-a-projected-crs:none)** represents the Earth's curved surface on a flat plane (in metres). Examples:

| CRS | [EPSG](#kw:what-is-a-projected-crs:none) Code | Used In |
|---|---|---|
| WGS 84 / [UTM](#kw:what-is-a-projected-crs:none) Zone 34N | [EPSG](#kw:what-is-a-projected-crs:none):32634 | Lithuania, much of Eastern Europe |
| WGS 84 / [UTM](#kw:what-is-a-projected-crs:none) Zone 35N | EPSG:32635 | Eastern Lithuania, Latvia |
| LKS94 / Lithuania TM | EPSG:3346 | Lithuania national grid |
| ETRS89 / TM35FIN | EPSG:3067 | Finland |

Use GIS software ([QGIS](#kw:preparing-rasters-with-qgis-free:none), ArcGIS Pro) to check or [reproject](#kw:reproject-to-projected-crs:none) your rasters if needed.

## Preparing Rasters with QGIS (Free)

### Check CRS

1. Open your `.tif` file in [QGIS](#kw:preparing-rasters-with-qgis-free:none).
2. Right-click the layer → **Properties** → **Information** tab.
3. Look for "CRS" — it should show a [Projected CRS](#kw:what-is-a-projected-crs:none), not EPSG:4326.

### Reproject to Projected CRS

1. **Raster** menu → **Projections** → **Warp ([Reproject](#kw:reproject-to-projected-crs:none))**.
2. Set Target CRS to your required projected CRS.
3. Set [NoData](#kw:check-and-set-nodata-value:none) value to `-9999`.
4. Save output as `.tif`.

### Check and Set NoData Value

1. **Raster** → **Miscellaneous** → **Build Virtual Raster**, or use the Raster Calculator.
2. Alternatively, use GDAL: `gdal_translate -a_nodata -9999 input.tif output.tif`

## Placing Files on the Server

Geodata files must be stored on the **CE Express server** (not the user's computer). Work with your system administrator to:

1. Create a folder for each project (e.g. `D:\geodata\vilnius_2025\`).
2. Copy `elevation.tif` (and optional [clutter](#kw:clutter-classification-values:none) files) into the folder.
3. Use this server path when creating or configuring a workspace.

## Clutter Classification Values

The `clutterClasses.tif` file assigns a land-use category to each pixel. Typical values:

| Value | Class |
|---|---|
| 0 | Open / Water |
| 1 | Open Rural |
| 2 | Suburban |
| 3 | Urban |
| 4 | Dense Urban |
| 5 | Forest |
| 6 | Industrial |

The exact values and their mapping to propagation loss are configured in the prediction model settings.

## Related Pages

- Workspaces — linking geodata to a workspace
- RF Prediction — how geodata is used in predictions
- System Requirements — server storage recommendations
