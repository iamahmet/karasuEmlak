/**
 * Critical Resources Preloader
 * Preloads critical resources for better performance
 */

/**
 * Preload critical fonts
 * Note: Fonts are already loaded via @import in globals.css
 * This function preconnects to font domains for faster loading
 */
export function preloadCriticalFonts(): void {
  if (typeof document === 'undefined') return;

  // Preconnect to Google Fonts domains (fonts are loaded via CSS @import)
  const fontDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];

  fontDomains.forEach((domain) => {
    // Check if preconnect already exists
    const existing = document.querySelector(`link[rel="preconnect"][href="${domain}"]`);
    if (existing) return;

    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/**
 * Preload critical API endpoints
 */
export function preconnectCriticalAPIs(): void {
  if (typeof document === 'undefined') return;

  // Preconnect to Supabase
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = supabaseUrl.origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  // Preconnect to Cloudinary
  const cloudinaryLink = document.createElement('link');
  cloudinaryLink.rel = 'preconnect';
  cloudinaryLink.href = 'https://res.cloudinary.com';
  cloudinaryLink.crossOrigin = 'anonymous';
  document.head.appendChild(cloudinaryLink);
}

/**
 * Initialize all critical resource hints
 */
export function initCriticalResources(): void {
  preloadCriticalFonts();
  preconnectCriticalAPIs();
}
