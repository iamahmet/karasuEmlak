/**
 * Content queries for Supabase
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'pending' | 'approved' | 'published' | 'rejected';
  author_id?: string;
  category?: string;
  tags?: string[];
  featured_image?: string;
  seo_title?: string;
  seo_description?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentQueryOptions {
  status?: string | string[];
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

/**
 * Get content items with filters
 */
export async function getContentItems(
  supabase: SupabaseClient,
  options: ContentQueryOptions = {}
): Promise<{ data: ContentItem[] | null; error: Error | null }> {
  const { status, limit = 10, offset = 0, orderBy = 'created_at', orderDirection = 'desc' } = options;

  let query = supabase
    .from('content_studio')
    .select('*')
    .order(orderBy, { ascending: orderDirection === 'asc' })
    .range(offset, offset + limit - 1);

  if (status) {
    if (Array.isArray(status)) {
      query = query.in('status', status);
    } else {
      query = query.eq('status', status);
    }
  }

  const { data, error } = await query;

  return { data, error: error as Error | null };
}

/**
 * Get single content item by ID
 */
export async function getContentById(
  supabase: SupabaseClient,
  id: string
): Promise<{ data: ContentItem | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('content_studio')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error: error as Error | null };
}

/**
 * Get content item by slug
 */
export async function getContentBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<{ data: ContentItem | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('content_studio')
    .select('*')
    .eq('slug', slug)
    .single();

  return { data, error: error as Error | null };
}

/**
 * Create new content item
 */
export async function createContent(
  supabase: SupabaseClient,
  content: Partial<ContentItem>
): Promise<{ data: ContentItem | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('content_studio')
    .insert(content)
    .select()
    .single();

  return { data, error: error as Error | null };
}

/**
 * Update content item
 */
export async function updateContent(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<ContentItem>
): Promise<{ data: ContentItem | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('content_studio')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  return { data, error: error as Error | null };
}

/**
 * Delete content item
 */
export async function deleteContent(
  supabase: SupabaseClient,
  id: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('content_studio')
    .delete()
    .eq('id', id);

  return { error: error as Error | null };
}
