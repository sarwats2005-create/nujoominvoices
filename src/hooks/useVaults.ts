import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Vault {
  id: string;
  user_id: string;
  warehouse_id: string;
  name: string;
  color: string;
  is_main: boolean;
  is_open: boolean;
  pin_hash: string | null;
  created_at: string;
}

export interface VaultTransaction {
  id: string;
  vault_id: string;
  warehouse_id: string;
  type: 'sale' | 'refund' | 'po_payment' | 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out';
  amount: number;
  currency: string;
  reference_type: string | null;
  reference_id: string | null;
  notes: string | null;
  created_at: string;
}

const db = (t: string) => (supabase as any).from(t);

export const useVaults = (warehouseId: string | null) => {
  const { user } = useAuth();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user || !warehouseId) { setVaults([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await db('vaults').select('*').eq('user_id', user.id).eq('warehouse_id', warehouseId).order('is_main', { ascending: false }).order('created_at');
    setVaults((data || []) as Vault[]);
    setLoading(false);
  }, [user, warehouseId]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel(`vaults-rt-${warehouseId}`)
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'vaults' }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, warehouseId, refresh]);

  const addVault = async (name: string, color: string) => {
    if (!user || !warehouseId) return null;
    const { data, error } = await db('vaults').insert({
      user_id: user.id, warehouse_id: warehouseId, name: name.trim(), color, is_main: false, is_open: true,
    }).select().single();
    if (error) return null;
    await refresh();
    return data as Vault;
  };

  const updateVault = async (id: string, patch: Partial<Pick<Vault, 'name' | 'color'>>) => {
    const { error } = await db('vaults').update(patch).eq('id', id);
    if (!error) await refresh();
    return !error;
  };

  const deleteVault = async (id: string) => {
    const { error } = await db('vaults').delete().eq('id', id);
    if (!error) await refresh();
    return { ok: !error, error: error?.message };
  };

  // Edge function actions
  const callPin = async (payload: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke('vault-pin', { body: payload });
    if (error) return { ok: false, error: (error as any).message || 'Error' };
    if (data?.error) return { ok: false, error: data.error };
    return { ok: true };
  };

  const setPin = (vault_id: string, new_pin: string) => callPin({ action: 'set_pin', vault_id, new_pin });
  const removePin = (vault_id: string, pin: string) => callPin({ action: 'remove_pin', vault_id, pin });
  const openVault = async (vault_id: string, pin: string) => {
    const r = await callPin({ action: 'open_vault', vault_id, pin });
    if (r.ok) await refresh();
    return r;
  };
  const closeVault = async (vault_id: string, pin: string) => {
    const r = await callPin({ action: 'close_vault', vault_id, pin });
    if (r.ok) await refresh();
    return r;
  };
  const verifyPin = (vault_id: string, pin: string) => callPin({ action: 'verify_pin', vault_id, pin });

  return { vaults, loading, refresh, addVault, updateVault, deleteVault, setPin, removePin, openVault, closeVault, verifyPin };
};

export const useVaultTransactions = (vaultId: string | null, limit = 50) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<VaultTransaction[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});

  const refresh = useCallback(async () => {
    if (!user || !vaultId) { setTransactions([]); setBalances({}); return; }
    const { data } = await db('vault_transactions').select('*').eq('vault_id', vaultId).order('created_at', { ascending: false }).limit(limit);
    const list = (data || []) as VaultTransaction[];
    setTransactions(list);
    // Aggregate balances per currency (compute from ALL rows, not just limit)
    const { data: all } = await db('vault_transactions').select('type,amount,currency').eq('vault_id', vaultId);
    const bal: Record<string, number> = {};
    (all || []).forEach((t: any) => {
      const sign = ['sale', 'deposit', 'transfer_in'].includes(t.type) ? 1 : -1;
      bal[t.currency] = (bal[t.currency] || 0) + sign * Number(t.amount);
    });
    setBalances(bal);
  }, [user, vaultId, limit]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!user || !vaultId) return;
    const ch = supabase.channel(`vault-tx-${vaultId}`)
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'vault_transactions', filter: `vault_id=eq.${vaultId}` }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, vaultId, refresh]);

  const logTransaction = async (payload: Omit<VaultTransaction, 'id' | 'created_at'> & { user_id?: string }) => {
    if (!user) return false;
    const { error } = await db('vault_transactions').insert({ ...payload, user_id: user.id });
    if (!error) await refresh();
    return !error;
  };

  const transfer = async (fromVaultId: string, toVaultId: string, warehouseId: string, amount: number, currency: string, notes?: string) => {
    if (!user) return false;
    const { error } = await db('vault_transactions').insert([
      { user_id: user.id, vault_id: fromVaultId, warehouse_id: warehouseId, type: 'transfer_out', amount, currency, notes: notes || `Transfer to vault` },
      { user_id: user.id, vault_id: toVaultId, warehouse_id: warehouseId, type: 'transfer_in', amount, currency, notes: notes || `Transfer from vault` },
    ]);
    if (!error) await refresh();
    return !error;
  };

  return { transactions, balances, refresh, logTransaction, transfer };
};
