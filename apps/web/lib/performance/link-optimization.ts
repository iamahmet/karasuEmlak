/**
 * Link Performance Optimization Utilities
 * 
 * Utilities for optimizing link performance including:
 * - Intelligent prefetching
 * - Connection-aware prefetching
 * - Viewport-based prefetching
 */

/**
 * Check if user has a fast connection
 */
export function isFastConnection(): boolean {
  if (typeof window === 'undefined') return true;

  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;

  if (!connection) return true; // Assume fast if we can't detect

  // Don't prefetch on slow connections
  const slowTypes = ['slow-2g', '2g'];
  return !slowTypes.includes(connection.effectiveType);
}

/**
 * Check if user has data saver enabled
 */
export function isDataSaverEnabled(): boolean {
  if (typeof window === 'undefined') return false;

  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;

  if (!connection) return false;

  return connection.saveData === true;
}

/**
 * Determine if prefetching should be enabled
 */
export function shouldPrefetch(): boolean {
  return isFastConnection() && !isDataSaverEnabled();
}

/**
 * Get prefetch priority based on link importance
 */
export function getPrefetchPriority(
  linkType: 'navigation' | 'content' | 'footer' | 'sidebar' | 'related'
): 'high' | 'medium' | 'low' {
  switch (linkType) {
    case 'navigation':
      return 'high';
    case 'content':
      return 'high';
    case 'related':
      return 'medium';
    case 'sidebar':
      return 'low';
    case 'footer':
      return 'low';
    default:
      return 'medium';
  }
}

/**
 * Prefetch link with connection awareness
 */
export function prefetchLink(href: string, priority: 'high' | 'medium' | 'low' = 'medium'): void {
  if (typeof window === 'undefined') return;
  if (!shouldPrefetch()) return;

  // Only prefetch high priority links on slower connections
  if (!isFastConnection() && priority !== 'high') {
    return;
  }

  // Use Next.js router prefetch if available
  if (typeof window !== 'undefined' && (window as any).__NEXT_DATA__) {
    // Next.js will handle prefetching automatically via Link component
    return;
  }

  // Fallback: manual prefetch
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  link.as = 'document';
  document.head.appendChild(link);
}

/**
 * Prefetch multiple links with priority
 */
export function prefetchLinks(links: Array<{ href: string; priority: 'high' | 'medium' | 'low' }>): void {
  if (!shouldPrefetch()) return;

  // Sort by priority
  const sorted = links.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  // Prefetch high priority links immediately
  sorted
    .filter(link => link.priority === 'high')
    .forEach(link => prefetchLink(link.href, link.priority));

  // Prefetch medium/low priority links with delay
  if (typeof window !== 'undefined' && window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      sorted
        .filter(link => link.priority !== 'high')
        .forEach(link => prefetchLink(link.href, link.priority));
    });
  } else {
    setTimeout(() => {
      sorted
        .filter(link => link.priority !== 'high')
        .forEach(link => prefetchLink(link.href, link.priority));
    }, 2000);
  }
}
