
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS loyalty_points numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS store_credit numeric NOT NULL DEFAULT 0;

ALTER TABLE public.pos_sales
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS refunded_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS loyalty_earned numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS loyalty_redeemed numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS store_credit_used numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS track_stock boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_negative_stock boolean NOT NULL DEFAULT false;

ALTER TABLE public.stock_movements
  ADD COLUMN IF NOT EXISTS cost_price numeric;

CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  phone text, email text, address text, notes text,
  balance numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own suppliers" ON public.suppliers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_suppliers_updated BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  po_number text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  expected_date date, received_date date,
  subtotal numeric NOT NULL DEFAULT 0,
  tax numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own POs" ON public.purchase_orders FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_po_updated BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id uuid NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id uuid, variant_id uuid,
  product_name text NOT NULL,
  quantity_ordered numeric NOT NULL DEFAULT 0,
  quantity_received numeric NOT NULL DEFAULT 0,
  unit_cost numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own PO items" ON public.purchase_order_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.purchase_orders po WHERE po.id = po_id AND po.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.purchase_orders po WHERE po.id = po_id AND po.user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.pos_returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  original_sale_id uuid REFERENCES public.pos_sales(id) ON DELETE SET NULL,
  return_number text NOT NULL,
  customer_id uuid,
  refund_amount numeric NOT NULL DEFAULT 0,
  refund_method text NOT NULL DEFAULT 'cash',
  reason text, notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pos_returns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own returns" ON public.pos_returns FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.pos_return_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id uuid NOT NULL REFERENCES public.pos_returns(id) ON DELETE CASCADE,
  sale_item_id uuid, product_id uuid, variant_id uuid,
  product_name text NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  unit_price numeric NOT NULL DEFAULT 0,
  refund_total numeric NOT NULL DEFAULT 0,
  restock boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pos_return_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own return items" ON public.pos_return_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pos_returns r WHERE r.id = return_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pos_returns r WHERE r.id = return_id AND r.user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.held_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  customer_id uuid,
  hold_label text,
  cart_snapshot jsonb NOT NULL,
  notes text,
  held_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.held_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own held sales" ON public.held_sales FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.loyalty_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  enabled boolean NOT NULL DEFAULT false,
  points_per_unit_currency numeric NOT NULL DEFAULT 1,
  redemption_value numeric NOT NULL DEFAULT 0.01,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own loyalty settings" ON public.loyalty_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_loyalty_settings_updated BEFORE UPDATE ON public.loyalty_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  sale_id uuid,
  type text NOT NULL,
  points numeric NOT NULL DEFAULT 0,
  balance_after numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own loyalty txns" ON public.loyalty_transactions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.pos_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  store_name text,
  receipt_header text,
  receipt_footer text,
  default_tax_rate numeric NOT NULL DEFAULT 0,
  low_stock_alert_enabled boolean NOT NULL DEFAULT true,
  currency text NOT NULL DEFAULT 'USD',
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pos_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own pos settings" ON public.pos_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_pos_settings_updated BEFORE UPDATE ON public.pos_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_suppliers_user ON public.suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_po_user ON public.purchase_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_po_supplier ON public.purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_po_items_po ON public.purchase_order_items(po_id);
CREATE INDEX IF NOT EXISTS idx_returns_user ON public.pos_returns(user_id);
CREATE INDEX IF NOT EXISTS idx_returns_sale ON public.pos_returns(original_sale_id);
CREATE INDEX IF NOT EXISTS idx_return_items_return ON public.pos_return_items(return_id);
CREATE INDEX IF NOT EXISTS idx_held_user ON public.held_sales(user_id);
CREATE INDEX IF NOT EXISTS idx_loy_txn_user ON public.loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loy_txn_customer ON public.loyalty_transactions(customer_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_variants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pos_sales;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pos_sale_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_movements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.suppliers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pos_returns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pos_return_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.held_sales;
ALTER PUBLICATION supabase_realtime ADD TABLE public.loyalty_transactions;

ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.product_variants REPLICA IDENTITY FULL;
ALTER TABLE public.product_categories REPLICA IDENTITY FULL;
ALTER TABLE public.customers REPLICA IDENTITY FULL;
ALTER TABLE public.pos_sales REPLICA IDENTITY FULL;
ALTER TABLE public.pos_sale_items REPLICA IDENTITY FULL;
ALTER TABLE public.stock_movements REPLICA IDENTITY FULL;
ALTER TABLE public.suppliers REPLICA IDENTITY FULL;
ALTER TABLE public.purchase_orders REPLICA IDENTITY FULL;
ALTER TABLE public.purchase_order_items REPLICA IDENTITY FULL;
ALTER TABLE public.pos_returns REPLICA IDENTITY FULL;
ALTER TABLE public.pos_return_items REPLICA IDENTITY FULL;
ALTER TABLE public.held_sales REPLICA IDENTITY FULL;
ALTER TABLE public.loyalty_transactions REPLICA IDENTITY FULL;
