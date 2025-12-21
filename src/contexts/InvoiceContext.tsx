import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Invoice {
  id: string;
  userId: string;
  dashboardId: string;
  amount: number;
  date: string;
  invoiceNumber: string;
  beneficiary: string;
  bank: string;
  containerNumber?: string;
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
  setCurrentDashboardId: (id: string | null) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'userId' | 'status' | 'createdAt'>) => void;
  updateInvoice: (id: string, data: Partial<Omit<Invoice, 'id' | 'userId' | 'createdAt'>>) => void;
  updateInvoiceStatus: (id: string, status: 'pending' | 'received') => void;
  deleteInvoice: (id: string) => void;
  deleteMultipleInvoices: (ids: string[]) => void;
  addBank: (name: string) => void;
  updateBank: (id: string, name: string) => void;
  deleteBank: (id: string) => void;
  addDashboard: (name: string) => void;
  updateDashboard: (id: string, name: string) => void;
  deleteDashboard: (id: string) => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

const INVOICES_KEY = 'invoice_app_invoices';
const BANKS_KEY = 'invoice_app_banks';
const DASHBOARDS_KEY = 'invoice_app_dashboards';
const CURRENT_DASHBOARD_KEY = 'invoice_app_current_dashboard';
const DEFAULT_USER_ID = 'local_user';

const defaultBanks: Bank[] = [
  { id: '1', name: 'Central Bank of Iraq' },
  { id: '2', name: 'Rafidain Bank' },
  { id: '3', name: 'Rasheed Bank' },
  { id: '4', name: 'Trade Bank of Iraq' },
  { id: '5', name: 'Kurdistan International Bank' },
];

export const InvoiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [currentDashboardId, setCurrentDashboardIdState] = useState<string | null>(null);

  useEffect(() => {
    const savedInvoices = localStorage.getItem(INVOICES_KEY);
    const savedBanks = localStorage.getItem(BANKS_KEY);
    const savedDashboards = localStorage.getItem(DASHBOARDS_KEY);
    const savedCurrentDashboard = localStorage.getItem(CURRENT_DASHBOARD_KEY);
    
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    }
    
    if (savedBanks) {
      setBanks(JSON.parse(savedBanks));
    } else {
      setBanks(defaultBanks);
      localStorage.setItem(BANKS_KEY, JSON.stringify(defaultBanks));
    }

    if (savedDashboards) {
      const parsed = JSON.parse(savedDashboards);
      setDashboards(parsed);
      if (savedCurrentDashboard) {
        setCurrentDashboardIdState(savedCurrentDashboard);
      } else if (parsed.length > 0) {
        setCurrentDashboardIdState(parsed[0].id);
        localStorage.setItem(CURRENT_DASHBOARD_KEY, parsed[0].id);
      }
    } else {
      // Create default dashboard
      const defaultDashboard: Dashboard = {
        id: crypto.randomUUID(),
        name: 'Main Dashboard',
        userId: DEFAULT_USER_ID,
      };
      const newDashboards = [defaultDashboard];
      setDashboards(newDashboards);
      localStorage.setItem(DASHBOARDS_KEY, JSON.stringify(newDashboards));
      setCurrentDashboardIdState(defaultDashboard.id);
      localStorage.setItem(CURRENT_DASHBOARD_KEY, defaultDashboard.id);
    }
  }, []);

  const currentDashboardInvoices = invoices.filter(inv => inv.dashboardId === currentDashboardId);

  const setCurrentDashboardId = (id: string | null) => {
    setCurrentDashboardIdState(id);
    if (id) {
      localStorage.setItem(CURRENT_DASHBOARD_KEY, id);
    } else {
      localStorage.removeItem(CURRENT_DASHBOARD_KEY);
    }
  };

  const saveInvoices = (newInvoices: Invoice[]) => {
    setInvoices(newInvoices);
    localStorage.setItem(INVOICES_KEY, JSON.stringify(newInvoices));
  };

  const saveBanks = (newBanks: Bank[]) => {
    setBanks(newBanks);
    localStorage.setItem(BANKS_KEY, JSON.stringify(newBanks));
  };

  const saveDashboards = (newDashboards: Dashboard[]) => {
    setDashboards(newDashboards);
    localStorage.setItem(DASHBOARDS_KEY, JSON.stringify(newDashboards));
  };

  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'userId' | 'status' | 'createdAt'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: crypto.randomUUID(),
      userId: DEFAULT_USER_ID,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    saveInvoices([...invoices, newInvoice]);
  };

  const updateInvoiceStatus = (id: string, status: 'pending' | 'received') => {
    const updated = invoices.map(inv => 
      inv.id === id ? { ...inv, status } : inv
    );
    saveInvoices(updated);
  };

  const deleteInvoice = (id: string) => {
    saveInvoices(invoices.filter(inv => inv.id !== id));
  };

  const deleteMultipleInvoices = (ids: string[]) => {
    saveInvoices(invoices.filter(inv => !ids.includes(inv.id)));
  };

  const updateInvoice = (id: string, data: Partial<Omit<Invoice, 'id' | 'userId' | 'createdAt'>>) => {
    const updated = invoices.map(inv =>
      inv.id === id ? { ...inv, ...data } : inv
    );
    saveInvoices(updated);
  };

  const addBank = (name: string) => {
    const newBank: Bank = {
      id: crypto.randomUUID(),
      name,
    };
    saveBanks([...banks, newBank]);
  };

  const updateBank = (id: string, name: string) => {
    const updated = banks.map(bank => 
      bank.id === id ? { ...bank, name } : bank
    );
    saveBanks(updated);
  };

  const deleteBank = (id: string) => {
    saveBanks(banks.filter(bank => bank.id !== id));
  };

  const addDashboard = (name: string) => {
    const newDashboard: Dashboard = {
      id: crypto.randomUUID(),
      name,
      userId: DEFAULT_USER_ID,
    };
    saveDashboards([...dashboards, newDashboard]);
  };

  const updateDashboard = (id: string, name: string) => {
    const updated = dashboards.map(d => 
      d.id === id ? { ...d, name } : d
    );
    saveDashboards(updated);
  };

  const deleteDashboard = (id: string) => {
    saveDashboards(dashboards.filter(d => d.id !== id));
    // Also delete invoices for this dashboard
    saveInvoices(invoices.filter(inv => inv.dashboardId !== id));
    // Reset current dashboard if deleted
    if (currentDashboardId === id) {
      const remaining = dashboards.filter(d => d.id !== id);
      if (remaining.length > 0) {
        setCurrentDashboardId(remaining[0].id);
      } else {
        setCurrentDashboardId(null);
      }
    }
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoices: currentDashboardInvoices,
        banks,
        dashboards,
        currentDashboardId,
        setCurrentDashboardId,
        addInvoice,
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