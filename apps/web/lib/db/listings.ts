/**
 * Listings Repository
 * 
 * Single source of truth for all listings database operations.
 * All listings queries must go through this repository.
 * 
 * Client Type Declaration:
 * - anon: Public reads (published, available, not deleted)
 * - service: Admin operations (all data, including drafts/deleted)
 */

import { createAnonServerClient, createServiceClient } from '@/lib/supabase/clients';
import type { SupabaseClient } from '@supabase/supabase-js';

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
  features: Record<string, any>;
  description_short?: string;
  description_long?: string;
  description_generated: boolean;
  images: any[];
  agent_name?: string;
  agent_phone?: string;
  agent_whatsapp?: string;
  agent_email?: string;
  keywords: string[];
  seo_keywords: string[];
  virtual_tour?: any;
  video_tour?: any;
  floor_plan?: any;
  available: boolean;
  published: boolean;
  featured: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ListingFilters {
  status?: 'satilik' | 'kiralik';
  property_type?: string;
  location_district?: string;
  location_neighborhood?: string;
  min_price?: number;
  max_price?: number;
  featured?: boolean;
}

export interface ListingSort {
  field: 'created_at' | 'updated_at' | 'price_amount' | 'featured';
  order: 'asc' | 'desc';
}

/**
 * Get listings (anon client - respects RLS)
 * 
 * @param filters - Filter options
 * @param sort - Sort options
 * @param limit - Maximum number of results
 * @param offset - Pagination offset
 * @returns Listings and total count
 */
/**
 * Get listings (anon server client - published only)
 * Used in server components, so uses createAnonServerClient()
 */
export async function getListings(
  filters?: ListingFilters,
  sort?: ListingSort,
  limit = 20,
  offset = 0
): Promise<{ listings: Listing[]; total: number }> {
  const supabase = await createAnonServerClient();
  return getListingsWithClient(supabase, filters, sort, limit, offset);
}

/**
 * Get listings (service client - bypasses RLS)
 * 
 * @param filters - Filter options
 * @param sort - Sort options
 * @param limit - Maximum number of results
 * @param offset - Pagination offset
 * @returns Listings and total count (includes unpublished/deleted)
 */
export async function getListingsAdmin(
  filters?: ListingFilters,
  sort?: ListingSort,
  limit = 20,
  offset = 0
): Promise<{ listings: Listing[]; total: number }> {
  const supabase = createServiceClient();
  return getListingsWithClient(supabase, filters, sort, limit, offset, false);
}

/**
 * Internal: Get listings with specified client
 */
async function getListingsWithClient(
  supabase: SupabaseClient,
  filters?: ListingFilters,
  sort?: ListingSort,
  limit = 20,
  offset = 0,
  publicOnly = true
): Promise<{ listings: Listing[]; total: number }> {
  let query = supabase
    .from('listings')
    .select('*', { count: 'exact' });

  // Public filter: only published, available, not deleted
  if (publicOnly) {
    query = query
      .eq('published', true)
      .eq('available', true)
      .is('deleted_at', null);
  }

  // Apply filters
  if (filters) {
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.property_type) {
      query = query.eq('property_type', filters.property_type);
    }
    if (filters.location_district) {
      query = query.eq('location_district', filters.location_district);
    }
    if (filters.location_neighborhood) {
      query = query.eq('location_neighborhood', filters.location_neighborhood);
    }
    if (filters.min_price !== undefined) {
      query = query.gte('price_amount', filters.min_price);
    }
    if (filters.max_price !== undefined) {
      query = query.lte('price_amount', filters.max_price);
    }
    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured);
    }
  }

  // Apply sorting
  const sortField = sort?.field || 'created_at';
  const sortOrder = sort?.order || 'desc';
  query = query.order(sortField, { ascending: sortOrder === 'asc' });

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('[listings.ts] Error fetching listings:', error);
    throw new Error(`Failed to fetch listings: ${error.message}`);
  }

  return {
    listings: (data as Listing[]) || [],
    total: count || 0,
  };
}

/**
 * Get single listing by slug (anon server client - published only)
 * Used in server components, so uses createAnonServerClient()
 */
export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const supabase = await createAnonServerClient();
  
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .eq('available', true)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('[listings.ts] Error fetching listing:', error);
    throw new Error(`Failed to fetch listing: ${error.message}`);
  }

  return data as Listing;
}

/**
 * Get single listing by slug (service client - includes unpublished)
 */
export async function getListingBySlugAdmin(slug: string): Promise<Listing | null> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('[listings.ts] Error fetching listing (admin):', error);
    throw new Error(`Failed to fetch listing: ${error.message}`);
  }

  return data as Listing;
}

/**
 * Create listing (service client only)
 */
export async function createListing(listing: Omit<Listing, 'id' | 'created_at' | 'updated_at'>): Promise<Listing> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('listings')
    .insert(listing)
    .select()
    .single();

  if (error) {
    console.error('[listings.ts] Error creating listing:', error);
    throw new Error(`Failed to create listing: ${error.message}`);
  }

  return data as Listing;
}

/**
 * Update listing (service client only)
 */
export async function updateListing(id: string, updates: Partial<Listing>): Promise<Listing> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('listings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[listings.ts] Error updating listing:', error);
    throw new Error(`Failed to update listing: ${error.message}`);
  }

  return data as Listing;
}

/**
 * Delete listing (soft delete - service client only)
 */
export async function deleteListing(id: string): Promise<void> {
  const supabase = createServiceClient();
  
  const { error } = await supabase
    .from('listings')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('[listings.ts] Error deleting listing:', error);
    throw new Error(`Failed to delete listing: ${error.message}`);
  }
}

/**
 * Get listing count by status (service client)
 */
export async function getListingCounts(): Promise<{
  total: number;
  published: number;
  draft: number;
  deleted: number;
}> {
  const supabase = createServiceClient();
  
  const [totalResult, publishedResult, draftResult, deletedResult] = await Promise.all([
    supabase.from('listings').select('*', { count: 'exact', head: true }),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('published', false),
    supabase.from('listings').select('*', { count: 'exact', head: true }).not('deleted_at', 'is', null),
  ]);

  return {
    total: totalResult.count || 0,
    published: publishedResult.count || 0,
    draft: draftResult.count || 0,
    deleted: deletedResult.count || 0,
  };
}
