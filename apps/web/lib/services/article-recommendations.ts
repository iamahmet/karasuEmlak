/**
 * Enhanced Article Recommendations
 * 
 * Intelligent article recommendation system using multiple signals
 */

import { Article } from '@/lib/supabase/queries/articles';
import { createServiceClient } from '@/lib/supabase/clients';

export interface RecommendationScore {
  article: Article;
  score: number;
  reasons: string[];
}

/**
 * Calculate similarity score between two articles
 */
function calculateSimilarity(article1: Article, article2: Article): number {
  let score = 0;
  const reasons: string[] = [];

  // Category match (40% weight)
  if (article1.category && article2.category && article1.category === article2.category) {
    score += 0.4;
    reasons.push('Aynı kategori');
  }

  // Tag overlap (30% weight)
  const tags1 = article1.tags || [];
  const tags2 = article2.tags || [];
  if (tags1.length > 0 && tags2.length > 0) {
    const commonTags = tags1.filter(tag => tags2.includes(tag));
    if (commonTags.length > 0) {
      score += (commonTags.length / Math.max(tags1.length, tags2.length)) * 0.3;
      reasons.push(`${commonTags.length} ortak etiket`);
    }
  }

  // Title keyword overlap (20% weight)
  const title1Words = (article1.title || '').toLowerCase().split(/\s+/);
  const title2Words = (article2.title || '').toLowerCase().split(/\s+/);
  const commonWords = title1Words.filter(word => 
    word.length > 3 && title2Words.includes(word)
  );
  if (commonWords.length > 0) {
    score += (commonWords.length / Math.max(title1Words.length, title2Words.length)) * 0.2;
    reasons.push('Benzer başlık kelimeleri');
  }

  // Content keyword overlap (10% weight)
  const content1 = (article1.content || '').toLowerCase();
  const content2 = (article2.content || '').toLowerCase();
  const importantKeywords = ['karasu', 'kocaali', 'satılık', 'kiralık', 'villa', 'daire', 'ev'];
  const matchingKeywords = importantKeywords.filter(keyword => 
    content1.includes(keyword) && content2.includes(keyword)
  );
  if (matchingKeywords.length > 0) {
    score += (matchingKeywords.length / importantKeywords.length) * 0.1;
    reasons.push('Benzer içerik anahtar kelimeleri');
  }

  return Math.min(1, score);
}

/**
 * Get intelligent article recommendations
 */
export async function getIntelligentRecommendations(
  currentArticle: Article,
  limit: number = 6
): Promise<RecommendationScore[]> {
  const supabase = createServiceClient();

  // Fetch candidate articles
  const { data: candidates, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .neq('id', currentArticle.id)
    .order('published_at', { ascending: false })
    .limit(limit * 3); // Get more candidates for better scoring

  if (error || !candidates) {
    console.error('Error fetching recommendation candidates:', error);
    return [];
  }

  // Calculate similarity scores
  const scored: RecommendationScore[] = candidates.map(article => {
    const score = calculateSimilarity(currentArticle, article as Article);
    return {
      article: article as Article,
      score,
      reasons: [],
    };
  });

  // Sort by score and take top results
  const topRecommendations = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .filter(item => item.score > 0.1); // Only include if similarity > 10%

  // Add recency boost for recent articles
  const now = new Date();
  topRecommendations.forEach(item => {
    if (item.article.published_at) {
      const publishedDate = new Date(item.article.published_at);
      const daysSincePublished = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSincePublished < 30) {
        item.score += 0.1; // Boost for recent articles
        item.reasons.push('Yeni yayın');
      }
    }
  });

  // Re-sort after recency boost
  return topRecommendations.sort((a, b) => b.score - a.score);
}

/**
 * Get trending articles
 */
export async function getTrendingArticles(limit: number = 5): Promise<Article[]> {
  const supabase = createServiceClient();

  // Get recent articles with high engagement potential
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit * 2);

  if (error || !data) {
    return [];
  }

  // Filter and prioritize by:
  // 1. Recent (last 30 days)
  // 2. Has category
  // 3. Has excerpt
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const trending = (data as Article[])
    .filter(article => {
      if (!article.published_at) return false;
      const publishedDate = new Date(article.published_at);
      return publishedDate >= thirtyDaysAgo;
    })
    .sort((a, b) => {
      // Prioritize articles with category and excerpt
      let scoreA = 0;
      let scoreB = 0;

      if (a.category) scoreA += 1;
      if (a.excerpt) scoreA += 1;
      if (b.category) scoreB += 1;
      if (b.excerpt) scoreB += 1;

      return scoreB - scoreA;
    })
    .slice(0, limit);

  return trending;
}

/**
 * Get articles by topic/keyword
 */
export async function getArticlesByTopic(
  topic: string,
  limit: number = 5
): Promise<Article[]> {
  const supabase = createServiceClient();
  const topicLower = topic.toLowerCase();

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .or(`title.ilike.%${topicLower}%,content.ilike.%${topicLower}%,category.ilike.%${topicLower}%`)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return (data as Article[]) || [];
}
