-- Add currency column to invoices table with default USD
ALTER TABLE public.invoices ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD';