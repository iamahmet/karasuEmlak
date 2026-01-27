/**
 * Serialization Safety Utilities
 * 
 * Ensures all data returned from server components is serializable.
 * Converts Date, BigInt, Decimal, and other non-serializable types.
 */

/**
 * Convert a value to a serializable format
 * 
 * Handles:
 * - Date -> ISO string
 * - BigInt -> string
 * - Decimal-like objects -> number/string
 * - Strips undefined, functions, class instances
 * - Handles circular references
 */
export function toSerializable<T = any>(value: T, seen = new WeakSet()): T {
  // Handle primitives
  if (value === null || value === undefined) {
    return value as T;
  }

  // Handle Date
  if (value instanceof Date) {
    return value.toISOString() as T;
  }

  // Handle BigInt
  if (typeof value === 'bigint') {
    return String(value) as T;
  }

  // Handle primitives (string, number, boolean)
  if (typeof value !== 'object') {
    return value;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(item => toSerializable(item, seen)) as T;
  }

  // Handle circular references
  if (seen.has(value as object)) {
    return '[Circular]' as T;
  }
  seen.add(value as object);

  // Handle objects
  const result: any = {};
  for (const key in value) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      continue;
    }

    const val = (value as any)[key];

    // Skip undefined
    if (val === undefined) {
      continue;
    }

    // Skip functions
    if (typeof val === 'function') {
      continue;
    }

    // Skip class instances (except Date which we handle above)
    if (val && typeof val === 'object' && val.constructor && val.constructor !== Object && val.constructor !== Array) {
      // Check if it's a Decimal-like object
      if ('toNumber' in val && typeof val.toNumber === 'function') {
        result[key] = val.toNumber();
      } else if ('toString' in val && typeof val.toString === 'function') {
        result[key] = val.toString();
      } else {
        // Skip unknown class instances
        continue;
      }
    } else {
      result[key] = toSerializable(val, seen);
    }
  }

  return result as T;
}

/**
 * Convert a listing object to serializable format
 */
export function serializeListing(listing: any) {
  try {
    // Handle null/undefined
    if (!listing || typeof listing !== 'object') {
      return listing;
    }

    const serialized = toSerializable({
      ...listing,
      // Ensure dates are strings (handle both Date objects and ISO strings)
      created_at: listing.created_at instanceof Date 
        ? listing.created_at.toISOString() 
        : (typeof listing.created_at === 'string' ? listing.created_at : new Date().toISOString()),
      updated_at: listing.updated_at instanceof Date 
        ? listing.updated_at.toISOString() 
        : (typeof listing.updated_at === 'string' ? listing.updated_at : new Date().toISOString()),
      deleted_at: listing.deleted_at instanceof Date 
        ? listing.deleted_at.toISOString() 
        : listing.deleted_at,
      // Ensure price is number (not Decimal)
      price_amount: typeof listing.price_amount === 'object' && listing.price_amount?.toNumber
        ? listing.price_amount.toNumber()
        : (typeof listing.price_amount === 'number' ? listing.price_amount : null),
      // Ensure images and features are arrays/objects (already handled by safeParseFeatures/Images)
      images: Array.isArray(listing.images) ? listing.images : [],
      features: listing.features && typeof listing.features === 'object' && !Array.isArray(listing.features)
        ? listing.features
        : {},
    });

    return serialized;
  } catch (error: any) {
    console.error('[serializeListing] Error serializing listing:', error?.message);
    // Return minimal safe listing
    return {
      id: listing?.id || '',
      title: listing?.title || '',
      slug: listing?.slug || '',
      status: listing?.status || 'kiralik',
      property_type: listing?.property_type || 'daire',
      location_city: listing?.location_city || 'Sakarya',
      location_district: listing?.location_district || 'Karasu',
      location_neighborhood: listing?.location_neighborhood || '',
      price_amount: null,
      price_currency: listing?.price_currency || 'TRY',
      available: listing?.available ?? true,
      published: listing?.published ?? false,
      featured: listing?.featured ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: [],
      features: {},
      keywords: [],
      seo_keywords: [],
    };
  }
}

/**
 * Convert an article object to serializable format
 */
export function serializeArticle(article: any) {
  return toSerializable({
    ...article,
    // Ensure dates are strings
    created_at: article.created_at instanceof Date ? article.created_at.toISOString() : article.created_at,
    updated_at: article.updated_at instanceof Date ? article.updated_at.toISOString() : article.updated_at,
    published_at: article.published_at instanceof Date ? article.published_at.toISOString() : article.published_at,
    scheduled_publish_at: article.scheduled_publish_at instanceof Date
      ? article.scheduled_publish_at.toISOString()
      : article.scheduled_publish_at,
  });
}

/**
 * Convert an array of listings to serializable format
 */
export function serializeListings(listings: any[]) {
  if (!Array.isArray(listings)) {
    return [];
  }
  
  return listings
    .map(listing => {
      try {
        return serializeListing(listing);
      } catch (error: any) {
        console.warn('[serializeListings] Error serializing listing:', error?.message);
        return null;
      }
    })
    .filter((listing): listing is NonNullable<typeof listing> => listing !== null);
}

/**
 * Convert an array of articles to serializable format
 */
export function serializeArticles(articles: any[]) {
  return articles.map(serializeArticle);
}
