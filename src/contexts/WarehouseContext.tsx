import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Warehouse {
  id: string;
  user_id: string;
  name: string;
  is_main: boolean;
  is_active: boolean;
  created_at: string;
}

interface Ctx {
  warehouses: Warehouse[];
  activeWarehouseId: string | null;
  activeWarehouse: Warehouse | null;
  setActiveWarehouseId: (id: string | null) => void;
  loading: boolean;
  refresh: () => Promise<void>;
  addWarehouse: (name: string) => Promise<Warehouse | null>;
  renameWarehouse: (id: string, name: string) => Promise<boolean>;
  deleteWarehouse: (id: string) => Promise<boolean>;
}

const WarehouseContext = createContext<Ctx | undefined>(undefined);
const STORAGE_KEY = 'active_warehouse_id';
const db = (t: string) => (supabase as any).from(t);

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [activeWarehouseId, setActiveWarehouseIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setWarehouses([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await db('warehouses').select('*').eq('user_id', user.id).eq('is_active', true).order('is_main', { ascending: false }).order('created_at');
    const list = (data || []) as Warehouse[];
    setWarehouses(list);
    // resolve active
    const stored = localStorage.getItem(STORAGE_KEY);
    const valid = stored && list.some(w => w.id === stored) ? stored : (list.find(w => w.is_main)?.id || list[0]?.id || null);
    setActiveWarehouseIdState(valid);
    if (valid) localStorage.setItem(STORAGE_KEY, valid);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel('warehouses-rt')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'warehouses' }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, refresh]);

  const setActiveWarehouseId = (id: string | null) => {
    setActiveWarehouseIdState(id);
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  };

  const addWarehouse = async (name: string) => {
    if (!user) return null;
    const { data, error } = await db('warehouses').insert({ user_id: user.id, name: name.trim(), is_main: false }).select().single();
    if (error) return null;
    await refresh();
    return data as Warehouse;
  };

  const renameWarehouse = async (id: string, name: string) => {
    const { error } = await db('warehouses').update({ name: name.trim() }).eq('id', id);
    if (!error) await refresh();
    return !error;
  };

  const deleteWarehouse = async (id: string) => {
    const { error } = await db('warehouses').delete().eq('id', id);
    if (!error) {
      if (activeWarehouseId === id) setActiveWarehouseId(null);
      await refresh();
    }
    return !error;
  };

  const activeWarehouse = warehouses.find(w => w.id === activeWarehouseId) || null;

  return (
    <WarehouseContext.Provider value={{ warehouses, activeWarehouseId, activeWarehouse, setActiveWarehouseId, loading, refresh, addWarehouse, renameWarehouse, deleteWarehouse }}>
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = () => {
  const ctx = useContext(WarehouseContext);
  if (!ctx) throw new Error('useWarehouse must be used within WarehouseProvider');
  return ctx;
};
