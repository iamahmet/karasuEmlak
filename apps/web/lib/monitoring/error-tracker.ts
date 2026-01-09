/**
 * Error Tracking and Monitoring
 * Centralized error tracking for production
 */

interface ErrorContext {
  userId?: string;
  url?: string;
  userAgent?: string;
  timestamp?: string;
  [key: string]: any;
}

/**
 * Track error to monitoring service
 */
export function trackError(
  error: Error,
  context?: ErrorContext
): void {
  const errorData = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString(),
    ...context,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 Error tracked:', errorData);
    return;
  }

  // In production, send to Sentry
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.captureException(error, {
        contexts: {
          custom: context,
        },
        tags: {
          errorType: error.name,
        },
      });
    }).catch(() => {
      // Fallback to console if Sentry fails
      console.error('Production error:', errorData);
    });
  } else {
    // Development: log to console
    console.error('🔴 Error tracked:', errorData);
  }
}

/**
 * Track performance metrics
 */
export function trackPerformance(
  metricName: string,
  value: number,
  unit: string = 'ms',
  context?: Record<string, any>
): void {
  const metricData = {
    name: metricName,
    value,
    unit,
    timestamp: new Date().toISOString(),
    ...context,
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Performance metric:', metricData);
    return;
  }

  // Send to Google Analytics if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'performance_metric', {
      event_category: 'Performance',
      event_label: metricName,
      value: Math.round(value),
      non_interaction: true,
    });
  }
  
  // Send to custom analytics endpoint
  if (typeof window !== 'undefined') {
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metricName, value, unit, ...context }),
      keepalive: true,
    }).catch(() => {
      // Silently fail
    });
  }
}

/**
 * Track user action/event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
): void {
  const eventData = {
    name: eventName,
    timestamp: new Date().toISOString(),
    ...properties,
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('📝 Event tracked:', eventData);
    return;
  }

  // Send to Google Analytics if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, {
      ...properties,
      non_interaction: false,
    });
  }
  
  // Send to custom analytics endpoint
  if (typeof window !== 'undefined') {
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventName, ...properties }),
      keepalive: true,
    }).catch(() => {
      // Silently fail
    });
  }
}

/**
 * Track API call performance
 */
export function trackAPICall(
  endpoint: string,
  method: string,
  duration: number,
  statusCode: number,
  error?: Error
): void {
  const apiData = {
    endpoint,
    method,
    duration,
    statusCode,
    success: statusCode >= 200 && statusCode < 300,
    error: error?.message,
    timestamp: new Date().toISOString(),
  };

  if (error) {
    trackError(error, { endpoint, method, statusCode });
  }

  trackPerformance(`api.${method.toLowerCase()}.${endpoint}`, duration, 'ms', {
    statusCode,
  });
}

