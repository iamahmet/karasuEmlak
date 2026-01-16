/**
 * Client-side listings API
 * For infinite scroll and dynamic loading
 */

import type { Listing, ListingFilters, ListingSort } from '@/lib/supabase/queries';

export interface FetchListingsParams {
  filters?: ListingFilters;
  sort?: ListingSort;
  limit?: number;
  offset?: number;
  basePath?: string;
}

export interface FetchListingsResponse {
  listings: Listing[];
  total: number;
  hasMore: boolean;
}

/**
 * Fetch listings from API
 */
export async function fetchListings({
  filters = {},
  sort = { field: 'created_at', order: 'desc' },
  limit = 18,
  offset = 0,
  basePath = '',
}: FetchListingsParams): Promise<FetchListingsResponse> {
  try {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.status) params.set('status', filters.status);
    if (filters.property_type?.length) params.set('property_type', filters.property_type.join(','));
    if (filters.location_neighborhood?.length) params.set('neighborhood', filters.location_neighborhood.join(','));
    if (filters.min_price) params.set('minPrice', filters.min_price.toString());
    if (filters.max_price) params.set('maxPrice', filters.max_price.toString());
    if (filters.min_size) params.set('minSize', filters.min_size.toString());
    if (filters.max_size) params.set('maxSize', filters.max_size.toString());
    if (filters.rooms?.length) params.set('rooms', filters.rooms.join(','));
    if (filters.query) params.set('q', filters.query);
    if (filters.balcony) params.set('balcony', 'true');
    if (filters.parking) params.set('parking', 'true');
    if (filters.elevator) params.set('elevator', 'true');
    if (filters.seaView) params.set('seaView', 'true');
    if (filters.furnished) params.set('furnished', 'true');
    
    // Add sort
    params.set('sort', `${sort.field}-${sort.order}`);
    
    // Add pagination
    params.set('limit', limit.toString());
    params.set('offset', offset.toString());

    const response = await fetch(`${basePath}/api/listings?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch listings: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch listings');
    }

    const listings = data.data?.listings || [];
    const total = data.data?.total || 0;
    const hasMore = offset + limit < total;

    return {
      listings,
      total,
      hasMore,
    };
  } catch (error) {
    console.error('Error fetching listings:', error);
    return {
      listings: [],
      total: 0,
      hasMore: false,
    };
  }
}
