/**
 * Placeholder Image Utilities
 * 
 * Provides placeholder images from free APIs when listing images are missing
 * Uses Unsplash Source API (free, no API key required)
 */

export interface PlaceholderImageOptions {
  width?: number;
  height?: number;
  keywords?: string;
  propertyType?: string;
  seed?: string | number;
}

/**
 * Get placeholder image URL from Unsplash Source API
 * Free API, no key required, keyword-based image selection
 * Returns real estate/property/building related images
 */
export function getPlaceholderImageUrl(options: PlaceholderImageOptions = {}): string {
  const {
    width = 800,
    height = 600,
    propertyType = 'house',
    keywords,
    seed,
  } = options;

  // Map property types to real estate keywords
  const keywordMap: Record<string, string> = {
    'villa': 'luxury-villa,modern-house,architecture',
    'yazlik': 'summer-house,beach-house,coastal-property',
    'arsa': 'land,property,construction-site',
    'daire': 'apartment,modern-interior,home',
    'ev': 'house,residential-property,home',
    'isyeri': 'commercial-building,office-building,business',
    'dukkan': 'shop,storefront,retail-space',
    'house': 'house,residential-property,real-estate',
  };

  // Select keyword based on property type
  const selectedKeyword = keywords || keywordMap[propertyType] || 'real-estate,property,building';
  
  // Use first keyword for seed generation
  const primaryKeyword = selectedKeyword.split(',')[0].trim();
  
  // Generate consistent numeric seed based on property type and seed
  let imageSeed: number;
  if (seed) {
    if (typeof seed === 'string') {
      // Convert keyword + seed string to numeric value
      const combined = `${primaryKeyword}-${seed}`;
      imageSeed = combined.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000;
    } else {
      imageSeed = seed % 1000;
    }
  } else {
    const typeSeeds: Record<string, number> = {
      'villa': 100,
      'yazlik': 200,
      'arsa': 300,
      'daire': 400,
      'ev': 500,
      'isyeri': 600,
      'dukkan': 700,
    };
    imageSeed = typeSeeds[propertyType] || 800;
  }

  // Picsum Photos with keyword-based seed
  // Note: Picsum doesn't support keywords directly, but using keyword in seed
  // ensures different property types get different images
  // The seed format: {keyword}-{numeric-seed} ensures consistency
  const seedString = `${primaryKeyword}-${imageSeed}`;
  return `https://picsum.photos/seed/${seedString}/${width}/${height}`;
}

/**
 * Get placeholder image URL from Picsum (alternative)
 */
export function getPicsumPlaceholderUrl(width = 800, height = 600, seed?: number): string {
  const imageId = seed || Math.floor(Math.random() * 1000);
  return `https://picsum.photos/seed/${imageId}/${width}/${height}`;
}

/**
 * Get property-specific placeholder based on listing data
 * Uses real estate/property/building keywords for relevant images
 */
export function getPropertyPlaceholder(
  propertyType: string,
  status: 'satilik' | 'kiralik',
  neighborhood?: string,
  width = 800,
  height = 600
): string {
  // Map property types to real estate keywords
  const keywordMap: Record<string, string> = {
    'villa': 'luxury-villa,modern-house,architecture',
    'yazlik': 'summer-house,beach-house,coastal-property',
    'arsa': 'land,property,construction-site',
    'daire': 'apartment,modern-interior,home',
    'ev': 'house,residential-property,home',
    'isyeri': 'commercial-building,office-building,business',
    'dukkan': 'shop,storefront,retail-space',
  };

  const keywords = keywordMap[propertyType] || 'real-estate,property,building';
  
  // Generate consistent seed from neighborhood and property type
  const seedString = `${propertyType}-${neighborhood || 'default'}-${status}`;
  const seed = seedString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return getPlaceholderImageUrl({
    width,
    height,
    keywords,
    propertyType,
    seed,
  });
}

/**
 * Check if image URL is valid
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get image URL with fallback to placeholder
 */
export function getImageWithFallback(
  imageUrl: string | null | undefined,
  publicId: string | null | undefined,
  placeholderOptions: PlaceholderImageOptions
): string | null {
  // Priority 1: Use provided URL
  if (imageUrl && isValidImageUrl(imageUrl)) {
    return imageUrl;
  }

  // Priority 2: Use Cloudinary public_id (will be handled by Cloudinary component)
  if (publicId) {
    return null; // Let Cloudinary component handle it
  }

  // Priority 3: Use placeholder
  return getPlaceholderImageUrl(placeholderOptions);
}
