# Logging In to CE Express

CE Express uses **ArcGIS Enterprise** for authentication. You log in with your ArcGIS credentials — the same username and password you use for your organisation's ArcGIS portal.

## Steps

1. Open your browser and navigate to the CE Express URL provided by your administrator.
   Example: `https://cecom2.cellular-expert.com/ce_express/`

2. Click **Login as ArcGIS**.

3. Enter your **ArcGIS Enterprise username and password**.

4. On successful login you are taken to the **Network [Data Management](#kw:31-data-management-tools:inventory3d-user-guide)** view.

5. Click **Open [Map View](#kw:switching-between-views:none)** to start working on the map.

## First-Time Access

If you are logging in for the first time:

- Confirm with your administrator that your ArcGIS account has been granted access to the CE Express application item in the ArcGIS Portal.
- Make sure at least one **workspace** has been created and shared with your account. Without a workspace you cannot run predictions or view [network objects](#kw:object-types:ce-express-network-objects) on the map.

## Switching Between Views

| View | Purpose |
|---|---|
| **[Map View](#kw:switching-between-views:none)** | Interactive map with all CE Express tools |
| **Network [Data Management](#kw:31-data-management-tools:inventory3d-user-guide)** | Table view for editing [network object](#kw:object-types:ce-express-network-objects) attributes |

You can switch between these at any time using the button in the top toolbar.

## Logging Out

Click your user name or avatar in the top-right corner of the ArcGIS Portal and select **Sign Out**.

## Troubleshooting Login Issues

| Problem | Solution |
|---|---|
| "Invalid credentials" | Check username/password. Note: CE Express uses ArcGIS credentials, not a separate login. |
| "You do not have access to this item" | Ask your ArcGIS administrator to share the CE Express app with your account. |
| Page loads but map is blank | A workspace may not be selected. Open the [Workspace tool](#kw:opening-the-workspace-tool:ce-express-workspace) and select one. |
| Page does not load at all | Check that the CE Express server is running. Contact your system administrator. |

## Related Pages

- CE Express Overview
- Workspaces
- [Troubleshooting](#kw:troubleshooting-login-issues:none)
