## Goal
Add full Kurdish Sorani (ku) translation coverage to every page and component in the POS & Inventory module. Currently none of those files use the app's `useLanguage()` / `t()` system — all strings are hardcoded English. We'll wire them all into the existing trilingual (en/ar/ku) system used elsewhere in the app.

## Scope (files to localize)

Pages:
- `src/pages/POS.tsx` (cart, checkout, hold/recall, payment, receipt actions)
- `src/pages/Inventory.tsx` (products, categories, variants, stock movements, CSV)
- `src/pages/Suppliers.tsx`
- `src/pages/PurchaseOrders.tsx`
- `src/pages/Returns.tsx`
- `src/pages/POSReports.tsx` (Z-report, profit, top products, stock valuation)

Components:
- `src/components/pos/BarcodeScanner.tsx`
- Any POS-related dialogs/sub-components referenced above

Navigation:
- `src/components/Header.tsx` — POS/Inventory/Suppliers/Purchase Orders/Returns/Reports menu labels (translate any still-hardcoded ones)

## Approach

1. **Audit strings** — Grep each POS file for visible UI text (button labels, headings, placeholders, toast messages, empty states, table headers, dialog titles, validation messages).
2. **Add translation keys** to `src/contexts/LanguageContext.tsx` under a clearly delimited `// POS Module` section, with `en` / `ar` / `ku` values for every key. Group by sub-area (pos, inventory, suppliers, purchaseOrders, returns, reports, common).
3. **Wire pages** — In each page/component:
   - Import `useLanguage` from `@/contexts/LanguageContext`
   - Replace hardcoded strings with `t('key')`
   - Keep dynamic values (numbers, names, currency symbols) untouched — only swap the surrounding labels.
4. **Preserve RTL** — Kurdish and Arabic already trigger RTL via the existing language context; no extra work needed beyond using semantic Tailwind classes that already adapt.
5. **Toasts & validation** — Translate `toast({ title, description })` strings and any `zod`/inline validation messages.

## Out of scope

- No changes to business logic, database, hooks, or component structure.
- PDF/receipt body text stays in its current language(s) unless trivially keyed (we'll translate only the user-facing UI; printed receipts can be a follow-up).
- No font swaps — Kurdish renders with current fonts.

## Verification

- Switch language in the header to Kurdish (ku) and walk through: POS sale flow, hold/recall, Inventory CRUD, Suppliers, Purchase Orders, Returns, POS Reports.
- Switch to Arabic and confirm RTL still looks correct.
- Build passes; no missing `t()` keys (fallback returns the key name, which would be obvious).

## Notes
- Estimated ~150–200 new translation keys.
- Single PR-style change set; one pass per file to minimize re-reads.
