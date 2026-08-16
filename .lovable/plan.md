# Transaction Types, Live Insights, and Bank Statements

## 1. Transaction type column on invoice dashboards

A new managed list of transaction types (code + label + color), shared across every dashboard.

- Manage the list from Settings: add, rename, recolor, delete. Entries look like `01 - Import Transfer`.
- New "Type" column in the dashboard table, showing the code (and label on hover) as a colored badge using each type's own color.
- Set the type on a single invoice inline from the row, and on many invoices at once via a bulk "Set Type" action next to the existing Move/Delete bulk actions (including "Clear type").
- New "Type" filter in the dashboard filter bar (multi-select, plus "No type").
- Export (PDF/Excel) always exports exactly what is currently visible: the active search, status, date, bank and type filters, in the current sort order, with the Type column included.
- Deleting a type does not delete invoices; affected invoices simply become untyped.

## 2. Insights page — live and scoped

- New dashboard scope selector at the top: multi-select list of dashboards with "Select all" / "Clear", defaulting to all.
- All figures recalculate from the selected dashboards combined, sourced live from the database (not just the currently open dashboard), and refresh when invoices change.
- Every invoice column feeds a breakdown: amount and count by bank, by currency, by status, by beneficiary, by transaction type (using type colors), by month, plus swift-date tracking (swift issued vs pending) and container coverage.
- When more than one dashboard is selected, add a per-dashboard comparison table (invoice count, total per currency, received vs pending).

## 3. Professional per-bank account statements

- New "Bank Statement" export on the dashboard: pick a bank (or all banks, one section each) and a date range.
- Layout: company name heading, statement title, bank name, generation date and time, dashboard name(s), and the applied filters line.
- Table rows: date, invoice number, beneficiary, container, transaction type, swift date, status, amount + currency.
- Footer per bank: number of rows and total amount grouped by currency; grand total when multiple banks are included.
- Available as PDF and Excel, honoring the same visible-data rule as the normal export, and Arabic/Kurdish safe via the existing Amiri font pipeline.

## Technical notes

- New table `public.transaction_types` (`id`, `user_id`, `code`, `label`, `color`, `sort_order`, timestamps) with GRANTs and per-user RLS; unique on (`user_id`, `code`).
- New nullable `transaction_type_id` column on `invoices` referencing `transaction_types` with `ON DELETE SET NULL`.
- New `useTransactionTypes` hook; `InvoiceContext` gains `transactionTypeId` on the `Invoice` model plus `setInvoiceType` and `setInvoicesType` (bulk) mutations.
- Insights switches to a scope-aware fetch (all dashboards for the user, filtered client-side by selected dashboard ids) instead of the single-dashboard context list.
- Statement generation lives in a shared `src/lib/statementExport.ts` used by both PDF (jsPDF + autoTable, Amiri registered) and Excel (xlsx) paths, so both outputs stay identical in content.
- New translation keys added for English, Arabic and Kurdish Sorani.
