/**
 * Lazy Import Utilities
 * Centralized lazy loading for heavy components
 */

import dynamic from 'next/dynamic';
import type { ReactElement, ComponentType } from 'react';

/**
 * Lazy load components with loading fallback
 */
export function createLazyComponent<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: {
    loading?: () => ReactElement | null;
    ssr?: boolean;
  } = {}
): ComponentType<P> {
  return dynamic(importFn, {
    loading: options.loading || (() => null),
    ssr: options.ssr !== false,
  }) as ComponentType<P>;
}

/**
 * Common loading fallbacks
 */
export const LoadingSpinner = (): ReactElement => (
  <div className="flex items-center justify-center p-8">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
  </div>
);

export const LoadingSkeleton = (): ReactElement => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
  </div>
);
