
-- 1. Add currency column to used_bl_counting
ALTER TABLE used_bl_counting ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD';

-- 2. Add revert columns to unused_bl
ALTER TABLE unused_bl ADD COLUMN IF NOT EXISTS original_used_data JSONB DEFAULT NULL;
ALTER TABLE unused_bl ADD COLUMN IF NOT EXISTS revert_reason TEXT DEFAULT NULL;
ALTER TABLE unused_bl ADD COLUMN IF NOT EXISTS reverted_at TIMESTAMPTZ DEFAULT NULL;

-- 3. Create bl_change_log table (audit trail for B/L actions)
CREATE TABLE IF NOT EXISTS bl_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bl_id UUID NOT NULL,
  bl_no TEXT NOT NULL,
  action TEXT NOT NULL,
  changed_fields JSONB DEFAULT NULL,
  reason TEXT DEFAULT NULL,
  performed_by TEXT DEFAULT NULL,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dashboard_id TEXT DEFAULT NULL,
  user_id UUID NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bl_change_log_bl_id ON bl_change_log(bl_id);
CREATE INDEX IF NOT EXISTS idx_bl_change_log_performed_at ON bl_change_log(performed_at);

-- 4. RLS on bl_change_log
ALTER TABLE bl_change_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bl change logs" ON bl_change_log
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bl change logs" ON bl_change_log
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 5. Create bl_presets table
CREATE TABLE IF NOT EXISTS bl_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, type, value)
);

-- 6. RLS on bl_presets
ALTER TABLE bl_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bl presets" ON bl_presets
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bl presets" ON bl_presets
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bl presets" ON bl_presets
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 7. Add archive_folder_id to used_bl_counting for future use
ALTER TABLE used_bl_counting ADD COLUMN IF NOT EXISTS archive_folder_id UUID DEFAULT NULL;
