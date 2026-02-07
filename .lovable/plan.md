

# Fix Date Timezone Bug Across the Project

## The Problem
When you enter a date like **07/02/2026** on the New Invoice form, it shows up as **06/02/2026** on the Dashboard. This happens because `toISOString()` converts dates to UTC timezone, which shifts the date backward for users in timezones ahead of UTC (like Iraq, UTC+3).

## Root Cause
- **New Invoice page** uses `date.toISOString()` which converts local midnight to UTC (shifting the date back)
- **Dashboard** then parses these UTC strings, sometimes showing the wrong date
- The same issue affects Swift Date

## The Fix

### 1. Create a date utility helper (`src/lib/dateUtils.ts`)
A new file with two helper functions used everywhere:
- `formatDateToString(date)` -- Converts a Date object to `YYYY-MM-DD` string using local time (not UTC)
- `parseDateString(dateStr)` -- Parses a `YYYY-MM-DD` string into a Date using local time components, avoiding UTC interpretation

### 2. Fix New Invoice page (`src/pages/NewInvoice.tsx`)
Replace `date.toISOString()` with `formatDateToString(date)` for both the invoice date and swift date fields. This stores `2026-02-07` instead of `2026-02-06T21:00:00.000Z`.

### 3. Fix Dashboard page (`src/pages/Dashboard.tsx`)
Replace all instances of `new Date(inv.date)` and `new Date(inv.swiftDate)` with `parseDateString(...)` across:
- Table cell display (invoice date and swift date columns)
- Search filtering
- Copy to clipboard
- CSV export
- Print view
- PDF export
- Swift date countdown calculation
- Date sorting

### 4. Fix Edit Invoice dialog (`src/components/EditInvoiceDialog.tsx`)
Replace `new Date(invoice.date)` and `new Date(invoice.swiftDate)` with `parseDateString(...)` when populating the edit form.

### 5. Fix Zapier Sync dialog (`src/components/ZapierSyncDialog.tsx`)
Replace `new Date(inv.date)` with `parseDateString(...)` for the date formatting.

---

## Technical Details

**New file: `src/lib/dateUtils.ts`**
```typescript
// Formats a Date to YYYY-MM-DD using LOCAL time (avoids UTC shift)
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parses YYYY-MM-DD string to Date using LOCAL time (avoids UTC shift)
export function parseDateString(dateStr: string): Date {
  if (!dateStr) return new Date();
  // If it's already an ISO string with time, extract just the date part
  const datePart = dateStr.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day);
}
```

**Files modified (4 files):**

| File | What changes |
|------|-------------|
| `src/lib/dateUtils.ts` | New file with timezone-safe date helpers |
| `src/pages/NewInvoice.tsx` | Use `formatDateToString()` instead of `.toISOString()` |
| `src/pages/Dashboard.tsx` | Use `parseDateString()` instead of `new Date()` in ~12 locations |
| `src/components/EditInvoiceDialog.tsx` | Use `parseDateString()` instead of `new Date()` for form population |
| `src/components/ZapierSyncDialog.tsx` | Use `parseDateString()` instead of `new Date()` |

This fix ensures the date you enter is exactly the date that appears on the Dashboard -- no more off-by-one day shifts regardless of your timezone.

