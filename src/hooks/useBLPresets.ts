import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type PresetType = 'bank' | 'owner' | 'used_for' | 'beneficiary' | 'currency';

export interface BLPreset {
  id: string;
  user_id: string;
  type: string;
  value: string;
  created_at: string;
}

const db = (table: string) => (supabase as any).from(table);

const BL_PRESETS_KEY = 'invoice_app_bl_presets';
const BL_PRESETS_MIGRATED_KEY = 'bl_presets_migrated_to_db';

export const useBLPresets = () => {
  const { user } = useAuth();
  const [presets, setPresets] = useState<BLPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);

  const fetchPresets = useCallback(async () => {
    if (!user) return;
    const { data, error } = await db('bl_presets')
      .select('*')
      .eq('user_id', user.id)
      .order('value');
    if (!error && data) setPresets(data as BLPreset[]);
    setLoading(false);
  }, [user]);

  // One-time migration from localStorage
  const migrateFromLocalStorage = useCallback(async () => {
    if (!user) return;
    const alreadyMigrated = localStorage.getItem(BL_PRESETS_MIGRATED_KEY);
    if (alreadyMigrated) return;

    const savedPresets = localStorage.getItem(BL_PRESETS_KEY);
    if (!savedPresets) {
      localStorage.setItem(BL_PRESETS_MIGRATED_KEY, 'true');
      return;
    }

    try {
      setMigrating(true);
      const parsed = JSON.parse(savedPresets) as {
        banks?: string[];
        owners?: string[];
        usedFor?: string[];
        beneficiaries?: string[];
      };

      const inserts: { user_id: string; type: string; value: string }[] = [];
      
      const typeMap: Record<string, string> = {
        banks: 'bank',
        owners: 'owner',
        usedFor: 'used_for',
        beneficiaries: 'beneficiary',
      };

      for (const [key, type] of Object.entries(typeMap)) {
        const values = parsed[key as keyof typeof parsed] || [];
        for (const value of values) {
          if (value.trim()) {
            inserts.push({ user_id: user.id, type, value: value.trim().toUpperCase() });
          }
        }
      }

      if (inserts.length > 0) {
        // Use upsert to avoid duplicates
        await db('bl_presets').upsert(inserts, { onConflict: 'user_id,type,value', ignoreDuplicates: true });
      }

      localStorage.setItem(BL_PRESETS_MIGRATED_KEY, 'true');
      await fetchPresets();
    } catch (err) {
      console.error('Error migrating presets:', err);
    } finally {
      setMigrating(false);
    }
  }, [user, fetchPresets]);

  useEffect(() => {
    const init = async () => {
      await fetchPresets();
      await migrateFromLocalStorage();
    };
    init();
  }, [fetchPresets, migrateFromLocalStorage]);

  const getByType = useCallback((type: PresetType): string[] => {
    return presets.filter(p => p.type === type).map(p => p.value);
  }, [presets]);

  const addPreset = async (type: PresetType, value: string): Promise<boolean> => {
    if (!user) return false;
    const trimmed = value.trim().toUpperCase();
    if (!trimmed) return false;

    // Check for case-insensitive duplicate
    const existing = presets.find(p => p.type === type && p.value.toUpperCase() === trimmed);
    if (existing) return false;

    const { error } = await db('bl_presets').insert({
      user_id: user.id,
      type,
      value: trimmed,
    });
    if (!error) {
      await fetchPresets();
      return true;
    }
    return false;
  };

  const removePreset = async (id: string): Promise<boolean> => {
    const { error } = await db('bl_presets').delete().eq('id', id);
    if (!error) {
      await fetchPresets();
      return true;
    }
    return false;
  };

  const removePresetByValue = async (type: PresetType, value: string): Promise<boolean> => {
    if (!user) return false;
    const preset = presets.find(p => p.type === type && p.value === value);
    if (!preset) return false;
    return removePreset(preset.id);
  };

  return {
    presets,
    loading,
    migrating,
    getByType,
    addPreset,
    removePreset,
    removePresetByValue,
    refetch: fetchPresets,
  };
};
