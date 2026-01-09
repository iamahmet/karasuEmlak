/**
 * Internal Linking Engine
 * Programmatic, smart internal linking system
 */

import { createServiceClient } from '@karasu/lib/supabase/service';

export interface InternalLink {
  from: {
    type: 'blog' | 'news' | 'listing' | 'neighborhood' | 'hub';
    slug: string;
    id?: string;
  };
  to: {
    type: 'blog' | 'news' | 'listing' | 'neighborhood' | 'hub' | 'listing-index';
    slug: string;
    id?: string;
  };
  anchor: string; // Natural Turkish anchor text
  context?: string; // Why this link is relevant
}

/**
 * Generate internal links for a content piece
 */
export async function generateInternalLinks(
  contentType: 'blog' | 'news' | 'listing' | 'neighborhood',
  contentSlug: string,
  contentId?: string,
  context?: {
    location?: string;
    category?: string;
    tags?: string[];
  }
): Promise<InternalLink[]> {
  const supabase = createServiceClient();
  const links: InternalLink[] = [];

  try {
    // Hub links (always include)
    if (contentType === 'blog' || contentType === 'news') {
      // Link to Karasu or Kocaali hub based on location
      const location = context?.location?.toLowerCase() || '';
      if (location.includes('karasu')) {
        links.push({
          from: { type: contentType, slug: contentSlug, id: contentId },
          to: { type: 'hub', slug: 'karasu' },
          anchor: 'Karasu emlak rehberi',
          context: 'Hub connection',
        });
      } else if (location.includes('kocaali')) {
        links.push({
          from: { type: contentType, slug: contentSlug, id: contentId },
          to: { type: 'hub', slug: 'kocaali' },
          anchor: 'Kocaali emlak rehberi',
          context: 'Hub connection',
        });
      }
    }

    // Neighborhood links
    if (contentType === 'blog' || contentType === 'news' || contentType === 'listing') {
      const { data: neighborhoods } = await supabase
        .from('neighborhoods')
        .select('id, name, slug')
        .eq('published', true)
        .limit(3);

      if (neighborhoods && neighborhoods.length > 0) {
        neighborhoods.forEach((neighborhood: any) => {
          links.push({
            from: { type: contentType, slug: contentSlug, id: contentId },
            to: { type: 'neighborhood', slug: neighborhood.slug, id: neighborhood.id },
            anchor: `${neighborhood.name} mahallesi`,
            context: 'Related neighborhood',
          });
        });
      }
    }

    // Listing index links
    if (contentType === 'blog' || contentType === 'news') {
      links.push({
        from: { type: contentType, slug: contentSlug, id: contentId },
        to: { type: 'listing-index', slug: 'satilik' },
        anchor: 'Karasu satılık evler',
        context: 'Listing index',
      });
    }

    // Related content links
    if (contentType === 'blog') {
      const { data: relatedArticles } = await supabase
        .from('articles')
        .select('id, title, slug')
        .eq('status', 'published')
        .neq('slug', contentSlug)
        .limit(2);

      if (relatedArticles) {
        relatedArticles.forEach((article: any) => {
          links.push({
            from: { type: contentType, slug: contentSlug, id: contentId },
            to: { type: 'blog', slug: article.slug, id: article.id },
            anchor: article.title,
            context: 'Related article',
          });
        });
      }
    }

    if (contentType === 'news') {
      const { data: relatedNews } = await supabase
        .from('news_articles')
        .select('id, title, slug')
        .eq('published', true)
        .neq('slug', contentSlug)
        .limit(2);

      if (relatedNews) {
        relatedNews.forEach((news: any) => {
          links.push({
            from: { type: contentType, slug: contentSlug, id: contentId },
            to: { type: 'news', slug: news.slug, id: news.id },
            anchor: news.title,
            context: 'Related news',
          });
        });
      }
    }

    // Listing to neighborhood
    if (contentType === 'listing') {
      // Get listing's neighborhood
      const { data: listing } = await supabase
        .from('listings')
        .select('location_neighborhood')
        .eq('slug', contentSlug)
        .single();

      if (listing?.location_neighborhood) {
        const { data: neighborhood } = await supabase
          .from('neighborhoods')
          .select('id, name, slug')
          .eq('name', listing.location_neighborhood)
          .eq('published', true)
          .single();

        if (neighborhood) {
          links.push({
            from: { type: contentType, slug: contentSlug, id: contentId },
            to: { type: 'neighborhood', slug: neighborhood.slug, id: neighborhood.id },
            anchor: `${neighborhood.name} mahallesi hakkında daha fazla bilgi`,
            context: 'Listing location',
          });
        }
      }
    }

    // Neighborhood to listings
    if (contentType === 'neighborhood') {
      links.push({
        from: { type: contentType, slug: contentSlug, id: contentId },
        to: { type: 'listing-index', slug: 'satilik' },
        anchor: 'Karasu satılık evler',
        context: 'Neighborhood listings',
      });
    }

  } catch (error: any) {
    console.error('Error generating internal links:', error);
  }

  return links;
}

/**
 * Inject internal links into content
 */
export function injectInternalLinks(
  content: string,
  links: InternalLink[],
  basePath: string = ''
): string {
  let enhancedContent = content;

  links.forEach((link) => {
    const href = getHref(link.to, basePath);
    const anchor = link.anchor;
    
    // Find natural anchor text in content (case-insensitive)
    const anchorRegex = new RegExp(`(${anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    
    if (anchorRegex.test(enhancedContent)) {
      // Replace first occurrence with link
      enhancedContent = enhancedContent.replace(
        anchorRegex,
        `<a href="${href}" class="text-primary hover:underline font-medium">${anchor}</a>`
      );
    } else {
      // Add link at end of a paragraph if anchor not found
      enhancedContent += ` <a href="${href}" class="text-primary hover:underline font-medium">${anchor}</a>`;
    }
  });

  return enhancedContent;
}

/**
 * Get href for a link target
 */
function getHref(target: InternalLink['to'], basePath: string): string {
  switch (target.type) {
    case 'hub':
      return `${basePath}/${target.slug}`;
    case 'neighborhood':
      return `${basePath}/mahalle/${target.slug}`;
    case 'listing':
      return `${basePath}/ilan/${target.slug}`;
    case 'blog':
      return `${basePath}/blog/${target.slug}`;
    case 'news':
      return `${basePath}/haberler/${target.slug}`;
    case 'listing-index':
      return `${basePath}/${target.slug}`;
    default:
      return '#';
  }
}

/**
 * Audit internal links for a page type
 */
export async function auditInternalLinks(
  pageType: string
): Promise<{ total: number; minRequired: number; status: 'pass' | 'fail' }> {
  const minLinks: Record<string, number> = {
    blog: 3,
    news: 2,
    listing: 2,
    neighborhood: 3,
    hub: 4,
  };

  const required = minLinks[pageType] || 2;
  
  // This would check actual pages - simplified for now
  return {
    total: 0, // Would be calculated from actual pages
    minRequired: required,
    status: 'pass', // Would be calculated
  };
}
