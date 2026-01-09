/**
 * Enhanced Performance Monitoring
 * 
 * Advanced performance tracking with detailed metrics and analytics
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  url: string;
  userAgent?: string;
  connectionType?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
}

export interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: 'script' | 'stylesheet' | 'image' | 'font' | 'other';
}

/**
 * Track Core Web Vitals with enhanced details
 */
export function trackEnhancedWebVitals(metric: {
  name: string;
  value: number;
  id: string;
  delta: number;
  entries: PerformanceEntry[];
  rating?: 'good' | 'needs-improvement' | 'poor';
  navigationType?: string;
}): void {
  const deviceType = getDeviceType();
  const connectionType = getConnectionType();

  const enhancedMetric: PerformanceMetric = {
    name: metric.name,
    value: metric.value,
    unit: metric.name === 'CLS' ? '' : 'ms',
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    connectionType,
    deviceType,
  };

  // Send to analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      custom_map: {
        rating: metric.rating || 'unknown',
        device_type: deviceType,
        connection_type: connectionType,
        navigation_type: metric.navigationType || 'unknown',
      },
      non_interaction: true,
    });
  }

  // Send to custom endpoint
  if (typeof window !== 'undefined') {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enhancedMetric),
      keepalive: true,
    }).catch(() => {
      // Silently fail
    });
  }
}

/**
 * Track resource load performance
 */
export function trackResourcePerformance(): ResourceTiming[] {
  if (typeof window === 'undefined' || !window.performance) {
    return [];
  }

  const resources: ResourceTiming[] = [];
  const entries = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  for (const entry of entries) {
    const name = entry.name;
    const duration = entry.duration;
    const size = (entry as any).transferSize || 0;
    
    // Determine resource type
    let type: ResourceTiming['type'] = 'other';
    if (name.includes('.js') || name.includes('chunk')) {
      type = 'script';
    } else if (name.includes('.css')) {
      type = 'stylesheet';
    } else if (name.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i)) {
      type = 'image';
    } else if (name.match(/\.(woff|woff2|ttf|otf|eot)$/i)) {
      type = 'font';
    }

    resources.push({ name, duration, size, type });
  }

  return resources;
}

/**
 * Track largest contentful paint (LCP)
 */
export function trackLCP(): void {
  if (typeof window === 'undefined' || !window.PerformanceObserver) {
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;

      trackEnhancedWebVitals({
        name: 'LCP',
        value: lastEntry.renderTime || lastEntry.loadTime,
        id: lastEntry.id || 'lcp',
        delta: lastEntry.renderTime || lastEntry.loadTime,
        entries: [lastEntry],
        rating: getLCPRating(lastEntry.renderTime || lastEntry.loadTime),
      });
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (error) {
    // Silently fail if LCP tracking is not supported
  }
}

/**
 * Track first input delay (FID) / Interaction to Next Paint (INP)
 */
export function trackInteraction(): void {
  if (typeof window === 'undefined' || !window.PerformanceObserver) {
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const eventEntry = entry as any;
        const delay = eventEntry.processingStart - eventEntry.startTime;

        trackEnhancedWebVitals({
          name: 'INP',
          value: delay,
          id: eventEntry.name || 'interaction',
          delta: delay,
          entries: [eventEntry],
          rating: getINPRating(delay),
        });
      }
    });

    observer.observe({ entryTypes: ['event'] });
  } catch (error) {
    // Silently fail if interaction tracking is not supported
  }
}

/**
 * Track cumulative layout shift (CLS)
 */
export function trackCLS(): void {
  if (typeof window === 'undefined' || !window.PerformanceObserver) {
    return;
  }

  try {
    let clsValue = 0;
    let clsEntries: any[] = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as any;
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value;
          clsEntries.push(layoutShift);
        }
      }
    });

    observer.observe({ entryTypes: ['layout-shift'] });

    // Report CLS when page is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        trackEnhancedWebVitals({
          name: 'CLS',
          value: clsValue,
          id: 'cls',
          delta: clsValue,
          entries: clsEntries,
          rating: getCLSRating(clsValue),
        });
      }
    });
  } catch (error) {
    // Silently fail if CLS tracking is not supported
  }
}

/**
 * Get device type
 */
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Get connection type
 */
function getConnectionType(): string {
  if (typeof navigator === 'undefined' || !(navigator as any).connection) {
    return 'unknown';
  }
  
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  return connection?.effectiveType || 'unknown';
}

/**
 * Get LCP rating
 */
function getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= 2500) return 'good';
  if (value <= 4000) return 'needs-improvement';
  return 'poor';
}

/**
 * Get INP rating
 */
function getINPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= 200) return 'good';
  if (value <= 500) return 'needs-improvement';
  return 'poor';
}

/**
 * Get CLS rating
 */
function getCLSRating(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= 0.1) return 'good';
  if (value <= 0.25) return 'needs-improvement';
  return 'poor';
}

/**
 * Track page load performance
 */
export function trackPageLoadPerformance(): void {
  if (typeof window === 'undefined' || !window.performance) {
    return;
  }

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
          (window as any).gtag('event', 'page_load_metric', {
            event_category: 'Performance',
            event_label: name,
            value: Math.round(value),
            non_interaction: true,
          });
        });
      }

      // Track resources
      const resources = trackResourcePerformance();
      if (resources.length > 0) {
        const slowResources = resources
          .filter(r => r.duration > 1000)
          .sort((a, b) => b.duration - a.duration)
          .slice(0, 5);

        if (slowResources.length > 0 && (window as any).gtag) {
          (window as any).gtag('event', 'slow_resources', {
            event_category: 'Performance',
            event_label: 'Slow Resources',
            value: slowResources.length,
            non_interaction: true,
          });
        }
      }
    }
  });
}

/**
 * Initialize enhanced performance monitoring
 */
export function initEnhancedPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  // Track Core Web Vitals
  trackLCP();
  trackInteraction();
  trackCLS();
  
  // Track page load
  trackPageLoadPerformance();
}
