/**
 * useNetworkStatus Composable
 *
 * A composable that provides reactive network status monitoring.
 * Handles online/offline state changes and provides subscription capabilities.
 */

import { ref, onMounted, onUnmounted } from 'vue';

export interface INetworkStatus {
  online: {
    value: boolean;
    subscribe: (callback: (isOnline: boolean) => void) => void;
    unsubscribe: (callback: (isOnline: boolean) => void) => void;
  };
  lastChecked: Date;
}

export function useNetworkStatus(): INetworkStatus {
  const online = ref(navigator.onLine);
  const lastChecked = ref(new Date());
  const subscribers = new Set<(isOnline: boolean) => void>();

  const updateOnlineStatus = (isOnline: boolean): void => {
    online.value = isOnline;
    lastChecked.value = new Date();
    for (const callback of subscribers) {
      callback(isOnline);
    }
  };

  const handleOnline = (): void => {
    updateOnlineStatus(true);
  };

  const handleOffline = (): void => {
    updateOnlineStatus(false);
  };

  onMounted(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  });

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  });

  return {
    online: {
      value: online.value,
      subscribe: (callback: (isOnline: boolean) => void) => {
        subscribers.add(callback);
      },
      unsubscribe: (callback: (isOnline: boolean) => void) => {
        subscribers.delete(callback);
      },
    },
    lastChecked: lastChecked.value,
  };
}
