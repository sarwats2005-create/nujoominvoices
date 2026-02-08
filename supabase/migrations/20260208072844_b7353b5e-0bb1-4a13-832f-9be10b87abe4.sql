
-- Create the used_bl_counting table
CREATE TABLE public.used_bl_counting (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bl_no TEXT NOT NULL,
  container_no TEXT NOT NULL,
  invoice_amount NUMERIC NOT NULL,
  invoice_date DATE NOT NULL,
  bank TEXT NOT NULL,
  owner TEXT NOT NULL,
  used_for TEXT NOT NULL,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint on bl_no per user
CREATE UNIQUE INDEX idx_used_bl_counting_bl_no_user ON public.used_bl_counting (bl_no, user_id) WHERE is_active = true;

-- Create index for common queries
CREATE INDEX idx_used_bl_counting_user_active ON public.used_bl_counting (user_id, is_active);
CREATE INDEX idx_used_bl_counting_invoice_date ON public.used_bl_counting (invoice_date);

-- Enable RLS
ALTER TABLE public.used_bl_counting ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only access their own records
CREATE POLICY "Users can view their own used BL records"
  ON public.used_bl_counting FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own used BL records"
  ON public.used_bl_counting FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own used BL records"
  ON public.used_bl_counting FOR UPDATE
  USING (auth.uid() = user_id);

-- Only admins can hard delete (soft delete via is_active for regular users)
CREATE POLICY "Admins can delete used BL records"
  ON public.used_bl_counting FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_used_bl_counting_updated_at
  BEFORE UPDATE ON public.used_bl_counting
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
