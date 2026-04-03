
-- Create archive_folders table
CREATE TABLE public.archive_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dashboard_id UUID REFERENCES public.bl_dashboards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.archive_folders ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own archive folders" ON public.archive_folders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own archive folders" ON public.archive_folders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own archive folders" ON public.archive_folders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own archive folders" ON public.archive_folders FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_archive_folders_updated_at BEFORE UPDATE ON public.archive_folders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
