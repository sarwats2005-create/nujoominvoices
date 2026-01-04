import { supabase } from '@/integrations/supabase/client';
import {
  getPendingSyncActions,
  markActionSynced,
  clearSyncedActions,
  saveInvoicesOffline,
  saveBanksOffline,
  saveDashboardsOffline,
} from './offlineDb';

type SyncStatus = 'idle' | 'syncing' | 'error' | 'success';

interface SyncManagerState {
  status: SyncStatus;
  lastSyncTime: number | null;
  pendingCount: number;
  error: string | null;
}

let syncState: SyncManagerState = {
  status: 'idle',
  lastSyncTime: null,
  pendingCount: 0,
  error: null,
};

const listeners: Set<(state: SyncManagerState) => void> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener({ ...syncState }));
}

export function subscribeSyncState(listener: (state: SyncManagerState) => void): () => void {
  listeners.add(listener);
  listener({ ...syncState });
  return () => listeners.delete(listener);
}

export function getSyncState(): SyncManagerState {
  return { ...syncState };
}

async function syncAction(action: {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: 'invoices' | 'banks' | 'dashboards';
  data: Record<string, unknown>;
}): Promise<boolean> {
  try {
    const { type, table, data } = action;

    switch (type) {
      case 'create':
      case 'update':
        const { error: upsertError } = await supabase.from(table).upsert(data as never);
        if (upsertError) throw upsertError;
        break;

      case 'delete':
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('id', data.id as string);
        if (deleteError) throw deleteError;
        break;
    }

    return true;
  } catch (error) {
    console.error('Sync action failed:', error);
    return false;
  }
}

export async function syncPendingActions(): Promise<void> {
  if (!navigator.onLine) {
    console.log('Offline - skipping sync');
    return;
  }

  const pendingActions = await getPendingSyncActions();
  if (pendingActions.length === 0) {
    syncState.pendingCount = 0;
    notifyListeners();
    return;
  }

  syncState.status = 'syncing';
  syncState.pendingCount = pendingActions.length;
  syncState.error = null;
  notifyListeners();

  let successCount = 0;
  let errorCount = 0;

  for (const action of pendingActions) {
    const success = await syncAction(action);
    if (success) {
      await markActionSynced(action.id);
      successCount++;
    } else {
      errorCount++;
    }
  }

  await clearSyncedActions();

  syncState.status = errorCount > 0 ? 'error' : 'success';
  syncState.lastSyncTime = Date.now();
  syncState.pendingCount = errorCount;
  syncState.error = errorCount > 0 ? `${errorCount} actions failed to sync` : null;
  notifyListeners();

  // Reset status after a delay
  setTimeout(() => {
    if (syncState.status !== 'syncing') {
      syncState.status = 'idle';
      notifyListeners();
    }
  }, 3000);
}

export async function fetchAndCacheData(userId: string): Promise<void> {
  if (!navigator.onLine) {
    console.log('Offline - using cached data');
    return;
  }

  try {
    // Fetch dashboards
    const { data: dashboards } = await supabase
      .from('dashboards')
      .select('*')
      .eq('user_id', userId);

    if (dashboards) {
      await saveDashboardsOffline(dashboards);
    }

    // Fetch banks
    const { data: banks } = await supabase
      .from('banks')
      .select('*')
      .eq('user_id', userId);

    if (banks) {
      await saveBanksOffline(banks);
    }

    // Fetch invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId);

    if (invoices) {
      await saveInvoicesOffline(invoices);
    }

    console.log('Data cached successfully');
  } catch (error) {
    console.error('Failed to cache data:', error);
  }
}

// Set up online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Back online - syncing pending actions');
    syncPendingActions();
  });
}
