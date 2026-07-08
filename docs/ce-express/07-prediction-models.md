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

Prediction [models](#kw:31-models:ce-express-tr-models) define how **signal propagation losses** are calculated across the coverage area.

## How CE Evaluates Propagation

Instead of applying a single formula everywhere, CE Express evaluates the **radio visibility condition** between each transmitter and each receiver pixel, then applies the most appropriate loss model:

| Visibility Condition | Abbreviation | Description |
|---------------------|--------------|-------------|
| [Line-of-Sight](#kw:running-a-profile:ce-express-profile) | LOS | Clear unobstructed path |
| Near [Line-of-Sight](#kw:running-a-profile:ce-express-profile) | NLOS1 | Marginally obstructed ([Fresnel zone](#kw:fresnel-zone-clearance:ce-express-profile) partially blocked) |
| Non-[Line-of-Sight](#kw:running-a-profile:ce-express-profile) | NLOS | Fully obstructed path |

Radio visibility is evaluated using: DTM (terrain), Obstacles, and [Clutter](#kw:clutter-classification-values:ce-express-geodata) path profiles.

This approach enables **near-deterministic modeling** — terrain, obstacles, and [clutter](#kw:clutter-classification-values:ce-express-geodata) are explicitly considered for every calculation pixel.

## Available Models

### Okumura-Hata

- **Type:** Empirical
- **Frequency range:** 150 – 1500 MHz
- **Environments:** Urban, Suburban, Rural, Open
- **Use case:** Macro cells, large coverage areas, legacy 2G/3G networks
- **Data needed:** DEM + [Clutter](#kw:clutter-classification-values:ce-express-geodata) (optional)

### COST-231 Hata

- **Type:** Empirical (extension of [Okumura-Hata](#kw:okumurahata:none))
- **Frequency range:** Up to 2 GHz
- **Environments:** Urban, Suburban
- **Use case:** 3G/UMTS macro planning
- **Data needed:** DEM + Clutter

### COST-231 Walfisch-Ikegami

- **Type:** Semi-empirical (considers building geometry)
- **Frequency range:** 800 MHz – 2 GHz
- **Environments:** Urban micro cells
- **Use case:** Dense urban environments, small cells
- **Data needed:** DEM + Clutter + Building data (heights)

### SPM (Standard Propagation Model)

- **Type:** Configurable empirical
- **Frequency range:** Wide (depends on configuration)
- **Use case:** General-purpose; can be calibrated to local conditions
- **Data needed:** DEM + Clutter
- **Key feature:** Adjustable coefficients (K1–K6) for local tuning

### Ray Tracing (3D)

- **Type:** Physics-based (deterministic)
- **Accuracy:** Highest
- **Use case:** Urban micro planning, indoor-to-outdoor, small cells
- **Data needed:** DEM + Clutter + **Full 3D building [models](#kw:31-models:ce-express-tr-models) required**
- **Speed:** Slowest — recommended for small areas only

### CE Custom Models

- Site-specific models tuned for particular deployment environments
- Created using [Model Tuning](#kw:model-tuning-calibration:none) against drive-test measurements

## Selecting a Model

In the Prediction Models tool, configure the model:

1. Choose the **model type**
2. Set the **environment** (Dense Urban / Urban / Suburban / Rural / Open)
3. Configure **LOS, NLOS1, NLOS** model assignments (can use different models per visibility condition)
4. Adjust **[model coefficients](#kw:model-tuning-calibration:none)** if required (advanced)

Models can be set:
- **Per workspace** — applies to all cells unless overridden
- **Per cell** — override workspace default for specific cells

## Model Tuning / Calibration

Improve prediction accuracy by calibrating against real measurements:

1. Import drive-test data (CSV with Lat/Lon/Signal level/Cell ID)
2. CE Express → **[Model Tuning](#kw:model-tuning-calibration:none)** tool
3. The wizard compares predicted vs. measured values
4. Adjusts [model coefficients](#kw:model-tuning-calibration:none) to minimize mean error
5. Save the tuned model for future predictions

→ See [Model Tuning](#kw:model-tuning-calibration:none) →

## Choosing the Right Model

| Environment | Recommended Model |
|-------------|------------------|
| Rural / Open terrain | [Okumura-Hata](#kw:okumurahata:none) (Rural/Open) |
| Suburban | [COST-231 Hata](#kw:cost231-hata:none) or [Okumura-Hata](#kw:okumurahata:none) (Suburban) |
| Urban macro | [COST-231 Hata](#kw:cost231-hata:none) (Urban) |
| Dense urban, small cells | [COST-231 Walfisch-Ikegami](#kw:cost231-walfischikegami:none) or [Ray Tracing](#kw:ray-tracing-3d:none) |
| 5G (sub-6 GHz) | [SPM](#kw:spm-standard-propagation-model:none) or tuned [COST-231](#kw:cost231-hata:none) |
| Backhaul / Point-to-point | See Radio Link Prediction |

## Related Topics

- RF Prediction →
- Model Tuning →
- Geodata Requirements →
