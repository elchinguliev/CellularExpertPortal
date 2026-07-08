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

> **Version:** CE Express v7.2

Administrators manage users through the **CE Inventory3D web application admin interface**.

## User Roles

| Role | Access | Capabilities |
|------|--------|-------------|
| **Admin** | Full | All settings, [user management](#kw:adding-a-user:none), system config, all workspaces |
| **Editor** | Map + Data | Add/edit/delete objects, run predictions, manage own workspace objects |
| **Planner** | Map + Calculations | Run predictions, view data, limited editing |
| **Viewer** | Read-only | View map and data, no editing or predictions |

## Adding a User

1. Admin Panel → **[User Management](#kw:adding-a-user:none)** → **Add User**
2. Enter: Username, Email, Password (or ArcGIS account link)
3. Select **Role**
4. Assign **Workspace access** (which workspaces the user can see)
5. Click **Save**

## Assigning Workspace Access

Users only see workspaces they are assigned to.

1. Admin Panel → Workspaces → select workspace → **[User groups](#kw:user-groups:none)**
2. Add user or user group to the workspace
3. Set permission level for that workspace (View / Edit / Admin)

## User Groups

Group users to assign workspace permissions efficiently:
1. Admin Panel → **[User Groups](#kw:user-groups:none)** → **New Group**
2. Add users to the group
3. Assign the group to workspaces instead of individual users

## Resetting Passwords

### CE Express Account (local)

Admin Panel → Users → select user → **Reset Password** → enter new password.

Or the user can use **Reset password** on the login page (requires email configured).

### ArcGIS Account

Use ArcGIS Portal admin tools to reset. CE Express does not manage ArcGIS passwords.

## License Management

Admin Panel → **[License](#kw:license-management:none) Manager**:
- View current [license](#kw:license-management:none) status (expiry date, licensed features)
- Activate a new [license](#kw:license-management:none) key
- Check concurrent user count

## History / Audit Log

Admin Panel → **History**:
- View all user actions (object creation, edits, deletions, predictions)
- Filter by user, date, action type
- Export to CSV

## Related Topics

- Installation Guide →
- Logging In →
