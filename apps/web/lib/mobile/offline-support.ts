/**
 * Offline Support Utilities
 * Handles offline detection, caching, and sync
 */

import { useState, useEffect } from 'react';

export interface OfflineStatus {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnlineTime: number | null;
}

/**
 * Check if device is online
 */
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

/**
 * Get offline status with history
 */
export function getOfflineStatus(): OfflineStatus {
  if (typeof window === 'undefined') {
    return {
      isOnline: true,
      wasOffline: false,
      lastOnlineTime: Date.now(),
    };
  }

  const wasOffline = sessionStorage.getItem('was-offline') === 'true';
  const lastOnlineTime = sessionStorage.getItem('last-online-time')
    ? parseInt(sessionStorage.getItem('last-online-time')!, 10)
    : null;

  return {
    isOnline: navigator.onLine,
    wasOffline,
    lastOnlineTime,
  };
}

/**
 * React hook for offline status
 */
export function useOfflineStatus() {
  if (typeof window === 'undefined') {
    return getOfflineStatus();
  }

  const [status, setStatus] = useState<OfflineStatus>(getOfflineStatus());

  useEffect(() => {
    const updateStatus = () => {
      const isOnline = navigator.onLine;
      
      if (isOnline) {
        sessionStorage.setItem('last-online-time', Date.now().toString());
        sessionStorage.removeItem('was-offline');
      } else {
        sessionStorage.setItem('was-offline', 'true');
      }

      setStatus({
        isOnline,
        wasOffline: !isOnline && sessionStorage.getItem('was-offline') === 'true',
        lastOnlineTime: isOnline
          ? Date.now()
          : (sessionStorage.getItem('last-online-time')
              ? parseInt(sessionStorage.getItem('last-online-time')!, 10)
              : null),
      });
    };

    // Initial status
    updateStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return status;
}

/**
 * Cache data for offline use
 */
export function cacheData(key: string, data: any, ttl: number = 3600000): void {
  if (typeof window === 'undefined') return;

  try {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(`cache-${key}`, JSON.stringify(cacheItem));
  } catch (error) {
    console.warn('Failed to cache data:', error);
  }
}

/**
 * Get cached data
 */
export function getCachedData<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(`cache-${key}`);
    if (!cached) return null;

    const cacheItem = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired
    if (now - cacheItem.timestamp > cacheItem.ttl) {
      localStorage.removeItem(`cache-${key}`);
      return null;
    }

    return cacheItem.data as T;
  } catch (error) {
    console.warn('Failed to get cached data:', error);
    return null;
  }
}

/**
 * Clear expired cache
 */
export function clearExpiredCache(): void {
  if (typeof window === 'undefined') return;

  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();

    keys.forEach((key) => {
      if (key.startsWith('cache-')) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const cacheItem = JSON.parse(cached);
            if (now - cacheItem.timestamp > cacheItem.ttl) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // Invalid cache item, remove it
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.warn('Failed to clear expired cache:', error);
  }
}
