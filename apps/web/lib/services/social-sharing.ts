/**
 * Social Media Sharing APIs
 * 
 * Enhanced social sharing with analytics and optimization
 */

import { safeJsonParse } from '@/lib/utils/safeJsonParse';

export interface ShareAnalytics {
  platform: string;
  url: string;
  timestamp: number;
}

/**
 * Generate optimized share URLs for different platforms
 */
export function generateShareUrl(
  platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'telegram' | 'email',
  url: string,
  title: string,
  description?: string
): string {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = description ? encodeURIComponent(description) : '';

  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    
    case 'twitter':
      const twitterText = description 
        ? `${title} - ${description.substring(0, 100)}`
        : title;
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(twitterText)}`;
    
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    
    case 'whatsapp':
      const whatsappText = description
        ? `${title}\n\n${description}\n\n${url}`
        : `${title}\n\n${url}`;
      return `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    
    case 'telegram':
      const telegramText = description
        ? `${title}\n\n${description}\n\n${url}`
        : `${title}\n\n${url}`;
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(telegramText)}`;
    
    case 'email':
      const emailSubject = title;
      const emailBody = description
        ? `${description}\n\n${url}`
        : url;
      return `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    default:
      return url;
  }
}

/**
 * Track share analytics (client-side)
 */
export function trackShare(platform: string, url: string): void {
  if (typeof window === 'undefined') return;

  // Track in analytics
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'share', {
      method: platform,
      content_type: 'article',
      item_id: url,
    });
  }

  // Store in localStorage for analytics
  try {
    const shares = safeJsonParse<ShareAnalytics[]>(
      localStorage.getItem('share_analytics') || '[]',
      [],
      { context: 'share-analytics', dedupeKey: 'share-analytics' }
    );
    shares.push({
      platform,
      url,
      timestamp: Date.now(),
    });
    
    // Keep only last 100 shares
    const recentShares = shares.slice(-100);
    localStorage.setItem('share_analytics', JSON.stringify(recentShares));
  } catch (error) {
    // Ignore localStorage errors
  }
}

/**
 * Open share dialog
 */
export function openShareDialog(
  platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'telegram' | 'email',
  url: string,
  title: string,
  description?: string
): void {
  const shareUrl = generateShareUrl(platform, url, title, description);
  
  // Track share
  trackShare(platform, url);
  
  // Open in new window (except email)
  if (platform === 'email') {
    window.location.href = shareUrl;
  } else {
    window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes');
  }
}

/**
 * Use native Web Share API if available
 */
export async function nativeShare(
  title: string,
  text: string,
  url: string
): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.share) {
    return false;
  }

  try {
    await navigator.share({
      title,
      text,
      url,
    });
    
    trackShare('native', url);
    return true;
  } catch (error) {
    // User cancelled or error occurred
    return false;
  }
}
