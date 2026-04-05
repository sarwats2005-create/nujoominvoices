

# Multi-Invoice per B/L System

## What this does
Currently, one Unused B/L can only be converted to one Used B/L record. This upgrade allows a single B/L to be used for **multiple invoices** (each with its own currency, amount, customer, bank, etc.). The Used B/L dashboard and Account Statement will visually group these sibling records together.

## Architecture Changes

### 1. Database — No schema changes needed
The `used_bl_counting` table already has `source_unused_bl_id` linking back to the source Unused B/L. Multiple rows can share the same `source_unused_bl_id`. We just need to stop marking the Unused B/L as "USED" after the first invoice (or track a count).

### 2. Hook Changes — `useUnusedBL.ts`
- **`useBL` function**: Instead of marking the Unused B/L status as `USED` on every call, change logic to:
  - Insert the new `used_bl_counting` row (same as now)
  - Update `unused_bl.status = 'USED'` and `used_at` (keep doing this — the B/L is indeed used)
  - But allow calling `useBL` again on an already-USED record (remove the implicit filter that only shows UNUSED records in the modal context)
- **`revertBL` function**: Only revert the Unused B/L to `UNUSED` status if ALL sibling used records are deleted/deactivated (check count of active `used_bl_counting` rows with same `source_unused_bl_id`)

### 3. UseBLModal — Multi-invoice support
- Redesign `UseBLModal.tsx` to support adding **multiple invoice entries** in one session:
  - Add an "Add Another Invoice" button that appends a new invoice form row
  - Each row has: Customer, Beneficiary, Bank, Currency, Amount, Date, Manufacturer, Dashboard
  - On confirm, loop through all entries and call `useBL` for each
- Also allow re-opening the "Use" action on an already-USED B/L from the Unused B/L page (show USED records with an "Add Invoice" option)

### 4. Used B/L Dashboard — Visual grouping
- In `UsedBLDashboard.tsx`, after sorting/filtering, group records that share the same `source_unused_bl_id`
- Render sibling records stacked together with a thin colored left-border outline (e.g., `border-l-2 border-primary`) and a subtle shared background
- Show a small badge like "1 of 2" or "Shared B/L" on grouped rows
- Allow adding more invoices to the same B/L from the Used B/L dashboard via an "Add Invoice" button on grouped rows

### 5. Used B/L Details — Edit & Add more invoices
- On `UsedBLDetails.tsx`, show all sibling records for the same source B/L
- Add an "Add Another Invoice" button that opens a form to create another `used_bl_counting` row with the same `source_unused_bl_id` and B/L metadata
- Each sibling record remains independently editable via the existing edit page

### 6. Account Statement — Grouped display
- In `UnusedBLOwnerDetail.tsx`, when listing used records for an owner, group records sharing the same `source_unused_bl_id` (or same `bl_no`)
- Display them stacked with a visual indicator (thin outline, indented sub-rows)
- In the PDF exports (both Professional and Government), render multi-invoice B/Ls as a parent row + indented child rows with subtotals per B/L

## Files to modify
1. **`src/hooks/useUnusedBL.ts`** — Update `useBL` to allow multi-use, update `revertBL` to check sibling count
2. **`src/components/unused-bl/UseBLModal.tsx`** — Add multi-invoice form with "Add Another Invoice" button
3. **`src/pages/UnusedBLDashboard.tsx`** — Show "Add Invoice" action on USED records  
4. **`src/pages/UsedBLDashboard.tsx`** — Group sibling records visually with outline styling
5. **`src/pages/UsedBLDetails.tsx`** — Show siblings, add "Add Invoice" button
6. **`src/pages/UnusedBLOwnerDetail.tsx`** — Group multi-invoice B/Ls in statement + PDF

## Implementation order
1. Hook logic changes (allow multi-use, smart revert)
2. UseBLModal multi-invoice form
3. Unused B/L dashboard "Add Invoice" on USED records
4. Used B/L dashboard visual grouping
5. Used B/L details — sibling display + add more
6. Account statement grouping + PDF updates

