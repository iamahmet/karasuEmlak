/**
 * CLS (Cumulative Layout Shift) Optimization Utilities
 * Helps prevent layout shifts by ensuring fixed dimensions
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Common aspect ratios
 */
export const ASPECT_RATIOS = {
  square: 1,
  landscape: 16 / 9,
  portrait: 3 / 4,
  hero: 16 / 9,
  card: 4 / 3,
  listing: 3 / 2,
} as const;

/**
 * Calculate dimensions maintaining aspect ratio
 */
export function calculateDimensions(
  width: number,
  aspectRatio: number = ASPECT_RATIOS.landscape
): ImageDimensions {
  return {
    width,
    height: Math.round(width / aspectRatio),
  };
}

/**
 * Get standard dimensions for common use cases
 */
export function getStandardDimensions(
  type: 'thumbnail' | 'card' | 'listing' | 'hero' | 'gallery'
): ImageDimensions {
  const dimensions = {
    thumbnail: { width: 150, height: 150 },
    card: { width: 400, height: 300 },
    listing: { width: 600, height: 400 },
    hero: { width: 1920, height: 1080 },
    gallery: { width: 1200, height: 800 },
  };

  return dimensions[type];
}

/**
 * Validate that image has fixed dimensions
 */
export function hasFixedDimensions(
  width?: number | string,
  height?: number | string
): boolean {
  return (
    width !== undefined &&
    height !== undefined &&
    typeof width === 'number' &&
    typeof height === 'number' &&
    width > 0 &&
    height > 0
  );
}

/**
 * Get aspect ratio from dimensions
 */
export function getAspectRatio(width: number, height: number): number {
  if (height === 0) return 1;
  return width / height;
}

/**
 * Generate CSS aspect ratio string
 */
export function getAspectRatioCSS(width: number, height: number): string {
  const ratio = getAspectRatio(width, height);
  return `${width} / ${height}`;
}

/**
 * Generate padding-bottom percentage for aspect ratio (for responsive containers)
 */
export function getAspectRatioPadding(width: number, height: number): string {
  const ratio = (height / width) * 100;
  return `${ratio.toFixed(2)}%`;
}
