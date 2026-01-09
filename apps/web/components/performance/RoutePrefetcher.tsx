'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initRoutePrefetching } from '@/lib/performance/route-prefetch';
import { routing } from '@/i18n/routing';

export function RoutePrefetcher() {
  const pathname = usePathname();
  
  useEffect(() => {
    // Get base path from current pathname
    const locale = pathname.split('/')[1];
    const basePath = locale && (routing.locales as readonly string[]).includes(locale)
      ? `/${locale}`
      : '';
    
    // Initialize route prefetching
    initRoutePrefetching(basePath);
  }, [pathname]);

  return null;
}
