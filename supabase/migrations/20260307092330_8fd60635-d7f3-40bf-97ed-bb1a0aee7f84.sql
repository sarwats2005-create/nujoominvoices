
-- Create unused_bl table
CREATE TABLE public.unused_bl (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  bl_no text NOT NULL UNIQUE,
  container_no text NOT NULL,
  owner text NOT NULL,
  clearance_company text NOT NULL,
  product_description text NOT NULL,
  product_category text NOT NULL,
  bl_date date NOT NULL,
  clearance_date date NOT NULL,
  quantity_value numeric NULL,
  quantity_unit text NULL,
  shipper_name text NULL,
  port_of_loading text NOT NULL,
  status text NOT NULL DEFAULT 'UNUSED',
  used_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.unused_bl ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own unused_bl" ON public.unused_bl FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own unused_bl" ON public.unused_bl FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own unused_bl" ON public.unused_bl FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own unused_bl" ON public.unused_bl FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_unused_bl_updated_at
  BEFORE UPDATE ON public.unused_bl
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create unused_bl_files table
CREATE TABLE public.unused_bl_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unused_bl_id uuid NOT NULL REFERENCES public.unused_bl(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL DEFAULT 'PDF',
  original_filename text NOT NULL,
  page_label text NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.unused_bl_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own unused_bl_files" ON public.unused_bl_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own unused_bl_files" ON public.unused_bl_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own unused_bl_files" ON public.unused_bl_files FOR DELETE USING (auth.uid() = user_id);

-- Create unused_bl_settings table for dropdown options
CREATE TABLE public.unused_bl_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  setting_type text NOT NULL,
  value text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, setting_type, value)
);

ALTER TABLE public.unused_bl_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own unused_bl_settings" ON public.unused_bl_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own unused_bl_settings" ON public.unused_bl_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own unused_bl_settings" ON public.unused_bl_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own unused_bl_settings" ON public.unused_bl_settings FOR DELETE USING (auth.uid() = user_id);

-- Add traceability column to used_bl_counting
ALTER TABLE public.used_bl_counting ADD COLUMN IF NOT EXISTS source_unused_bl_id uuid NULL REFERENCES public.unused_bl(id);

-- Create storage bucket (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('unused-bl-files', 'unused-bl-files', false);

-- Storage RLS policies
CREATE POLICY "Auth users upload unused-bl-files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'unused-bl-files' AND auth.role() = 'authenticated');
CREATE POLICY "Auth users read unused-bl-files" ON storage.objects FOR SELECT USING (bucket_id = 'unused-bl-files' AND auth.role() = 'authenticated');
CREATE POLICY "Auth users delete unused-bl-files" ON storage.objects FOR DELETE USING (bucket_id = 'unused-bl-files' AND auth.role() = 'authenticated');
