'use client';

import { useEffect, useRef } from 'react';
import { trackArticleView, trackScrollDepth, BlogEvent } from '@/lib/analytics/blog-events';

interface ArticleAnalyticsProps {
  event: BlogEvent;
}

export function ArticleAnalytics({ event }: ArticleAnalyticsProps) {
  const scrollDepthsTracked = useRef<Set<number>>(new Set());

  useEffect(() => {
    // Track initial view
    trackArticleView(event);

    // Track scroll depth
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollableHeight = documentHeight - windowHeight;
      const scrolled = scrollTop / scrollableHeight;
      const depth = Math.round(scrolled * 100);

      // Track milestones: 25%, 50%, 75%, 100%
      [25, 50, 75, 100].forEach((milestone) => {
        if (depth >= milestone && !scrollDepthsTracked.current.has(milestone)) {
          scrollDepthsTracked.current.add(milestone);
          trackScrollDepth(event, milestone as 25 | 50 | 75 | 100);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [event]);

  return null;
}
