import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Customer } from '@/types/pos';

const db = (table: string) => (supabase as any).from(table);

export const useCustomers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await db('customers').select('*').eq('user_id', user.id).eq('is_active', true).order('name');
    if (data) setCustomers(data as Customer[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const addCustomer = async (data: Partial<Customer>): Promise<Customer | null> => {
    if (!user) return null;
    const { data: inserted, error } = await db('customers')
      .insert({ ...data, user_id: user.id })
      .select()
      .single();
    if (error) return null;
    await fetchCustomers();
    return inserted as Customer;
  };

  const updateCustomer = async (id: string, data: Partial<Customer>): Promise<boolean> => {
    if (!user) return false;
    const { error } = await db('customers').update(data).eq('id', id).eq('user_id', user.id);
    if (!error) await fetchCustomers();
    return !error;
  };

  const deleteCustomer = async (id: string): Promise<boolean> => {
    if (!user) return false;
    const { error } = await db('customers').update({ is_active: false }).eq('id', id);
    if (!error) await fetchCustomers();
    return !error;
  };

  return { customers, loading, addCustomer, updateCustomer, deleteCustomer, refetch: fetchCustomers };
};
