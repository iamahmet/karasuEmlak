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
      html.style.setProperty('overflow', 'visible', 'important');
      html.style.setProperty('overflow-x', 'hidden', 'important');
      html.style.setProperty('overflow-y', 'scroll', 'important');
      html.style.setProperty('height', 'auto', 'important');
      html.style.setProperty('max-height', 'none', 'important');
      html.style.setProperty('position', 'static', 'important');
      
      body.style.setProperty('overflow', 'visible', 'important');
      body.style.setProperty('overflow-x', 'hidden', 'important');
      body.style.setProperty('overflow-y', 'visible', 'important');
      body.style.setProperty('height', 'auto', 'important');
      body.style.setProperty('max-height', 'none', 'important');
      body.style.setProperty('position', 'static', 'important');
      
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
    const handleWheel = (e: WheelEvent) => {
      // Only handle vertical scroll
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      
      const html = document.documentElement;
      const canScroll = html.scrollHeight > window.innerHeight;
      
      if (!canScroll) return;
      
      // Check if scroll is blocked
      if (isScrollBlocked()) {
        // Unlock first
        forceEnableScroll();
        
        // Then manually scroll as fallback
        const currentScroll = window.pageYOffset || html.scrollTop || 0;
        const scrollAmount = e.deltaY;
        const maxScroll = html.scrollHeight - window.innerHeight;
        const newScroll = Math.max(0, Math.min(maxScroll, currentScroll + scrollAmount));
        
        window.scrollTo(0, newScroll);
        html.scrollTop = newScroll;
        
        // Prevent default only if we had to intervene
        e.preventDefault();
        e.stopPropagation();
      }
      // Otherwise let native scroll work (faster!)
    };
    
    // Add wheel listener with capture to intercept early
    document.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    
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
      document.removeEventListener('wheel', handleWheel, { capture: true } as any);
    };
  }, []);
  
  return null;
}
