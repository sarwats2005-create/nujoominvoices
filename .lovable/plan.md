## POS & Inventory — Godmode Upgrade

Transform the POS/Inventory module into a full retail platform: multi-variant products, suppliers + purchase orders, returns/refunds, held sales, loyalty + store credit, complete reporting, barcode label printing, CSV import/export, low-stock alerts, and live cross-device realtime sync.

---

### 1. Database (single migration)

New tables (all with RLS `auth.uid() = user_id` and `updated_at` triggers):

- **suppliers** — name, phone, email, address, notes, balance, is_active
- **purchase_orders** — supplier_id, po_number, status (`draft|ordered|partial|received|cancelled`), order_date, expected_date, received_date, subtotal, tax, total, currency, notes
- **purchase_order_items** — po_id, product_id, variant_id, quantity_ordered, quantity_received, unit_cost, total
- **pos_returns** — original_sale_id, return_number, customer_id, refund_amount, refund_method (`cash|store_credit|original`), reason, notes
- **pos_return_items** — return_id, sale_item_id, product_id, variant_id, quantity, unit_price, refund_total, restock (bool)
- **held_sales** — cart_snapshot (jsonb), customer_id, hold_label, notes, held_at
- **loyalty_settings** — points_per_unit_currency, redemption_value, currency, enabled
- **loyalty_transactions** — customer_id, sale_id, type (`earn|redeem|adjust`), points, balance_after, notes
- **pos_settings** — receipt_header, receipt_footer, default_tax_rate, low_stock_alert_enabled, currency, store_name, logo_url

Extend existing tables:
- `customers`: add `loyalty_points` (numeric, default 0), `store_credit` (numeric, default 0)
- `pos_sales`: add `status` (`completed|refunded|partial_refund`), `refunded_amount`, `loyalty_earned`, `loyalty_redeemed`, `store_credit_used`
- `products`: add `track_stock` (bool), `allow_negative_stock` (bool)
- `stock_movements`: add `cost_price` (snapshot for valuation)

Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE` for products, product_variants, product_categories, customers, pos_sales, pos_sale_items, stock_movements, suppliers, purchase_orders, purchase_order_items, pos_returns, held_sales, loyalty_transactions.

---

### 2. Hooks (data layer + realtime)