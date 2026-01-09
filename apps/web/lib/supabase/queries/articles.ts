import { createServiceClient } from '@karasu/lib/supabase/service';
import { wrapQuery, QueryOptions } from '../query-wrapper';

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
}

/**
 * Get all published articles
 */
export async function getArticles(limit = 50, offset = 0): Promise<{ articles: Article[]; total: number }> {
  const supabase = createServiceClient();

  const { data, error, count } = await supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching articles:', error);
    return { articles: [], total: 0 };
  }

  return {
    articles: (data as Article[]) || [],
    total: count || 0,
  };
}

/**
 * Get a single article by slug
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }

  return data as Article;
}

/**
 * Get featured articles
 */
export async function getFeaturedArticles(limit = 3): Promise<Article[]> {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error: any) {
    console.error('Error creating service client for getFeaturedArticles:', error.message);
    return [];
  }

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('views', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured articles:', error);
    return [];
  }

  return (data as Article[]) || [];
}

/**
 * Get related articles based on category and tags
 */
export async function getRelatedArticles(
  article: Article,
  limit = 3
): Promise<Article[]> {
  const supabase = createServiceClient();

  // Build query for related articles
  let query = supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .neq('id', article.id);

  // Same category
  if (article.category) {
    query = query.eq('category', article.category);
  }

  const { data, error } = await query
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }

  // If not enough results, get any recent articles
  if (!data || data.length < limit) {
    const fallbackQuery = supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .neq('id', article.id)
      .order('published_at', { ascending: false })
      .limit(limit);

    const { data: fallbackData, error: fallbackError } = await fallbackQuery;

    if (fallbackError) {
      console.error('Error fetching fallback related articles:', fallbackError);
      return (data as Article[]) || [];
    }

    return (fallbackData as Article[]) || [];
  }

  return (data as Article[]) || [];
}

/**
 * Get adjacent (previous and next) articles for navigation
 */
export async function getAdjacentArticles(
  currentId: string,
  publishedAt?: string | null
): Promise<{ previous: Article | null; next: Article | null }> {
  const supabase = createServiceClient();

  const publishDate = publishedAt || new Date().toISOString();

  // Get previous article (older)
  const { data: previousData } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, featured_image')
    .eq('status', 'published')
    .neq('id', currentId)
    .lt('published_at', publishDate)
    .order('published_at', { ascending: false })
    .limit(1)
    .single();

  // Get next article (newer)
  const { data: nextData } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, featured_image')
    .eq('status', 'published')
    .neq('id', currentId)
    .gt('published_at', publishDate)
    .order('published_at', { ascending: true })
    .limit(1)
    .single();

  return {
    previous: previousData as Article | null,
    next: nextData as Article | null,
  };
}

/**
 * Increment article view count
 */
export async function incrementArticleViews(articleId: string): Promise<void> {
  const supabase = createServiceClient();

  await supabase.rpc('increment_article_views', { article_id: articleId });
}

