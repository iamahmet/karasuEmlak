"use client";

import { useEffect } from 'react';
import { initCriticalResources } from '@/lib/performance/critical-resources';

/**
 * Critical Resources Loader Component
 * Initializes resource hints and preloads critical resources
 */
export function CriticalResourcesLoader() {
  useEffect(() => {
    initCriticalResources();
  }, []);

  return null;
}
