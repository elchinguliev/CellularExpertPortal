---
id: ce-express-radio-link
title: Radio Link (Microwave) Prediction
product: CE Express
version: "7.3"
category: Calculations
order: 9
related:
  - ce-express-profile
  - ce-express-mw-equipment
  - ce-express-prediction-models
---

# Radio Link (Microwave) Prediction

CE Express includes a complete **microwave (MW) backhaul planning** module for point-to-point and point-to-multipoint radio links.

## Creating a Radio Link

1. Select two sites on the map
2. Right-click → **Create Link** (or use Features tool → Add Link)
3. Configure [link parameters](#kw:link-parameters:none):

### Link Parameters

| Parameter | Description |
|-----------|-------------|
| **A-site / B-site** | Both ends of the link |
| **Frequency (GHz)** | Operating frequency |
| **[Polarisation](#kw:link-parameters:none)** | Horizontal (H) or Vertical (V) |
| **Channel bandwidth** | MHz |
| **Antenna (A-end / B-end)** | Parabolic antenna from library |
| **Radio model** | Modem/radio equipment from library |

## Link Budget Calculation

Click **[Link Prediction](#kw:link-prediction-report:none)** → **Calculation** to compute:

| Output | Description |
|--------|-------------|
| **[Free-space path loss](#kw:link-budget-calculation:none)** | [FSPL](#kw:link-budget-calculation:none) = 20·log(d) + 20·log(f) + 32.44 (dB) |
| **Atmospheric absorption** | Gas absorption (oxygen, water vapour) per [ITU-R P.676](#kw:geoclimatic-data:none) |
| **Received Signal Level (RSL)** | Signal strength at receiver (dBm) |
| **System gain** | Tx power + both antenna gains − losses |
| **[Fade margin](#kw:link-budget-calculation:none)** | RSL minus receiver sensitivity (dB) |

## Geoclimatic Data

CE Express uses [ITU-R](#kw:geoclimatic-data:none) P-series recommendations for fade calculations:

| Factor | [ITU-R](#kw:geoclimatic-data:none) Reference | Description |
|--------|----------------|-------------|
| **[Gaseous absorption](#kw:geoclimatic-data:none)** | P.676 | Frequency-dependent gas attenuation |
| **Temperature** | P.453 | Affect refractivity and multipath |
| **[Multipath fading](#kw:geoclimatic-data:none)** | P.530 | Statistical fading due to atmospheric layering |
| **Rain fading** | P.838 | Rain-induced attenuation |
| **Statistics** | P.530 | Annual [availability](#kw:availability-calculation:none) % |

## Availability Calculation

The [link budget](#kw:link-budget-calculation:none) includes [ITU-R](#kw:geoclimatic-data:none) **[availability](#kw:availability-calculation:none) prediction**:

| [Availability](#kw:availability-calculation:none) | Typical Use |
|-------------|------------|
| 99.999% | Critical infrastructure (telecom backhaul) |
| 99.99% | High-availability links |
| 99.9% | Standard commercial links |

## Reflections

The **[Reflections](#kw:reflections:none)** tab analyses signal [reflections](#kw:reflections:none) from terrain and water bodies that can cause multipath interference on the link.

## Link Prediction Report

Click **Export** → generates a PDF report with:
- [Link parameters](#kw:link-parameters:none) summary
- Path profile
- [Link budget](#kw:link-budget-calculation:none) table
- Availability calculation
- [Fade margin](#kw:link-budget-calculation:none) analysis

## Multi-Hop Paths

For [multi-hop](#kw:multihop-paths:none) backhaul:
1. Create links between consecutive sites
2. CE Express calculates end-to-end performance for each hop
3. Total availability = product of individual hop availabilities

## MW Equipment Library

→ See [MW Equipment](#kw:mw-equipment-library:none) →

To use [Link Prediction](#kw:link-prediction-report:none), assign antenna and radio [models](#kw:31-models:ce-express-tr-models) from the equipment library to each link endpoint.

## Automatic Frequency Planning (AFP)

For mesh and multi-link networks, use **[AFP](#kw:automatic-frequency-planning-afp:none)** to automatically assign frequencies minimizing interference.

→ See [Automatic Frequency Planning](#kw:automatic-frequency-planning-[afp](#kw:automatic-frequency-planning-afp:none):none):none) →

## Related Topics

- Profile / [Line of Sight](#kw:running-a-profile:ce-express-profile) →
- [MW Equipment](#kw:mw-equipment-library:none) Library →
- Mesh Networks →
