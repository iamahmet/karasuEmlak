/**
 * Image Preloader Utility
 * Preloads critical images for better LCP (Largest Contentful Paint)
 */

export interface PreloadImage {
  src: string;
  as?: 'image';
  fetchpriority?: 'high' | 'low' | 'auto';
  type?: string;
}

/**
 * Preload critical images
 * Use for above-the-fold images, hero images, etc.
 */
export function preloadImage(image: PreloadImage): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = image.as || 'image';
  link.href = image.src;
  if (image.fetchpriority) {
    link.setAttribute('fetchpriority', image.fetchpriority);
  }
  if (image.type) {
    link.type = image.type;
  }
  document.head.appendChild(link);
}

/**
 * Preload multiple images
 */
export function preloadImages(images: PreloadImage[]): void {
  images.forEach(preloadImage);
}

/**
 * Preload hero image for homepage
 */
export function preloadHomepageHero(imageUrl: string): void {
  preloadImage({
    src: imageUrl,
    as: 'image',
    fetchpriority: 'high',
  });
}

/**
 * Preload listing card images (below-the-fold, lower priority)
 */
export function preloadListingImages(imageUrls: string[]): void {
  imageUrls.slice(0, 6).forEach((url) => {
    preloadImage({
      src: url,
      as: 'image',
      fetchpriority: 'low',
    });
  });
}
