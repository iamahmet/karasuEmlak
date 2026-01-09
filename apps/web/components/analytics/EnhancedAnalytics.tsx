"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackScrollDepth } from "@/lib/analytics/events";

/**
 * Enhanced Analytics Component
 * Tracks page views, scroll depth, and user interactions
 */
export function EnhancedAnalytics() {
  const pathname = usePathname();

  // Track page view on route change
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: pathname,
        page_title: document.title,
      });
    }
  }, [pathname]);

  // Track scroll depth
  useEffect(() => {
    const cleanup = trackScrollDepth();
    return cleanup;
  }, [pathname]);

  return null;
}

