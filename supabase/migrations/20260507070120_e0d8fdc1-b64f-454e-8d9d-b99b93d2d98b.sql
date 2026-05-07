DROP INDEX IF EXISTS public.idx_used_bl_counting_bl_no_dashboard;

CREATE UNIQUE INDEX idx_used_bl_counting_manual_bl_no_dashboard
ON public.used_bl_counting (bl_no, dashboard_id)
WHERE is_active = true AND source_unused_bl_id IS NULL;