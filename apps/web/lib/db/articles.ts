/**
 * Articles Repository
 * 
 * Single source of truth for all articles (blog posts) database operations.
 * 
 * Client Type Declaration:
 * - anon: Public reads (status = 'published' only)
 * - service: Admin operations (all statuses)
 */

import { createAnonServerClient, createServiceClient } from '@/lib/supabase/clients';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  meta_description?: string;
  keywords?: string[];
  author: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'published' | 'archived';
  featured_image?: string;
  category?: string;
  tags?: string[];
  views: number;
  seo_score?: number;
  discover_eligible: boolean;
  discover_headline?: string;
  discover_image?: string;
  internal_links: any[];
  scheduled_publish_at?: string;
}

export interface ArticleFilters {
  category?: string;
  tags?: string[];
  author?: string;
  status?: 'draft' | 'published' | 'archived';
}

/**
 * Get articles (anon server client - published only)
 * Used in server components, so uses createAnonServerClient()
 */
export async function getArticles(
  filters?: ArticleFilters,
  limit = 20,
  offset = 0
): Promise<{ articles: Article[]; total: number }> {
  const supabase = await createAnonServerClient();
  return getArticlesWithClient(supabase, filters, limit, offset, true);
}

/**
 * Get articles (service client - all statuses)
 */
export async function getArticlesAdmin(
  filters?: ArticleFilters,
  limit = 20,
  offset = 0
): Promise<{ articles: Article[]; total: number }> {
  const supabase = createServiceClient();
  return getArticlesWithClient(supabase, filters, limit, offset, false);
}

async function getArticlesWithClient(
  supabase: SupabaseClient,
  filters?: ArticleFilters,
  limit = 20,
  offset = 0,
  publicOnly = true
): Promise<{ articles: Article[]; total: number }> {
  let query = supabase
    .from('articles')
    .select('*', { count: 'exact' });

  if (publicOnly) {
    query = query.eq('status', 'published');
  }

  if (filters) {
    if (filters.category) {
      // Use case-insensitive exact matching for categories
      // ilike is already case-insensitive, so we use exact match
      const normalizedCategory = filters.category.trim();
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('[getArticles] Filtering by category:', normalizedCategory);
      }
      
      query = query.ilike('category', normalizedCategory);
    }
    if (filters.author) {
      query = query.eq('author', filters.author);
    }
    if (filters.status && !publicOnly) {
      query = query.eq('status', filters.status);
    }
  }

  query = query
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('[articles.ts] Error fetching articles:', error);
    throw new Error(`Failed to fetch articles: ${error.message}`);
  }

  return {
    articles: (data as Article[]) || [],
    total: count || 0,
  };
}

/**
 * Get article by slug (anon server client - published only)
 * Used in server components, so uses createAnonServerClient()
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = await createAnonServerClient();
  
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('[articles.ts] Error fetching article:', error);
    throw new Error(`Failed to fetch article: ${error.message}`);
  }

  return data as Article;
}

/**
 * Get article by slug (service client - all statuses)
 */
export async function getArticleBySlugAdmin(slug: string): Promise<Article | null> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('[articles.ts] Error fetching article (admin):', error);
    throw new Error(`Failed to fetch article: ${error.message}`);
  }

  return data as Article;
}

/**
 * Create article (service client only)
 */
export async function createArticle(article: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'views'>): Promise<Article> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('articles')
    .insert({
      ...article,
      views: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('[articles.ts] Error creating article:', error);
    throw new Error(`Failed to create article: ${error.message}`);
  }

  return data as Article;
}

/**
 * Update article (service client only)
 */
export async function updateArticle(id: string, updates: Partial<Article>): Promise<Article> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('articles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[articles.ts] Error updating article:', error);
    throw new Error(`Failed to update article: ${error.message}`);
  }

  return data as Article;
}

/**
 * Delete article (service client only)
 */
export async function deleteArticle(id: string): Promise<void> {
  const supabase = createServiceClient();
  
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[articles.ts] Error deleting article:', error);
    throw new Error(`Failed to delete article: ${error.message}`);
  }
}

/**
 * Increment article views (anon server client)
 * Used in server components, so uses createAnonServerClient()
 */
export async function incrementArticleViews(slug: string): Promise<void> {
  const supabase = await createAnonServerClient();
  
  const { error } = await supabase.rpc('increment_article_views', { article_slug: slug });
  
  if (error) {
    // Fallback: manual update with service client
    const serviceSupabase = createServiceClient();
    const article = await getArticleBySlugAdmin(slug);
    if (article) {
      await serviceSupabase
        .from('articles')
        .update({ views: (article.views || 0) + 1 })
        .eq('id', article.id);
    }
  }
}
