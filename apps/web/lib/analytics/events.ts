/**
 * Analytics Event Tracking
 * Centralized event tracking for Google Analytics 4
 */

export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

/**
 * Track custom event
 */
export function trackEvent({ action, category, label, value, ...params }: AnalyticsEvent) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...params,
    });
  }
}

/**
 * Homepage Events
 */
export const trackHomepageEvent = {
  heroSearchClick: () => trackEvent({
    action: 'hero_search_click',
    category: 'engagement',
    label: 'Hero Section Search',
  }),

  filterApplied: (filterType: string) => trackEvent({
    action: 'filter_applied',
    category: 'search',
    label: filterType,
  }),

  listingCardClick: (listingId: string, position: number) => trackEvent({
    action: 'listing_card_click',
    category: 'listings',
    label: listingId,
    value: position,
  }),

  neighborhoodClick: (neighborhood: string) => trackEvent({
    action: 'neighborhood_click',
    category: 'navigation',
    label: neighborhood,
  }),

  ctaClick: (ctaType: 'phone' | 'whatsapp' | 'email') => trackEvent({
    action: 'cta_click',
    category: 'conversion',
    label: ctaType,
  }),

  mapInteraction: (action: 'zoom' | 'pan' | 'marker_click') => trackEvent({
    action: 'map_interaction',
    category: 'engagement',
    label: action,
  }),

  faqOpen: (question: string) => trackEvent({
    action: 'faq_opened',
    category: 'engagement',
    label: question,
  }),

  carouselInteraction: (action: 'next' | 'prev' | 'indicator') => trackEvent({
    action: 'carousel_interaction',
    category: 'engagement',
    label: action,
  }),
};

/**
 * Conversion Events
 */
export const trackConversion = {
  phoneCall: () => trackEvent({
    action: 'phone_call',
    category: 'conversion',
    label: 'Phone CTA',
  }),

  whatsappMessage: () => trackEvent({
    action: 'whatsapp_message',
    category: 'conversion',
    label: 'WhatsApp CTA',
  }),

  contactFormSubmit: (formType: string) => trackEvent({
    action: 'form_submit',
    category: 'conversion',
    label: formType,
  }),

  listingInquiry: (listingId: string) => trackEvent({
    action: 'listing_inquiry',
    category: 'conversion',
    label: listingId,
  }),

  favoriteAdded: (listingId: string) => trackEvent({
    action: 'favorite_added',
    category: 'engagement',
    label: listingId,
  }),
};

/**
 * Scroll Depth Tracking
 */
export function trackScrollDepth() {
  if (typeof window === 'undefined') return;

  const depths = [25, 50, 75, 100];
  const tracked = new Set<number>();

  const handleScroll = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;

    depths.forEach((depth) => {
      if (scrollPercent >= depth && !tracked.has(depth)) {
        tracked.add(depth);
        trackEvent({
          action: 'scroll_depth',
          category: 'engagement',
          label: `${depth}%`,
          value: depth,
        });
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  
  return () => window.removeEventListener('scroll', handleScroll);
}

