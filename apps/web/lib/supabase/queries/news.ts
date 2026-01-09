import { createServiceClient } from '@karasu/lib/supabase/service';

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  source_url: string;
  source_domain: string;
  original_summary: string;
  emlak_analysis?: string;
  emlak_analysis_generated: boolean;
  related_neighborhoods?: string[];
  related_listings?: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  published_at?: string;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  cover_image?: string;
  og_image?: string;
}

/**
 * Get all published news articles
 */
export async function getNewsArticles(limit = 50, offset = 0): Promise<{ articles: NewsArticle[]; total: number }> {
  const supabase = createServiceClient();

  const { data, error, count } = await supabase
    .from('news_articles')
    .select('*', { count: 'exact' })
    .eq('published', true)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching news articles:', error);
    return { articles: [], total: 0 };
  }

  return {
    articles: (data as NewsArticle[]) || [],
    total: count || 0,
  };
}

/**
 * Get a single news article by slug
 */
export async function getNewsArticleBySlug(slug: string): Promise<NewsArticle | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) {
    console.error('Error fetching news article:', error);
    return null;
  }

  return data as NewsArticle;
}

/**
 * Get featured news articles
 */
export async function getFeaturedNewsArticles(limit = 3): Promise<NewsArticle[]> {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error: any) {
    console.error('Error creating service client for getFeaturedNewsArticles:', error.message);
    return [];
  }

  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('published', true)
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured news articles:', error);
    return [];
  }

  return (data as NewsArticle[]) || [];
}

