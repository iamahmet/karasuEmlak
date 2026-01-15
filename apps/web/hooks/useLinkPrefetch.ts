"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook for intelligent link prefetching
 * 
 * Features:
 * - Prefetch on hover (with delay to avoid unnecessary requests)
 * - Prefetch visible links in viewport
 * - Respect user's connection quality
 * - Avoid prefetching on slow connections
 */
export function useLinkPrefetch(href: string, enabled: boolean = true) {
  const router = useRouter();
  const prefetchedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || prefetchedRef.current) return;

    // Check connection quality
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      // Don't prefetch on slow connections (2G, slow 3G)
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return;
      }
    }

    // Prefetch using Next.js router
    const prefetch = () => {
      if (!prefetchedRef.current) {
        router.prefetch(href);
        prefetchedRef.current = true;
      }
    };

    // Prefetch after a short delay (to avoid prefetching on accidental hovers)
    timeoutRef.current = setTimeout(prefetch, 100);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [href, enabled, router]);

  return {
    prefetch: () => {
      if (!prefetchedRef.current) {
        router.prefetch(href);
        prefetchedRef.current = true;
      }
    },
  };
}

/**
 * Hook for hover-based prefetching
 */
export function useHoverPrefetch(href: string, enabled: boolean = true) {
  const router = useRouter();
  const prefetchedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (!enabled || prefetchedRef.current) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Prefetch after 100ms delay (to avoid prefetching on accidental hovers)
    timeoutRef.current = setTimeout(() => {
      if (!prefetchedRef.current) {
        router.prefetch(href);
        prefetchedRef.current = true;
      }
    }, 100);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };
}
