/**
 * Link Utility Functions
 * 
 * Utilities for handling links consistently across the application
 */

import { siteConfig } from '@karasu-emlak/config';

/**
 * Check if a URL is external
 */
export function isExternalUrl(url: string): boolean {
  if (!url) return false;
  
  // Absolute URLs are external (unless they're our own domain)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const urlObj = new URL(url);
      return !urlObj.hostname.includes(siteConfig.url.replace(/https?:\/\//, ''));
    } catch {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if a URL is a special protocol (tel:, mailto:, etc.)
 */
export function isSpecialProtocol(url: string): boolean {
  if (!url) return false;
  return url.startsWith('tel:') || 
         url.startsWith('mailto:') || 
         url.startsWith('sms:') ||
         url.startsWith('whatsapp:');
}

/**
 * Get link type for analytics
 */
export function getLinkType(url: string): 'internal' | 'external' | 'phone' | 'email' | 'download' {
  if (!url) return 'internal';
  
  if (url.startsWith('tel:')) return 'phone';
  if (url.startsWith('mailto:')) return 'email';
  if (url.startsWith('http') && (url.includes('.pdf') || url.includes('.doc') || url.includes('.zip'))) {
    return 'download';
  }
  if (isExternalUrl(url)) return 'external';
  
  return 'internal';
}

/**
 * Sanitize link href
 */
export function sanitizeLinkHref(href: string): string {
  if (!href) return '#';
  
  // Allow special protocols
  if (isSpecialProtocol(href)) {
    return href;
  }
  
  // Sanitize external URLs
  if (isExternalUrl(href)) {
    try {
      const url = new URL(href);
      // Only allow http, https
      if (!['http:', 'https:'].includes(url.protocol)) {
        return '#';
      }
      return url.toString();
    } catch {
      return '#';
    }
  }
  
  return href;
}

/**
 * Get security attributes for external links
 */
export function getExternalLinkAttributes(): { target: string; rel: string } {
  return {
    target: '_blank',
    rel: 'noopener noreferrer',
  };
}

/**
 * Get aria-label for external links
 */
export function getExternalLinkAriaLabel(linkText: string): string {
  return `${linkText} (Yeni sekmede açılır)`;
}

/**
 * Check if link should be prefetched
 */
export function shouldPrefetchLink(
  href: string,
  linkType?: 'navigation' | 'content' | 'footer' | 'sidebar' | 'related'
): boolean {
  // Don't prefetch external links
  if (isExternalUrl(href)) return false;
  
  // Don't prefetch special protocols
  if (isSpecialProtocol(href)) return false;
  
  // Don't prefetch hash links
  if (href.startsWith('#')) return false;
  
  // Don't prefetch query-only links
  if (href.startsWith('?')) return false;
  
  // Prefetch based on link type
  if (linkType) {
    return ['navigation', 'content', 'related'].includes(linkType);
  }
  
  return true;
}
