import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface Invoice {
  id: string;
  userId: string;
  dashboardId: string;
  amount: number;
  currency: string;
  date: string;
  invoiceNumber: string;
  beneficiary: string;
  bank: string;
  containerNumber?: string;
  swiftDate?: string;
  status: 'pending' | 'received';
  createdAt: string;
}

export interface Bank {
  id: string;
  name: string;
}

export interface Dashboard {
  id: string;
  name: string;
  userId: string;
}

interface InvoiceContextType {
  invoices: Invoice[];
  banks: Bank[];
  dashboards: Dashboard[];
  currentDashboardId: string | null;
  loading: boolean;
  setCurrentDashboardId: (id: string | null) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'userId' | 'status' | 'createdAt'>) => Promise<void>;
  addMultipleInvoices: (invoices: Omit<Invoice, 'id' | 'userId' | 'status' | 'createdAt'>[]) => Promise<void>;
  updateInvoice: (id: string, data: Partial<Omit<Invoice, 'id' | 'userId' | 'createdAt'>>) => Promise<void>;
  updateInvoiceStatus: (id: string, status: 'pending' | 'received') => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  deleteMultipleInvoices: (ids: string[]) => Promise<void>;
  addBank: (name: string) => Promise<void>;
  updateBank: (id: string, name: string) => Promise<void>;
  deleteBank: (id: string) => Promise<void>;
  addDashboard: (name: string) => Promise<void>;
  updateDashboard: (id: string, name: string) => Promise<void>;
  deleteDashboard: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

const defaultBanks = [
  'Central Bank of Iraq',
  'Rafidain Bank',
  'Rasheed Bank',
  'Trade Bank of Iraq',
  'Kurdistan International Bank',
];

export const InvoiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [currentDashboardId, setCurrentDashboardIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboards = useCallback(async () => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('dashboards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching dashboards:', error);
      return [];
    }

    return (data || []).map(d => ({
      id: d.id,
      name: d.name,
      userId: d.user_id,
    }));
  }, [user]);

  const fetchBanks = useCallback(async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('banks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching banks:', error);
      return [];
    }

    return (data || []).map(b => ({
      id: b.id,
      name: b.name,
    }));
  }, [user]);

  const fetchInvoices = useCallback(async (dashboardId: string | null) => {
    if (!user || !dashboardId) return [];

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .eq('dashboard_id', dashboardId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }

    return (data || []).map(inv => ({
      id: inv.id,
      userId: inv.user_id,
      dashboardId: inv.dashboard_id,
      amount: Number(inv.amount),
      currency: inv.currency,
      date: inv.date,
      invoiceNumber: inv.invoice_number,
      beneficiary: inv.beneficiary,
      bank: inv.bank,
      containerNumber: inv.container_number || undefined,
      swiftDate: inv.swift_date || undefined,
      status: inv.status as 'pending' | 'received',
      createdAt: inv.created_at,
    }));
  }, [user]);

  const initializeUserData = useCallback(async () => {
    if (!user) {
      setDashboards([]);
      setBanks([]);
      setInvoices([]);
      setCurrentDashboardIdState(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Fetch dashboards
      let userDashboards = await fetchDashboards();

      // Create default dashboard if none exists
      if (userDashboards.length === 0) {
        const { data: newDashboard, error } = await supabase
          .from('dashboards')
          .insert({ user_id: user.id, name: 'Main Dashboard' })
          .select()
          .single();

        if (!error && newDashboard) {
          userDashboards = [{
            id: newDashboard.id,
            name: newDashboard.name,
            userId: newDashboard.user_id,
          }];
        }
      }

      setDashboards(userDashboards);

      // Set current dashboard
      const savedDashboardId = localStorage.getItem(`current_dashboard_${user.id}`);
      const validDashboardId = userDashboards.find(d => d.id === savedDashboardId)?.id || userDashboards[0]?.id || null;
      setCurrentDashboardIdState(validDashboardId);

      // Fetch banks
      let userBanks = await fetchBanks();

      // Create default banks if none exist
      if (userBanks.length === 0) {
        const banksToInsert = defaultBanks.map(name => ({ user_id: user.id, name }));
        const { data: newBanks, error } = await supabase
          .from('banks')
          .insert(banksToInsert)
          .select();

        if (!error && newBanks) {
          userBanks = newBanks.map(b => ({ id: b.id, name: b.name }));
        }
      }

      setBanks(userBanks);

      // Fetch invoices for current dashboard
      if (validDashboardId) {
        const userInvoices = await fetchInvoices(validDashboardId);
        setInvoices(userInvoices);
      }
    } catch (error) {
      console.error('Error initializing user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, fetchDashboards, fetchBanks, fetchInvoices]);

  useEffect(() => {
    initializeUserData();
  }, [initializeUserData]);

  // Re-fetch invoices when dashboard changes
  useEffect(() => {
    if (user && currentDashboardId) {
      fetchInvoices(currentDashboardId).then(setInvoices);
      localStorage.setItem(`current_dashboard_${user.id}`, currentDashboardId);
    }
  }, [currentDashboardId, user, fetchInvoices]);

  const setCurrentDashboardId = (id: string | null) => {
    setCurrentDashboardIdState(id);
  };

  const refreshData = async () => {
    await initializeUserData();
  };

  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'userId' | 'status' | 'createdAt'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        dashboard_id: invoiceData.dashboardId,
        amount: invoiceData.amount,
        currency: invoiceData.currency || 'USD',
        date: invoiceData.date,
        invoice_number: invoiceData.invoiceNumber,
        beneficiary: invoiceData.beneficiary,
        bank: invoiceData.bank,
        container_number: invoiceData.containerNumber || null,
        swift_date: invoiceData.swiftDate || null,
        status: 'pending',
      })
      .select()
      .single();

    if (!error && data) {
      const newInvoice: Invoice = {
        id: data.id,
        userId: data.user_id,
        dashboardId: data.dashboard_id,
        amount: Number(data.amount),
        currency: data.currency,
        date: data.date,
        invoiceNumber: data.invoice_number,
        beneficiary: data.beneficiary,
        bank: data.bank,
        containerNumber: data.container_number || undefined,
        swiftDate: data.swift_date || undefined,
        status: data.status as 'pending' | 'received',
        createdAt: data.created_at,
      };
      setInvoices(prev => [newInvoice, ...prev]);
    }
  };

  const addMultipleInvoices = async (invoicesData: Omit<Invoice, 'id' | 'userId' | 'status' | 'createdAt'>[]) => {
    if (!user) return;

    const toInsert = invoicesData.map(inv => ({
      user_id: user.id,
      dashboard_id: inv.dashboardId,
      amount: inv.amount,
      currency: inv.currency || 'USD',
      date: inv.date,
      invoice_number: inv.invoiceNumber,
      beneficiary: inv.beneficiary,
      bank: inv.bank,
      container_number: inv.containerNumber || null,
      swift_date: inv.swiftDate || null,
      status: 'pending',
    }));

    const { data, error } = await supabase
      .from('invoices')
      .insert(toInsert)
      .select();

    if (!error && data) {
      const newInvoices: Invoice[] = data.map(d => ({
        id: d.id,
        userId: d.user_id,
        dashboardId: d.dashboard_id,
        amount: Number(d.amount),
        currency: d.currency,
        date: d.date,
        invoiceNumber: d.invoice_number,
        beneficiary: d.beneficiary,
        bank: d.bank,
        containerNumber: d.container_number || undefined,
        swiftDate: d.swift_date || undefined,
        status: d.status as 'pending' | 'received',
        createdAt: d.created_at,
      }));
      setInvoices(prev => [...newInvoices, ...prev]);
    }
  };

  const updateInvoice = async (id: string, data: Partial<Omit<Invoice, 'id' | 'userId' | 'createdAt'>>) => {
    if (!user) return;

    const updateData: Record<string, unknown> = {};
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.invoiceNumber !== undefined) updateData.invoice_number = data.invoiceNumber;
    if (data.beneficiary !== undefined) updateData.beneficiary = data.beneficiary;
    if (data.bank !== undefined) updateData.bank = data.bank;
    if (data.containerNumber !== undefined) updateData.container_number = data.containerNumber || null;
    if (data.swiftDate !== undefined) updateData.swift_date = data.swiftDate || null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.dashboardId !== undefined) updateData.dashboard_id = data.dashboardId;

    const { error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setInvoices(prev => prev.map(inv =>
        inv.id === id ? { ...inv, ...data } : inv
      ));
    }
  };

  const updateInvoiceStatus = async (id: string, status: 'pending' | 'received') => {
    await updateInvoice(id, { status });
  };

  const deleteInvoice = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    }
  };

  const deleteMultipleInvoices = async (ids: string[]) => {
    if (!user) return;

    const { error } = await supabase
      .from('invoices')
      .delete()
      .in('id', ids)
      .eq('user_id', user.id);

    if (!error) {
      setInvoices(prev => prev.filter(inv => !ids.includes(inv.id)));
    }
  };

  const addBank = async (name: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('banks')
      .insert({ user_id: user.id, name })
      .select()
      .single();

    if (!error && data) {
      setBanks(prev => [...prev, { id: data.id, name: data.name }]);
    }
  };

  const updateBank = async (id: string, name: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('banks')
      .update({ name })
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setBanks(prev => prev.map(bank =>
        bank.id === id ? { ...bank, name } : bank
      ));
    }
  };

  const deleteBank = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('banks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setBanks(prev => prev.filter(bank => bank.id !== id));
    }
  };

  const addDashboard = async (name: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('dashboards')
      .insert({ user_id: user.id, name })
      .select()
      .single();

    if (!error && data) {
      setDashboards(prev => [...prev, { id: data.id, name: data.name, userId: data.user_id }]);
    }
  };

  const updateDashboard = async (id: string, name: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('dashboards')
      .update({ name })
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setDashboards(prev => prev.map(d =>
        d.id === id ? { ...d, name } : d
      ));
    }
  };

  const deleteDashboard = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('dashboards')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setDashboards(prev => prev.filter(d => d.id !== id));
      setInvoices(prev => prev.filter(inv => inv.dashboardId !== id));

      if (currentDashboardId === id) {
        const remaining = dashboards.filter(d => d.id !== id);
        setCurrentDashboardIdState(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        banks,
        dashboards,
        currentDashboardId,
        loading,
        setCurrentDashboardId,
        addInvoice,
        addMultipleInvoices,
        updateInvoice,
        updateInvoiceStatus,
        deleteInvoice,
        deleteMultipleInvoices,
        addBank,
        updateBank,
        deleteBank,
        addDashboard,
        updateDashboard,
        deleteDashboard,
        refreshData,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoice = (): InvoiceContextType => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return context;
};
