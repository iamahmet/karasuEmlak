import { createServiceClient } from '@karasu/lib/supabase/service';

/**
 * Get popular tags from articles
 */
export async function getPopularTags(limit = 10): Promise<Array<{ name: string; count: number; slug: string }>> {
  const supabase = createServiceClient();

  const { data: articles, error } = await supabase
    .from('articles')
    .select('tags')
    .eq('status', 'published');

  if (error || !articles) {
    return [];
  }

  // Count tags
  const tagMap = new Map<string, number>();
  articles.forEach((article) => {
    if (article.tags && Array.isArray(article.tags)) {
      article.tags.forEach((tag: string) => {
        if (tag && typeof tag === 'string') {
          const normalizedTag = tag.trim().toLowerCase();
          if (normalizedTag) {
            const count = tagMap.get(normalizedTag) || 0;
            tagMap.set(normalizedTag, count + 1);
          }
        }
      });
    }
  });

  // Convert to array and sort by count
  return Array.from(tagMap.entries())
    .map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
