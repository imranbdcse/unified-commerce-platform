import { openDB } from 'idb';

const DB_NAME = 'ucp-pos-offline';
const DB_VERSION = 1;

let dbPromise = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Offline orders
        if (!db.objectStoreNames.contains('offline_orders')) {
          const orderStore = db.createObjectStore('offline_orders', { keyPath: 'offlineId' });
          orderStore.createIndex('synced', 'synced');
          orderStore.createIndex('created_at', 'created_at');
        }
        // Products cache
        if (!db.objectStoreNames.contains('products_cache')) {
          db.createObjectStore('products_cache', { keyPath: 'id' });
        }
        // Settings
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
};

// Offline order সংরক্ষণ করুন
export const saveOfflineOrder = async (order) => {
  const db = await getDB();
  await db.put('offline_orders', { ...order, synced: false, created_at: new Date().toISOString() });
};

// সব pending offline orders পান
export const getPendingOrders = async () => {
  const db = await getDB();
  return db.getAllFromIndex('offline_orders', 'synced', false);
};

// Order synced হিসেবে চিহ্নিত করুন
export const markOrderSynced = async (offlineId) => {
  const db = await getDB();
  const order = await db.get('offline_orders', offlineId);
  if (order) {
    await db.put('offline_orders', { ...order, synced: true });
  }
};

// Products cache সংরক্ষণ করুন
export const cacheProducts = async (products) => {
  const db = await getDB();
  const tx = db.transaction('products_cache', 'readwrite');
  await Promise.all(products.map((p) => tx.store.put(p)));
  await tx.done;
};

// Cached products পান
export const getCachedProducts = async () => {
  const db = await getDB();
  return db.getAll('products_cache');
};

// Settings
export const saveSetting = async (key, value) => {
  const db = await getDB();
  await db.put('settings', { key, value });
};

export const getSetting = async (key) => {
  const db = await getDB();
  const item = await db.get('settings', key);
  return item?.value;
};
