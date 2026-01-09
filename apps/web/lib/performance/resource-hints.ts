/**
 * Resource Hints Utility
 * Adds DNS prefetch, preconnect, and prefetch hints for better performance
 */

/**
 * Add DNS prefetch hint
 */
export function addDNSPrefetch(domain: string): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = `//${domain}`;
  document.head.appendChild(link);
}

/**
 * Add preconnect hint
 */
export function addPreconnect(url: string, crossorigin: boolean = false): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;
  if (crossorigin) {
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);
}

/**
 * Add prefetch hint for next page
 */
export function addPrefetch(url: string): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Initialize resource hints for common domains
 */
export function initResourceHints(): void {
  if (typeof window === 'undefined') return;

  // Preconnect to Cloudinary (image CDN)
  addPreconnect('https://res.cloudinary.com', true);
  
  // Preconnect to Supabase
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    addPreconnect(supabaseUrl.origin, true);
  }

  // DNS prefetch for external domains
  addDNSPrefetch('fonts.googleapis.com');
  addDNSPrefetch('fonts.gstatic.com');
}
