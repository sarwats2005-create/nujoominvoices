import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { UnusedBL, UnusedBLFile, UseBLFormData } from '@/types/unusedBL';

const db = (table: string) => (supabase as any).from(table);

export const useUnusedBL = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<UnusedBL[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await db('unused_bl')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setRecords(data as UnusedBL[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const checkDuplicateBLNo = async (blNo: string, excludeId?: string): Promise<boolean> => {
    let query = db('unused_bl').select('id').eq('bl_no', blNo);
    if (excludeId) query = query.neq('id', excludeId);
    const { data } = await query.maybeSingle();
    return !!data;
  };

  const checkContainerWarning = async (containerNo: string): Promise<string | null> => {
    const [u1, u2] = await Promise.all([
      db('unused_bl').select('id').eq('container_no', containerNo).limit(1),
      db('used_bl_counting').select('id').eq('container_no', containerNo).limit(1),
    ]);
    if (u1.data?.length || u2.data?.length) return 'Container already exists in records';
    return null;
  };

  const uploadFiles = async (blId: string, files: { file: File; pageLabel?: string }[]) => {
    if (!user) return;
    for (const { file, pageLabel } of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const fileType = ext === 'pdf' ? 'PDF' : ext === 'png' ? 'PNG' : 'JPG';
      const path = `${user.id}/${blId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('unused-bl-files').upload(path, file);
      if (uploadError) continue;
      await db('unused_bl_files').insert({
        unused_bl_id: blId,
        user_id: user.id,
        file_url: path,
        file_type: fileType,
        original_filename: file.name,
        page_label: pageLabel || null,
      });
    }
  };

  const createRecord = async (
    data: Omit<UnusedBL, 'id' | 'user_id' | 'status' | 'used_at' | 'created_at' | 'updated_at'>,
    files: { file: File; pageLabel?: string }[]
  ): Promise<{ success: boolean; id?: string; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };
    const isDup = await checkDuplicateBLNo(data.bl_no);
    if (isDup) return { success: false, error: 'duplicate_bl' };
    const { data: inserted, error } = await db('unused_bl')
      .insert({ ...data, user_id: user.id, status: 'UNUSED' })
      .select('id')
      .single();
    if (error) return { success: false, error: error.message };
    if (files.length > 0) await uploadFiles(inserted.id, files);
    await fetchRecords();
    return { success: true, id: inserted.id };
  };

  const deleteRecord = async (id: string): Promise<boolean> => {
    const { data: files } = await db('unused_bl_files').select('file_url').eq('unused_bl_id', id);
    if (files?.length) {
      await supabase.storage.from('unused-bl-files').remove(files.map((f: any) => f.file_url));
    }
    const { error } = await db('unused_bl').delete().eq('id', id);
    if (!error) await fetchRecords();
    return !error;
  };

  const getFiles = async (blId: string): Promise<UnusedBLFile[]> => {
    const { data } = await db('unused_bl_files').select('*').eq('unused_bl_id', blId).order('uploaded_at');
    return (data || []) as UnusedBLFile[];
  };

  const getSignedUrl = async (path: string): Promise<string | null> => {
    const { data } = await supabase.storage.from('unused-bl-files').createSignedUrl(path, 3600);
    return data?.signedUrl || null;
  };

  const useBL = async (blId: string, formData: UseBLFormData): Promise<boolean> => {
    if (!user) return false;
    const record = records.find(r => r.id === blId);
    if (!record) return false;

    const insertData: any = {
      user_id: user.id,
      dashboard_id: formData.dashboard_id,
      bl_no: record.bl_no,
      container_no: record.container_no,
      invoice_amount: formData.invoice_amount,
      invoice_date: formData.invoice_date,
      bank: formData.bank,
      owner: record.owner,
      used_for: formData.using_for,
      used_for_beneficiary: formData.used_for_beneficiary || null,
      source_unused_bl_id: blId,
    };

    const { error: insertError } = await db('used_bl_counting').insert(insertData);
    if (insertError) return false;

    const { error: updateError } = await db('unused_bl')
      .update({ status: 'USED', used_at: new Date().toISOString() })
      .eq('id', blId);
    if (updateError) return false;

    await fetchRecords();
    return true;
  };

  const updateRecord = async (
    id: string,
    data: Partial<Omit<UnusedBL, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<boolean> => {
    if (!user) return false;
    const { error } = await db('unused_bl')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);
    if (!error) await fetchRecords();
    return !error;
  };

  const getUniqueOwners = (): string[] => {
    return [...new Set(records.map(r => r.owner))];
  };

  return {
    records, loading,
    stats: {
      total: records.length,
      unused: records.filter(r => r.status === 'UNUSED').length,
      used: records.filter(r => r.status === 'USED').length,
    },
    createRecord, deleteRecord, updateRecord, uploadFiles, getFiles, getSignedUrl, useBL,
    checkDuplicateBLNo, checkContainerWarning, refetch: fetchRecords, getUniqueOwners,
  };
};
