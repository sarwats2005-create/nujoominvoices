## Goal
Turn the Used B/L archive into a proper folder-based filing system with nesting, drill-in navigation, mandatory folder selection, and richer bulk actions.

## 1. Database (migration)
Add to `archive_folders`:
- `parent_id uuid NULL` — references `archive_folders(id) ON DELETE SET NULL`, enables sub-folders.
- Index on `(user_id, dashboard_id, parent_id)`.

No changes to `used_bl_counting` — `archive_folder_id` already exists and will continue to hold the leaf folder ID.

## 2. Archive flow changes (mandatory folder)
- Remove the "No folder" option from archive dialogs (single + bulk).
- The archive button is disabled until a folder is selected.
- Existing unfiled archived records remain accessible via an auto-shown "Unfiled" virtual folder (read-only system bucket) so nothing is lost. Once moved out it disappears when empty.
- Inside the archive dialog, add an inline "+ New folder" row that opens a small form (name, color, optional parent) and assigns the new folder immediately on create.

## 3. Folder browser (drill-in cards)
Replace the current flat folder filter tabs with a card-based browser inside the "Archived Records" section:

```text
[Archived Records] (collapsible)
  Breadcrumb: All Archives  >  Clients  >  2024
  ┌────────────┐ ┌────────────┐ ┌────────────┐
  │ 📁 Clients │ │ 📁 Suppliers│ │ 📁 Banks   │
  │ 12 records │ │ 4 records  │ │ 7 records  │
  │ $45,300    │ │ €2,100     │ │ $8,900     │
  └────────────┘ └────────────┘ └────────────┘
  Records directly in this folder:
  [archived table here]
```

- Folder cards show: color dot, name, child-folder count, record count (recursive), per-currency totals (recursive).
- Click a card → enter folder (breadcrumb updates, view shows that folder's sub-folders + its records).
- Breadcrumb segments are clickable to navigate back up.
- "All Archives" root shows top-level folders + records with no folder set ("Unfiled" pseudo-folder).
- Each card has a hover overlay with: rename, change color, change parent, delete.

## 4. Inline rename/recolor from cards & breadcrumb
- Pencil icon on each folder card opens a small popover (name input + color swatches + parent dropdown), saves on Enter / Save button.
- Same popover reachable from breadcrumb's current-folder name.

## 5. Bulk actions on archived records
Mirror the active-table pattern:
- Checkbox column on archived rows + select-all.
- Sticky bulk bar appears with: Move to folder…, Restore, Delete.
- "Move to folder" opens the folder picker (tree-style, with inline "+ New folder").

## 6. Per-folder currency totals
- Aggregated client-side from `archivedRecords` (one query already loads them all per dashboard).
- A helper walks the folder tree to compute recursive totals per currency, shown on cards and in the breadcrumb header.

## 7. Files to add / change

New:
- `src/components/archive/FolderBrowser.tsx` — cards, breadcrumb, drill-in state.
- `src/components/archive/FolderCard.tsx` — card with totals + inline edit popover.
- `src/components/archive/FolderPicker.tsx` — reusable tree picker with inline "+ New folder" (used by archive dialog, bulk move, card edit).
- `src/components/archive/ArchivedRecordsTable.tsx` — extracted table with multi-select + bulk bar.
- `src/hooks/useArchiveFolderTree.ts` — builds tree, computes per-folder recursive counts & currency totals.

Updated:
- `src/types/usedBL.ts` — add `parent_id: string | null` to `ArchiveFolder`.
- `src/hooks/useArchiveFolders.ts` — accept/return `parent_id`; add `moveFolder(id, parentId)`.
- `src/hooks/useUsedBL.ts` — add `moveArchivedToFolder(ids, folderId)` and `bulkDeleteArchived(ids)` (soft delete).
- `src/components/ArchiveFolderManager.tsx` — deprecated; replaced by FolderBrowser. Removed from page.
- `src/pages/UsedBLDashboard.tsx` — wire FolderBrowser into the Archived Records card; require folder on archive; pass through new bulk handlers.

## 8. Translation keys
Add EN / AR / KU keys for: "All Archives", "Choose a folder", "New folder", "Parent folder", "Move to folder", "Restore selected", "Delete selected", "Unfiled", "Sub-folders", "Records in this folder", "Folder required".

## 9. Technical notes
- Drill-in state lives in `UsedBLDashboard` as `currentFolderId: string | null` (null = root). Reset when the BL dashboard switches.
- Recursive deletion: deleting a folder with sub-folders prompts a choice — "Move children to parent" (default) or "Unfile children".
- Cycle prevention when changing a folder's parent: walk ancestors and reject if target is a descendant.
- All folder writes stay user-scoped via existing RLS on `archive_folders`.
- No changes to the active records table, dashboard selector, or non-archive logic.