/**
 * Neighborhoods Repository
 * 
 * Single source of truth for all neighborhoods database operations.
 * 
 * Client Type Declaration:
 * - anon: Public reads (published = true, deleted_at IS NULL)
 * - service: Admin operations (all data)
 */

import { createAnonServerClient, createServiceClient } from '@/lib/supabase/clients';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface Neighborhood {
  id: string;
  slug: string;
  name: string;
  district: string;
  city: string;
  description?: string;
  content_generated: boolean;
  seo_content: Record<string, any>;
  faqs: any[];
  stats: Record<string, any>;
  coordinates_lat?: number;
  coordinates_lng?: number;
  published: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NeighborhoodFilters {
  district?: string;
  city?: string;
  published?: boolean;
}

/**
 * Get neighborhoods (anon server client - published only)
 * Used in server components, so uses createAnonServerClient()
 */
export async function getNeighborhoods(
  filters?: NeighborhoodFilters,
  limit = 100,
  offset = 0
): Promise<{ neighborhoods: Neighborhood[]; total: number }> {
  const supabase = await createAnonServerClient();
  return getNeighborhoodsWithClient(supabase, filters, limit, offset, true);
}

/**
 * Get neighborhoods (service client - all data)
 */
export async function getNeighborhoodsAdmin(
  filters?: NeighborhoodFilters,
  limit = 100,
  offset = 0
): Promise<{ neighborhoods: Neighborhood[]; total: number }> {
  const supabase = createServiceClient();
  return getNeighborhoodsWithClient(supabase, filters, limit, offset, false);
}

async function getNeighborhoodsWithClient(
  supabase: SupabaseClient,
  filters?: NeighborhoodFilters,
  limit = 100,
  offset = 0,
  publicOnly = true
): Promise<{ neighborhoods: Neighborhood[]; total: number }> {
  let query = supabase
    .from('neighborhoods')
    .select('*', { count: 'exact' });

  if (publicOnly) {
    query = query
      .eq('published', true)
      .is('deleted_at', null);
  }

  if (filters) {
    if (filters.district) {
      query = query.eq('district', filters.district);
    }
    if (filters.city) {
      query = query.eq('city', filters.city);
    }
    if (filters.published !== undefined && !publicOnly) {
      query = query.eq('published', filters.published);
    }
  }

  query = query
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('[neighborhoods.ts] Error fetching neighborhoods:', error);
    throw new Error(`Failed to fetch neighborhoods: ${error.message}`);
  }

  return {
    neighborhoods: (data as Neighborhood[]) || [],
    total: count || 0,
  };
}

/**
 * Get neighborhood by slug (anon server client - published only)
 * Used in server components, so uses createAnonServerClient()
 */
export async function getNeighborhoodBySlug(slug: string): Promise<Neighborhood | null> {
  const supabase = await createAnonServerClient();
  
  const { data, error } = await supabase
    .from('neighborhoods')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('[neighborhoods.ts] Error fetching neighborhood:', error);
    throw new Error(`Failed to fetch neighborhood: ${error.message}`);
  }

  return data as Neighborhood;
}

/**
 * Get neighborhood by slug (service client - all data)
 */
export async function getNeighborhoodBySlugAdmin(slug: string): Promise<Neighborhood | null> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('neighborhoods')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('[neighborhoods.ts] Error fetching neighborhood (admin):', error);
    throw new Error(`Failed to fetch neighborhood: ${error.message}`);
  }

  return data as Neighborhood;
}

/**
 * Create neighborhood (service client only)
 */
export async function createNeighborhood(neighborhood: Omit<Neighborhood, 'id' | 'created_at' | 'updated_at'>): Promise<Neighborhood> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('neighborhoods')
    .insert(neighborhood)
    .select()
    .single();

  if (error) {
    console.error('[neighborhoods.ts] Error creating neighborhood:', error);
    throw new Error(`Failed to create neighborhood: ${error.message}`);
  }

  return data as Neighborhood;
}

/**
 * Update neighborhood (service client only)
 */
export async function updateNeighborhood(id: string, updates: Partial<Neighborhood>): Promise<Neighborhood> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('neighborhoods')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[neighborhoods.ts] Error updating neighborhood:', error);
    throw new Error(`Failed to update neighborhood: ${error.message}`);
  }

  return data as Neighborhood;
}

/**
 * Delete neighborhood (soft delete - service client only)
 */
export async function deleteNeighborhood(id: string): Promise<void> {
  const supabase = createServiceClient();
  
  const { error } = await supabase
    .from('neighborhoods')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('[neighborhoods.ts] Error deleting neighborhood:', error);
    throw new Error(`Failed to delete neighborhood: ${error.message}`);
  }
}
