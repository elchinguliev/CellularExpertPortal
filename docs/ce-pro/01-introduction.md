---
id: ce-pro-introduction
title: Introduction to CE Desktop Pro
product: CE Pro
version: "4.9"
category: Getting Started
order: 1
related:
  - ce-pro-installation
  - ce-pro-workspace
  - geodata-requirements
---

# Introduction to CE Desktop Pro (RLP / RCP)

**CE Desktop Pro** is an extension for **Esri ArcGIS Pro** providing advanced radio planning and optimization tools directly within the ArcGIS Pro environment.

## Product Variants

| Product | Full Name | Primary Use |
|---------|-----------|-------------|
| **CE Desktop RLP** | Radio Link Planning | Microwave/backhaul, mesh, point-to-point links |
| **CE Desktop RCP** | Radio Coverage Planning | RF coverage, cellular networks, interference |
| **CE Desktop Indoor** | Indoor Planning | In-building signal propagation, DAS |
| **CE Desktop Sound** | Sound Propagation | Siren audibility, acoustic analysis |
| **CE Desktop EMF** | EMF Analysis | Electromagnetic field compliance |

All variants share the same core architecture and workspace format. This guide covers **RLP v4.9** and **RCP v4.9**.

## Software Purpose

CE Desktop provides:

- **Ultra-fast wave propagation calculations** using a proprietary C++ engine
- **ArcGIS Pro integration** — all results are native ArcGIS layers
- **Wide frequency range:** 10 kHz – 350 GHz
- **Multiple calculation types:** coverage, interference, LOS, link budget, mesh, EMF
- Support for **2G, 3G, 4G/LTE, 5G NR, NB-IoT, Wi-Fi, TETRA, DMR**, and proprietary technologies

## Architecture

```
ArcGIS Pro (UI + Map Engine)
       ↓
CE Desktop Extension (Toolbar + Geoprocessing Tools)
       ↓
CE Calculation Engine (C++, multi-threaded, optional GPU)
       ↓
File Geodatabase or Enterprise GDB (data storage)
```

## Key Advantages Over CE Express

| Feature | CE Desktop | CE Express |
|---------|-----------|-----------|
| Offline operation | ✅ Yes | ❌ No |
| ArcGIS Pro integration | ✅ Native | ❌ Web-based |
| Advanced analysis tools | ✅ Full | Subset |
| Multi-user collaboration | Via Enterprise GDB | ✅ Native |
| Browser access | ❌ No | ✅ Yes |

## Related Topics

- [Installation →](#ce-pro-installation)
- [Creating a Workspace →](#ce-pro-workspace)
- [Geographic Data →](#ce-pro-geodata)
- [Licensing →](#ce-pro-licensing)
