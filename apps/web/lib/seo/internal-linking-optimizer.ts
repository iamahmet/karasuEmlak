/**
 * SEO-Optimized Internal Linking System
 * Generates keyword-rich anchor texts and topic clusters
 */

import { createServiceClient } from '@karasu/lib/supabase/service';
import { siteConfig } from '@karasu-emlak/config';

export interface OptimizedInternalLink {
  url: string;
  anchor: string; // Keyword-rich anchor text
  title: string;
  description?: string;
  relevance: number; // 0-1 score
  type: 'cornerstone' | 'hub' | 'listing' | 'blog' | 'neighborhood' | 'page';
  priority: 'high' | 'medium' | 'low';
}

export interface LinkContext {
  content: string;
  title?: string;
  location?: string;
  category?: string;
  tags?: string[];
  propertyType?: string;
  status?: 'satilik' | 'kiralik';
}

/**
 * Cornerstone pages - High priority internal links
 */
const CORNERSTONE_PAGES: Record<string, OptimizedInternalLink> = {
  'karasu-satilik-daire': {
    url: '/karasu-satilik-daire',
    anchor: 'Karasu satılık daire',
    title: 'Karasu Satılık Daire',
    description: 'Karasu\'da satılık daire ilanları ve fiyatları',
    relevance: 1.0,
    type: 'cornerstone',
    priority: 'high',
  },
  'karasu-satilik-villa': {
    url: '/karasu-satilik-villa',
    anchor: 'Karasu satılık villa',
    title: 'Karasu Satılık Villa',
    description: 'Karasu\'da satılık villa ilanları',
    relevance: 1.0,
    type: 'cornerstone',
    priority: 'high',
  },
  'karasu-satilik-yazlik': {
    url: '/karasu-satilik-yazlik',
    anchor: 'Karasu satılık yazlık',
    title: 'Karasu Satılık Yazlık',
    description: 'Karasu\'da satılık yazlık evler',
    relevance: 1.0,
    type: 'cornerstone',
    priority: 'high',
  },
  'karasu-kiralik-daire': {
    url: '/karasu-kiralik-daire',
    anchor: 'Karasu kiralık daire',
    title: 'Karasu Kiralık Daire',
    description: 'Karasu\'da kiralık daire ilanları',
    relevance: 1.0,
    type: 'cornerstone',
    priority: 'high',
  },
  'karasu-merkez-satilik-ev': {
    url: '/karasu-merkez-satilik-ev',
    anchor: 'Karasu merkez satılık ev',
    title: 'Karasu Merkez Satılık Ev',
    description: 'Karasu merkez bölgede satılık evler',
    relevance: 0.9,
    type: 'cornerstone',
    priority: 'high',
  },
  'karasu-denize-yakin-satilik-ev': {
    url: '/karasu-denize-yakin-satilik-ev',
    anchor: 'Karasu denize sıfır satılık ev',
    title: 'Karasu Denize Sıfır Satılık Ev',
    description: 'Karasu\'da denize yakın satılık evler',
    relevance: 0.9,
    type: 'cornerstone',
    priority: 'high',
  },
  'karasu-yatirimlik-satilik-ev': {
    url: '/karasu-yatirimlik-satilik-ev',
    anchor: 'Karasu yatırımlık satılık ev',
    title: 'Karasu Yatırımlık Satılık Ev',
    description: 'Karasu\'da yatırım amaçlı satılık evler',
    relevance: 0.9,
    type: 'cornerstone',
    priority: 'high',
  },
};

/**
 * Hub pages - Main authority pages
 */
const HUB_PAGES: Record<string, OptimizedInternalLink> = {
  'karasu-satilik-ev': {
    url: '/karasu-satilik-ev',
    anchor: 'Karasu satılık ev ilanları',
    title: 'Karasu Satılık Ev',
    description: 'Karasu\'da tüm satılık ev ilanları',
    relevance: 1.0,
    type: 'hub',
    priority: 'high',
  },
  'kocaali-satilik-ev': {
    url: '/kocaali-satilik-ev',
    anchor: 'Kocaali satılık ev ilanları',
    title: 'Kocaali Satılık Ev',
    description: 'Kocaali\'de satılık ev ilanları',
    relevance: 0.9,
    type: 'hub',
    priority: 'high',
  },
  'satilik': {
    url: '/satilik',
    anchor: 'satılık emlak ilanları',
    title: 'Satılık İlanlar',
    description: 'Tüm satılık emlak ilanları',
    relevance: 0.8,
    type: 'hub',
    priority: 'medium',
  },
  'kiralik': {
    url: '/kiralik',
    anchor: 'kiralık emlak ilanları',
    title: 'Kiralık İlanlar',
    description: 'Tüm kiralık emlak ilanları',
    relevance: 0.8,
    type: 'hub',
    priority: 'medium',
  },
};

/**
 * Generate keyword-rich anchor text variations
 */
function generateAnchorTextVariations(
  baseAnchor: string,
  context: LinkContext
): string[] {
  const variations: string[] = [baseAnchor];

  // Add location-based variations
  if (context.location) {
    variations.push(`${context.location} ${baseAnchor}`);
  }

  // Add property type variations
  if (context.propertyType) {
    const typeLabels: Record<string, string> = {
      daire: 'daire',
      villa: 'villa',
      yazlik: 'yazlık',
      ev: 'ev',
      arsa: 'arsa',
    };
    const typeLabel = typeLabels[context.propertyType] || '';
    if (typeLabel && !baseAnchor.includes(typeLabel)) {
      variations.push(`${baseAnchor} ${typeLabel}`);
    }
  }

  // Add status variations
  if (context.status) {
    const statusLabel = context.status === 'satilik' ? 'satılık' : 'kiralık';
    if (!baseAnchor.includes(statusLabel)) {
      variations.push(`${statusLabel} ${baseAnchor}`);
    }
  }

  return variations;
}

/**
 * Calculate relevance score for a link based on context
 */
function calculateRelevance(
  link: OptimizedInternalLink,
  context: LinkContext
): number {
  let score = link.relevance;

  const contentLower = (context.content || '').toLowerCase();
  const titleLower = (context.title || '').toLowerCase();
  const anchorLower = link.anchor.toLowerCase();

  // Title match
  if (titleLower && anchorLower) {
    const titleWords = titleLower.split(/\s+/);
    const anchorWords = anchorLower.split(/\s+/);
    const commonWords = titleWords.filter((w) => anchorWords.includes(w));
    if (commonWords.length > 0) {
      score += 0.2;
    }
  }

  // Content keyword match
  if (contentLower) {
    const anchorWords = anchorLower.split(/\s+/);
    const matches = anchorWords.filter((w) => contentLower.includes(w));
    score += matches.length * 0.1;
  }

  // Location match
  if (context.location && link.url.includes(context.location.toLowerCase())) {
    score += 0.3;
  }

  // Property type match
  if (context.propertyType && link.url.includes(context.propertyType)) {
    score += 0.2;
  }

  // Status match
  if (context.status && link.url.includes(context.status)) {
    score += 0.2;
  }

  return Math.min(score, 1.0);
}

/**
 * Generate optimized internal links for content
 */
export async function generateOptimizedInternalLinks(
  context: LinkContext,
  maxLinks: number = 8
): Promise<OptimizedInternalLink[]> {
  const links: OptimizedInternalLink[] = [];
  const supabase = createServiceClient();

  // Add relevant cornerstone pages
  Object.values(CORNERSTONE_PAGES).forEach((link) => {
    const relevance = calculateRelevance(link, context);
    if (relevance > 0.4) {
      links.push({ ...link, relevance });
    }
  });

  // Add relevant hub pages
  Object.values(HUB_PAGES).forEach((link) => {
    const relevance = calculateRelevance(link, context);
    if (relevance > 0.5) {
      links.push({ ...link, relevance });
    }
  });

  // Add related blog articles
  try {
    const { data: articles } = await supabase
      .from('articles')
      .select('id, title, slug, excerpt, category')
      .eq('status', 'published')
      .limit(10);

    if (articles) {
      articles.forEach((article: any) => {
        const articleLink: OptimizedInternalLink = {
          url: `/blog/${article.slug}`,
          anchor: article.title,
          title: article.title,
          description: article.excerpt,
          relevance: calculateRelevance(
            {
              url: `/blog/${article.slug}`,
              anchor: article.title,
              title: article.title,
              relevance: 0.6,
              type: 'blog',
              priority: 'medium',
            },
            context
          ),
          type: 'blog',
          priority: 'medium',
        };

        if (articleLink.relevance > 0.5) {
          links.push(articleLink);
        }
      });
    }
  } catch (error) {
    console.error('Error fetching articles for internal links:', error);
  }

  // Add related neighborhoods
  try {
    const { data: neighborhoods } = await supabase
      .from('neighborhoods')
      .select('id, name, slug, description')
      .eq('published', true)
      .limit(5);

    if (neighborhoods) {
      neighborhoods.forEach((neighborhood: any) => {
        const neighborhoodLink: OptimizedInternalLink = {
          url: `/mahalle/${neighborhood.slug}`,
          anchor: `${neighborhood.name} mahallesi`,
          title: `${neighborhood.name} Mahallesi`,
          description: neighborhood.description,
          relevance: calculateRelevance(
            {
              url: `/mahalle/${neighborhood.slug}`,
              anchor: `${neighborhood.name} mahallesi`,
              title: `${neighborhood.name} Mahallesi`,
              relevance: 0.7,
              type: 'neighborhood',
              priority: 'medium',
            },
            context
          ),
          type: 'neighborhood',
          priority: 'medium',
        };

        if (neighborhoodLink.relevance > 0.5) {
          links.push(neighborhoodLink);
        }
      });
    }
  } catch (error) {
    console.error('Error fetching neighborhoods for internal links:', error);
  }

  // Sort by relevance and priority
  links.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.relevance - a.relevance;
  });

  return links.slice(0, maxLinks);
}

/**
 * Inject internal links into HTML content
 */
export function injectOptimizedLinks(
  content: string,
  links: OptimizedInternalLink[]
): string {
  let enhancedContent = content;

  links.forEach((link) => {
    // Try to find anchor text in content
    const anchorVariations = generateAnchorTextVariations(link.anchor, {
      content,
    });

    for (const anchor of anchorVariations) {
      const regex = new RegExp(
        `(^|[^>])(${anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?![^<]*</a>)`,
        'gi'
      );

      if (regex.test(enhancedContent)) {
        enhancedContent = enhancedContent.replace(
          regex,
          `$1<a href="${link.url}" class="text-[#006AFF] hover:underline font-medium" title="${link.title}">$2</a>`
        );
        break; // Only replace first occurrence
      }
    }
  });

  return enhancedContent;
}
