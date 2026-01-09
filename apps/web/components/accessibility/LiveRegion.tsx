/**
 * Live Region Component
 * Announces dynamic content changes to screen readers
 */

'use client';

import { useEffect, useRef } from 'react';

interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  id?: string;
}

export default function LiveRegion({ 
  message, 
  priority = 'polite',
  id = 'live-region'
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!message || !regionRef.current) return;

    // Clear previous message
    regionRef.current.textContent = '';
    
    // Small delay to ensure screen reader picks up the change
    setTimeout(() => {
      if (regionRef.current) {
        regionRef.current.textContent = message;
      }
    }, 100);
  }, [message]);

  return (
    <div
      ref={regionRef}
      id={id}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    />
  );
}
