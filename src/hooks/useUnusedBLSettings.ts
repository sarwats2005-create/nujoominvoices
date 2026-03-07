import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { UnusedBLSetting, SettingType } from '@/types/unusedBL';

const db = (table: string) => (supabase as any).from(table);

export const useUnusedBLSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UnusedBLSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    const { data, error } = await db('unused_bl_settings')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('value');
    if (!error && data) setSettings(data as UnusedBLSetting[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const getByType = useCallback((type: SettingType) =>
    settings.filter(s => s.setting_type === type).map(s => s.value)
  , [settings]);

  const getSettingsByType = useCallback((type: SettingType) =>
    settings.filter(s => s.setting_type === type)
  , [settings]);

  const addSetting = async (type: SettingType, value: string): Promise<boolean> => {
    if (!user) return false;
    const trimmed = value.trim();
    if (!trimmed) return false;
    const { error } = await db('unused_bl_settings').insert({
      user_id: user.id,
      setting_type: type,
      value: trimmed,
    });
    if (!error) { await fetchSettings(); return true; }
    return false;
  };

  const removeSetting = async (id: string): Promise<boolean> => {
    const { error } = await db('unused_bl_settings').delete().eq('id', id);
    if (!error) { await fetchSettings(); return true; }
    return false;
  };

  return { settings, loading, getByType, getSettingsByType, addSetting, removeSetting, refetch: fetchSettings };
};
