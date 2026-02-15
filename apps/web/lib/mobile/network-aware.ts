/**
 * Network-Aware Utilities
 * Detects network quality and adjusts behavior accordingly
 */

import { useState, useEffect } from 'react';

export type ConnectionType = 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
export type EffectiveConnectionType = 'slow-2g' | '2g' | '3g' | '4g';

interface NetworkInformation extends EventTarget {
  effectiveType?: EffectiveConnectionType;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  type?: ConnectionType;
  onchange?: (event: Event) => void;
}

declare global {
  interface Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }
}

export interface NetworkStatus {
  effectiveType: EffectiveConnectionType;
  downlink: number;
  rtt: number;
  saveData: boolean;
  isSlow: boolean;
  isOffline: boolean;
}

/**
 * Get current network information
 */
export function getNetworkStatus(): NetworkStatus {
  const defaultStatus: NetworkStatus = {
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false,
    isSlow: false,
    isOffline: false,
  };

  if (typeof window === 'undefined') {
    return defaultStatus;
  }

  // Check if offline
  if (!navigator.onLine) {
    return {
      ...defaultStatus,
      isOffline: true,
      isSlow: true,
      effectiveType: 'slow-2g',
    };
  }

  // Get connection info
  const connection =
    navigator.connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;

  if (!connection) {
    return defaultStatus;
  }

  const effectiveType = (connection.effectiveType || '4g') as EffectiveConnectionType;
  const downlink = connection.downlink || 10;
  const rtt = connection.rtt || 50;
  const saveData = connection.saveData || false;

  const isSlow = effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1.5;

  return {
    effectiveType,
    downlink,
    rtt,
    saveData,
    isSlow,
    isOffline: false,
  };
}

/**
 * Get optimal image quality based on network
 */
export function getOptimalImageQuality(networkStatus?: NetworkStatus): {
  quality: number;
  format: 'auto' | 'webp' | 'jpg';
  width: number;
} {
  const status = networkStatus || getNetworkStatus();

  if (status.isOffline || status.isSlow) {
    return {
      quality: 60,
      format: 'auto',
      width: 800,
    };
  }

  if (status.effectiveType === '2g' || status.downlink < 1.5) {
    return {
      quality: 70,
      format: 'auto',
      width: 1000,
    };
  }

  if (status.effectiveType === '3g' || status.downlink < 3) {
    return {
      quality: 80,
      format: 'auto',
      width: 1200,
    };
  }

  // 4g or better
  return {
    quality: 90,
    format: 'auto',
    width: 1920,
  };
}

/**
 * Should prefetch resources based on network
 */
export function shouldPrefetch(networkStatus?: NetworkStatus): boolean {
  const status = networkStatus || getNetworkStatus();
  
  if (status.isOffline || status.saveData) {
    return false;
  }

  return status.effectiveType === '4g' && status.downlink >= 3;
}

/**
 * React hook for network status
 */
export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>(() => getNetworkStatus());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateStatus = () => {
      setStatus(getNetworkStatus());
    };

    // Initial status
    updateStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Listen for connection changes
    const connection =
      navigator.connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener('change', updateStatus);
    }

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      if (connection) {
        connection.removeEventListener('change', updateStatus);
      }
    };
  }, []);

  return status;
}
