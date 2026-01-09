/**
 * SEO-Friendly Image Alt Text Generator
 * 
 * Generates descriptive, keyword-rich alt text for images
 * while maintaining natural language and avoiding keyword stuffing
 */

export interface ImageAltContext {
  propertyType?: 'daire' | 'villa' | 'yazlik' | 'arsa' | 'ev' | 'isyeri' | 'dukkan';
  status?: 'satilik' | 'kiralik';
  location?: {
    neighborhood?: string;
    district?: string;
    city?: string;
  };
  features?: {
    rooms?: number;
    sizeM2?: number;
    seaView?: boolean;
    furnished?: boolean;
  };
  price?: number;
}

/**
 * Generate SEO-friendly alt text for property listing images
 */
export function generatePropertyImageAlt(
  context: ImageAltContext,
  fallback?: string
): string {
  const {
    propertyType = 'emlak',
    status,
    location,
    features,
    price,
  } = context;

  const parts: string[] = [];

  // Property type
  const typeLabels: Record<string, string> = {
    daire: 'Daire',
    villa: 'Villa',
    yazlik: 'Yazlık',
    arsa: 'Arsa',
    ev: 'Ev',
    isyeri: 'İşyeri',
    dukkan: 'Dükkan',
  };
  const typeLabel = typeLabels[propertyType] || 'Emlak';

  // Status
  const statusLabel = status === 'satilik' ? 'Satılık' : status === 'kiralik' ? 'Kiralık' : '';

  // Location
  const locationParts: string[] = [];
  if (location?.neighborhood) {
    locationParts.push(location.neighborhood);
  }
  if (location?.district) {
    locationParts.push(location.district);
  }
  if (location?.city) {
    locationParts.push(location.city);
  }
  const locationText = locationParts.length > 0 ? locationParts.join(', ') : 'Karasu';

  // Features
  const featureParts: string[] = [];
  if (features?.rooms) {
    featureParts.push(`${features.rooms} oda`);
  }
  if (features?.sizeM2) {
    featureParts.push(`${features.sizeM2} m²`);
  }
  if (features?.seaView) {
    featureParts.push('deniz manzaralı');
  }
  if (features?.furnished) {
    featureParts.push('eşyalı');
  }
  const featuresText = featureParts.length > 0 ? `, ${featureParts.join(', ')}` : '';

  // Build alt text
  if (statusLabel && locationText) {
    parts.push(`${statusLabel} ${typeLabel.toLowerCase()}`);
    parts.push(locationText);
    if (featuresText) {
      parts.push(featuresText);
    }
  } else {
    parts.push(`${typeLabel} - ${locationText}`);
    if (featuresText) {
      parts.push(featuresText);
    }
  }

  const altText = parts.join(' ').trim();

  // Ensure minimum length and add context
  if (altText.length < 20 && locationText) {
    return `${altText} - Karasu Emlak`;
  }

  return altText || fallback || 'Emlak görseli - Karasu Emlak';
}

/**
 * Generate alt text for blog/article images
 */
export function generateBlogImageAlt(
  title: string,
  category?: string,
  location?: string
): string {
  const parts: string[] = [title];
  
  if (category) {
    parts.push(`- ${category}`);
  }
  
  if (location) {
    parts.push(`- ${location}`);
  }
  
  return parts.join(' ').trim();
}

/**
 * Generate alt text for neighborhood/location images
 */
export function generateNeighborhoodImageAlt(
  neighborhood: string,
  district?: string,
  city: string = 'Karasu'
): string {
  return `${neighborhood}${district ? `, ${district}` : ''} - ${city} Emlak`;
}

/**
 * Generate alt text for service/feature images
 */
export function generateServiceImageAlt(
  serviceName: string,
  location?: string
): string {
  if (location) {
    return `${serviceName} - ${location} Emlak`;
  }
  return `${serviceName} - Karasu Emlak`;
}

/**
 * Generate alt text for homepage/hero images
 */
export function generateHomepageImageAlt(
  context?: {
    featured?: boolean;
    location?: string;
    propertyType?: string;
  }
): string {
  if (context?.featured) {
    return `Öne çıkan ${context.propertyType || 'emlak'} - ${context.location || 'Karasu'} Emlak`;
  }
  return `Karasu Emlak - Satılık ve Kiralık Gayrimenkul İlanları`;
}

/**
 * Generate alt text for comparison/table images
 */
export function generateComparisonImageAlt(
  listingTitle: string,
  location?: string
): string {
  if (location) {
    return `${listingTitle} - ${location}`;
  }
  return listingTitle;
}
