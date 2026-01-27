/**
 * Analytics events for listings page
 */

import { safeJsonParse } from '@/lib/utils/safeJsonParse';

/**
 * Track listing view (when user views a listing card)
 */
export function trackListingView(listingId: string, listingTitle: string, viewMode: 'grid' | 'list' | 'map') {
  if (typeof window === 'undefined' || !window.gtag) return;

  const cookieConsent = localStorage.getItem('cookie-consent');
  if (!cookieConsent) return;

  const consent = safeJsonParse(cookieConsent, { analytics: false, marketing: false, necessary: true }, {
    context: 'cookie-consent',
    dedupeKey: 'cookie-consent',
  });
  if (!consent.analytics) return;

  window.gtag('event', 'view_item', {
    event_category: 'Listings',
    event_label: listingTitle,
    item_id: listingId,
    view_mode: viewMode,
  });
}

/**
 * Track quick view modal open
 */
export function trackQuickView(listingId: string, listingTitle: string) {
  if (typeof window === 'undefined' || !window.gtag) return;

  const cookieConsent = localStorage.getItem('cookie-consent');
  if (!cookieConsent) return;

  const consent = safeJsonParse(cookieConsent, { analytics: false, marketing: false, necessary: true }, {
    context: 'cookie-consent',
    dedupeKey: 'cookie-consent',
  });
  if (!consent.analytics) return;

  window.gtag('event', 'view_item', {
    event_category: 'Listings',
    event_label: 'Quick View',
    item_id: listingId,
    item_name: listingTitle,
  });
}

/**
 * Track filter usage
 */
export function trackFilterUsage(filterType: string, filterValue: string | number) {
  if (typeof window === 'undefined' || !window.gtag) return;

  const cookieConsent = localStorage.getItem('cookie-consent');
  if (!cookieConsent) return;

  const consent = safeJsonParse(cookieConsent, { analytics: false, marketing: false, necessary: true }, {
    context: 'cookie-consent',
    dedupeKey: 'cookie-consent',
  });
  if (!consent.analytics) return;

  window.gtag('event', 'filter_used', {
    event_category: 'Listings',
    event_label: filterType,
    filter_type: filterType,
    filter_value: String(filterValue),
  });
}

/**
 * Track view mode change
 */
export function trackViewModeChange(viewMode: 'grid' | 'list' | 'map') {
  if (typeof window === 'undefined' || !window.gtag) return;

  const cookieConsent = localStorage.getItem('cookie-consent');
  if (!cookieConsent) return;

  const consent = safeJsonParse(cookieConsent, { analytics: false, marketing: false, necessary: true }, {
    context: 'cookie-consent',
    dedupeKey: 'cookie-consent',
  });
  if (!consent.analytics) return;

  window.gtag('event', 'view_mode_change', {
    event_category: 'Listings',
    event_label: viewMode,
    view_mode: viewMode,
  });
}

/**
 * Track search performed
 */
export function trackSearch(query: string, resultsCount: number) {
  if (typeof window === 'undefined' || !window.gtag) return;

  const cookieConsent = localStorage.getItem('cookie-consent');
  if (!cookieConsent) return;

  const consent = safeJsonParse(cookieConsent, { analytics: false, marketing: false, necessary: true }, {
    context: 'cookie-consent',
    dedupeKey: 'cookie-consent',
  });
  if (!consent.analytics) return;

  window.gtag('event', 'search', {
    event_category: 'Listings',
    search_term: query,
    results_count: resultsCount,
  });
}

/**
 * Track listing click (when user clicks to view details)
 */
export function trackListingClick(listingId: string, listingTitle: string, source: 'card' | 'quick_view' | 'map') {
  if (typeof window === 'undefined' || !window.gtag) return;

  const cookieConsent = localStorage.getItem('cookie-consent');
  if (!cookieConsent) return;

  const consent = safeJsonParse(cookieConsent, { analytics: false, marketing: false, necessary: true }, {
    context: 'cookie-consent',
    dedupeKey: 'cookie-consent',
  });
  if (!consent.analytics) return;

  window.gtag('event', 'select_item', {
    event_category: 'Listings',
    event_label: listingTitle,
    item_id: listingId,
    source: source,
  });
}

// Type declarations
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
