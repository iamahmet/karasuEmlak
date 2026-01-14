/**
 * Code Splitting Utilities
 * Dynamic imports and lazy loading helpers
 */

import dynamic from "next/dynamic";
import { ComponentType } from "react";
import React from "react";

/**
 * Create a dynamically imported component with loading state
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    loading?: ComponentType;
    ssr?: boolean;
  }
) {
  const LoadingComponent = options?.loading;
  return dynamic(importFn, {
    loading: LoadingComponent ? () => React.createElement(LoadingComponent) : undefined,
    ssr: options?.ssr ?? true,
  });
}

/**
 * Lazy load heavy components
 */
export const LazyComponents = {
  // Dashboard components
  RealTimeStats: dynamic(() => import("@/components/dashboard/RealTimeStats").then((mod) => ({ default: mod.RealTimeStats }))),
  ActivityFeed: dynamic(() => import("@/components/activity-feed/ActivityFeed").then((mod) => ({ default: mod.ActivityFeed }))),
  
  // SEO components
  SEOBoosterDashboard: dynamic(() => import("@/components/seo/SEOBoosterDashboard").then((mod) => ({ default: mod.SEOBoosterDashboard }))),
  
  // Media components
  MediaLibrary: dynamic(() => import("@/components/media/MediaLibrary").then((mod) => ({ default: mod.MediaLibrary }))),
  
  // Chart components
  AnalyticsCharts: dynamic(() => import("@/components/analytics/AnalyticsCharts").then((mod) => ({ default: mod.AnalyticsCharts }))),
};
