# Antenna Patterns

An [antenna pattern](#kw:managing-the-antenna-library:none) file describes how an antenna radiates power in different directions — both horizontally (azimuth) and vertically (elevation). CE Express uses these patterns to calculate accurate RF predictions rather than assuming an idealised omnidirectional antenna.

## Supported Formats

| Format | Extension | Notes |
|---|---|---|
| [MSI Planet](#kw:pattern-file-structure-msi:none) | `.msi` | Most common format from antenna vendors |
| Kathrein | `.txt` | Text-based pattern format |

Most antenna manufacturers (Kathrein, Commscope, Ericsson, Nokia, Huawei) provide patterns in .msi format on their websites or on Antenna DL.

## Importing Antenna Patterns

1. Open the **Antennas** tool from the left toolbar.
2. Click **Import**.
3. Select one or more `.msi` or `.txt` files.
4. Click **Open** — the patterns are imported into the [antenna library](#kw:managing-the-antenna-library:none).

You can import multiple files at once. Imported patterns are available to all workspaces.

## Assigning a Pattern to a Cell

1. Open **Network [Data Management](#kw:31-data-management-tools:inventory3d-user-guide)**.
2. Find the cell row.
3. Click the `antenna_pattern` field.
4. Type or select the pattern name from the dropdown.
5. Click **Synchronize Changes**.

> If no pattern is assigned, CE Express uses an **isotropic (omnidirectional)** model for that cell. This gives less accurate predictions but allows you to run a quick test without patterns.

## Pattern File Structure (MSI)

An .msi file contains:

- **Header** — frequency, gain, half-power beamwidths (H and V), front-to-back ratio
- **Horizontal pattern** — attenuation in dB at each azimuth angle (0–360°)
- **Vertical pattern** — attenuation in dB at each elevation angle

Example header:
```
NAME    Kathrein 742212
MAKE    Kathrein
FREQUENCY   1710-1880
GAIN    17.5dBd
TILT    0
BEAMWIDTH H 65
BEAMWIDTH V 7.5
```

## Viewing Patterns

In the Antennas tool, click a pattern name to view its horizontal and vertical radiation plots.

## Managing the Antenna Library

| Action | How |
|---|---|
| View all imported patterns | Open Antennas tool → Library tab |
| Delete a pattern | Select the pattern → click Delete |
| Export a pattern | Select the pattern → click Export |
| Rename a pattern | Not supported — re-import under a new name |

## Tips

- Use the **actual vendor pattern** for your installed antennas whenever possible — it significantly improves prediction accuracy.
- Pattern file names often contain the model number (e.g. `K742212_1800MHz_0deg.msi`). Keep names consistent so they are easy to assign in bulk via CSV import.
- For multi-band antennas (e.g. 900/1800 MHz combined), import separate pattern files per band.

## Related Pages

- [Network Objects](#kw:object-types:ce-express-network-objects) — assigning patterns to cells
- RF Prediction — how patterns affect [prediction results](#kw:viewing-results:ce-express-rf-prediction)
