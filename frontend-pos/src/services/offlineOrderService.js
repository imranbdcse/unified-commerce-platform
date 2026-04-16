import { v4 as uuidv4 } from 'uuid';
import { saveOfflineOrder, getPendingOrders, markOrderSynced } from './offlineDB';
import api from './api';

// Offline order তৈরি করুন
export const createOfflineOrder = async (orderData) => {
  const offlineId = `OFFLINE-${uuidv4()}`;
  const order = {
    offlineId,
    ...orderData,
    status: 'pending_sync',
    is_synced: false,
    created_at: new Date().toISOString(),
  };

  await saveOfflineOrder(order);
  return order;
};

// Offline orders sync করুন
export const syncOfflineOrders = async () => {
  const pendingOrders = await getPendingOrders();
  const results = { synced: 0, failed: 0, errors: [] };

  for (const order of pendingOrders) {
    try {
      await api.post('/orders/sync', order);
      await markOrderSynced(order.offlineId);
      results.synced++;
    } catch (err) {
      results.failed++;
      results.errors.push({ offlineId: order.offlineId, error: err.message });
    }
  }

  return results;
};
