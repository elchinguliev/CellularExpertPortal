---
id: ce-pro-installation
title: Installation and Activation
product: CE Pro
version: "4.9"
category: Getting Started
order: 2
related:
  - ce-pro-introduction
  - ce-pro-workspace
---

# CE Desktop Installation and Activation

## System Requirements

### Hardware

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 4 cores | 8+ cores (multi-threaded calculations benefit greatly) |
| **RAM** | 8 GB | 16–32 GB |
| **GPU** | — | NVIDIA GPU with CUDA (for GPU-accelerated predictions) |
| **Storage** | 20 GB | 100+ GB (geodata can be very large) |
| **Display** | 1920×1080 | 2560×1440 or dual monitors |

### Software

| Software | Requirement |
|----------|------------|
| **Operating System** | Windows 10 / 11 (64-bit) |
| **ArcGIS Pro** | Version 2.8 or later (including ArcGIS Pro 3.x) |
| **ArcGIS Pro License** | Any (Basic, Standard, or Advanced) |
| **.NET Framework** | 4.8 or later (usually pre-installed with ArcGIS Pro) |

> CE Desktop **does not support ArcMap (ArcGIS Desktop 10.x)**. ArcGIS Pro is required.

## Installation Order

⚠️ **The order matters:**

1. Install **ArcGIS Pro** first
2. Install **CE Desktop** (run installer as Administrator)

For upgrades:
1. **Delete** the old CE Desktop version (Control Panel → Programs → Uninstall CE Desktop)
2. Install the **new CE Desktop version**
3. ArcGIS Pro upgrade does **not** require CE Desktop reinstallation

## Installation Steps

1. Download the CE Desktop installer from the Cellular Expert portal or from your distributor
2. Right-click the `.exe` → **Run as administrator**
3. Follow the installation wizard:
   - Accept license agreement
   - Choose installation directory (default: `C:\Program Files\Cellular Expert\`)
   - Select components (RLP, RCP, Indoor, Sound, EMF — install only what is licensed)
4. Click **Install** → wait for completion
5. Click **Finish**

## Activation

### Step 1: Open ArcGIS Pro

Launch ArcGIS Pro → create or open any project.

### Step 2: Enable CE Extension

Go to **Project** tab → **Settings** → **Licensing** → scroll to **CE Desktop** → enable the extension toggle.

### Step 3: Send License Key

A **User Key** is generated for your machine. Send this key to:
- Your CE Desktop distributor, or
- Cellular Expert directly: `support@cellular-expert.com`

### Step 4: Receive and Apply Activation

You will receive an activation file or activation code. Apply it in the CE License Manager.

## Offline Activation

If the machine has no internet access:
1. Generate activation request in License Manager
2. Send the request file to Cellular Expert support
3. Receive an activation response file
4. Apply the response file in License Manager

## Verifying the Installation

After activation:
1. Open ArcGIS Pro
2. Look for the **Cellular Expert** tab in the ribbon
3. Click **CE Tools** → the CE toolbar should appear
4. Open a workspace to confirm all tools are functional

## Uninstallation

Control Panel → Programs → CE Desktop → Uninstall

> Always uninstall CE Desktop **before** uninstalling ArcGIS Pro.

## Related Topics

- [Creating a Workspace →](#ce-pro-workspace)
- [Licensing →](#ce-pro-licensing)
- [System Requirements →](#ce-pro-requirements)
