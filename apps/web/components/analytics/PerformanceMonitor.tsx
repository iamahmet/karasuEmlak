"use client";

import { useEffect } from 'react';
import { initPerformanceMonitoring } from '@/lib/performance/monitoring';

/**
 * Performance Monitor Component
 * Initializes performance tracking
 */
export function PerformanceMonitor() {
  useEffect(() => {
    initPerformanceMonitoring();
  }, []);

  return null;
}
