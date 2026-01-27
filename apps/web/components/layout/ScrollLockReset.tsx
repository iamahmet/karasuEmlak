'use client';

import { useEffect } from 'react';

/**
 * ScrollLockReset - Nuclear option: Forces scroll to work
 * Sets inline styles with !important to override everything
 * Also handles wheel events for guaranteed scrolling
 */
export function ScrollLockReset() {
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
    
    // CRITICAL: Always handle wheel events manually for guaranteed scrolling
    // Native scroll might be blocked, so we always do it ourselves
    const handleWheel = (e: WheelEvent) => {
      // Only handle vertical scroll
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      
      const html = document.documentElement;
      const canScroll = html.scrollHeight > window.innerHeight;
      
      if (!canScroll) return;
      
      // Always force unlock first
      forceEnableScroll();
      
      // Always manually scroll - don't trust native scroll
      const currentScroll = window.pageYOffset || html.scrollTop || 0;
      const scrollAmount = e.deltaY; // 1:1 ratio for natural feel
      const maxScroll = html.scrollHeight - window.innerHeight;
      const newScroll = Math.max(0, Math.min(maxScroll, currentScroll + scrollAmount));
      
      // Apply scroll immediately
      window.scrollTo(0, newScroll);
      html.scrollTop = newScroll;
      document.body.scrollTop = newScroll; // Fallback
      
      // Prevent default to stop any other handlers
      e.preventDefault();
      e.stopPropagation();
    };
    
    // Add wheel listener with capture to intercept early
    document.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    
    // Run immediately
    forceEnableScroll();
    
    // Run on intervals to catch late-loading components
    const intervals = [10, 50, 100, 200, 500, 1000, 2000, 3000];
    const timeouts = intervals.map(ms => setTimeout(forceEnableScroll, ms));
    
    // Watch for scroll locks being re-applied
    const observer = new MutationObserver(() => {
      const htmlStyle = window.getComputedStyle(html);
      const bodyStyle = window.getComputedStyle(body);
      
      // If scroll is blocked, unlock it
      if (htmlStyle.overflow === 'hidden' || htmlStyle.overflowY === 'hidden' ||
          bodyStyle.overflow === 'hidden' || bodyStyle.overflowY === 'hidden') {
        forceEnableScroll();
      }
    });
    
    observer.observe(html, { 
      attributes: true, 
      attributeFilter: ['style', 'class', 'data-scroll-locked']
    });
    observer.observe(body, { 
      attributes: true, 
      attributeFilter: ['style', 'class', 'data-scroll-locked']
    });
    
    // Watch for Radix UI scroll locks
    const documentObserver = new MutationObserver(() => {
      const radixLocks = document.querySelectorAll('[data-radix-scroll-lock]');
      if (radixLocks.length > 0) {
        forceEnableScroll();
      }
    });
    
    documentObserver.observe(document, { 
      childList: true, 
      subtree: true 
    });
    
    return () => {
      timeouts.forEach(clearTimeout);
      observer.disconnect();
      documentObserver.disconnect();
      document.removeEventListener('wheel', handleWheel, { capture: true } as any);
    };
  }, []);
  
  return null;
}
