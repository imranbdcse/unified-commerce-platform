import { create } from 'zustand';

const useOfflineStore = create((set) => ({
  pendingCount: 0,
  lastSyncAt: null,
  isSyncing: false,

  setPendingCount: (count) => set({ pendingCount: count }),
  setLastSyncAt: (date) => set({ lastSyncAt: date }),
  setSyncing: (val) => set({ isSyncing: val }),
}));

export default useOfflineStore;
