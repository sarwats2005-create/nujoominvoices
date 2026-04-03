import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { ArchiveFolder } from '@/types/usedBL';

export const useArchiveFolders = (dashboardId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [folders, setFolders] = useState<ArchiveFolder[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFolders = useCallback(async () => {
    if (!user || !dashboardId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('archive_folders' as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('dashboard_id', dashboardId)
      .order('created_at', { ascending: true });

    if (!error) setFolders((data as any[]) || []);
    setLoading(false);
  }, [user, dashboardId]);

  useEffect(() => { fetchFolders(); }, [fetchFolders]);

  const addFolder = async (name: string, color: string = '#6366f1'): Promise<ArchiveFolder | null> => {
    if (!user || !dashboardId) return null;
    const { data, error } = await supabase
      .from('archive_folders' as any)
      .insert({ user_id: user.id, dashboard_id: dashboardId, name, color } as any)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error creating folder', variant: 'destructive' });
      return null;
    }
    const created = data as any;
    setFolders(prev => [...prev, created]);
    return created;
  };

  const updateFolder = async (id: string, name: string, color: string): Promise<boolean> => {
    if (!user) return false;
    const { error } = await supabase
      .from('archive_folders' as any)
      .update({ name, color } as any)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return false;
    setFolders(prev => prev.map(f => f.id === id ? { ...f, name, color } : f));
    return true;
  };

  const deleteFolder = async (id: string): Promise<boolean> => {
    if (!user) return false;
    // Unset folder reference on archived records first
    await supabase
      .from('used_bl_counting' as any)
      .update({ archive_folder_id: null } as any)
      .eq('archive_folder_id', id)
      .eq('user_id', user.id);

    const { error } = await supabase
      .from('archive_folders' as any)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return false;
    setFolders(prev => prev.filter(f => f.id !== id));
    return true;
  };

  return { folders, loading, addFolder, updateFolder, deleteFolder, refetch: fetchFolders };
};
