/**
 * Performance Monitoring
 * Track and report performance metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  url?: string;
  userAgent?: string;
}

/**
 * Track Core Web Vitals
 */
export function trackWebVitals(metric: {
  name: string;
  value: number;
  id: string;
  delta: number;
  entries: PerformanceEntry[];
}) {
  // Send to analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
  
  // Send to API endpoint
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
      }),
      keepalive: true,
    }).catch(() => {
      // Silently fail
    });
  }
}

/**
 * Track page load performance
 */
export function trackPageLoad() {
  if (typeof window === 'undefined') return;
  
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      const metrics = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ssl: navigation.secureConnectionStart ? navigation.connectEnd - navigation.secureConnectionStart : 0,
        ttfb: navigation.responseStart - navigation.requestStart,
        download: navigation.responseEnd - navigation.responseStart,
        domProcessing: navigation.domComplete - navigation.domInteractive,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        load: navigation.loadEventEnd - navigation.loadEventStart,
        total: navigation.loadEventEnd - navigation.fetchStart,
      };
      
      // Send to analytics
      if ((window as any).gtag) {
        Object.entries(metrics).forEach(([name, value]) => {
          (window as any).gtag('event', 'page_load', {
            event_category: 'Performance',
            event_label: name,
            value: Math.round(value),
            non_interaction: true,
          });
        });
      }
    }
  });
}

/**
 * Track resource load performance
 */
export function trackResourceLoad() {
  if (typeof window === 'undefined') return;
  
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'resource') {
        const resourceEntry = entry as PerformanceResourceTiming;
        
        // Track slow resources (>1s)
        if (resourceEntry.duration > 1000) {
          if ((window as any).gtag) {
            (window as any).gtag('event', 'slow_resource', {
              event_category: 'Performance',
              event_label: resourceEntry.name,
              value: Math.round(resourceEntry.duration),
              non_interaction: true,
            });
          }
        }
      }
    }
  });
  
  try {
    observer.observe({ entryTypes: ['resource'] });
  } catch (e) {
    // PerformanceObserver not supported
  }
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;
  
  trackPageLoad();
  trackResourceLoad();
}
