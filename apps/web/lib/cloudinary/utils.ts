export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'limit';
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  gravity?: string;
}

/**
 * Generate Cloudinary URL for client-side use
 * Uses Cloudinary URL transformation API
 * Client-safe: Only uses NEXT_PUBLIC_ environment variables
 */
export function getCloudinaryUrl(
  publicId: string,
  options: CloudinaryTransformOptions = {}
): string {
  // Check if it's a placeholder URL or direct URL
  const isPlaceholderUrl = publicId.startsWith('placeholder:') || publicId.startsWith('http://') || publicId.startsWith('https://');
  
  if (isPlaceholderUrl) {
    // Return direct URL for placeholders
    return publicId.replace('placeholder:', '');
  }

  // Use NEXT_PUBLIC_ variable directly for client-side compatibility
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dqucm2ffl';
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    gravity = 'auto',
  } = options;

  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  if (gravity && gravity !== 'auto') transformations.push(`g_${gravity}`);

  const transformString = transformations.length > 0 ? transformations.join(',') : '';

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString ? transformString + '/' : ''}${publicId}`;
}

