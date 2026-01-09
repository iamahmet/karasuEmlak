/**
 * Image Optimization Utilities
 * Helps optimize images for better Core Web Vitals
 */

import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary/optimization';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale';
  priority?: boolean;
}

/**
 * Get optimized image URL with performance hints
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: ImageOptimizationOptions = {}
): string {
  const {
    width = 800,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
  } = options;

  return getOptimizedCloudinaryUrl(publicId, {
    width,
    height,
    quality,
    format,
    crop,
  });
}

/**
 * Generate responsive image srcset
 */
export function generateSrcSet(
  publicId: string,
  sizes: number[] = [400, 800, 1200, 1600],
  options: Omit<ImageOptimizationOptions, 'width' | 'height'> = {}
): string {
  return sizes
    .map((width) => {
      const url = getOptimizedImageUrl(publicId, { ...options, width });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizesAttribute(
  defaultSize: string = '100vw',
  breakpoints: Record<string, string> = {}
): string {
  const sizes: string[] = [];
  
  // Add breakpoint-specific sizes
  Object.entries(breakpoints)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .forEach(([breakpoint, size]) => {
      sizes.push(`(max-width: ${breakpoint}) ${size}`);
    });
  
  // Add default size
  sizes.push(defaultSize);
  
  return sizes.join(', ');
}

/**
 * Check if image should be priority loaded (above-the-fold)
 */
export function shouldPriorityLoad(
  index: number,
  totalImages: number,
  aboveFoldCount: number = 3
): boolean {
  return index < aboveFoldCount;
}

/**
 * Get image loading strategy
 */
export function getLoadingStrategy(
  index: number,
  priority: boolean = false
): 'lazy' | 'eager' {
  if (priority) return 'eager';
  return index < 3 ? 'eager' : 'lazy';
}
