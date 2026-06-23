---
id: ce-express-admin-user-management
title: User Management
product: CE Express
version: "7.2"
category: Administration
order: 22
related:
  - ce-express-login
  - ce-express-admin-installation
---

# User Management

Administrators manage users through the **CE [Inventory3D](https://www.google.com/search?q=Cellular+Expert+Inventory3D+asset+management) web application admin interface**.

## User Roles

| Role | Access | Capabilities |
|------|--------|-------------|
| **Admin** | Full | All settings, user management, system config, all workspaces |
| **Editor** | Map + Data | Add/edit/delete objects, run predictions, manage own workspace objects |
| **Planner** | Map + Calculations | Run predictions, view data, limited editing |
| **Viewer** | Read-only | View map and data, no editing or predictions |

## Adding a User

1. Admin Panel → **User Management** → **Add User**
2. Enter: Username, Email, Password (or [ArcGIS](https://www.google.com/search?q=ArcGIS+Esri+GIS+platform) account link)
3. Select **Role**
4. Assign **Workspace access** (which workspaces the user can see)
5. Click **Save**

## Assigning Workspace Access

Users only see workspaces they are assigned to.

1. Admin Panel → Workspaces → select workspace → **User groups**
2. Add user or user group to the workspace
3. Set permission level for that workspace (View / Edit / Admin)

## User Groups

Group users to assign workspace permissions efficiently:
1. Admin Panel → **User Groups** → **New Group**
2. Add users to the group
3. Assign the group to workspaces instead of individual users

## Resetting Passwords

### [CE Express](https://www.google.com/search?q=Cellular+Expert+CE+Express+web+platform) Account (local)

Admin Panel → Users → select user → **Reset Password** → enter new password.

Or the user can use **Reset password** on the login page (requires email configured).

### ArcGIS Account

Use [ArcGIS Portal](https://www.google.com/search?q=ArcGIS+Portal+enterprise+GIS) admin tools to reset. CE Express does not manage ArcGIS passwords.

## License Management

Admin Panel → **License Manager**:
- View current license status (expiry date, licensed features)
- Activate a new license key
- Check concurrent user count

## History / Audit Log

Admin Panel → **History**:
- View all user actions (object creation, edits, deletions, predictions)
- Filter by user, date, action type
- Export to [CSV](https://www.google.com/search?q=CSV+comma-separated+values+file+format)

## Related Topics

- [Installation Guide →](#ce-express-admin-installation)
- [Logging In →](#ce-express-login)
