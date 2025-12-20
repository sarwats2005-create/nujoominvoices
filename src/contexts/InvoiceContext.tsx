import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Invoice {
  id: string;
  userId: string;
  amount: number;
  date: string;
  invoiceNumber: string;
  beneficiary: string;
  bank: string;
  status: 'pending' | 'received';
  createdAt: string;
}

export interface Bank {
  id: string;
  name: string;
}

interface InvoiceContextType {
  invoices: Invoice[];
  banks: Bank[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'userId' | 'status' | 'createdAt'>) => void;
  updateInvoice: (id: string, data: Partial<Omit<Invoice, 'id' | 'userId' | 'createdAt'>>) => void;
  updateInvoiceStatus: (id: string, status: 'pending' | 'received') => void;
  deleteInvoice: (id: string) => void;
  deleteMultipleInvoices: (ids: string[]) => void;
  addBank: (name: string) => void;
  updateBank: (id: string, name: string) => void;
  deleteBank: (id: string) => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

const INVOICES_KEY = 'invoice_app_invoices';
const BANKS_KEY = 'invoice_app_banks';

const defaultBanks: Bank[] = [
  { id: '1', name: 'Central Bank of Iraq' },
  { id: '2', name: 'Rafidain Bank' },
  { id: '3', name: 'Rasheed Bank' },
  { id: '4', name: 'Trade Bank of Iraq' },
  { id: '5', name: 'Kurdistan International Bank' },
];

export const InvoiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);

  useEffect(() => {
    const savedInvoices = localStorage.getItem(INVOICES_KEY);
    const savedBanks = localStorage.getItem(BANKS_KEY);
    
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    }
    
    if (savedBanks) {
      setBanks(JSON.parse(savedBanks));
    } else {
      setBanks(defaultBanks);
      localStorage.setItem(BANKS_KEY, JSON.stringify(defaultBanks));
    }
  }, []);

  const userInvoices = invoices.filter(inv => inv.userId === user?.id);

  const saveInvoices = (newInvoices: Invoice[]) => {
    setInvoices(newInvoices);
    localStorage.setItem(INVOICES_KEY, JSON.stringify(newInvoices));
  };

  const saveBanks = (newBanks: Bank[]) => {
    setBanks(newBanks);
    localStorage.setItem(BANKS_KEY, JSON.stringify(newBanks));
  };

  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'userId' | 'status' | 'createdAt'>) => {
    if (!user) return;
    
    const newInvoice: Invoice = {
      ...invoiceData,
      id: crypto.randomUUID(),
      userId: user.id,
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

  return (
    <InvoiceContext.Provider
      value={{
        invoices: userInvoices,
        banks,
        addInvoice,
        updateInvoice,
        updateInvoiceStatus,
        deleteInvoice,
        deleteMultipleInvoices,
        addBank,
        updateBank,
        deleteBank,
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
