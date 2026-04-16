import React, { useState, useEffect } from 'react';
import { addNetworkListener, isOnline } from '../../services/networkStatus';
import { triggerManualSync } from '../../services/syncManager';
import useOfflineStore from '../../stores/offlineStore';

const NetworkStatusBar = () => {
  const [online, setOnline] = useState(isOnline());
  const { pendingCount, isSyncing, setSyncing } = useOfflineStore();

  useEffect(() => {
    return addNetworkListener(setOnline);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await triggerManualSync();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  if (online && pendingCount === 0) return null;

  return (
    <div className={`px-4 py-2 text-sm flex items-center justify-between ${online ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
      <div className="flex items-center gap-2">
        <span>{online ? '🟡' : '🔴'}</span>
        <span>
          {!online ? 'অফলাইন মোড - অর্ডার সংরক্ষিত হচ্ছে' :
           `${pendingCount} অর্ডার sync বাকি আছে`}
        </span>
      </div>
      {online && pendingCount > 0 && (
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
        >
          {isSyncing ? '⟳ Syncing...' : '↑ এখনই Sync করুন'}
        </button>
      )}
    </div>
  );
};

export default NetworkStatusBar;
