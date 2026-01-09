'use client';

import { useEffect, useState } from 'react';

/**
 * Screen Reader Announcer
 * Announces dynamic content changes to screen readers
 */
export default function Announcer() {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (announcement) {
      const timer = setTimeout(() => {
        setAnnouncement('');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  // Expose setAnnouncement globally for use in other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).announceToScreenReader = (message: string) => {
        setAnnouncement(message);
      };
    }
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    >
      {announcement}
    </div>
  );
}

/**
 * Hook to announce messages to screen readers
 */
export function useAnnouncer() {
  const announce = (message: string) => {
    if (typeof window !== 'undefined' && (window as any).announceToScreenReader) {
      (window as any).announceToScreenReader(message);
    }
  };

  return { announce };
}
