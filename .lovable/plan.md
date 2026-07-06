
## POS Warehouses & Vaults

Add multi-warehouse support to POS with per-warehouse vaults that route all cash movements. Vaults have color, optional PIN, and open/closed state.

### 1. Database (migration)

New tables (all `user_id`-scoped, RLS on, GRANTs for authenticated + service_role):

- **warehouses** — `id, user_id, name, is_main bool, is_active, created_at, updated_at`. Trigger ensures exactly one `is_main=true` per user; main cannot be deleted.
- **vaults** — `id, user_id, warehouse_id (fk), name, color (hex), is_main bool, is_open bool default true, pin_hash text nullable, created_at, updated_at`. One main vault per warehouse, not deletable.
- **vault_transactions** — `id, user_id, vault_id, warehouse_id, type (sale|refund|po_payment|deposit|withdrawal|transfer_in|transfer_out), amount, currency, reference_type, reference_id, notes, created_at`. Immutable ledger.

Add `warehouse_id` + `vault_id` columns (nullable at first, backfilled to main) to: `products`/`product_variants` (stock per warehouse via new **variant_stock** table: `variant_id, warehouse_id, stock_quantity, min_stock_level`), `pos_sales`, `pos_returns`, `stock_movements`, `customers`, `suppliers`, `purchase_orders`, `loyalty_transactions`.

Data migration: create one "Main Warehouse" + "Main Vault" per existing user, backfill all POS rows with those ids, move existing `product_variants.stock_quantity` into `variant_stock`.

### 2. Edge functions

- **vault-pin** — actions: `set_pin`, `verify_pin`, `remove_pin`, `open_vault`, `close_vault`. Hashes PIN with bcrypt (via `npm:bcryptjs`), validates JWT, enforces 4–6 digit numeric PIN, rate-limits verify attempts via existing `auth_rate_limits` (`attempt_type='vault_pin:<vault_id>'`). Never returns the hash. Closing a vault requires PIN if one is set.

### 3. Frontend routing

- New route `/pos` → warehouse picker grid (cards per warehouse, "Add warehouse" tile).
- `/pos/:warehouseId` → existing POS page, scoped to that warehouse.
- Same pattern for `/inventory/:warehouseId`, `/suppliers/:warehouseId`, `/purchase-orders/:warehouseId`, `/returns/:warehouseId`, `/pos-reports/:warehouseId`. Header shows active warehouse + quick switcher.

### 4. Vault UI

- **Vault sidebar** on POS page: list of vaults for the active warehouse, each showing color chip, name, open/closed badge, balance in each currency.
- Active vault is selected before checkout; selector disabled if no open vault.
- **Manage vaults** dialog: create/rename/recolor, set/remove PIN, mark closed. Main vault: delete disabled.
- **Open vault flow**: numeric keypad modal → calls `vault-pin/open_vault` → optimistic UI on success.
- **Close vault flow**: keypad if PIN set, otherwise instant.
- Guard: `completeSale`, refund, PO payment, and manual transfer all refuse if selected vault `is_open=false`.

### 5. Cash routing

Extend `usePOS.completeSale`, returns hook, and PO payment flow to insert a `vault_transactions` row for every cash movement, tagged with the active `vault_id` + `warehouse_id`. Transfers between vaults insert paired `transfer_out`/`transfer_in` rows in a single call.

### 6. Hooks / types

- `useWarehouses`, `useVaults`, `useVaultTransactions` (with realtime).
- Extend `useProducts`, `useRetail`, `usePOS`, `useCustomers` to accept `warehouseId`.
- Add `WarehouseContext` providing the current `warehouseId` from the URL param.

### 7. Translation keys

Add EN/AR/KU keys: `warehouses`, `mainWarehouse`, `addWarehouse`, `vaults`, `mainVault`, `openVault`, `closeVault`, `setPin`, `enterPin`, `wrongPin`, `vaultClosed`, `transferBetweenVaults`, etc.

### Technical notes
- PIN: 4–6 digits, bcrypt-hashed server-side, verified through edge function with `auth_rate_limits` (5 attempts / 15 min, 30 min block).
- Cycle prevention n/a; no nesting.
- Stock model changes are breaking — the migration backfills so existing sales stay valid.
- No changes to invoice / unused-BL / used-BL modules.
