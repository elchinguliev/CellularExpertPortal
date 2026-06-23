---
id: ce-express-admin-installation
title: Installation Guide
product: CE Express
version: "7.2"
category: Administration
order: 21
related:
  - ce-express-admin-requirements
  - ce-express-admin-workspace
---

# CE Express Installation Guide

## Prerequisites

Before installing CE Express, ensure the following are installed and configured:

### 1. ArcGIS Server
- ArcGIS Server 10.9.1 or later
- Configured and licensed
- Site created and accessible

### 2. PostgreSQL
- PostgreSQL 13+ with **PostGIS** extension installed
- Database user with CREATE privileges
- Remote connections enabled (pg_hba.conf)

### 3. PHP Server
- PHP 7.4 or later
- Extensions: `pdo_pgsql`, `curl`, `json`, `mbstring`

## Installation Steps

### Step 1: Accept Terms and Conditions

Run the CE Express installer as **Administrator**. Accept the software license agreement.

### Step 2: Prepare Installation Folders

Create the following folder structure on the server:

```
C:\CEExpress\
  ├── app\          (web application files)
  ├── geodata\      (terrain, clutter, building data)
  ├── antennas\     (antenna pattern files)
  └── logs\         (application logs)
```

### Step 3: Prepare Server Configuration

Edit `ce_express_config.php`:

```php
// Database connection
$db_host = 'localhost';
$db_port = '5432';
$db_name = 'ce_express';
$db_user = 'ce_user';
$db_pass = 'your_password';

// ArcGIS Portal
$portal_url = 'https://your-server/portal';
$server_url = 'https://your-server/server';
```

### Step 4: Configure Database

Edit `ce_express_db_config.php` with PostgreSQL connection details.

Run the CE Express database setup script:

```sql
-- Creates CE Express schema
\i ce_express_setup.sql
```

### Step 5: Verify Installation and License

1. Open CE Express in a browser: `https://your-server/ceexp`
2. In CE Express → Settings → License Manager
3. Enter your license key
4. Click **Activate** (requires internet for online activation)

### Step 6: Enable SSL (Recommended)

Configure your web server to enforce HTTPS:

**IIS:** Enable SSL certificate → Require SSL in site bindings

**Nginx:**
```nginx
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    # Redirect HTTP to HTTPS
}
```

### Step 7: Configure ArcGIS Portal Publishing (Optional)

To allow CE Express to publish layers to ArcGIS Portal:
1. Create a dedicated ArcGIS Portal service account for CE Express
2. Edit `ce_express_config.php` → set `$portal_user` and `$portal_pass`
3. Test: CE Express → Features → Publish → verify layer appears in Portal

### Step 8: Configure Email Notifications (Optional)

For password reset and ticket notifications:
1. Edit `ce_express_config.php` → set `$smtp_host`, `$smtp_port`, `$smtp_user`, `$smtp_pass`
2. Test: CE Express → Settings → Send test email

### Step 9: Create Database Structure (Inventory3D)

Run the Inventory3D database initialization:
```bash
php ce_inventory3d_setup.php
```

### Step 10: Install Inventory3D Web Application

Copy Inventory3D web application package to the web server folder.
Register in ArcGIS Portal as a web application.

## CE Inventory3D Folder Structure

```
CEInventory3D\
  ├── webapplication\    (browser UI)
  ├── api\               (REST API endpoints)
  ├── config\            (configuration files)
  └── uploads\           (attachment storage)
```

## Verifying the Installation

1. Open `https://your-server/ceexp` in Chrome
2. Log in with ArcGIS credentials
3. Verify Map view loads
4. Create a test workspace
5. Run a test RF prediction

## Related Topics

- [System Requirements →](#ce-express-admin-requirements)
- [Geodata Preparation →](#ce-express-admin-geodata)
- [User Management →](#ce-express-admin-user-management)
- [Creating Workspaces (Admin) →](#ce-express-admin-workspace)
