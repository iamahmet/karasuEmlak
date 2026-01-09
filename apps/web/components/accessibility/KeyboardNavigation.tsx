"use client";

import { useEffect, useRef } from 'react';
import { isFocusable, trapFocus } from '@/lib/accessibility/a11y';

interface KeyboardNavigationProps {
  children: React.ReactNode;
  trapFocus?: boolean;
  onEscape?: () => void;
}

/**
 * Keyboard Navigation Wrapper
 * Enhances keyboard navigation for components
 */
export function KeyboardNavigation({
  children,
  trapFocus: shouldTrapFocus = false,
  onEscape,
}: KeyboardNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let cleanup: (() => void) | undefined;

    if (shouldTrapFocus) {
      cleanup = trapFocus(containerRef.current);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape();
      }
    };

    containerRef.current.addEventListener('keydown', handleKeyDown);

    return () => {
      cleanup?.();
      containerRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [shouldTrapFocus, onEscape]);

  return (
    <div ref={containerRef} tabIndex={-1}>
      {children}
    </div>
  );
}
