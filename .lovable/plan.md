

# Plan: Admin-Only Access Controls

## Summary
Restrict three areas of the app to admin users only:
1. **Settings page** -- only admin can access/change settings
2. **Invoice management** -- only admin can create, edit, or delete invoices (non-admins can still view the dashboard)
3. **Used B/L page** -- completely hidden from non-admin users (invisible in navigation + routes blocked)

---

## Changes

### 1. Header Navigation (`src/components/Header.tsx`)
- Hide the **"Used B/L"** nav item for non-admin users (same pattern already used for the Admin Panel link)
- Hide the **"Settings"** nav item for non-admin users
- Hide the **"New Invoice"** nav item for non-admin users

### 2. Route Protection (`src/App.tsx`)
- Wrap `/settings`, `/new-invoice`, `/used-bl`, `/used-bl/new`, `/used-bl/:id`, `/used-bl/:id/edit` routes with an `AdminRoute` component
- `AdminRoute` checks `useAdmin()` and redirects non-admins to `/dashboard`

### 3. Dashboard Page (`src/pages/Dashboard.tsx`)
- Hide the delete, edit, and bulk-delete buttons/actions for non-admin users
- Hide CSV import functionality for non-admins
- Non-admins can still view invoices and export data

### 4. New Component: `AdminRoute` (inline in `src/App.tsx`)
A small wrapper component similar to `ProtectedRoute`:
- Uses `useAdmin()` hook
- Shows a loading spinner while checking admin status
- Redirects to `/dashboard` if user is not admin

---

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add `AdminRoute` component; wrap admin-only routes with it |
| `src/components/Header.tsx` | Conditionally show Settings, New Invoice, and Used B/L nav items only for admins |
| `src/pages/Dashboard.tsx` | Hide edit/delete/import actions for non-admin users using `useAdmin()` hook |

### AdminRoute Component (in App.tsx)

```text
const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAdmin();
  if (loading) return <spinner />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};
```

### Navigation Filtering (Header.tsx)

Currently the Used B/L and Settings items are always shown. They will be moved into the conditional admin block alongside the existing Admin Panel item:

```text
const navItems = [
  { path: '/dashboard', ... },
  ...(isAdmin ? [{ path: '/new-invoice', ... }] : []),
  ...(isAdmin ? [{ path: '/used-bl', ... }] : []),
  { path: '/insights', ... },
  { path: '/contact', ... },
  ...(isAdmin ? [{ path: '/settings', ... }] : []),
  ...(isAdmin ? [{ path: '/admin', ... }] : []),
];
```

### Dashboard Restrictions

Add `useAdmin()` to the Dashboard component and conditionally render:
- Edit button on each invoice row -- admin only
- Delete button / bulk delete -- admin only
- CSV import button -- admin only
- The "New Invoice" quick-action button (if any) -- admin only

Non-admin users retain: viewing invoices, sorting, filtering, exporting CSV/PDF.

