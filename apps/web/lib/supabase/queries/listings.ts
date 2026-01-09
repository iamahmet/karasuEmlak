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
    public_id: string;
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
        // Return listing with safe fallbacks
        return {
          ...listing,
          features: {},
          images: [],
        } as Listing;
      }
    });
  } catch (batchError: any) {
    console.error('[getListings] Error processing listings batch:', batchError.message);
    // Return empty array if batch processing fails
    return { listings: [], total: 0 };
  }

  return {
    listings,
    total: count || 0,
  };
}

/**
 * Get a single listing by slug
 * Supports both database listings and demo listings
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
        id: demoListing.id,
        title: demoListing.title,
        slug: demoListing.slug,
        status: demoListing.status,
        property_type: demoListing.property_type,
        location_city: 'Sakarya',
        location_district: demoListing.location_district,
        location_neighborhood: demoListing.location_neighborhood,
        location_full_address: demoListing.location_full_address,
        coordinates_lat: parseFloat(demoListing.coordinates_lat),
        coordinates_lng: parseFloat(demoListing.coordinates_lng),
        price_amount: parseFloat(demoListing.price_amount),
        price_currency: demoListing.price_currency,
        features: demoListing.features,
        description_short: demoListing.description_short,
        description_long: demoListing.description_long,
        images: demoListing.images.map(img => ({
          public_id: img.public_id,
          url: img.url,
          alt: img.alt,
          order: img.order,
        })),
        agent_name: demoListing.agent_name,
        agent_phone: demoListing.agent_phone,
        agent_whatsapp: demoListing.agent_whatsapp,
        agent_email: demoListing.agent_email,
        available: true,
        published: true,
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  } catch (importError) {
    console.error('Error importing demo listings:', importError);
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
    console.error('[getFeaturedListings] Error processing listings batch:', batchError.message);
    return [];
  }

  return parsedListings;
}

/**
 * Get listings by neighborhood
 */
/**
 * Get listings by neighborhood
 * Supports both database listings and demo listings
 */
export async function getListingsByNeighborhood(
  neighborhood: string,
  limit = 20
): Promise<Listing[]> {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error: any) {
    console.error('Error creating service client for getListingsByNeighborhood:', error.message);
    return [];
  }

  let data, error;
  try {
    const result = await supabase
      .from('listings')
      .select('*')
      .eq('published', true)
      .eq('available', true)
      .eq('location_neighborhood', neighborhood)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);
    data = result.data;
    error = result.error;
  } catch (queryError: any) {
    console.error('[getListingsByNeighborhood] Error executing query:', queryError.message);
    return [];
  }

  // Parse JSON fields safely with error handling
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
        console.warn(`[getListingsByNeighborhood] Error parsing listing ${listing.id}:`, parseError.message);
        return {
          ...listing,
          features: {},
          images: [],
        } as Listing;
      }
    });
  } catch (batchError: any) {
    console.error('[getListingsByNeighborhood] Error processing listings batch:', batchError.message);
    return [];
  }

  // Add demo listings from the same neighborhood
  try {
    const { demoListings } = await import('@/lib/demo-listings');
    const demoListingsInNeighborhood = demoListings
      .filter(l => l.location_neighborhood === neighborhood)
      .slice(0, limit - listings.length)
      .map(demoListing => ({
        id: demoListing.id,
        title: demoListing.title,
        slug: demoListing.slug,
        status: demoListing.status,
        property_type: demoListing.property_type,
        location_city: 'Sakarya',
        location_district: demoListing.location_district,
        location_neighborhood: demoListing.location_neighborhood,
        location_full_address: demoListing.location_full_address,
        coordinates_lat: parseFloat(demoListing.coordinates_lat),
        coordinates_lng: parseFloat(demoListing.coordinates_lng),
        price_amount: parseFloat(demoListing.price_amount),
        price_currency: demoListing.price_currency,
        features: demoListing.features,
        description_short: demoListing.description_short,
        description_long: demoListing.description_long,
        images: demoListing.images.map(img => ({
          public_id: img.public_id,
          url: img.url,
          alt: img.alt,
          order: img.order,
        })),
        agent_name: demoListing.agent_name,
        agent_phone: demoListing.agent_phone,
        agent_whatsapp: demoListing.agent_whatsapp,
        agent_email: demoListing.agent_email,
        available: true,
        published: true,
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

    listings = [...listings, ...demoListingsInNeighborhood].slice(0, limit);
  } catch (importError) {
    console.error('Error importing demo listings:', importError);
  }

  if (error) {
    console.error('Error fetching listings by neighborhood:', error);
  }

  return listings;
}

/**
 * Get listing statistics
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
    satilik: data?.filter((l) => l.status === 'satilik').length || 0,
    kiralik: data?.filter((l) => l.status === 'kiralik').length || 0,
    byType: {} as Record<string, number>,
  };

  // Count by property type
  data?.forEach((listing) => {
    const type = listing.property_type;
    stats.byType[type] = (stats.byType[type] || 0) + 1;
  });

  return stats;
}

/**
 * Get unique neighborhoods from neighborhoods table (preferred) or listings (fallback)
 */
export async function getNeighborhoods(): Promise<string[]> {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error: any) {
    console.error('Error creating service client for getNeighborhoods:', error.message);
    return [];
  }

  // First, try to get from neighborhoods table (preferred)
  const { data: neighborhoodsData, error: neighborhoodsError } = await supabase
    .from('neighborhoods')
    .select('name')
    .eq('published', true)
    .order('name', { ascending: true });

  if (!neighborhoodsError && neighborhoodsData && neighborhoodsData.length > 0) {
    return neighborhoodsData.map(n => n.name);
  }

  // Fallback: get from listings table
  const { data, error } = await supabase
    .from('listings')
    .select('location_neighborhood')
    .eq('published', true)
    .eq('available', true)
    .is('deleted_at', null);

  if (error) {
    console.error('Error fetching neighborhoods:', error);
    return [];
  }

  const neighborhoods = new Set<string>();
  data?.forEach((listing) => {
    if (listing.location_neighborhood) {
      neighborhoods.add(listing.location_neighborhood);
    }
  });

  return Array.from(neighborhoods);
}

/**
 * Get unique property types from listings
 */
export async function getPropertyTypes(): Promise<string[]> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('listings')
    .select('property_type')
    .eq('published', true)
    .eq('available', true)
    .is('deleted_at', null);

  if (error) {
    console.error('Error fetching property types:', error);
    return [];
  }

  const types = new Set<string>();
  data?.forEach((listing) => {
    if (listing.property_type) {
      types.add(listing.property_type);
    }
  });

  return Array.from(types);
}

/**
 * Get similar listings based on property type, location, and price range
 */
export async function getSimilarListings(
  listing: Listing,
  limit = 4
): Promise<Listing[]> {
  const supabase = createServiceClient();

  // Build query for similar listings
  let query = supabase
    .from('listings')
    .select('*')
    .eq('published', true)
    .eq('available', true)
    .neq('id', listing.id)
    .is('deleted_at', null);

  // Same property type
  query = query.eq('property_type', listing.property_type);

  // Same status
  query = query.eq('status', listing.status);

  // Same neighborhood or district
  query = query.or(`location_neighborhood.eq.${listing.location_neighborhood},location_district.eq.${listing.location_district}`);

  // Similar price range (±30%)
  if (listing.price_amount) {
    const minPrice = listing.price_amount * 0.7;
    const maxPrice = listing.price_amount * 1.3;
    query = query.gte('price_amount', minPrice).lte('price_amount', maxPrice);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching similar listings:', error);
    return [];
  }

  // If not enough results, relax filters
  if (!data || data.length < limit) {
    const fallbackQuery = supabase
      .from('listings')
      .select('*')
      .eq('published', true)
      .eq('available', true)
      .neq('id', listing.id)
      .eq('property_type', listing.property_type)
      .eq('status', listing.status)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    const { data: fallbackData, error: fallbackError } = await fallbackQuery;

    if (fallbackError) {
      console.error('Error fetching fallback similar listings:', fallbackError);
      return (data as Listing[]) || [];
    }

    return (fallbackData as Listing[]) || [];
  }

  return (data as Listing[]) || [];
}
