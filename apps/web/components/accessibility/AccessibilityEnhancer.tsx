'use client';

import { useEffect } from 'react';
import { initAccessibilityEnhancements } from '@/lib/accessibility/enhanced-a11y';

/**
 * Accessibility Enhancer Component
 * Initializes accessibility enhancements on mount
 */
export function AccessibilityEnhancer() {
  useEffect(() => {
    initAccessibilityEnhancements();
  }, []);

  return null;
}
