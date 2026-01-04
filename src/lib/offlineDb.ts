import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  date: string;
  beneficiary: string;
  bank: string;
  status: string;
  container_number: string | null;
  swift_date: string | null;
  dashboard_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface Bank {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

interface Dashboard {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface SyncAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: 'invoices' | 'banks' | 'dashboards';
  data: Record<string, unknown>;
  timestamp: number;
  synced: boolean;
}

interface NujoomDB extends DBSchema {
  invoices: {
    key: string;
    value: Invoice;
    indexes: { 'by-dashboard': string; 'by-user': string };
  };
  banks: {
    key: string;
    value: Bank;
    indexes: { 'by-user': string };
  };
  dashboards: {
    key: string;
    value: Dashboard;
    indexes: { 'by-user': string };
  };
  syncQueue: {
    key: string;
    value: SyncAction;
    indexes: { 'by-synced': number };
  };
  appState: {
    key: string;
    value: {
      key: string;
      value: unknown;
      updatedAt: number;
    };
  };
}

const DB_NAME = 'nujoom-invoices-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<NujoomDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<NujoomDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<NujoomDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Invoices store
      if (!db.objectStoreNames.contains('invoices')) {
        const invoiceStore = db.createObjectStore('invoices', { keyPath: 'id' });
        invoiceStore.createIndex('by-dashboard', 'dashboard_id');
        invoiceStore.createIndex('by-user', 'user_id');
      }

      // Banks store
      if (!db.objectStoreNames.contains('banks')) {
        const bankStore = db.createObjectStore('banks', { keyPath: 'id' });
        bankStore.createIndex('by-user', 'user_id');
      }

      // Dashboards store
      if (!db.objectStoreNames.contains('dashboards')) {
        const dashboardStore = db.createObjectStore('dashboards', { keyPath: 'id' });
        dashboardStore.createIndex('by-user', 'user_id');
      }

      // Sync queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
        syncStore.createIndex('by-synced', 'synced');
      }

      // App state store
      if (!db.objectStoreNames.contains('appState')) {
        db.createObjectStore('appState', { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
}

// Invoice operations
export async function saveInvoicesOffline(invoices: Invoice[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('invoices', 'readwrite');
  await Promise.all([
    ...invoices.map((invoice) => tx.store.put(invoice)),
    tx.done,
  ]);
}

export async function getInvoicesOffline(dashboardId?: string): Promise<Invoice[]> {
  const db = await getDB();
  if (dashboardId) {
    return db.getAllFromIndex('invoices', 'by-dashboard', dashboardId);
  }
  return db.getAll('invoices');
}

export async function saveInvoiceOffline(invoice: Invoice): Promise<void> {
  const db = await getDB();
  await db.put('invoices', invoice);
}

export async function deleteInvoiceOffline(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('invoices', id);
}

// Bank operations
export async function saveBanksOffline(banks: Bank[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('banks', 'readwrite');
  await Promise.all([...banks.map((bank) => tx.store.put(bank)), tx.done]);
}

export async function getBanksOffline(): Promise<Bank[]> {
  const db = await getDB();
  return db.getAll('banks');
}

// Dashboard operations
export async function saveDashboardsOffline(dashboards: Dashboard[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('dashboards', 'readwrite');
  await Promise.all([
    ...dashboards.map((dashboard) => tx.store.put(dashboard)),
    tx.done,
  ]);
}

export async function getDashboardsOffline(): Promise<Dashboard[]> {
  const db = await getDB();
  return db.getAll('dashboards');
}

// Sync queue operations
export async function addToSyncQueue(action: Omit<SyncAction, 'id' | 'timestamp' | 'synced'>): Promise<void> {
  const db = await getDB();
  const syncAction: SyncAction = {
    ...action,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    synced: false,
  };
  await db.put('syncQueue', syncAction);
}

export async function getPendingSyncActions(): Promise<SyncAction[]> {
  const db = await getDB();
  const allActions = await db.getAll('syncQueue');
  return allActions.filter((action) => !action.synced).sort((a, b) => a.timestamp - b.timestamp);
}

export async function markActionSynced(id: string): Promise<void> {
  const db = await getDB();
  const action = await db.get('syncQueue', id);
  if (action) {
    action.synced = true;
    await db.put('syncQueue', action);
  }
}

export async function clearSyncedActions(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('syncQueue', 'readwrite');
  const allActions = await tx.store.getAll();
  await Promise.all([
    ...allActions.filter((a) => a.synced).map((a) => tx.store.delete(a.id)),
    tx.done,
  ]);
}

// App state operations
export async function saveAppState(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  await db.put('appState', { key, value, updatedAt: Date.now() });
}

export async function getAppState<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  const state = await db.get('appState', key);
  return state?.value as T | undefined;
}

// Clear all offline data
export async function clearAllOfflineData(): Promise<void> {
  const db = await getDB();
  const tx1 = db.transaction('invoices', 'readwrite');
  await tx1.store.clear();
  await tx1.done;
  
  const tx2 = db.transaction('banks', 'readwrite');
  await tx2.store.clear();
  await tx2.done;
  
  const tx3 = db.transaction('dashboards', 'readwrite');
  await tx3.store.clear();
  await tx3.done;
}
