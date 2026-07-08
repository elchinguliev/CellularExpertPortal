# Path Profile & Line of Sight

The **Profile** tool analyses the terrain between two points — typically between a transmitter (cell) and a receiver location. It shows whether a clear [line of sight](#kw:running-a-profile:none) exists, how much [Fresnel zone](#kw:fresnel-zone-clearance:none) clearance there is, the expected path loss, and the link power budget.

## When to Use the Profile Tool

- Checking whether a microwave link has sufficient clearance
- Verifying that a cell has [line-of-sight](#kw:running-a-profile:none) to a target location
- Estimating path loss for a specific point-to-point link
- Planning repeater placement (finding obstructions)

## Running a Profile

1. Open the **Profile** tool from the left toolbar.

2. **Set the transmitter** — hold **CTRL** and click on a cell on the map. The tool snaps to the cell and reads its position and height.

3. **Set the receiver** — left-click a point on the map. The profile calculates automatically.

4. The **Profile panel** appears showing:
   - A terrain cross-section graph between the two points
   - First [Fresnel zone](#kw:fresnel-zone-clearance:none) ellipse overlay
   - Summary results table

## Understanding the Results

| Result | Description |
|---|---|
| **Clearance** | How much of the first [Fresnel zone](#kw:fresnel-zone-clearance:none) is clear of obstacles (%). ≥ 60% is acceptable; ≥ 100% is ideal. |
| **Power Budget** | Received signal power at the receiver (dBm), accounting for path loss, antenna gain, and cable loss |
| **Path Loss** | Total signal attenuation between transmitter and receiver (dB) |
| **Angle** | Elevation angle from transmitter to receiver (degrees) |
| **Distance** | Straight-line distance between the two points |

## Fresnel Zone Clearance

The Fresnel zone is an elliptical region around the direct path between two antennas. Signal energy travels not just along the direct line but also through this zone. Obstructions inside the Fresnel zone cause diffraction losses:

| Clearance | Effect |
|---|---|
| > 100% | Full clearance, minimal diffraction loss |
| 60–100% | Minor diffraction loss (< 1 dB typical) |
| < 60% | Significant diffraction loss — consider adjusting antenna heights or finding an alternative path |
| 0% (obstructed) | Non-[line-of-sight](#kw:running-a-profile:none) (NLOS) — may still work but with higher loss |

## Reading the Profile Graph

The graph shows:
- **Brown/grey area** — terrain elevation along the path
- **Dashed ellipse** — first Fresnel zone boundary
- **Red line** — direct path between transmitter and receiver
- **Obstructions** — terrain or [clutter](#kw:clutter-classification-values:ce-express-geodata) features that intersect the Fresnel zone are highlighted

## Tips

- Hold **CTRL** when clicking on any [network object](#kw:object-types:ce-express-network-objects) to snap precisely to its position (useful for both ends of a microwave link).
- For **microwave link planning**, use the [Profile tool](#kw:when-to-use-the-profile-tool:none) before ordering equipment to confirm clearance at different frequencies (the Fresnel zone radius changes with frequency).
- The profile uses the `elevation.tif` terrain model, and `clutterHeight.tif` if available, to account for buildings and trees.
- To [compare](#kw:98-compare-predictions:ce-pro-rcp) multiple paths, run the [profile tool](#kw:when-to-use-the-profile-tool:none) multiple times — each result is shown in the panel as a separate tab.

## Related Pages

- Geodata & Rasters — the terrain data used by the [profile tool](#kw:when-to-use-the-profile-tool:none)
- CE Desktop RLP — detailed microwave link budget planning
- [Network Objects](#kw:object-types:ce-express-network-objects) — setting correct antenna heights for accurate profiles
