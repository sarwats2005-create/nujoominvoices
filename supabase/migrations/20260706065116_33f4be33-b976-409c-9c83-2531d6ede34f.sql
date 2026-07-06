
-- 1. Warehouses
CREATE TABLE public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_main BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX warehouses_one_main_per_user ON public.warehouses(user_id) WHERE is_main = true;
CREATE INDEX warehouses_user_idx ON public.warehouses(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.warehouses TO authenticated;
GRANT ALL ON public.warehouses TO service_role;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own warehouses" ON public.warehouses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER warehouses_updated_at BEFORE UPDATE ON public.warehouses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Prevent deleting main warehouse
CREATE OR REPLACE FUNCTION public.prevent_main_warehouse_delete() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN IF OLD.is_main THEN RAISE EXCEPTION 'Cannot delete the main warehouse'; END IF; RETURN OLD; END; $$;
CREATE TRIGGER warehouses_prevent_main_delete BEFORE DELETE ON public.warehouses FOR EACH ROW EXECUTE FUNCTION public.prevent_main_warehouse_delete();

-- 2. Vaults
CREATE TABLE public.vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  is_main BOOLEAN NOT NULL DEFAULT false,
  is_open BOOLEAN NOT NULL DEFAULT true,
  pin_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX vaults_one_main_per_warehouse ON public.vaults(warehouse_id) WHERE is_main = true;
CREATE INDEX vaults_user_wh_idx ON public.vaults(user_id, warehouse_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vaults TO authenticated;
GRANT ALL ON public.vaults TO service_role;
ALTER TABLE public.vaults ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own vaults" ON public.vaults FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER vaults_updated_at BEFORE UPDATE ON public.vaults FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.prevent_main_vault_delete() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN IF OLD.is_main THEN RAISE EXCEPTION 'Cannot delete the main vault'; END IF; RETURN OLD; END; $$;
CREATE TRIGGER vaults_prevent_main_delete BEFORE DELETE ON public.vaults FOR EACH ROW EXECUTE FUNCTION public.prevent_main_vault_delete();

-- 3. Vault transactions ledger
CREATE TABLE public.vault_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  vault_id UUID NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('sale','refund','po_payment','deposit','withdrawal','transfer_in','transfer_out')),
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  reference_type TEXT,
  reference_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX vault_tx_vault_idx ON public.vault_transactions(vault_id, created_at DESC);
CREATE INDEX vault_tx_user_idx ON public.vault_transactions(user_id);
GRANT SELECT, INSERT ON public.vault_transactions TO authenticated;
GRANT ALL ON public.vault_transactions TO service_role;
ALTER TABLE public.vault_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own vault tx" ON public.vault_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own vault tx" ON public.vault_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Backfill: create main warehouse + main vault for every existing user, add warehouse/vault columns
ALTER TABLE public.products ADD COLUMN warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL;
ALTER TABLE public.product_variants ADD COLUMN warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL;
ALTER TABLE public.customers ADD COLUMN warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL;
ALTER TABLE public.suppliers ADD COLUMN warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL;
ALTER TABLE public.pos_sales ADD COLUMN warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL;
ALTER TABLE public.pos_sales ADD COLUMN vault_id UUID REFERENCES public.vaults(id) ON DELETE SET NULL;
ALTER TABLE public.pos_returns ADD COLUMN warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL;
ALTER TABLE public.pos_returns ADD COLUMN vault_id UUID REFERENCES public.vaults(id) ON DELETE SET NULL;
ALTER TABLE public.purchase_orders ADD COLUMN warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL;
ALTER TABLE public.purchase_orders ADD COLUMN vault_id UUID REFERENCES public.vaults(id) ON DELETE SET NULL;
ALTER TABLE public.stock_movements ADD COLUMN warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL;
ALTER TABLE public.loyalty_transactions ADD COLUMN warehouse_id UUID REFERENCES public.warehouses(id) ON DELETE SET NULL;

-- Seed main warehouse + main vault per user from profiles
DO $$
DECLARE r RECORD; wh_id UUID; v_id UUID;
BEGIN
  FOR r IN SELECT id FROM public.profiles LOOP
    INSERT INTO public.warehouses (user_id, name, is_main) VALUES (r.id, 'Main Warehouse', true) RETURNING id INTO wh_id;
    INSERT INTO public.vaults (user_id, warehouse_id, name, is_main, color) VALUES (r.id, wh_id, 'Main Vault', true, '#10B981') RETURNING id INTO v_id;
    UPDATE public.products SET warehouse_id = wh_id WHERE user_id = r.id AND warehouse_id IS NULL;
    UPDATE public.product_variants SET warehouse_id = wh_id WHERE user_id = r.id AND warehouse_id IS NULL;
    UPDATE public.customers SET warehouse_id = wh_id WHERE user_id = r.id AND warehouse_id IS NULL;
    UPDATE public.suppliers SET warehouse_id = wh_id WHERE user_id = r.id AND warehouse_id IS NULL;
    UPDATE public.pos_sales SET warehouse_id = wh_id, vault_id = v_id WHERE user_id = r.id AND warehouse_id IS NULL;
    UPDATE public.pos_returns SET warehouse_id = wh_id, vault_id = v_id WHERE user_id = r.id AND warehouse_id IS NULL;
    UPDATE public.purchase_orders SET warehouse_id = wh_id, vault_id = v_id WHERE user_id = r.id AND warehouse_id IS NULL;
    UPDATE public.stock_movements SET warehouse_id = wh_id WHERE user_id = r.id AND warehouse_id IS NULL;
    UPDATE public.loyalty_transactions SET warehouse_id = wh_id WHERE user_id = r.id AND warehouse_id IS NULL;
  END LOOP;
END $$;

-- 5. Auto-provision main warehouse + vault on new profile
CREATE OR REPLACE FUNCTION public.create_main_warehouse_for_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE wh_id UUID;
BEGIN
  INSERT INTO public.warehouses (user_id, name, is_main) VALUES (NEW.id, 'Main Warehouse', true) RETURNING id INTO wh_id;
  INSERT INTO public.vaults (user_id, warehouse_id, name, is_main, color) VALUES (NEW.id, wh_id, 'Main Vault', true, '#10B981');
  RETURN NEW;
END; $$;
CREATE TRIGGER profiles_create_main_warehouse AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.create_main_warehouse_for_user();
