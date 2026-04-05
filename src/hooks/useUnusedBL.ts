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

  const logChange = async (blId: string, blNo: string, action: string, changedFields?: any, reason?: string, dashboardId?: string) => {
    if (!user) return;
    await db('bl_change_log').insert({
      bl_id: blId,
      bl_no: blNo,
      action,
      changed_fields: changedFields || null,
      reason: reason || null,
      performed_by: user.email || user.id,
      user_id: user.id,
      dashboard_id: dashboardId || null,
    });
  };

  const createRecord = async (
    data: Omit<UnusedBL, 'id' | 'user_id' | 'status' | 'used_at' | 'created_at' | 'updated_at' | 'original_used_data' | 'revert_reason' | 'reverted_at'>,
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
    await logChange(inserted.id, data.bl_no, 'created');
    await fetchRecords();
    return { success: true, id: inserted.id };
  };

  const deleteRecord = async (id: string): Promise<boolean> => {
    const record = records.find(r => r.id === id);
    const { data: files } = await db('unused_bl_files').select('file_url').eq('unused_bl_id', id);
    if (files?.length) {
      await supabase.storage.from('unused-bl-files').remove(files.map((f: any) => f.file_url));
    }
    const { error } = await db('unused_bl').delete().eq('id', id);
    if (!error) {
      if (record) await logChange(id, record.bl_no, 'deleted');
      await fetchRecords();
    }
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
      currency: formData.currency || 'USD',
      source_unused_bl_id: blId,
    };

    const { error: insertError } = await db('used_bl_counting').insert(insertData);
    if (insertError) return false;

    // Always mark the source as USED (idempotent for multi-invoice)
    if (record.status !== 'USED') {
      const { error: updateError } = await db('unused_bl')
        .update({ status: 'USED', used_at: new Date().toISOString() })
        .eq('id', blId);
      if (updateError) return false;
    }

    // Log the transition
    await logChange(blId, record.bl_no, 'used', {
      used_for: { from: null, to: formData.using_for },
      invoice_amount: { from: null, to: formData.invoice_amount },
      currency: { from: null, to: formData.currency },
      bank: { from: null, to: formData.bank },
      dashboard_id: { from: null, to: formData.dashboard_id },
    }, null, formData.dashboard_id);

    await fetchRecords();
    return true;
  };

  const addInvoiceToUsedBL = async (sourceUnusedBlId: string, formData: UseBLFormData): Promise<boolean> => {
    if (!user) return false;
    // Fetch source record from DB directly (may not be in local records if status filter hides it)
    const { data: srcData } = await db('unused_bl').select('*').eq('id', sourceUnusedBlId).single();
    if (!srcData) return false;
    const src = srcData as UnusedBL;

    const insertData: any = {
      user_id: user.id,
      dashboard_id: formData.dashboard_id,
      bl_no: src.bl_no,
      container_no: src.container_no,
      invoice_amount: formData.invoice_amount,
      invoice_date: formData.invoice_date,
      bank: formData.bank,
      owner: src.owner,
      used_for: formData.using_for,
      used_for_beneficiary: formData.used_for_beneficiary || null,
      currency: formData.currency || 'USD',
      source_unused_bl_id: sourceUnusedBlId,
    };

    const { error: insertError } = await db('used_bl_counting').insert(insertData);
    if (insertError) return false;

    await logChange(sourceUnusedBlId, src.bl_no, 'used', {
      used_for: { from: null, to: formData.using_for },
      invoice_amount: { from: null, to: formData.invoice_amount },
      currency: { from: null, to: formData.currency },
      bank: { from: null, to: formData.bank },
      dashboard_id: { from: null, to: formData.dashboard_id },
    }, null, formData.dashboard_id);

    return true;
  };

  const revertBL = async (usedBLId: string, reason: string): Promise<boolean> => {
    if (!user) return false;

    // Fetch the used BL record
    const { data: usedRecord, error: fetchError } = await db('used_bl_counting')
      .select('*')
      .eq('id', usedBLId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !usedRecord) return false;

    const sourceUnusedId = usedRecord.source_unused_bl_id;
    if (!sourceUnusedId) return false;

    // Store original used data on the unused_bl record
    const originalUsedData = {
      used_for: usedRecord.used_for,
      used_for_beneficiary: usedRecord.used_for_beneficiary,
      invoice_amount: usedRecord.invoice_amount,
      currency: usedRecord.currency || 'USD',
      invoice_date: usedRecord.invoice_date,
      bank: usedRecord.bank,
      dashboard_id: usedRecord.dashboard_id,
    };

    // Restore unused_bl to UNUSED
    const { error: restoreError } = await db('unused_bl')
      .update({
        status: 'UNUSED',
        used_at: null,
        original_used_data: originalUsedData,
        revert_reason: reason,
        reverted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sourceUnusedId)
      .eq('user_id', user.id);

    if (restoreError) return false;

    // Soft-delete the used record
    const { error: deleteError } = await db('used_bl_counting')
      .update({ is_active: false })
      .eq('id', usedBLId)
      .eq('user_id', user.id);

    if (deleteError) return false;

    // Log the revert
    await logChange(sourceUnusedId, usedRecord.bl_no, 'reverted', {
      used_for: { from: usedRecord.used_for, to: null },
      invoice_amount: { from: usedRecord.invoice_amount, to: null },
      dashboard_id: { from: usedRecord.dashboard_id, to: null },
    }, reason, usedRecord.dashboard_id);

    await fetchRecords();
    return true;
  };

  const updateRecord = async (
    id: string,
    data: Partial<Omit<UnusedBL, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<boolean> => {
    if (!user) return false;
    const oldRecord = records.find(r => r.id === id);
    const { error } = await db('unused_bl')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);
    if (!error) {
      // Log edit
      if (oldRecord) {
        const changedFields: any = {};
        Object.keys(data).forEach(key => {
          const oldVal = (oldRecord as any)[key];
          const newVal = (data as any)[key];
          if (oldVal !== newVal) changedFields[key] = { from: oldVal, to: newVal };
        });
        if (Object.keys(changedFields).length > 0) {
          await logChange(id, oldRecord.bl_no, 'edited', changedFields);
        }
      }
      await fetchRecords();
    }
    return !error;
  };

  const getUniqueOwners = (): string[] => {
    return [...new Set(records.map(r => r.owner))];
  };

  const getChangeLog = async (blId: string) => {
    if (!user) return [];
    const { data } = await db('bl_change_log')
      .select('*')
      .eq('bl_id', blId)
      .eq('user_id', user.id)
      .order('performed_at', { ascending: false });
    return data || [];
  };

  return {
    records, loading,
    stats: {
      total: records.length,
      unused: records.filter(r => r.status === 'UNUSED').length,
      used: records.filter(r => r.status === 'USED').length,
    },
    createRecord, deleteRecord, updateRecord, uploadFiles, getFiles, getSignedUrl, useBL, revertBL,
    checkDuplicateBLNo, checkContainerWarning, refetch: fetchRecords, getUniqueOwners, getChangeLog,
  };
};

