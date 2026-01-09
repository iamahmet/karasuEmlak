import { createServiceClient } from '@karasu/lib/supabase/service';
import { Article } from './articles';
import { normalizeCategoryName, categoryToSlug } from '@/lib/utils/category-utils';

/**
 * Get blog categories with article counts
 * Categories are normalized to ensure consistency
 */
export async function getBlogCategories(): Promise<Array<{ name: string; slug: string; count: number }>> {
  const supabase = createServiceClient();

  const { data: articles, error } = await supabase
    .from('articles')
    .select('category')
    .eq('status', 'published');

  if (error || !articles) {
    return [];
  }

  // Count articles by category (normalized)
  const categoryMap = new Map<string, number>();
  articles.forEach((article) => {
    const normalizedCategory = normalizeCategoryName(article.category);
    if (normalizedCategory) {
      const count = categoryMap.get(normalizedCategory) || 0;
      categoryMap.set(normalizedCategory, count + 1);
    }
  });

  // Convert to array and sort by count
  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({
      name,
      slug: categoryToSlug(name),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get popular articles (by views)
 */
export async function getPopularArticles(limit = 5): Promise<Article[]> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('views', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching popular articles:', error);
    return [];
  }

  return (data as Article[]) || [];
}
