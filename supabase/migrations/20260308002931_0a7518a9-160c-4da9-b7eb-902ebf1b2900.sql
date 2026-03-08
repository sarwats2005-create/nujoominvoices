
-- Fix RLS policies: Drop RESTRICTIVE policies and recreate as PERMISSIVE

-- unused_bl table
DROP POLICY IF EXISTS "Users can view own unused_bl" ON public.unused_bl;
DROP POLICY IF EXISTS "Users can insert own unused_bl" ON public.unused_bl;
DROP POLICY IF EXISTS "Users can update own unused_bl" ON public.unused_bl;
DROP POLICY IF EXISTS "Users can delete own unused_bl" ON public.unused_bl;

CREATE POLICY "Users can view own unused_bl" ON public.unused_bl FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own unused_bl" ON public.unused_bl FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own unused_bl" ON public.unused_bl FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own unused_bl" ON public.unused_bl FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- unused_bl_files table
DROP POLICY IF EXISTS "Users can view own unused_bl_files" ON public.unused_bl_files;
DROP POLICY IF EXISTS "Users can insert own unused_bl_files" ON public.unused_bl_files;
DROP POLICY IF EXISTS "Users can delete own unused_bl_files" ON public.unused_bl_files;

CREATE POLICY "Users can view own unused_bl_files" ON public.unused_bl_files FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own unused_bl_files" ON public.unused_bl_files FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own unused_bl_files" ON public.unused_bl_files FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- unused_bl_settings table
DROP POLICY IF EXISTS "Users can view own unused_bl_settings" ON public.unused_bl_settings;
DROP POLICY IF EXISTS "Users can insert own unused_bl_settings" ON public.unused_bl_settings;
DROP POLICY IF EXISTS "Users can update own unused_bl_settings" ON public.unused_bl_settings;
DROP POLICY IF EXISTS "Users can delete own unused_bl_settings" ON public.unused_bl_settings;

CREATE POLICY "Users can view own unused_bl_settings" ON public.unused_bl_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own unused_bl_settings" ON public.unused_bl_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own unused_bl_settings" ON public.unused_bl_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own unused_bl_settings" ON public.unused_bl_settings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Storage policies for unused-bl-files bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('unused-bl-files', 'unused-bl-files', false) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload unused bl files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'unused-bl-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own unused bl files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'unused-bl-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own unused bl files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'unused-bl-files' AND (storage.foldername(name))[1] = auth.uid()::text);
