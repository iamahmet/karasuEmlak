import { createServiceClient } from '@karasu/lib/supabase/service';
import { safeParseFeatures, safeParseImages } from '@/lib/utils/safe-json';

export interface Listing {
  id: string;
  title: string;
  slug: string;
  status: 'satilik' | 'kiralik';
  property_type: 'daire' | 'villa' | 'ev' | 'yazlik' | 'arsa' | 'isyeri' | 'dukkan';
  location_city: string;
  location_district: string;
  location_neighborhood: string;
  location_full_address?: string;
  coordinates_lat?: number;
  coordinates_lng?: number;
  price_amount?: number;
  price_currency: string;
  features: {
    rooms?: number;
    bathrooms?: number;
    sizeM2?: number;
    floor?: number;
    buildingAge?: number;
    heating?: string;
    furnished?: boolean;
    balcony?: boolean;
    parking?: boolean;
    elevator?: boolean;
    seaView?: boolean;
  };
  description_short?: string;
  description_long?: string;
  images: Array<{
    public_id?: string;
    url: string;
    alt?: string;
    order: number;
  }>;
  agent_name?: string;
  agent_phone?: string;
  agent_whatsapp?: string;
  agent_email?: string;
  available: boolean;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListingFilters {
  status?: 'satilik' | 'kiralik';
  property_type?: string[];
  location_neighborhood?: string[];
  location_district?: string[];
  location_city?: string[];
  min_price?: number;
  max_price?: number;
  min_size?: number;
  max_size?: number;
  rooms?: number[];
  query?: string;
  featured?: boolean;
  balcony?: boolean;
  parking?: boolean;
  elevator?: boolean;
  seaView?: boolean;
  furnished?: boolean;
}

export interface ListingSort {
  field: 'price_amount' | 'created_at' | 'updated_at';
  order: 'asc' | 'desc';
}

/**
 * Get all published listings with optional filters
 */
export async function getListings(
  filters?: ListingFilters,
  sort?: ListingSort,
  limit = 20,
  offset = 0
): Promise<{ listings: Listing[]; total: number }> {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error: any) {
    console.error('Error creating service client for getListings:', error.message);
    return { listings: [], total: 0 };
  }

  let query = supabase
    .from('listings')
    .select('*', { count: 'exact' })
    .eq('published', true)
    .eq('available', true)
    .is('deleted_at', null);

  // Apply text search
  if (filters?.query) {
    const searchQuery = `%${filters.query.toLowerCase()}%`;
    query = query.or(
      `title.ilike.${searchQuery},description_short.ilike.${searchQuery},description_long.ilike.${searchQuery},location_neighborhood.ilike.${searchQuery},location_district.ilike.${searchQuery},location_city.ilike.${searchQuery}`
    );
  }

  // Apply filters
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.property_type && filters.property_type.length > 0) {
    query = query.in('property_type', filters.property_type);
  }

  if (filters?.location_neighborhood && filters.location_neighborhood.length > 0) {
    query = query.in('location_neighborhood', filters.location_neighborhood);
  }

  if (filters?.min_price) {
    query = query.gte('price_amount', filters.min_price);
  }

  if (filters?.max_price) {
    query = query.lte('price_amount', filters.max_price);
  }

  if (filters?.min_size) {
    query = query.gte('features->sizeM2', filters.min_size);
  }

  if (filters?.max_size) {
    query = query.lte('features->sizeM2', filters.max_size);
  }

  if (filters?.rooms && filters.rooms.length > 0) {
    query = query.in('features->rooms', filters.rooms);
  }

  if (filters?.featured !== undefined) {
    query = query.eq('featured', filters.featured);
  }

  // Apply new feature filters
  if (filters?.balcony !== undefined) {
    query = query.eq('features->balcony', filters.balcony);
  }
  if (filters?.parking !== undefined) {
    query = query.eq('features->parking', filters.parking);
  }
  if (filters?.elevator !== undefined) {
    query = query.eq('features->elevator', filters.elevator);
  }
  if (filters?.seaView !== undefined) {
    query = query.eq('features->seaView', filters.seaView);
  }
  if (filters?.furnished !== undefined) {
    query = query.eq('features->furnished', filters.furnished);
  }

  // Apply sorting
  if (sort) {
    query = query.order(sort.field, { ascending: sort.order === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  let data, error, count;
  try {
    // Execute query and handle any errors
    const result = await query;
    
    data = result.data;
    error = result.error;
    count = result.count;
  } catch (queryError: any) {
    console.error('[getListings] Unexpected error executing query:', queryError.message);
    return { listings: [], total: 0 };
  }

  if (error) {
    console.error('Error fetching listings:', error);
    return { listings: [], total: 0 };
  }

  // Parse features and images safely using utility functions
  // Wrap in try-catch to handle any unexpected JSON parsing errors
  let listings: Listing[] = [];
  try {
    listings = (data || []).map((listing: any) => {
      try {
        return {
          ...listing,
          features: safeParseFeatures(listing.features),
          images: safeParseImages(listing.images),
        } as Listing;
      } catch (parseError: any) {
        console.warn(`[getListings] Error parsing listing ${listing.id}:`, parseError.message);
        return {
          ...listing,
          features: {},
          images: [],
        } as Listing;
      }
    });
  } catch (batchError: any) {
    console.error('[getListings] Error processing listings:', batchError.message);
    return { listings: [], total: 0 };
  }

  return { listings, total: count || 0 };
}

/**
 * Get listing by slug
 */
export async function getListingBySlug(slug: string): Promise<Listing | null> {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error: any) {
    console.error('Error creating service client for getListingBySlug:', error.message);
    return null;
  }

  // First try to get from database
  let data, error;
  try {
    const result = await supabase
      .from('listings')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .is('deleted_at', null)
      .single();
    data = result.data;
    error = result.error;
  } catch (queryError: any) {
    console.error('[getListingBySlug] Error executing query:', queryError.message);
    return null;
  }

  if (!error && data) {
    try {
      return {
        ...data,
        features: safeParseFeatures(data.features),
        images: safeParseImages(data.images),
      } as Listing;
    } catch (parseError: any) {
      console.warn(`[getListingBySlug] Error parsing listing ${data.id}:`, parseError.message);
      return {
        ...data,
        features: {},
        images: [],
      } as Listing;
    }
  }

  // If not found in database, check demo listings
  try {
    const { demoListings } = await import('@/lib/demo-listings');
    const demoListing = demoListings.find(l => l.slug === slug);
    
    if (demoListing) {
      // Convert demo listing to Listing format
      return {
        ...demoListing,
        features: safeParseFeatures(demoListing.features),
        images: safeParseImages(demoListing.images),
      } as Listing;
    }
  } catch (demoError) {
    // Demo listings not available, continue
  }

  return null;
}

/**
 * Get featured listings
 * If no featured listings found, returns regular published listings
 */
export async function getFeaturedListings(limit = 6): Promise<Listing[]> {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error: any) {
    console.error('Error creating service client for getFeaturedListings:', error.message);
    return [];
  }

  // First try to get featured listings
  const { data: featuredData, error: featuredError } = await supabase
    .from('listings')
    .select('*')
    .eq('published', true)
    .eq('available', true)
    .eq('featured', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  // If we have featured listings, return them with parsed JSON
  if (!featuredError && featuredData && featuredData.length > 0) {
    try {
      const parsedListings = featuredData.map((listing: any) => {
        try {
          return {
            ...listing,
            features: safeParseFeatures(listing.features),
            images: safeParseImages(listing.images),
          } as Listing;
        } catch (parseError: any) {
          console.warn(`[getFeaturedListings] Error parsing listing ${listing.id}:`, parseError.message);
          return {
            ...listing,
            features: {},
            images: [],
          } as Listing;
        }
      });
      return parsedListings;
    } catch (batchError: any) {
      console.error('[getFeaturedListings] Error processing featured listings:', batchError.message);
      return [];
    }
  }

  // Fallback: get regular published listings if no featured ones
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('published', true)
    .eq('available', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching listings:', error);
    return [];
  }

  // Parse JSON fields safely with error handling
  let parsedListings: Listing[] = [];
  try {
    parsedListings = (data || []).map((listing: any) => {
      try {
        return {
          ...listing,
          features: safeParseFeatures(listing.features),
          images: safeParseImages(listing.images),
        } as Listing;
      } catch (parseError: any) {
        console.warn(`[getFeaturedListings] Error parsing listing ${listing.id}:`, parseError.message);
        return {
          ...listing,
          features: {},
          images: [],
        } as Listing;
      }
    });
  } catch (batchError: any) {
    console.error('[getFeaturedListings] Error processing listings:', batchError.message);
    return [];
  }

  return parsedListings;
}

/**
 * Get recent listings (last added)
 */
export async function getRecentListings(limit = 6): Promise<Listing[]> {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error: any) {
    console.error('Error creating service client for getRecentListings:', error.message);
    return [];
  }

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('published', true)
    .eq('available', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent listings:', error);
    return [];
  }

  // Parse JSON fields safely
  let parsedListings: Listing[] = [];
  try {
    parsedListings = (data || []).map((listing: any) => {
      try {
        return {
          ...listing,
          features: safeParseFeatures(listing.features),
          images: safeParseImages(listing.images),
        } as Listing;
      } catch (parseError: any) {
        console.warn(`[getRecentListings] Error parsing listing ${listing.id}:`, parseError.message);
        return {
          ...listing,
          features: {},
          images: [],
        } as Listing;
      }
    });
  } catch (batchError: any) {
    console.error('[getRecentListings] Error processing listings:', batchError.message);
    return [];
  }

  return parsedListings;
}

/**
 * Get listings by neighborhood
 */
export async function getListingsByNeighborhood(
  neighborhood: string,
  limit = 6
): Promise<Listing[]> {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error: any) {
    console.error('Error creating service client for getListingsByNeighborhood:', error.message);
    return [];
  }

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('published', true)
    .eq('available', true)
    .eq('location_neighborhood', neighborhood)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching listings by neighborhood:', error);
    return [];
  }

  // Parse JSON fields safely
  let parsedListings: Listing[] = [];
  try {
    parsedListings = (data || []).map((listing: any) => {
      try {
        return {
          ...listing,
          features: safeParseFeatures(listing.features),
          images: safeParseImages(listing.images),
        } as Listing;
      } catch (parseError: any) {
        console.warn(`[getListingsByNeighborhood] Error parsing listing ${listing.id}:`, parseError.message);
        return {
          ...listing,
          features: {},
          images: [],
        } as Listing;
      }
    });
  } catch (batchError: any) {
    console.error('[getListingsByNeighborhood] Error processing listings:', batchError.message);
    return [];
  }

  return parsedListings;
}

/**
 * Get listing stats
 */
export async function getListingStats(): Promise<{
  total: number;
  satilik: number;
  kiralik: number;
  byType: Record<string, number>;
}> {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error: any) {
    console.error('Error creating service client for getListingStats:', error.message);
    return { total: 0, satilik: 0, kiralik: 0, byType: {} };
  }

  try {
    // Get all published listings
    const { data, error } = await supabase
      .from('listings')
      .select('status, property_type')
      .eq('published', true)
      .eq('available', true)
      .is('deleted_at', null);

    if (error) {
      console.error('Error fetching listing stats:', error);
      return { total: 0, satilik: 0, kiralik: 0, byType: {} };
    }

    const stats = {
      total: data?.length || 0,
      satilik: data?.filter((l: any) => l.status === 'satilik').length || 0,
      kiralik: data?.filter((l: any) => l.status === 'kiralik').length || 0,
      byType: {} as Record<string, number>,
    };

    // Count by property type
    if (data) {
      data.forEach((listing: any) => {
        const type = listing.property_type || 'other';
        stats.byType[type] = (stats.byType[type] || 0) + 1;
      });
    }

    return stats;
  } catch (error: any) {
    console.error('Error calculating listing stats:', error.message);
    return { total: 0, satilik: 0, kiralik: 0, byType: {} };
  }
}
