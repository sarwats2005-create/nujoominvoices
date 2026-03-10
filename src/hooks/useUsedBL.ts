import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { UsedBL, UsedBLInsert, UsedBLUpdate, BLDashboard } from '@/types/usedBL';

const BL_DASHBOARD_KEY = 'currentBLDashboardId';

export const useUsedBL = (dashboardId?: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<UsedBL[]>([]);
  const [archivedRecords, setArchivedRecords] = useState<UsedBL[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [blDashboards, setBLDashboards] = useState<BLDashboard[]>([]);
  const [currentBLDashboardId, setCurrentBLDashboardIdState] = useState<string | null>(() => {
    return localStorage.getItem(BL_DASHBOARD_KEY);
  });

  const activeDashboardId = dashboardId ?? currentBLDashboardId;

  const setCurrentBLDashboardId = useCallback((id: string | null) => {
    setCurrentBLDashboardIdState(id);
    if (id) localStorage.setItem(BL_DASHBOARD_KEY, id);
    else localStorage.removeItem(BL_DASHBOARD_KEY);
  }, []);

  // Fetch BL dashboards
  const fetchBLDashboards = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('bl_dashboards' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching BL dashboards:', error);
      return;
    }

    const dashboards = (data as any[]) || [];
    setBLDashboards(dashboards);

    // Auto-create default dashboard if none exist
    if (dashboards.length === 0) {
      const { data: newDash, error: createError } = await supabase
        .from('bl_dashboards' as any)
        .insert({ user_id: user.id, name: 'حوالات محمد خاص' } as any)
        .select()
        .single();

      if (!createError && newDash) {
        const created = newDash as any;
        setBLDashboards([created]);
        setCurrentBLDashboardId(created.id);
      }
    } else if (!activeDashboardId || !dashboards.find(d => d.id === activeDashboardId)) {
      setCurrentBLDashboardId(dashboards[0].id);
    }
  }, [user, activeDashboardId, setCurrentBLDashboardId]);

  useEffect(() => {
    fetchBLDashboards();
  }, [fetchBLDashboards]);

  // Fetch records filtered by dashboard
  const fetchRecords = useCallback(async () => {
    if (!user || !activeDashboardId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('used_bl_counting' as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('dashboard_id', activeDashboardId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching used BL records:', error);
      toast({ title: 'Error loading records', variant: 'destructive' });
    } else {
      setRecords((data as any[]) || []);
    }
    setLoading(false);
  }, [user, activeDashboardId, toast]);

  useEffect(() => {
    if (activeDashboardId) fetchRecords();
  }, [fetchRecords, activeDashboardId]);

  const addRecord = async (record: UsedBLInsert): Promise<{ success: boolean; error?: string }> => {
    if (!user || !activeDashboardId) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('used_bl_counting' as any)
      .insert({
        ...record,
        user_id: user.id,
        dashboard_id: activeDashboardId,
      } as any)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return { success: false, error: 'duplicate_bl' };
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
      if (error.code === '23505') return { success: false, error: 'duplicate_bl' };
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
    if (!user || !activeDashboardId) return false;

    let query = supabase
      .from('used_bl_counting' as any)
      .select('id')
      .eq('user_id', user.id)
      .eq('dashboard_id', activeDashboardId)
      .eq('container_no', containerNo)
      .eq('is_active', true);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data } = await query;
    return (data as any[])?.length > 0;
  };

  const addMultipleRecords = async (newRecords: UsedBLInsert[]): Promise<{ added: number; skipped: number }> => {
    if (!user || !activeDashboardId) return { added: 0, skipped: 0 };

    let added = 0;
    let skipped = 0;

    for (const record of newRecords) {
      const result = await addRecord({ ...record, dashboard_id: activeDashboardId });
      if (result.success) added++;
      else skipped++;
    }

    return { added, skipped };
  };

  // BL Dashboard CRUD
  const addBLDashboard = async (name: string): Promise<BLDashboard | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('bl_dashboards' as any)
      .insert({ user_id: user.id, name } as any)
      .select()
      .single();

    if (error) {
      console.error('Error adding BL dashboard:', error);
      toast({ title: 'Error adding dashboard', variant: 'destructive' });
      return null;
    }

    const created = data as any;
    setBLDashboards(prev => [...prev, created]);
    return created;
  };

  const updateBLDashboard = async (id: string, name: string): Promise<boolean> => {
    if (!user) return false;
    const { error } = await supabase
      .from('bl_dashboards' as any)
      .update({ name } as any)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating BL dashboard:', error);
      return false;
    }

    setBLDashboards(prev => prev.map(d => d.id === id ? { ...d, name } : d));
    return true;
  };

  const deleteBLDashboard = async (id: string): Promise<boolean> => {
    if (!user || blDashboards.length <= 1) return false;
    const { error } = await supabase
      .from('bl_dashboards' as any)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting BL dashboard:', error);
      return false;
    }

    setBLDashboards(prev => {
      const remaining = prev.filter(d => d.id !== id);
      if (activeDashboardId === id && remaining.length > 0) {
        setCurrentBLDashboardId(remaining[0].id);
      }
      return remaining;
    });
    return true;
  };

  const currentDashboardName = blDashboards.find(d => d.id === activeDashboardId)?.name || '';

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
    // Dashboard management
    blDashboards,
    currentBLDashboardId: activeDashboardId,
    currentDashboardName,
    setCurrentBLDashboardId,
    addBLDashboard,
    updateBLDashboard,
    deleteBLDashboard,
    fetchBLDashboards,
  };
};
