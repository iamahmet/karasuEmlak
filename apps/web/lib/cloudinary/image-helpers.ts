/**
 * Cloudinary Image Helper Functions
 * Utility functions for common image operations
 */

import { getOptimizedCloudinaryUrl, IMAGE_SIZES } from './optimization';

/**
 * Get optimized image URL for listing card
 */
export function getListingCardImageUrl(publicId: string): string {
  return getOptimizedCloudinaryUrl(publicId, {
    width: IMAGE_SIZES.card.width,
    height: IMAGE_SIZES.card.height,
    quality: 'auto',
    format: 'auto',
  });
}

/**
 * Get optimized image URL for listing detail
 */
export function getListingDetailImageUrl(publicId: string, index: number = 0): string {
  if (index === 0) {
    // Hero image - larger
    return getOptimizedCloudinaryUrl(publicId, {
      width: IMAGE_SIZES.large.width,
      height: IMAGE_SIZES.large.height,
      quality: 90,
      format: 'auto',
    });
  }
  // Gallery images
  return getOptimizedCloudinaryUrl(publicId, {
    width: IMAGE_SIZES.gallery.width,
    height: IMAGE_SIZES.gallery.height,
    quality: 'auto',
    format: 'auto',
  });
}

/**
 * Get optimized image URL for blog/article
 */
export function getArticleImageUrl(publicId: string, featured: boolean = false): string {
  if (featured) {
    return getOptimizedCloudinaryUrl(publicId, {
      width: IMAGE_SIZES.hero.width,
      height: IMAGE_SIZES.hero.height,
      quality: 85,
      format: 'auto',
    });
  }
  return getOptimizedCloudinaryUrl(publicId, {
    width: IMAGE_SIZES.medium.width,
    height: IMAGE_SIZES.medium.height,
    quality: 'auto',
    format: 'auto',
  });
}

/**
 * Get optimized image URL for thumbnail
 */
export function getThumbnailImageUrl(publicId: string): string {
  return getOptimizedCloudinaryUrl(publicId, {
    width: IMAGE_SIZES.thumbnail.width,
    height: IMAGE_SIZES.thumbnail.height,
    quality: 'auto',
    format: 'auto',
  });
}

/**
 * Get optimized image URL for avatar/profile picture
 */
export function getAvatarImageUrl(publicId: string, size: number = 100): string {
  return getOptimizedCloudinaryUrl(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
    gravity: 'face', // Focus on face
  });
}

/**
 * Get optimized image URL for hero/banner
 */
export function getHeroImageUrl(publicId: string): string {
  return getOptimizedCloudinaryUrl(publicId, {
    width: IMAGE_SIZES.hero.width,
    height: IMAGE_SIZES.hero.height,
    quality: 90,
    format: 'auto',
  });
}

/**
 * Get optimized image URL for gallery
 */
export function getGalleryImageUrl(publicId: string, index: number = 0): string {
  return getOptimizedCloudinaryUrl(publicId, {
    width: IMAGE_SIZES.gallery.width,
    height: IMAGE_SIZES.gallery.height,
    quality: index === 0 ? 90 : 'auto',
    format: 'auto',
  });
}

