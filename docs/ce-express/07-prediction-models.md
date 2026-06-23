---
id: ce-express-prediction-models
title: Prediction Models
product: CE Express
version: "7.3"
category: Calculations
order: 7
related:
  - ce-express-rf-prediction
  - ce-express-model-tuning
  - geodata-requirements
---

# Prediction Models

Prediction models define how **signal propagation losses** are calculated across the coverage area.

## How CE Evaluates Propagation

Instead of applying a single formula everywhere, [CE Express](https://www.google.com/search?q=Cellular+Expert+CE+Express+web+platform) evaluates the **radio visibility condition** between each transmitter and each receiver pixel, then applies the most appropriate loss model:

| Visibility Condition | Abbreviation | Description |
|---------------------|--------------|-------------|
| Line-of-Sight | LOS | Clear unobstructed path |
| Near Line-of-Sight | NLOS1 | Marginally obstructed ([Fresnel zone](https://www.google.com/search?q=Fresnel+zone+radio+link+clearance) partially blocked) |
| Non-Line-of-Sight | NLOS | Fully obstructed path |

Radio visibility is evaluated using: [DTM](https://www.google.com/search?q=DTM+Digital+Terrain+Model+elevation) (terrain), Obstacles, and Clutter path profiles.

This approach enables **near-deterministic modeling** — terrain, obstacles, and [clutter](https://www.google.com/search?q=clutter+land+use+classification+radio+planning) are explicitly considered for every calculation pixel.

## Available Models

### [Okumura-Hata](https://www.google.com/search?q=Okumura-Hata+propagation+model+radio+frequency)

- **Type:** Empirical
- **Frequency range:** 150 – 1500 MHz
- **Environments:** Urban, Suburban, Rural, Open
- **Use case:** Macro cells, large coverage areas, legacy 2G/3G networks
- **Data needed:** [DEM](https://www.google.com/search?q=DEM+Digital+Elevation+Model+terrain) + Clutter (optional)

### [COST-231 Hata](https://www.google.com/search?q=COST-231+Hata+propagation+model)

- **Type:** Empirical (extension of Okumura-Hata)
- **Frequency range:** Up to 2 GHz
- **Environments:** Urban, Suburban
- **Use case:** 3G/[UMTS](https://www.google.com/search?q=UMTS+3G+mobile+network) macro planning
- **Data needed:** DEM + Clutter

### [COST-231 Walfisch-Ikegami](https://www.google.com/search?q=COST-231+Walfisch-Ikegami+propagation+model+urban)

- **Type:** Semi-empirical (considers building geometry)
- **Frequency range:** 800 MHz – 2 GHz
- **Environments:** Urban micro cells
- **Use case:** Dense urban environments, small cells
- **Data needed:** DEM + Clutter + Building data (heights)

### [SPM](https://www.google.com/search?q=SPM+Standard+Propagation+Model+radio) (Standard Propagation Model)

- **Type:** Configurable empirical
- **Frequency range:** Wide (depends on configuration)
- **Use case:** General-purpose; can be calibrated to local conditions
- **Data needed:** DEM + Clutter
- **Key feature:** Adjustable coefficients (K1–K6) for local tuning

### [Ray Tracing](https://www.google.com/search?q=ray+tracing+radio+propagation+3D+model) (3D)

- **Type:** Physics-based (deterministic)
- **Accuracy:** Highest
- **Use case:** Urban micro planning, indoor-to-outdoor, small cells
- **Data needed:** DEM + Clutter + **Full 3D building models required**
- **Speed:** Slowest — recommended for small areas only

### CE Custom Models

- Site-specific models tuned for particular deployment environments
- Created using [Model Tuning](#ce-express-model-tuning) against drive-test measurements

## Selecting a Model

In the Prediction Models tool, configure the model:

1. Choose the **model type**
2. Set the **environment** (Dense Urban / Urban / Suburban / Rural / Open)
3. Configure **LOS, NLOS1, NLOS** model assignments (can use different models per visibility condition)
4. Adjust **model coefficients** if required (advanced)

Models can be set:
- **Per workspace** — applies to all cells unless overridden
- **Per cell** — override workspace default for specific cells

## Model Tuning / Calibration

Improve prediction accuracy by calibrating against real measurements:

1. Import drive-test data ([CSV](https://www.google.com/search?q=CSV+comma-separated+values+file+format) with Lat/Lon/Signal level/Cell ID)
2. CE Express → **Model Tuning** tool
3. The wizard compares predicted vs. measured values
4. Adjusts model coefficients to minimize mean error
5. Save the tuned model for future predictions

→ See [Model Tuning →](#ce-express-model-tuning)

## Choosing the Right Model

| Environment | Recommended Model |
|-------------|------------------|
| Rural / Open terrain | Okumura-Hata (Rural/Open) |
| Suburban | COST-231 Hata or Okumura-Hata (Suburban) |
| Urban macro | COST-231 Hata (Urban) |
| Dense urban, small cells | COST-231 Walfisch-Ikegami or Ray Tracing |
| 5G (sub-6 GHz) | SPM or tuned COST-231 |
| Backhaul / Point-to-point | See [Radio Link Prediction](#ce-express-radio-link) |

## Related Topics

- [RF Prediction →](#ce-express-rf-prediction)
- [Model Tuning →](#ce-express-model-tuning)
- [Geodata Requirements →](#geodata-requirements)
