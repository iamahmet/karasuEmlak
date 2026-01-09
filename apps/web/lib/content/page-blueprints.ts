/**
 * Page Type Content Blueprints
 * Defines content structure for each page type
 */

export interface ContentBlueprint {
  pageType: string;
  requiredBlocks: string[];
  optionalBlocks: string[];
  schemaTypes: string[];
  internalLinkTargets: string[];
}

export const PAGE_BLUEPRINTS: Record<string, ContentBlueprint> = {
  home: {
    pageType: 'home',
    requiredBlocks: ['hero', 'intro', 'featured-listings', 'neighborhoods', 'latest-content'],
    optionalBlocks: ['stats', 'testimonials', 'cta', 'faq'],
    schemaTypes: ['Organization', 'BreadcrumbList'],
    internalLinkTargets: ['listings', 'neighborhoods', 'blog', 'news'],
  },
  'listing-index': {
    pageType: 'listing-index',
    requiredBlocks: ['intro', 'filter-explanation', 'listings-grid'],
    optionalBlocks: ['buyer-guide', 'faq', 'related-neighborhoods', 'price-guide'],
    schemaTypes: ['BreadcrumbList', 'FAQPage'],
    internalLinkTargets: ['neighborhoods', 'blog', 'tools'],
  },
  'listing-detail': {
    pageType: 'listing-detail',
    requiredBlocks: ['hero', 'description', 'features', 'location-context'],
    optionalBlocks: ['neighborhood-context', 'transport-info', 'lifestyle-info', 'related-listings', 'related-articles', 'faq'],
    schemaTypes: ['RealEstateListing', 'BreadcrumbList', 'FAQPage'],
    internalLinkTargets: ['neighborhood', 'similar-listings', 'blog'],
  },
  neighborhood: {
    pageType: 'neighborhood',
    requiredBlocks: ['intro', 'transport', 'sea-distance', 'social-life', 'investment-potential', 'suitable-for'],
    optionalBlocks: ['local-tips', 'schools', 'pharmacies', 'market', 'parking', 'faq', 'related-listings', 'related-articles'],
    schemaTypes: ['BreadcrumbList', 'FAQPage', 'LocalBusiness'],
    internalLinkTargets: ['listings', 'blog', 'news', 'comparisons'],
  },
  'neighborhood-index': {
    pageType: 'neighborhood-index',
    requiredBlocks: ['intro', 'neighborhoods-grid', 'comparison-tool'],
    optionalBlocks: ['faq', 'investment-guide'],
    schemaTypes: ['BreadcrumbList', 'FAQPage'],
    internalLinkTargets: ['listings', 'blog'],
  },
  blog: {
    pageType: 'blog',
    requiredBlocks: ['intro', 'toc', 'sections', 'conclusion', 'next-reads'],
    optionalBlocks: ['editor-note', 'related-content', 'faq'],
    schemaTypes: ['Article', 'BreadcrumbList', 'FAQPage'],
    internalLinkTargets: ['hub', 'neighborhood', 'listings', 'news'],
  },
  'blog-index': {
    pageType: 'blog-index',
    requiredBlocks: ['intro', 'articles-grid', 'categories'],
    optionalBlocks: ['featured-articles', 'popular-articles'],
    schemaTypes: ['BreadcrumbList'],
    internalLinkTargets: ['news', 'listings'],
  },
  news: {
    pageType: 'news',
    requiredBlocks: ['intro', 'news-summary', 'why-matters', 'related-content'],
    optionalBlocks: ['editorial-note', 'local-faq', 'cross-link-gundem'],
    schemaTypes: ['NewsArticle', 'BreadcrumbList'],
    internalLinkTargets: ['blog', 'listings', 'neighborhoods'],
  },
  'news-index': {
    pageType: 'news-index',
    requiredBlocks: ['intro', 'news-grid', 'categories'],
    optionalBlocks: ['breaking-news', 'featured-news'],
    schemaTypes: ['BreadcrumbList'],
    internalLinkTargets: ['blog', 'listings'],
  },
  utility: {
    pageType: 'utility',
    requiredBlocks: ['intro', 'main-content', 'cta'],
    optionalBlocks: ['faq', 'contact-info', 'trust-signals'],
    schemaTypes: ['BreadcrumbList', 'FAQPage'],
    internalLinkTargets: ['home', 'listings'],
  },
  hub: {
    pageType: 'hub',
    requiredBlocks: ['intro', 'overview', 'neighborhoods', 'listings', 'local-info'],
    optionalBlocks: ['comparison', 'investment-guide', 'faq', 'related-content'],
    schemaTypes: ['BreadcrumbList', 'FAQPage', 'LocalBusiness'],
    internalLinkTargets: ['neighborhoods', 'listings', 'blog', 'news'],
  },
};

/**
 * Get blueprint for a page type
 */
export function getBlueprint(pageType: string): ContentBlueprint | null {
  return PAGE_BLUEPRINTS[pageType] || null;
}

/**
 * Check if a page has all required blocks
 */
export function hasRequiredBlocks(
  pageType: string,
  existingBlocks: string[]
): { complete: boolean; missing: string[] } {
  const blueprint = getBlueprint(pageType);
  if (!blueprint) {
    return { complete: true, missing: [] };
  }

  const missing = blueprint.requiredBlocks.filter(
    block => !existingBlocks.includes(block)
  );

  return {
    complete: missing.length === 0,
    missing,
  };
}
