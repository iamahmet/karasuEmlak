/**
 * Blog Article Analytics Events
 * Enterprise-level tracking for blog interactions
 */

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export interface BlogEvent {
  articleId: string;
  articleSlug: string;
  articleTitle: string;
  category?: string;
  readingTime?: number;
  wordCount?: number;
}

/**
 * Track article view
 */
export function trackArticleView(event: BlogEvent) {
  if (typeof window === 'undefined' || !window.gtag) return;

  // Check cookie consent
  const cookieConsent = localStorage.getItem('cookie-consent');
  if (!cookieConsent) return;

  try {
    const consent = JSON.parse(cookieConsent);
    if (!consent.analytics) return;
  } catch {
    return;
  }

  window.gtag('event', 'article_view', {
    event_category: 'Blog',
    event_label: event.articleTitle,
    article_id: event.articleId,
    article_slug: event.articleSlug,
    category: event.category,
    reading_time: event.readingTime,
    word_count: event.wordCount,
  });
}

/**
 * Track article scroll depth
 */
export function trackScrollDepth(event: BlogEvent, depth: 25 | 50 | 75 | 100) {
  if (typeof window === 'undefined' || !window.gtag) return;

  const cookieConsent = localStorage.getItem('cookie-consent');
  if (!cookieConsent) return;

  try {
    const consent = JSON.parse(cookieConsent);
    if (!consent.analytics) return;
  } catch {
    return;
  }

  window.gtag('event', 'article_scroll', {
    event_category: 'Blog',
    event_label: `${event.articleTitle} - ${depth}%`,
    article_id: event.articleId,
    scroll_depth: depth,
  });
}

/**
 * Track article share
 */
export function trackArticleShare(event: BlogEvent, platform: string) {
  if (typeof window === 'undefined' || !window.gtag) return;

  const cookieConsent = localStorage.getItem('cookie-consent');
  if (!cookieConsent) return;

  try {
    const consent = JSON.parse(cookieConsent);
    if (!consent.analytics) return;
  } catch {
    return;
  }

  window.gtag('event', 'share', {
    method: platform,
    content_type: 'article',
    item_id: event.articleId,
    event_category: 'Blog',
    event_label: event.articleTitle,
  });
}

/**
 * Track newsletter signup from article
 */
export function trackNewsletterSignup(event: BlogEvent) {
  if (typeof window === 'undefined' || !window.gtag) return;

  const cookieConsent = localStorage.getItem('cookie-consent');
  if (!cookieConsent) return;

  try {
    const consent = JSON.parse(cookieConsent);
    if (!consent.analytics) return;
  } catch {
    return;
  }

  window.gtag('event', 'newsletter_signup', {
    event_category: 'Blog',
    event_label: `From: ${event.articleTitle}`,
    article_id: event.articleId,
  });
}

/**
 * Track TOC click
 */
export function trackTOCClick(event: BlogEvent, heading: string) {
  if (typeof window === 'undefined' || !window.gtag) return;

  const cookieConsent = localStorage.getItem('cookie-consent');
  if (!cookieConsent) return;

  try {
    const consent = JSON.parse(cookieConsent);
    if (!consent.analytics) return;
  } catch {
    return;
  }

  window.gtag('event', 'toc_click', {
    event_category: 'Blog',
    event_label: heading,
    article_id: event.articleId,
  });
}
