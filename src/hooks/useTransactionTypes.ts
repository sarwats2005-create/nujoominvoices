import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TransactionType {
  id: string;
  code: string;
  label: string;
  color: string;
  sortOrder: number;
}

const db = (table: string) => (supabase as any).from(table);

export const TYPE_COLOR_PRESETS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
  '#6366F1',
  '#84CC16',
];

export const useTransactionTypes = () => {
  const { user } = useAuth();
  const [types, setTypes] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTypes = useCallback(async () => {
    if (!user) {
      setTypes([]);
      setLoading(false);
      return;
    }
    const { data, error } = await db('transaction_types')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })
      .order('code', { ascending: true });
    if (!error && data) {
      setTypes(
        (data as any[]).map(d => ({
          id: d.id,
          code: d.code,
          label: d.label || '',
          color: d.color || '#3B82F6',
          sortOrder: d.sort_order ?? 0,
        }))
      );
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  const addType = useCallback(
    async (code: string, label: string, color: string): Promise<boolean> => {
      if (!user) return false;
      const trimmed = code.trim();
      if (!trimmed) return false;
      const { error } = await db('transaction_types').insert({
        user_id: user.id,
        code: trimmed,
        label: label.trim(),
        color,
        sort_order: types.length,
      });
      if (error) {
        console.error('addType error', error);
        return false;
      }
      await fetchTypes();
      return true;
    },
    [user, types.length, fetchTypes]
  );

  const updateType = useCallback(
    async (id: string, patch: Partial<Pick<TransactionType, 'code' | 'label' | 'color' | 'sortOrder'>>): Promise<boolean> => {
      const payload: Record<string, unknown> = {};
      if (patch.code !== undefined) payload.code = patch.code.trim();
      if (patch.label !== undefined) payload.label = patch.label.trim();
      if (patch.color !== undefined) payload.color = patch.color;
      if (patch.sortOrder !== undefined) payload.sort_order = patch.sortOrder;
      const { error } = await db('transaction_types').update(payload).eq('id', id);
      if (error) {
        console.error('updateType error', error);
        return false;
      }
      await fetchTypes();
      return true;
    },
    [fetchTypes]
  );

  const deleteType = useCallback(
    async (id: string): Promise<boolean> => {
      const { error } = await db('transaction_types').delete().eq('id', id);
      if (error) {
        console.error('deleteType error', error);
        return false;
      }
      await fetchTypes();
      return true;
    },
    [fetchTypes]
  );

  const getType = useCallback((id?: string | null) => types.find(ty => ty.id === id), [types]);

  const formatType = useCallback(
    (id?: string | null) => {
      const ty = types.find(x => x.id === id);
      if (!ty) return '';
      return ty.label ? `${ty.code} - ${ty.label}` : ty.code;
    },
    [types]
  );

  return { types, loading, addType, updateType, deleteType, getType, formatType, refetch: fetchTypes };
};
