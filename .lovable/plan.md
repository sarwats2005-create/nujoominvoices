## Add fallback navigation buttons

Add "Back to Dashboard" buttons on pages that currently lack an easy return path, and a matching quick-nav button on the Dashboard for symmetry.

### Changes

1. **`src/pages/NewInvoice.tsx`** — Add a secondary "Back to Dashboard" button above the form card (top-left), navigating to `/dashboard`. Uses `ArrowLeft` icon + existing button styling. Translation key `backToDashboard`.

2. **`src/pages/Insights.tsx`** — Add same "Back to Dashboard" button at the top of the page, left-aligned above the content.

3. **`src/pages/Dashboard.tsx`** — Add a small quick-nav row (top) with buttons: "New Invoice" (→ `/new-invoice`, admin-only) and "Insights" (→ `/insights`). This gives the reciprocal fallback the user asked for. Non-admin users only see Insights.

4. **`src/contexts/LanguageContext.tsx`** — Add translation keys `backToDashboard`, `goToInsights`, `goToNewInvoice` in EN / AR / KU.

### Technical notes
- Uses existing `useNavigate` from react-router-dom and shadcn `Button` with `variant="ghost"` or `outline`.
- No routing, backend, or business-logic changes.
- Admin gating on the Dashboard's "New Invoice" quick button reuses `useAdmin()` (already used elsewhere).
- RTL is handled automatically since icons sit inside the button next to translated text.