import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { UsedBL, UsedBLInsert, UsedBLUpdate } from '@/types/usedBL';

export const useUsedBL = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<UsedBL[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('used_bl_counting' as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching used BL records:', error);
      toast({ title: 'Error loading records', variant: 'destructive' });
    } else {
      setRecords((data as any[]) || []);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const addRecord = async (record: UsedBLInsert): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('used_bl_counting' as any)
      .insert({
        ...record,
        user_id: user.id,
      } as any)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'duplicate_bl' };
      }
      console.error('Error adding record:', error);
      return { success: false, error: error.message };
    }

    setRecords(prev => [data as any, ...prev]);
    return { success: true };
  };

  const updateRecord = async (id: string, updates: UsedBLUpdate): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('used_bl_counting' as any)
      .update(updates as any)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'duplicate_bl' };
      }
      console.error('Error updating record:', error);
      return { success: false, error: error.message };
    }

    setRecords(prev => prev.map(r => r.id === id ? (data as any) : r));
    return { success: true };
  };

  const softDeleteRecord = async (id: string): Promise<boolean> => {
    if (!user) return false;

    const { error } = await supabase
      .from('used_bl_counting' as any)
      .update({ is_active: false } as any)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error soft deleting record:', error);
      toast({ title: 'Error deleting record', variant: 'destructive' });
      return false;
    }

    setRecords(prev => prev.filter(r => r.id !== id));
    return true;
  };

  const getRecord = async (id: string): Promise<UsedBL | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('used_bl_counting' as any)
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching record:', error);
      return null;
    }

    return (data as any) || null;
  };

  const checkContainerExists = async (containerNo: string, excludeId?: string): Promise<boolean> => {
    if (!user) return false;

    let query = supabase
      .from('used_bl_counting' as any)
      .select('id')
      .eq('user_id', user.id)
      .eq('container_no', containerNo)
      .eq('is_active', true);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data } = await query;
    return (data as any[])?.length > 0;
  };

  const addMultipleRecords = async (newRecords: UsedBLInsert[]): Promise<{ added: number; skipped: number }> => {
    if (!user) return { added: 0, skipped: 0 };

    let added = 0;
    let skipped = 0;

    for (const record of newRecords) {
      const result = await addRecord(record);
      if (result.success) {
        added++;
      } else {
        skipped++;
      }
    }

    return { added, skipped };
  };

  return {
    records,
    loading,
    addRecord,
    updateRecord,
    softDeleteRecord,
    getRecord,
    checkContainerExists,
    addMultipleRecords,
    refetch: fetchRecords,
  };
};
