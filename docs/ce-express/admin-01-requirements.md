---
id: ce-express-admin-requirements
title: System Requirements
product: CE Express
version: "7.2"
category: Administration
order: 20
related:
  - ce-express-admin-installation
  - ce-express-admin-user-management
---

# CE Express System Requirements

## Minimum Hardware Requirements

### Server (CE Express + ArcGIS Enterprise+Enterprise+server+deployment))

| Component | Minimum | Recommended | Optimal |
|-----------|---------|-------------|---------|
| **CPU** | 8 cores, hyperthreaded | 16 cores | 32 cores |
| **RAM** | 16 GB | 32 GB | 64 GB or more |
| **Storage** | 500 GB – 1 TB free | 2 TB+ SSD | NVMe SSD RAID |

### Optional: GPU-Accelerated Calculations

| Component | Requirement |
|-----------|------------|
| GPU | Any NVIDIA GPU with CUDA capabilities |
| Driver | Version 456.38 or later |
| CUDA Toolkit | 11.0 – 12.4 (recommended) |

See: https://developer.nvidia.com/cuda-gpus

> Requirements vary significantly depending on acceptable calculation time, task complexity, and database size.

## Minimum Software Requirements

| Software | Version | Notes |
|----------|---------|-------|
| **Operating System** | Windows Server 2016/2019/2022 | Also supported: Ubuntu 20.04+ |
| **ArcGIS Server** | 10.9.1 or later | Required for map services |
| **ArcGIS Portal** | 10.9.1 or later | Required for user authentication |
| **PostgreSQL** | 13 or later | With PostGIS extension |
| **PHP Server** | 7.4 or later | For CE Express web application |
| **Web Server** | IIS (Windows) or Nginx (Linux) | Front-end proxy |

## Architecture Examples

### Simplified On-Premises Deployment

```
[User Browser]
      ↓ HTTPS
[IIS / Nginx Web Server]
      ↓
[CE Express Application + PHP]
      ↓
[ArcGIS Enterprise (Portal + Server)]
      ↓
[PostgreSQL + PostGIS Database]
      ↓
[CE Calculation Engine]
```

### Cloud / Hybrid Deployment

CE Express supports [cloud deployment](#kw:cloud-hybrid-deployment:none) on:
- **Microsoft Azure** (recommended)
- **AWS**
- **Google Cloud Platform**

ArcGIS Enterprise and the CE Express server can be on separate machines/VMs.

## Related Topics

- Installation Guide →
- Geodata Preparation (Admin) →
- User Management →
