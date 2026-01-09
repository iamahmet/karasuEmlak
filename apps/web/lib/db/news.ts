/**
 * News Articles Repository
 * 
 * Single source of truth for all news articles database operations.
 * 
 * Client Type Declaration:
 * - anon: Public reads (published = true only)
 * - service: Admin operations (all data)
 */

import { createAnonServerClient, createServiceClient } from '@/lib/supabase/clients';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  source_url: string;
  source_domain: string;
  source_article_id?: string;
  original_summary: string;
  emlak_analysis?: string;
  emlak_analysis_generated: boolean;
  related_neighborhoods: string[];
  related_listings: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords: string[];
  published_at: string;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  cover_image?: string;
  og_image?: string;
  discover_eligible: boolean;
  discover_headline?: string;
  discover_image?: string;
  scheduled_publish_at?: string;
}

export interface NewsFilters {
  featured?: boolean;
  related_neighborhood?: string;
  published?: boolean;
}

/**
 * Get news articles (anon server client - published only)
 * Used in server components, so uses createAnonServerClient()
 */
export async function getNewsArticles(
  filters?: NewsFilters,
  limit = 20,
  offset = 0
): Promise<{ articles: NewsArticle[]; total: number }> {
  const supabase = await createAnonServerClient();
  return getNewsArticlesWithClient(supabase, filters, limit, offset, true);
}

/**
 * Get news articles (service client - all data)
 */
export async function getNewsArticlesAdmin(
  filters?: NewsFilters,
  limit = 20,
  offset = 0
): Promise<{ articles: NewsArticle[]; total: number }> {
  const supabase = createServiceClient();
  return getNewsArticlesWithClient(supabase, filters, limit, offset, false);
}

async function getNewsArticlesWithClient(
  supabase: SupabaseClient,
  filters?: NewsFilters,
  limit = 20,
  offset = 0,
  publicOnly = true
): Promise<{ articles: NewsArticle[]; total: number }> {
  let query = supabase
    .from('news_articles')
    .select('*', { count: 'exact' });

  if (publicOnly) {
    query = query
      .eq('published', true)
      .is('deleted_at', null);
  }

  if (filters) {
    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured);
    }
    if (filters.related_neighborhood) {
      query = query.contains('related_neighborhoods', [filters.related_neighborhood]);
    }
    if (filters.published !== undefined && !publicOnly) {
      query = query.eq('published', filters.published);
    }
  }

  query = query
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('[news.ts] Error fetching news articles:', error);
    throw new Error(`Failed to fetch news articles: ${error.message}`);
  }

  return {
    articles: (data as NewsArticle[]) || [],
    total: count || 0,
  };
}

/**
 * Get news article by slug (anon server client - published only)
 * Used in server components, so uses createAnonServerClient()
 */
export async function getNewsArticleBySlug(slug: string): Promise<NewsArticle | null> {
  const supabase = await createAnonServerClient();
  
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('[news.ts] Error fetching news article:', error);
    throw new Error(`Failed to fetch news article: ${error.message}`);
  }

  return data as NewsArticle;
}

/**
 * Get news article by slug (service client - all data)
 */
export async function getNewsArticleBySlugAdmin(slug: string): Promise<NewsArticle | null> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('[news.ts] Error fetching news article (admin):', error);
    throw new Error(`Failed to fetch news article: ${error.message}`);
  }

  return data as NewsArticle;
}

/**
 * Create news article (service client only)
 */
export async function createNewsArticle(article: Omit<NewsArticle, 'id' | 'created_at' | 'updated_at'>): Promise<NewsArticle> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('news_articles')
    .insert(article)
    .select()
    .single();

  if (error) {
    console.error('[news.ts] Error creating news article:', error);
    throw new Error(`Failed to create news article: ${error.message}`);
  }

  return data as NewsArticle;
}

/**
 * Update news article (service client only)
 */
export async function updateNewsArticle(id: string, updates: Partial<NewsArticle>): Promise<NewsArticle> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('news_articles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[news.ts] Error updating news article:', error);
    throw new Error(`Failed to update news article: ${error.message}`);
  }

  return data as NewsArticle;
}

/**
 * Delete news article (soft delete - service client only)
 */
export async function deleteNewsArticle(id: string): Promise<void> {
  const supabase = createServiceClient();
  
  const { error } = await supabase
    .from('news_articles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('[news.ts] Error deleting news article:', error);
    throw new Error(`Failed to delete news article: ${error.message}`);
  }
}
