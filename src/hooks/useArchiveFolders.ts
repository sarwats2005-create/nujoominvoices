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

  const addFolder = async (name: string, color: string = '#6366f1', parentId: string | null = null): Promise<ArchiveFolder | null> => {
    if (!user || !dashboardId) return null;
    const { data, error } = await supabase
      .from('archive_folders' as any)
      .insert({ user_id: user.id, dashboard_id: dashboardId, name, color, parent_id: parentId } as any)
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

  const updateFolder = async (id: string, updates: { name?: string; color?: string; parent_id?: string | null }): Promise<boolean> => {
    if (!user) return false;

    // Cycle prevention: if changing parent, ensure new parent is not a descendant
    if (updates.parent_id) {
      const isDescendant = (candidateId: string, ancestorId: string): boolean => {
        if (candidateId === ancestorId) return true;
        const f = folders.find(x => x.id === candidateId);
        if (!f || !f.parent_id) return false;
        return isDescendant(f.parent_id, ancestorId);
      };
      if (isDescendant(updates.parent_id, id)) {
        toast({ title: 'Invalid move', description: 'Cannot move a folder into its own sub-folder.', variant: 'destructive' });
        return false;
      }
    }

    const { error } = await supabase
      .from('archive_folders' as any)
      .update(updates as any)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return false;
    setFolders(prev => prev.map(f => f.id === id ? { ...f, ...updates } as ArchiveFolder : f));
    return true;
  };

  const deleteFolder = async (id: string, mode: 'promote' | 'unfile' = 'promote'): Promise<boolean> => {
    if (!user) return false;
    const folder = folders.find(f => f.id === id);
    const newParent = mode === 'promote' ? (folder?.parent_id ?? null) : null;

    // Reparent children if promoting (default ON DELETE SET NULL would unfile them)
    if (mode === 'promote') {
      await supabase
        .from('archive_folders' as any)
        .update({ parent_id: newParent } as any)
        .eq('parent_id', id)
        .eq('user_id', user.id);
    }

    // Unset folder reference on archived records
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
    setFolders(prev => prev
      .map(f => f.parent_id === id ? { ...f, parent_id: newParent } : f)
      .filter(f => f.id !== id));
    return true;
  };

  return { folders, loading, addFolder, updateFolder, deleteFolder, refetch: fetchFolders };
};
