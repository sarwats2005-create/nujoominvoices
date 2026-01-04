import { useState, useEffect, useCallback } from 'react';
import { syncPendingActions, subscribeSyncState } from '@/lib/syncManager';
import { getPendingSyncActions } from '@/lib/offlineDb';

interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  effectiveType: string | null;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  pendingActions: number;
  lastSyncTime: number | null;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSlowConnection: false,
    effectiveType: null,
    syncStatus: 'idle',
    pendingActions: 0,
    lastSyncTime: null,
  });

  const updateConnectionInfo = useCallback(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInformation })?.connection;
    if (connection) {
      setStatus((prev) => ({
        ...prev,
        effectiveType: connection.effectiveType || null,
        isSlowConnection: connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g',
      }));
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setStatus((prev) => ({ ...prev, isOnline: true }));
      syncPendingActions();
    };

    const handleOffline = () => {
      setStatus((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Network Information API
    const connection = (navigator as Navigator & { connection?: NetworkInformation })?.connection;
    if (connection) {
      updateConnectionInfo();
      connection.addEventListener('change', updateConnectionInfo);
    }

    // Subscribe to sync state changes
    const unsubscribe = subscribeSyncState((syncState) => {
      setStatus((prev) => ({
        ...prev,
        syncStatus: syncState.status,
        pendingActions: syncState.pendingCount,
        lastSyncTime: syncState.lastSyncTime,
      }));
    });

    // Check pending actions on mount
    getPendingSyncActions().then((actions) => {
      setStatus((prev) => ({ ...prev, pendingActions: actions.length }));
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateConnectionInfo);
      }
      unsubscribe();
    };
  }, [updateConnectionInfo]);

  return status;
}

interface NetworkInformation extends EventTarget {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  downlink: number;
  rtt: number;
  saveData: boolean;
  addEventListener(type: 'change', listener: () => void): void;
  removeEventListener(type: 'change', listener: () => void): void;
}
