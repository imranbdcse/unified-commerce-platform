let _isOnline = navigator.onLine;
const listeners = [];

export const isOnline = () => _isOnline;

export const addNetworkListener = (callback) => {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx > -1) listeners.splice(idx, 1);
  };
};

const notifyListeners = (status) => {
  _isOnline = status;
  listeners.forEach((fn) => fn(status));
};

// Server ping every 30 seconds to verify actual connectivity
const pingServer = async () => {
  try {
    const response = await fetch('/health', { method: 'GET', cache: 'no-cache', signal: AbortSignal.timeout(5000) });
    notifyListeners(response.ok);
  } catch {
    notifyListeners(false);
  }
};

window.addEventListener('online', () => { pingServer(); });
window.addEventListener('offline', () => notifyListeners(false));

setInterval(pingServer, 30000);
