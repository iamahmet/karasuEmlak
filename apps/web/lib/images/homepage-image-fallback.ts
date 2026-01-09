/**
 * Homepage Image Fallback System
 * 
 * Provides fallback images for homepage sections when images are missing
 * Uses media library, AI-generated images, or free image sources
 */

import { createServiceClient } from '@karasu/lib/supabase/service';

interface ImageFallbackOptions {
  entityType?: 'listing' | 'article' | 'news' | 'neighborhood';
  category?: string;
  propertyType?: string;
  location?: string;
}

/**
 * Get fallback image from media library
 */
export async function getFallbackImageFromMediaLibrary(
  options: ImageFallbackOptions
): Promise<string | null> {
  const supabase = createServiceClient();
  const { entityType, category, propertyType, location } = options;

  try {
    let query = supabase
      .from('media_assets')
      .select('cloudinary_public_id')
      .eq('ai_generated', true)
      .order('usage_count', { ascending: false })
      .limit(1);

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    if (category && entityType === 'article') {
      // Try to find image by category
      query = query.contains('transformations', { category });
    }

    if (propertyType && entityType === 'listing') {
      query = query.contains('transformations', { propertyType });
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Try generic fallback
      const { data: genericData } = await supabase
        .from('media_assets')
        .select('cloudinary_public_id')
        .eq('ai_generated', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return genericData?.cloudinary_public_id || null;
    }

    return data[0]?.cloudinary_public_id || null;
  } catch (error) {
    console.error('Error fetching fallback image:', error);
    return null;
  }
}

/**
 * Get free image URL for homepage sections
 */
export function getFreeImageForHomepageSection(
  section: 'listings' | 'neighborhoods' | 'blog' | 'news'
): string {
  const freeImages = {
    listings: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
    neighborhoods: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80',
    blog: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    news: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
  };

  return freeImages[section] || freeImages.listings;
}

/**
 * Get optimized image URL with fallback
 */
export async function getImageWithFallback(
  imageId: string | null | undefined,
  options: ImageFallbackOptions & { section: 'listings' | 'neighborhoods' | 'blog' | 'news' }
): Promise<string> {
  // If image exists, return it
  if (imageId) {
    return imageId;
  }

  // Try to get from media library
  const mediaLibraryImage = await getFallbackImageFromMediaLibrary(options);
  if (mediaLibraryImage) {
    return mediaLibraryImage;
  }

  // Fallback to free image
  return getFreeImageForHomepageSection(options.section);
}

