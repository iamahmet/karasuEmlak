/**
 * Route Prefetching Strategy
 * Intelligently prefetch routes based on user behavior and page importance
 */

/**
 * Prefetch important routes on page load
 */
export function prefetchImportantRoutes(basePath: string = '') {
  if (typeof window === 'undefined') return;

  const importantRoutes = [
    `${basePath}/satilik`,
    `${basePath}/kiralik`,
    `${basePath}/blog`,
    `${basePath}/karasu`,
  ];

  // Prefetch after page load
  if (typeof window.requestIdleCallback !== 'undefined') {
    window.requestIdleCallback(() => {
      importantRoutes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      importantRoutes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    }, 2000);
  }
}

/**
 * Prefetch route on hover (for better UX)
 */
export function prefetchOnHover(element: HTMLElement, href: string) {
  if (typeof window === 'undefined') return;

  let prefetched = false;
  
  const prefetch = () => {
    if (prefetched) return;
    prefetched = true;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  };

  // Prefetch on hover with small delay
  element.addEventListener('mouseenter', () => {
    setTimeout(prefetch, 100);
  }, { once: true });
}

/**
 * Prefetch routes based on viewport visibility
 */
export function prefetchVisibleLinks() {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;

  // Track prefetched URLs to avoid duplicates
  const prefetchedUrls = new Set<string>();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLAnchorElement;
          const href = link.getAttribute('href');
          
          if (href && !prefetchedUrls.has(href)) {
            prefetchedUrls.add(href);
            
            // Prefetch without modifying DOM attributes to avoid hydration mismatch
            const prefetchLink = document.createElement('link');
            prefetchLink.rel = 'prefetch';
            prefetchLink.href = href;
            document.head.appendChild(prefetchLink);
          }
        }
      });
    },
    {
      rootMargin: '200px', // Start prefetching 200px before link enters viewport
    }
  );

  // Observe all internal links
  document.querySelectorAll('a[href^="/"]').forEach(link => {
    observer.observe(link);
  });
}

/**
 * Initialize route prefetching
 */
export function initRoutePrefetching(basePath: string = '') {
  if (typeof window === 'undefined') return;

  // Prefetch important routes
  prefetchImportantRoutes(basePath);

  // Prefetch visible links
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      prefetchVisibleLinks();
    });
  } else {
    prefetchVisibleLinks();
  }
}
