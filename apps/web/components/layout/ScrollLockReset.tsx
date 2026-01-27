'use client';

import { useEffect, useRef } from 'react';

/**
 * ScrollLockReset - Optimized scroll unlock
 * Only unlocks when scroll is actually blocked
 * Uses debounced MutationObserver to avoid infinite loops
 */
export function ScrollLockReset() {
  const lastCheckRef = useRef(0);
  const observerRef = useRef<MutationObserver | null>(null);
  
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    
    const forceEnableScroll = () => {
      // SET inline styles with !important (not remove - CSS might override)
      html.style.setProperty('overflow-x', 'hidden', 'important');
      html.style.setProperty('overflow-y', 'auto', 'important');
      html.style.setProperty('height', '100%', 'important');
      html.style.setProperty('position', 'relative', 'important');
      
      body.style.setProperty('overflow-x', 'hidden', 'important');
      body.style.setProperty('overflow-y', 'auto', 'important');
      body.style.setProperty('height', '100%', 'important');
      body.style.setProperty('position', 'relative', 'important');
      
      // Remove scroll lock classes
      html.classList.remove('overflow-hidden', 'no-scroll', 'scroll-locked');
      body.classList.remove('overflow-hidden', 'no-scroll', 'scroll-locked');
      
      // Remove data attributes
      html.removeAttribute('data-scroll-locked');
      body.removeAttribute('data-scroll-locked');
      
      // Remove Radix UI scroll locks
      const radixScrollLocks = document.querySelectorAll('[data-radix-scroll-lock]');
      radixScrollLocks.forEach(el => el.remove());
    };
    
    // Check if scroll is actually blocked
    const isScrollBlocked = (): boolean => {
      const htmlStyle = window.getComputedStyle(html);
      const bodyStyle = window.getComputedStyle(body);
      
      return (
        htmlStyle.overflow === 'hidden' || 
        htmlStyle.overflowY === 'hidden' ||
        bodyStyle.overflow === 'hidden' || 
        bodyStyle.overflowY === 'hidden' ||
        html.hasAttribute('data-scroll-locked') ||
        body.hasAttribute('data-scroll-locked') ||
        document.querySelectorAll('[data-radix-scroll-lock]').length > 0
      );
    };
    
    // Debounced check - only unlock if actually blocked
    const checkAndUnlock = () => {
      const now = Date.now();
      // Throttle to max once per 100ms
      if (now - lastCheckRef.current < 100) return;
      lastCheckRef.current = now;
      
      if (isScrollBlocked()) {
        forceEnableScroll();
      }
    };
    
    // Wheel event handler - only intervene if scroll is blocked
    // REMOVED: This was preventing native scroll from working properly
    // Native scroll should work when not blocked - no need to intercept
    const handleWheel = (e: WheelEvent) => {
      // Only check if scroll is blocked - don't intercept if it's working
      if (isScrollBlocked()) {
        // Unlock first
        forceEnableScroll();
        // Let native scroll handle it after unlock - don't preventDefault
      }
      // Otherwise let native scroll work (faster!)
    };
    
    // Add wheel listener with passive: true to not block native scroll
    // Only use capture to detect early, but don't prevent default
    document.addEventListener('wheel', handleWheel, { passive: true, capture: false });
    
    // Run immediately
    forceEnableScroll();
    
    // Run on intervals to catch late-loading components (less aggressive)
    const intervals = [100, 500, 1000, 2000];
    const timeouts = intervals.map(ms => setTimeout(checkAndUnlock, ms));
    
    // Watch for scroll locks being re-applied (debounced)
    const observer = new MutationObserver(() => {
      checkAndUnlock();
    });
    
    observer.observe(html, { 
      attributes: true, 
      attributeFilter: ['style', 'class', 'data-scroll-locked']
    });
    observer.observe(body, { 
      attributes: true, 
      attributeFilter: ['style', 'class', 'data-scroll-locked']
    });
    
    observerRef.current = observer;
    
    // Watch for Radix UI scroll locks (debounced)
    const documentObserver = new MutationObserver(() => {
      checkAndUnlock();
    });
    
    documentObserver.observe(document, { 
      childList: true, 
      subtree: true 
    });
    
    return () => {
      timeouts.forEach(clearTimeout);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      documentObserver.disconnect();
      document.removeEventListener('wheel', handleWheel, { passive: true, capture: false } as any);
    };
  }, []);
  
  return null;
}
