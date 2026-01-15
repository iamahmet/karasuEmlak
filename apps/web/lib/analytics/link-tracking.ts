/**
 * Link Click Tracking
 * Tracks all important link clicks for analytics and user behavior analysis
 */

/**
 * Track link click with consent check
 */
export function trackLinkClick(
  href: string,
  linkText: string,
  linkType: 'internal' | 'external' | 'download' | 'phone' | 'email',
  category?: string,
  position?: number
): void {
  if (typeof window === 'undefined') return;

  // Check cookie consent
  const cookieConsent = localStorage.getItem('cookie-consent');
  if (!cookieConsent) return;

  try {
    const consent = JSON.parse(cookieConsent);
    if (!consent.analytics) return;
  } catch {
    return;
  }

  // Track with Google Analytics
  if (window.gtag) {
    window.gtag('event', 'link_click', {
      event_category: category || 'Navigation',
      event_label: linkText,
      link_url: href,
      link_type: linkType,
      position: position,
      non_interaction: false,
    });
  }

  // Track with custom analytics endpoint
  fetch('/api/analytics/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName: 'link_click',
      href,
      linkText,
      linkType,
      category: category || 'Navigation',
      position,
      timestamp: new Date().toISOString(),
    }),
    keepalive: true,
  }).catch(() => {
    // Silently fail
  });
}

/**
 * Track internal navigation (same domain)
 */
export function trackInternalLink(
  href: string,
  linkText: string,
  category?: string,
  position?: number
): void {
  trackLinkClick(href, linkText, 'internal', category, position);
}

/**
 * Track external link click
 */
export function trackExternalLink(
  href: string,
  linkText: string,
  category?: string
): void {
  trackLinkClick(href, linkText, 'external', category);
}

/**
 * Track phone number click
 */
export function trackPhoneClick(phoneNumber: string, source?: string): void {
  trackLinkClick(`tel:${phoneNumber}`, phoneNumber, 'phone', 'Contact', undefined);
  
  if (window.gtag) {
    window.gtag('event', 'phone_click', {
      event_category: 'Contact',
      event_label: phoneNumber,
      source: source,
    });
  }
}

/**
 * Track email click
 */
export function trackEmailClick(email: string, source?: string): void {
  trackLinkClick(`mailto:${email}`, email, 'email', 'Contact', undefined);
  
  if (window.gtag) {
    window.gtag('event', 'email_click', {
      event_category: 'Contact',
      event_label: email,
      source: source,
    });
  }
}

/**
 * Track download link
 */
export function trackDownloadClick(
  href: string,
  fileName: string,
  fileType?: string
): void {
  trackLinkClick(href, fileName, 'download', 'Downloads', undefined);
  
  if (window.gtag) {
    window.gtag('event', 'file_download', {
      event_category: 'Downloads',
      event_label: fileName,
      file_type: fileType,
      file_url: href,
    });
  }
}

/**
 * Track CTA button click
 */
export function trackCTAClick(
  ctaText: string,
  ctaType: 'primary' | 'secondary' | 'outline',
  destination?: string,
  position?: 'header' | 'hero' | 'sidebar' | 'footer' | 'inline'
): void {
  if (typeof window === 'undefined') return;

  const cookieConsent = localStorage.getItem('cookie-consent');
  if (!cookieConsent) return;

  try {
    const consent = JSON.parse(cookieConsent);
    if (!consent.analytics) return;
  } catch {
    return;
  }

  if (window.gtag) {
    window.gtag('event', 'cta_click', {
      event_category: 'Conversion',
      event_label: ctaText,
      cta_type: ctaType,
      destination: destination,
      position: position,
    });
  }

  fetch('/api/analytics/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName: 'cta_click',
      ctaText,
      ctaType,
      destination,
      position,
      timestamp: new Date().toISOString(),
    }),
    keepalive: true,
  }).catch(() => {});
}

// Type declarations
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
