/**
 * Cloudinary Image Optimization Utilities
 * Automatic image optimization, format selection, and responsive sizing
 */

export interface ImageSize {
  width: number;
  height: number;
}

export interface ResponsiveBreakpoint {
  breakpoint: number; // max-width in pixels
  width: number;
  height?: number;
}

/**
 * Common image sizes for different use cases
 */
export const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 400, height: 300 },
  medium: { width: 800, height: 600 },
  large: { width: 1200, height: 800 },
  xlarge: { width: 1920, height: 1080 },
  // Aspect ratios
  square: { width: 400, height: 400 },
  portrait: { width: 400, height: 600 },
  landscape: { width: 800, height: 600 },
  hero: { width: 1920, height: 1080 },
  card: { width: 400, height: 300 },
  listing: { width: 600, height: 400 },
  gallery: { width: 1200, height: 800 },
} as const;

/**
 * Responsive breakpoints for images
 */
export const RESPONSIVE_BREAKPOINTS: ResponsiveBreakpoint[] = [
  { breakpoint: 640, width: 400 },   // sm
  { breakpoint: 768, width: 600 },   // md
  { breakpoint: 1024, width: 800 },  // lg
  { breakpoint: 1280, width: 1200 }, // xl
  { breakpoint: 1536, width: 1920 }, // 2xl
];

/**
 * Generate responsive srcSet for Cloudinary images
 */
export function generateSrcSet(
  publicId: string,
  baseWidth: number,
  baseHeight?: number,
  breakpoints: ResponsiveBreakpoint[] = RESPONSIVE_BREAKPOINTS
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'karasuemlak';
  const srcSetParts: string[] = [];

  // Base size
  const baseTransform = baseHeight
    ? `w_${baseWidth},h_${baseHeight},c_fill,q_auto,f_auto`
    : `w_${baseWidth},c_fill,q_auto,f_auto`;
  srcSetParts.push(
    `https://res.cloudinary.com/${cloudName}/image/upload/${baseTransform}/${publicId} ${baseWidth}w`
  );

  // Responsive sizes
  for (const bp of breakpoints) {
    if (bp.width <= baseWidth) continue; // Skip smaller sizes

    const transform = baseHeight
      ? `w_${bp.width},h_${Math.round((bp.width / baseWidth) * (baseHeight || baseWidth))},c_fill,q_auto,f_auto`
      : `w_${bp.width},c_fill,q_auto,f_auto`;

    srcSetParts.push(
      `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${publicId} ${bp.width}w`
    );
  }

  return srcSetParts.join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(
  defaultSize: string = '100vw',
  breakpoints?: { [key: string]: string }
): string {
  if (!breakpoints) return defaultSize;

  const sizesParts: string[] = [];

  // Sort breakpoints by size (smallest first)
  const sorted = Object.entries(breakpoints).sort((a, b) => {
    const aSize = parseInt(a[0].replace(/\D/g, ''));
    const bSize = parseInt(b[0].replace(/\D/g, ''));
    return aSize - bSize;
  });

  for (const [breakpoint, size] of sorted) {
    sizesParts.push(`(max-width: ${breakpoint}) ${size}`);
  }

  sizesParts.push(defaultSize);
  return sizesParts.join(', ');
}

/**
 * Generate blur placeholder URL
 */
export function generateBlurPlaceholder(
  publicId: string,
  width: number = 20,
  height?: number
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'karasuemlak';
  const transform = height
    ? `w_${width},h_${height},c_fill,q_auto:low,e_blur:1000`
    : `w_${width},c_fill,q_auto:low,e_blur:1000`;

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${publicId}`;
}

/**
 * Get optimal image format based on browser support
 */
export function getOptimalFormat(): 'auto' | 'webp' | 'avif' {
  // Cloudinary's 'auto' format will serve the best format the browser supports
  return 'auto';
}

/**
 * Calculate aspect ratio
 */
export function calculateAspectRatio(width: number, height: number): number {
  return width / height;
}

/**
 * Get image dimensions maintaining aspect ratio
 */
export function getDimensionsWithAspectRatio(
  targetWidth: number,
  aspectRatio: number
): ImageSize {
  return {
    width: targetWidth,
    height: Math.round(targetWidth / aspectRatio),
  };
}

/**
 * Generate optimized Cloudinary URL with best practices
 * Handles both Cloudinary public_ids and direct URLs (for placeholders)
 */
export function getOptimizedCloudinaryUrl(
  publicId: string,
  options: {
    width: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'limit';
    quality?: number | 'auto';
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    gravity?: string;
    blur?: boolean;
  } = { width: 800 }
): string {
  // Return empty string if publicId is invalid
  if (!publicId || typeof publicId !== 'string' || publicId.trim() === '') {
    return '';
  }

  // Check if it's a placeholder URL, direct URL, or local URL (starts with /)
  const isPlaceholderUrl = publicId.startsWith('placeholder:') || publicId.startsWith('http://') || publicId.startsWith('https://') || publicId.startsWith('/');

  if (isPlaceholderUrl) {
    // Return direct URL for placeholders (remove placeholder: prefix if exists)
    return publicId.startsWith('placeholder:') ? publicId.replace('placeholder:', '') : publicId;
  }

  // Validate Cloudinary public_id format (should not contain http:// or https://)
  if (publicId.includes('http://') || publicId.includes('https://')) {
    // If it's a full Cloudinary URL, return as-is
    return publicId;
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dqucm2ffl';
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    gravity = 'auto',
    blur = false,
  } = options;

  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`c_${crop}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);
  if (gravity && gravity !== 'auto') transformations.push(`g_${gravity}`);
  if (blur) transformations.push('e_blur:1000');

  const transformString = transformations.join(',');

  // Clean publicId (remove any leading slashes or spaces)
  const cleanPublicId = publicId.trim().replace(/^\/+/, '');

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${cleanPublicId}`;
}

/**
 * Automatically detect and apply best format based on image characteristics
 */
export function getAutoFormat(publicId: string): 'auto' | 'webp' | 'avif' | 'jpg' | 'png' {
  // Check if it's a photo (jpg) or graphic (png)
  // This is a simple heuristic - in production, you might want to analyze the image
  const isPhoto = !publicId.includes('logo') && !publicId.includes('icon');

  // Prefer WebP for photos, AVIF for modern browsers
  // Cloudinary's 'auto' format will handle this automatically
  return 'auto';
}

/**
 * Get responsive image sizes for different breakpoints
 */
export function getResponsiveSizes(breakpoints: number[] = [640, 768, 1024, 1280, 1536]): string {
  return breakpoints.map((bp) => `(max-width: ${bp}px) ${bp}px`).join(', ') + ', 100vw';
}

/**
 * Generate multiple optimized URLs for responsive images
 */
export function getResponsiveImageUrls(
  publicId: string,
  options: {
    baseWidth?: number;
    breakpoints?: number[];
    aspectRatio?: number;
  } = {}
): Array<{ width: number; url: string }> {
  const { baseWidth = 800, breakpoints = [640, 768, 1024, 1280, 1536], aspectRatio } = options;

  return breakpoints.map((width) => ({
    width,
    url: getOptimizedCloudinaryUrl(publicId, {
      width,
      height: aspectRatio ? Math.round(width / aspectRatio) : undefined,
      format: 'auto',
      quality: 'auto',
    }),
  }));
}

