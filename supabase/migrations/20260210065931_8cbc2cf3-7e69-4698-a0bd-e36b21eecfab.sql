
-- Create bl_dashboards table
CREATE TABLE public.bl_dashboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bl_dashboards ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own bl dashboards" ON public.bl_dashboards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bl dashboards" ON public.bl_dashboards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bl dashboards" ON public.bl_dashboards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bl dashboards" ON public.bl_dashboards FOR DELETE USING (auth.uid() = user_id);

-- Add dashboard_id to used_bl_counting
ALTER TABLE public.used_bl_counting ADD COLUMN dashboard_id UUID REFERENCES public.bl_dashboards(id);

-- Update unique index to be per-dashboard instead of per-user
DROP INDEX IF EXISTS idx_used_bl_counting_bl_no_user;
CREATE UNIQUE INDEX idx_used_bl_counting_bl_no_dashboard ON public.used_bl_counting (bl_no, dashboard_id) WHERE is_active = true;

-- Trigger for updated_at
CREATE TRIGGER update_bl_dashboards_updated_at
  BEFORE UPDATE ON public.bl_dashboards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
