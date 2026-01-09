/**
 * Enhanced Internal Linking System
 * Smart, context-aware internal linking with relevance scoring
 */

import { createServiceClient } from '@karasu/lib/supabase/service';

export interface EnhancedInternalLink {
  url: string;
  anchor: string;
  title: string;
  relevance: number; // 0-1 score
  context: string;
  type: 'blog' | 'news' | 'listing' | 'neighborhood' | 'hub' | 'page';
}

export interface LinkContext {
  content: string;
  location?: string;
  category?: string;
  tags?: string[];
  propertyType?: string;
  priceRange?: { min?: number; max?: number };
}

/**
 * Calculate relevance score for a link
 */
function calculateRelevance(
  link: { title: string; content?: string; location?: string; category?: string },
  context: LinkContext
): number {
  let score = 0.5; // Base score

  // Location match
  if (context.location && link.location) {
    const contextLoc = context.location.toLowerCase();
    const linkLoc = link.location.toLowerCase();
    if (contextLoc.includes(linkLoc) || linkLoc.includes(contextLoc)) {
      score += 0.3;
    }
  }

  // Category match
  if (context.category && link.category) {
    if (context.category.toLowerCase() === link.category.toLowerCase()) {
      score += 0.2;
    }
  }

  // Content similarity (simple keyword matching)
  if (context.content && link.content) {
    const contextWords = context.content.toLowerCase().split(/\s+/);
    const linkWords = link.content.toLowerCase().split(/\s+/);
    const commonWords = contextWords.filter((w) => linkWords.includes(w));
    score += Math.min(commonWords.length * 0.05, 0.2);
  }

  return Math.min(score, 1.0);
}

/**
 * Generate enhanced internal links with relevance scoring
 */
export async function generateEnhancedInternalLinks(
  contentType: 'blog' | 'news' | 'listing' | 'neighborhood',
  contentSlug: string,
  context: LinkContext
): Promise<EnhancedInternalLink[]> {
  const supabase = createServiceClient();
  const links: EnhancedInternalLink[] = [];

  try {
    // Hub links (always high relevance)
    if (contentType === 'blog' || contentType === 'news') {
      const location = context.location?.toLowerCase() || '';
      if (location.includes('karasu')) {
        links.push({
          url: '/karasu',
          anchor: 'Karasu emlak rehberi',
          title: 'Karasu Emlak Rehberi',
          relevance: 0.9,
          context: 'Hub connection',
          type: 'hub',
        });
      } else if (location.includes('kocaali')) {
        links.push({
          url: '/kocaali',
          anchor: 'Kocaali emlak rehberi',
          title: 'Kocaali Emlak Rehberi',
          relevance: 0.9,
          context: 'Hub connection',
          type: 'hub',
        });
      }
    }

    // Neighborhood links with relevance
    if (contentType === 'blog' || contentType === 'news' || contentType === 'listing') {
      const { data: neighborhoods } = await supabase
        .from('neighborhoods')
        .select('id, name, slug, description')
        .eq('published', true)
        .limit(5);

      if (neighborhoods) {
        neighborhoods.forEach((neighborhood: any) => {
          const relevance = calculateRelevance(
            {
              title: neighborhood.name,
              content: neighborhood.description,
              location: neighborhood.name,
            },
            context
          );

          if (relevance > 0.4) {
            links.push({
              url: `/mahalle/${neighborhood.slug}`,
              anchor: `${neighborhood.name} mahallesi`,
              title: `${neighborhood.name} Mahallesi`,
              relevance,
              context: 'Related neighborhood',
              type: 'neighborhood',
            });
          }
        });
      }
    }

    // Related content links
    if (contentType === 'blog') {
      const { data: articles } = await supabase
        .from('articles')
        .select('id, title, slug, excerpt, category')
        .eq('status', 'published')
        .neq('slug', contentSlug)
        .limit(5);

      if (articles) {
        articles.forEach((article: any) => {
          const relevance = calculateRelevance(
            {
              title: article.title,
              content: article.excerpt || article.title,
              category: article.category,
            },
            context
          );

          if (relevance > 0.5) {
            links.push({
              url: `/blog/${article.slug}`,
              anchor: article.title,
              title: article.title,
              relevance,
              context: 'Related article',
              type: 'blog',
            });
          }
        });
      }
    }

    // Listing index links
    if (contentType === 'blog' || contentType === 'news') {
      links.push({
        url: '/satilik',
        anchor: 'Karasu satılık evler',
        title: 'Satılık İlanlar',
        relevance: 0.7,
        context: 'Listing index',
        type: 'page',
      });
      links.push({
        url: '/kiralik',
        anchor: 'Karasu kiralık evler',
        title: 'Kiralık İlanlar',
        relevance: 0.7,
        context: 'Listing index',
        type: 'page',
      });
    }

    // Sort by relevance and return top links
    return links
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 6); // Top 6 most relevant links
  } catch (error) {
    console.error('Error generating enhanced internal links:', error);
    return [];
  }
}

/**
 * Inject internal links into content
 */
export function injectInternalLinks(
  content: string,
  links: EnhancedInternalLink[]
): string {
  let enhancedContent = content;

  links.forEach((link) => {
    // Find natural anchor text in content
    const anchorRegex = new RegExp(
      `(${link.anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      'gi'
    );

    // Replace first occurrence with link
    if (anchorRegex.test(enhancedContent)) {
      enhancedContent = enhancedContent.replace(
        anchorRegex,
        `<a href="${link.url}" class="text-[#006AFF] hover:underline font-medium">$1</a>`
      );
    }
  });

  return enhancedContent;
}
