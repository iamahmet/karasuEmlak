/**
 * Related Content Utility
 * 
 * Fetches related blog articles and content based on page context
 * for SEO and user engagement purposes
 */

import { Article } from '@/lib/supabase/queries/articles';
import { createServiceClient } from '@/lib/supabase/clients';
import { safeJsonParse } from '@/lib/utils/safeJsonParse';

export interface RelatedContentOptions {
  keywords?: string[];
  location?: string;
  category?: string;
  tags?: string[];
  limit?: number;
  excludeIds?: string[];
}

/**
 * Get related articles based on page context
 * Uses intelligent matching: keywords, location, category, tags
 */
export async function getRelatedContent(
  options: RelatedContentOptions
): Promise<Article[]> {
  const {
    keywords = [],
    location,
    category,
    tags = [],
    limit = 6,
    excludeIds = [],
  } = options;

  const supabase = createServiceClient();

  // Build search terms from all inputs
  const searchTerms: string[] = [];
  
  if (location) {
    searchTerms.push(location.toLowerCase());
  }
  
  if (category) {
    searchTerms.push(category.toLowerCase());
  }
  
  keywords.forEach(kw => {
    if (kw && kw.length > 2) {
      searchTerms.push(kw.toLowerCase());
    }
  });
  
  tags.forEach(tag => {
    if (tag && tag.length > 2) {
      searchTerms.push(tag.toLowerCase());
    }
  });

  // If no search terms, return empty
  if (searchTerms.length === 0) {
    return [];
  }

  // Build query - search in title, content, excerpt, category, tags
  let query = supabase
    .from('articles')
    .select('*')
    .eq('status', 'published');

  // Exclude specific IDs
  if (excludeIds.length > 0) {
    excludeIds.forEach(id => {
      query = query.neq('id', id);
    });
  }

  // Build OR conditions for search terms
  const orConditions: string[] = [];
  
  searchTerms.forEach(term => {
    orConditions.push(`title.ilike.%${term}%`);
    orConditions.push(`excerpt.ilike.%${term}%`);
    orConditions.push(`content.ilike.%${term}%`);
    orConditions.push(`category.ilike.%${term}%`);
  });

  if (orConditions.length > 0) {
    query = query.or(orConditions.join(','));
  }

  // Order by relevance (published_at desc for recency)
  const { data, error } = await query
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('views', { ascending: false })
    .limit(limit * 2); // Get more for filtering

  if (error) {
    console.error('[getRelatedContent] Error fetching articles:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Score and rank articles by relevance
  const scored = (data as Article[]).map(article => {
    let score = 0;
    
    // Title match (highest weight)
    const titleLower = (article.title || '').toLowerCase();
    searchTerms.forEach(term => {
      if (titleLower.includes(term)) {
        score += 10;
      }
    });

    // Category match
    if (category && article.category?.toLowerCase() === category.toLowerCase()) {
      score += 8;
    }

    // Tag match
    let articleTags: string[] = [];
    try {
      if (Array.isArray(article.tags)) {
        articleTags = article.tags.map(t => String(t).toLowerCase());
      } else if (typeof article.tags === 'string') {
        // Use safeJsonParse instead of direct JSON.parse (can be malformed JSON from DB)
        const parsed = safeJsonParse(article.tags, [], 'related-content.tags');
        articleTags = Array.isArray(parsed) 
          ? parsed.map(t => String(t).toLowerCase())
          : [];
        if (!Array.isArray(parsed) || parsed.length === 0) {
          // If not JSON, treat as comma-separated string
          const tagsString = String(article.tags);
          articleTags = tagsString.split(',').map(t => t.trim().toLowerCase());
        }
      }
    } catch (error) {
      console.error('[getRelatedContent] Error parsing article tags:', error);
      articleTags = [];
    }
    
    tags.forEach(tag => {
      if (articleTags.includes(tag.toLowerCase())) {
        score += 5;
      }
    });

    // Location match in content
    if (location) {
      const contentLower = (article.content || '').toLowerCase();
      const excerptLower = (article.excerpt || '').toLowerCase();
      if (contentLower.includes(location.toLowerCase()) || 
          excerptLower.includes(location.toLowerCase())) {
        score += 6;
      }
    }

    // Keyword match in content
    keywords.forEach(kw => {
      const contentLower = (article.content || '').toLowerCase();
      if (contentLower.includes(kw.toLowerCase())) {
        score += 3;
      }
    });

    // Recency boost (articles from last 30 days get +2)
    if (article.published_at) {
      const publishedDate = new Date(article.published_at);
      const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSincePublished < 30) {
        score += 2;
      }
    }

    // Views boost (popular articles get +1)
    if (article.views > 100) {
      score += 1;
    }

    return { article, score };
  });

  // Sort by score and take top results
  const topArticles = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .filter(item => item.score > 0) // Only include if there's some relevance
    .map(item => item.article);

  return topArticles;
}

/**
 * Get related articles for a specific page context
 * Convenience function with common patterns
 */
export async function getRelatedArticlesForPage(
  pageTitle: string,
  pageKeywords: string[],
  location?: string,
  limit: number = 6
): Promise<Article[]> {
  return getRelatedContent({
    keywords: [...pageKeywords, ...pageTitle.toLowerCase().split(/\s+/)],
    location,
    limit,
  });
}
