'use client';

import { useEffect } from 'react';
import { initBackgroundSync } from '@/lib/pwa/background-sync';

/**
 * Background Sync Initialization Component
 * Initializes background sync listeners on mount
 */
export function BackgroundSyncInit() {
  useEffect(() => {
    initBackgroundSync();
  }, []);

  return null; // This component doesn't render anything
}
