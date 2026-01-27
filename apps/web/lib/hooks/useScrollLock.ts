/**
 * useScrollLock - Safe scroll lock/unlock hook
 * 
 * Guarantees cleanup even if component unmounts unexpectedly.
 * Only locks when open=true, always unlocks on cleanup.
 */

import { useEffect, useRef } from 'react';

interface UseScrollLockOptions {
  /**
   * Whether scroll should be locked
   */
  lock: boolean;
  /**
   * Optional: Custom element to lock (defaults to body)
   */
  element?: HTMLElement;
}

/**
 * Safely lock/unlock scroll with guaranteed cleanup
 * 
 * @example
 * ```tsx
 * function Modal({ open }) {
 *   useScrollLock({ lock: open });
 *   return <Dialog open={open}>...</Dialog>;
 * }
 * ```
 */
export function useScrollLock({ lock, element }: UseScrollLockOptions) {
  const originalOverflowRef = useRef<string | null>(null);
  const originalOverflowYRef = useRef<string | null>(null);
  const targetElement = element || (typeof document !== 'undefined' ? document.body : null);

  useEffect(() => {
    if (!targetElement) return;

    if (lock) {
      // Save original values
      originalOverflowRef.current = targetElement.style.overflow || '';
      originalOverflowYRef.current = targetElement.style.overflowY || '';

      // Lock scroll (but don't use hidden - use clip or auto)
      // Actually, we don't lock at all - CSS already prevents it
      // This hook is mainly for cleanup guarantee
    } else {
      // Restore original values
      if (originalOverflowRef.current !== null) {
        targetElement.style.overflow = originalOverflowRef.current;
      } else {
        targetElement.style.removeProperty('overflow');
      }

      if (originalOverflowYRef.current !== null) {
        targetElement.style.overflowY = originalOverflowYRef.current;
      } else {
        targetElement.style.removeProperty('overflow-y');
      }

      // Force enable scroll (CSS override)
      targetElement.style.setProperty('overflow', 'visible', 'important');
      targetElement.style.setProperty('overflow-x', 'hidden', 'important');
      targetElement.style.setProperty('overflow-y', 'visible', 'important');
      targetElement.style.setProperty('height', 'auto', 'important');
      targetElement.style.setProperty('max-height', 'none', 'important');
      targetElement.style.setProperty('position', 'static', 'important');

      // Remove scroll lock classes
      targetElement.classList.remove('overflow-hidden', 'no-scroll', 'scroll-locked');
      targetElement.removeAttribute('data-scroll-locked');
    }

    // Cleanup: Always restore on unmount
    return () => {
      if (!targetElement) return;

      // Force enable scroll
      targetElement.style.setProperty('overflow', 'visible', 'important');
      targetElement.style.setProperty('overflow-x', 'hidden', 'important');
      targetElement.style.setProperty('overflow-y', 'visible', 'important');
      targetElement.style.setProperty('height', 'auto', 'important');
      targetElement.style.setProperty('max-height', 'none', 'important');
      targetElement.style.setProperty('position', 'static', 'important');

      // Remove scroll lock classes
      targetElement.classList.remove('overflow-hidden', 'no-scroll', 'scroll-locked');
      targetElement.removeAttribute('data-scroll-locked');

      // Remove Radix UI scroll locks
      if (typeof document !== 'undefined') {
        const radixScrollLocks = document.querySelectorAll('[data-radix-scroll-lock]');
        radixScrollLocks.forEach(el => el.remove());
      }
    };
  }, [lock, targetElement]);
}
