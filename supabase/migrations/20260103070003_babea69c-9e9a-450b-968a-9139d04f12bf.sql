-- Add swift_date column to invoices table
ALTER TABLE public.invoices 
ADD COLUMN swift_date date DEFAULT NULL;