import { syncOfflineOrders } from './offlineOrderService';
import { isOnline } from './networkStatus';

let syncInterval = null;
const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export const startSyncManager = (onSyncComplete) => {
  const doSync = async () => {
    if (!isOnline()) return;
    try {
      const results = await syncOfflineOrders();
      if (results.synced > 0 && onSyncComplete) {
        onSyncComplete(results);
      }
    } catch (err) {
      console.error('Sync failed:', err);
    }
  };

  doSync();
  syncInterval = setInterval(doSync, SYNC_INTERVAL_MS);
  return () => clearInterval(syncInterval);
};

export const stopSyncManager = () => {
  if (syncInterval) clearInterval(syncInterval);
};

export const triggerManualSync = async () => {
  if (!isOnline()) {
    throw new Error('No internet connection');
  }
  return syncOfflineOrders();
};
