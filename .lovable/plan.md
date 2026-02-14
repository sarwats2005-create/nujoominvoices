

# Expenses Tracker Module -- Implementation Plan

## Overview

Build a full Expenses Tracker module with multi-company support, multi-currency (IQD base + USD), exchange rate management, branded PDF reports, and rich dashboards. The module integrates into the existing app as new pages and a Company Switcher in the header.

This is a large feature set. It will be implemented in **5 phases**, each delivering a usable increment.

---

## Phase 1: Foundation -- Companies, Storage, and Company Switcher

### Database Tables

**companies**
- id (uuid, PK)
- user_id (uuid, NOT NULL)
- name (text, NOT NULL)
- name_ar (text, nullable)
- phones (text[], nullable)
- address (text, nullable)
- address_ar (text, nullable)
- website (text, nullable)
- email (text, nullable)
- notes (text, nullable)
- tax_info (text, nullable)
- default_currency (text, default 'IQD')
- base_currency (text, default 'IQD')
- is_active (boolean, default true)
- created_at, updated_at
- RLS: users CRUD their own rows

**company_templates**
- id (uuid, PK)
- company_id (uuid, FK -> companies)
- user_id (uuid, NOT NULL)
- name (text, NOT NULL)
- header_image_url (text, NOT NULL) -- stored in Supabase Storage
- is_default (boolean, default false)
- is_active (boolean, default true)
- created_at, updated_at
- RLS: users CRUD their own rows

### Storage Buckets
- `company-logos` (public) -- company logo images
- `company-templates` (public) -- header template images
- `expense-attachments` (private) -- receipt images/PDFs

### Company Switcher
- New `CompanyContext` provider wrapping the app
  - Stores `currentCompanyId` in localStorage
  - Provides `companies`, `currentCompany`, `setCurrentCompanyId`
  - Auto-creates a default company if none exist
- Dropdown in Header showing current company name
- Admin-only "All Companies" option

### New Pages
- `/companies` -- CRUD list of companies (admin only)
- `/companies/:id/templates` -- manage header templates per company

### Files to Create/Modify
| File | Action |
|------|--------|
| Migration SQL | Create `companies`, `company_templates` tables, storage buckets |
| `src/contexts/CompanyContext.tsx` | New context provider |
| `src/components/CompanySwitcher.tsx` | New dropdown component for header |
| `src/components/Header.tsx` | Add CompanySwitcher |
| `src/pages/Companies.tsx` | New CRUD page |
| `src/pages/CompanyTemplates.tsx` | New template management page |
| `src/App.tsx` | Add CompanyProvider, new routes |
| `src/contexts/LanguageContext.tsx` | Add translations for all new strings |

---

## Phase 2: Categories, Vendors, and Exchange Rates

### Database Tables

**expense_categories**
- id, company_id, user_id
- name (text), parent_id (uuid, nullable, self-ref for subcategories)
- category_type (text: 'fixed' / 'variable' / 'one_time')
- monthly_budget (numeric, nullable)
- is_active, created_at, updated_at

**expense_vendors**
- id, company_id, user_id
- name (text), phone (text, nullable), notes (text, nullable)
- is_active, created_at, updated_at

**exchange_rates**
- id, user_id
- rate_date (date, NOT NULL)
- usd_to_iqd (numeric, NOT NULL)
- source (text: 'manual' / 'api' / 'note')
- is_default (boolean, default true)
- company_id (uuid, nullable -- null means global)
- created_at, updated_at
- Unique constraint on (rate_date, company_id)

**exchange_rate_audit**
- id, exchange_rate_id, user_id
- old_rate, new_rate, changed_at

### New Pages
- `/expenses/categories` -- category CRUD with subcategory support
- `/expenses/vendors` -- vendor CRUD
- `/expenses/exchange-rates` -- rate management (Settings sub-page)

### Files to Create/Modify
| File | Action |
|------|--------|
| Migration SQL | Create 4 tables above |
| `src/hooks/useCategories.ts` | CRUD hook |
| `src/hooks/useVendors.ts` | CRUD hook |
| `src/hooks/useExchangeRates.ts` | CRUD hook with "get rate for date" logic |
| `src/pages/ExpenseCategories.tsx` | New page |
| `src/pages/ExpenseVendors.tsx` | New page |
| `src/pages/ExchangeRates.tsx` | New page |
| `src/App.tsx` | Add routes |

---

## Phase 3: Expenses CRUD (Core)

### Database Tables

**expenses**
- id (uuid, PK)
- company_id (uuid, FK -> companies, NOT NULL)
- user_id (uuid, NOT NULL)
- expense_date (date, NOT NULL)
- original_amount (numeric, NOT NULL, > 0)
- original_currency (text, NOT NULL: 'IQD' or 'USD')
- exchange_rate_usd_to_iqd (numeric, nullable -- required when currency is USD)
- base_amount_iqd (numeric, NOT NULL -- auto-calculated)
- category_id (uuid, FK -> expense_categories, NOT NULL)
- subcategory_id (uuid, FK -> expense_categories, nullable)
- vendor_id (uuid, FK -> expense_vendors, nullable)
- payment_method (text: 'cash' / 'bank_transfer' / 'card' / 'other')
- project (text, nullable)
- branch (text, nullable)
- department (text, nullable)
- notes (text, nullable)
- tags (text[], nullable)
- status (text: 'draft' / 'posted' / 'void', default 'draft')
- created_by (uuid)
- created_at, updated_at

**expense_attachments**
- id, expense_id (FK), user_id
- file_url (text), file_name (text), file_type (text)
- created_at

**expense_audit_log**
- id, expense_id, user_id
- action (text: 'create' / 'update' / 'void' / 'post')
- old_data (jsonb), new_data (jsonb)
- created_at

### Expense Form UX
- When Currency = USD:
  - Auto-fill exchange rate from saved rate for expense date
  - Show live conversion: `USD Amount x Rate = IQD Base Amount`
  - "Use Today's Rate" button
  - "Update Today's Rate" button (opens inline modal)
- Validation: no negative amounts, exchange rate required for USD
- Editing a posted expense creates an audit log entry

### New Pages
- `/expenses` -- main expense list with filters, search, pagination
- `/expenses/new` -- expense form
- `/expenses/:id` -- expense detail view
- `/expenses/:id/edit` -- edit form

### Files to Create/Modify
| File | Action |
|------|--------|
| Migration SQL | Create `expenses`, `expense_attachments`, `expense_audit_log` |
| `src/hooks/useExpenses.ts` | Full CRUD + filtering + audit |
| `src/types/expenses.ts` | TypeScript interfaces |
| `src/components/ExpenseForm.tsx` | Form with currency logic |
| `src/components/ExpenseCard.tsx` | List item component |
| `src/pages/Expenses.tsx` | Main list page |
| `src/pages/ExpenseNew.tsx` | New expense |
| `src/pages/ExpenseDetail.tsx` | Detail view |
| `src/pages/ExpenseEdit.tsx` | Edit page |
| `src/components/Header.tsx` | Add "Expenses" nav item |

---

## Phase 4: Dashboards

### Dashboard Views (all scoped by current company)

1. **Overview Dashboard** -- Total this month/year (IQD base), month-over-month change, top categories, top vendors, cash vs bank split, USD spending line
2. **Category Dashboard** -- Spend by category with trends, budget vs actual bars
3. **Vendor Dashboard** -- Spend by vendor with trends
4. **Project/Branch Dashboard** -- Filter by project/branch
5. **Accountant Dashboard** -- Full table with all filters, export, audit view

### Filters (available on all dashboards)
- Date range, Currency (IQD/USD/All), Category, Vendor, Payment method, Project/Branch, User

### Files to Create/Modify
| File | Action |
|------|--------|
| `src/pages/ExpenseDashboard.tsx` | New page with dashboard selector tabs |
| `src/components/ExpenseOverviewDash.tsx` | Overview cards + charts |
| `src/components/ExpenseCategoryDash.tsx` | Category breakdown |
| `src/components/ExpenseVendorDash.tsx` | Vendor analytics |
| `src/components/ExpenseFilters.tsx` | Shared filter panel |

---

## Phase 5: Reports and PDF Generation

### Report Types
1. Monthly Expense Summary PDF
2. Monthly Category Breakdown PDF
3. Vendor Summary PDF
4. Excel export (raw + summary)

### PDF Branding
- Place selected company header template image at the top
- Clean invoice-style layout with spacing and footer
- Include: Month/Year, total IQD, totals by currency, category table, top vendors, payment split
- File naming: `Expenses_Report_<CompanyName>_YYYY_MM.pdf`

### Report History Table

**expense_report_runs**
- id, company_id, user_id
- template_id (uuid, FK -> company_templates)
- report_type (text)
- date_range_start, date_range_end
- metadata_snapshot (jsonb -- company name, template used, totals at time of generation)
- file_url (text -- stored PDF in storage)
- created_at

### Files to Create/Modify
| File | Action |
|------|--------|
| Migration SQL | Create `expense_report_runs` table |
| `src/pages/ExpenseReports.tsx` | Report generation page |
| `src/components/ExpenseReportGenerator.tsx` | PDF generation logic using jspdf |
| `src/hooks/useExpenseReports.ts` | Report history CRUD |

---

## Navigation Structure

The header will get a new "Expenses" nav item (admin-only) that leads to `/expenses`. From there, a sub-navigation provides access to:
- Expenses list
- Categories
- Vendors
- Dashboards
- Reports
- Exchange Rates

Companies management is accessible from the Company Switcher dropdown or Settings.

---

## Technical Notes

- All tables use RLS scoped by `user_id` with `has_role()` for admin-only features
- Storage buckets use RLS policies for authenticated upload/download
- Exchange rates are stored per-expense so historical reports stay accurate
- `base_amount_iqd` is always calculated and stored (IQD expenses: amount as-is; USD expenses: amount * rate, rounded to 0 decimals)
- Company Switcher context wraps the entire app similarly to `SettingsProvider`
- Existing pages (Dashboard, Used B/L, etc.) are unaffected
- All new translations added to `LanguageContext` for en/ar/ku

---

## Implementation Order

Phase 1 will be implemented first. Each subsequent phase builds on the previous one. I will ask for approval before starting each phase so you can test incrementally.

