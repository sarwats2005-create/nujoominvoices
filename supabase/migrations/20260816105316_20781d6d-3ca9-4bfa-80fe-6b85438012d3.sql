CREATE TABLE public.transaction_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  code TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#3B82F6',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, code)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.transaction_types TO authenticated;
GRANT ALL ON public.transaction_types TO service_role;

ALTER TABLE public.transaction_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own transaction types"
ON public.transaction_types FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_transaction_types_updated_at
BEFORE UPDATE ON public.transaction_types
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.invoices
ADD COLUMN transaction_type_id UUID REFERENCES public.transaction_types(id) ON DELETE SET NULL;

CREATE INDEX idx_invoices_transaction_type ON public.invoices(transaction_type_id);