

# Plan: Multi-Dashboard Support for Used B/L Module + Fix CSV Import/Export

## Summary
Add the ability to have multiple dashboards within the Used B/L Counting module (similar to how the invoices module already supports multiple dashboards). The first/default dashboard will be called "حوالات محمد خاص". Users can create, rename, and delete B/L dashboards from Settings. Also fix CSV import/export to work properly with the dashboard filtering.

---

## How It Works

Each B/L record will be linked to a specific B/L dashboard. When you switch dashboards, you only see records belonging to that dashboard. The form card header will show the name of the current dashboard instead of always showing "حوالات محمد خاص".

---

## Changes Required

### 1. Database: Add `bl_dashboards` Table and Link Records

Create a new `bl_dashboards` table (same pattern as the existing `dashboards` table for invoices) and add a `dashboard_id` column to `used_bl_counting`.

- **New table `bl_dashboards`**: `id`, `user_id`, `name`, `created_at`, `updated_at`
- **Add column** `dashboard_id` (uuid, nullable initially) to `used_bl_counting`
- RLS policies: users can only manage their own B/L dashboards
- Update the unique constraint on `bl_no` to be scoped per dashboard (not per user)

### 2. Settings Page: B/L Dashboard Manager

Add a new section in Settings (similar to the existing "Manage Dashboards" for invoices) that lets you:
- See all your B/L dashboards
- Add a new B/L dashboard
- Rename an existing dashboard
- Delete a dashboard (only if more than one exists)

### 3. Used B/L Dashboard Page: Dashboard Selector

Add a dashboard selector dropdown at the top of the `/used-bl` page:
- Shows the current dashboard name
- Switch between dashboards
- Quick "add new dashboard" button
- Records are filtered by the selected dashboard

### 4. Hook Updates (`useUsedBL`)

Update the `useUsedBL` hook to:
- Accept a `dashboardId` parameter
- Filter all queries by `dashboard_id`
- Include `dashboard_id` when inserting new records
- Manage B/L dashboards (CRUD operations)
- Track the currently selected B/L dashboard in localStorage

### 5. Form Updates

- The form header will dynamically show the dashboard name instead of hardcoded "حوالات محمد خاص"
- Pass the current `dashboard_id` when creating new records
- The card view will also show the dashboard name in its header

### 6. Fix CSV Import/Export

- **CSV Export**: Include a `DASHBOARD` column in the export so users know which dashboard the data belongs to. Export only records from the currently selected dashboard.
- **CSV Import**: Import records into the currently selected dashboard. Handle the mapping correctly:
  - If a CSV has 7 columns (the original format without dashboard), import all into the current dashboard
  - If a CSV has 8+ columns (with dashboard name column), still import into the current dashboard but log the original dashboard name in notes
- **PDF Export**: Also scoped to the current dashboard, with the dashboard name in the header

---

## Technical Details

### Database Migration SQL

```text
-- Create bl_dashboards table
CREATE TABLE public.bl_dashboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bl_dashboards ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own bl dashboards" ON public.bl_dashboards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bl dashboards" ON public.bl_dashboards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bl dashboards" ON public.bl_dashboards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bl dashboards" ON public.bl_dashboards FOR DELETE USING (auth.uid() = user_id);

-- Add dashboard_id to used_bl_counting
ALTER TABLE public.used_bl_counting ADD COLUMN dashboard_id UUID REFERENCES public.bl_dashboards(id);

-- Update unique index to be per-dashboard instead of per-user
DROP INDEX IF EXISTS idx_used_bl_counting_bl_no_user;
CREATE UNIQUE INDEX idx_used_bl_counting_bl_no_dashboard ON public.used_bl_counting (bl_no, dashboard_id) WHERE is_active = true;

-- Trigger for updated_at
CREATE TRIGGER update_bl_dashboards_updated_at
  BEFORE UPDATE ON public.bl_dashboards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

### Files to Create
| File | Purpose |
|------|---------|
| `src/components/BLDashboardSelector.tsx` | Dashboard selector dropdown for Used B/L page |
| `src/components/BLDashboardManager.tsx` | Dashboard management UI for Settings page |

### Files to Modify
| File | Changes |
|------|---------|
| `src/hooks/useUsedBL.ts` | Add dashboard CRUD, filter by dashboard_id, track current dashboard |
| `src/pages/UsedBLDashboard.tsx` | Add dashboard selector, scope data to selected dashboard |
| `src/pages/UsedBLNew.tsx` | Pass dashboard_id and dashboard name to form |
| `src/pages/UsedBLDetails.tsx` | Show dashboard name in card header |
| `src/pages/UsedBLEdit.tsx` | Pass dashboard name to form |
| `src/components/UsedBLForm.tsx` | Accept dynamic header name prop, include dashboard_id in data |
| `src/components/UsedBLCard.tsx` | Accept dynamic header name prop |
| `src/pages/Settings.tsx` | Add B/L Dashboard Manager section |
| `src/types/usedBL.ts` | Add `dashboard_id` to types, add `BLDashboard` interface |
| `src/contexts/LanguageContext.tsx` | Add translation keys for B/L dashboard management |

### CSV Import/Export Fix Details

**Export** will generate columns: `B/L NO, CONTAINER NO, INVOICE AMOUNT, INVOICE DATE, BANK, OWNER, USED FOR, NOTES`
- Only exports records from the current dashboard
- PDF header shows the dashboard name (e.g., "حوالات محمد خاص") instead of generic "USED B/L COUNTING"

**Import** will:
- Parse CSV rows properly (handle quoted fields, commas inside values)
- Assign `dashboard_id` of the currently selected dashboard to all imported records
- Skip empty rows and invalid data gracefully
- Report count of imported vs skipped records

