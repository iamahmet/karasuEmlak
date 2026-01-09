'use client';

import { useEffect } from 'react';
import { initEnhancedPerformanceMonitoring } from '@/lib/performance/enhanced-monitoring';

/**
 * Enhanced Performance Monitor Component
 * Initializes advanced performance tracking
 */
export function EnhancedPerformanceMonitor() {
  useEffect(() => {
    initEnhancedPerformanceMonitoring();
  }, []);

  return null;
}
