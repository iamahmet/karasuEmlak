/**
 * SEO metadata utilities
 */

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  canonical_url?: string;
  robots?: string;
  hreflang?: Array<{ lang: string; url: string }>;
}

/**
 * Generate SEO metadata from content
 * 
 * @param content - Content data
 * @param options - Optional parameters
 * @returns SEOMetadata
 */
export function generateSEOMetadata(
  content: {
    title: string;
    description?: string;
    excerpt?: string;
    keywords?: string[];
    image?: string;
    slug?: string;
    locale?: string;
  },
  options?: {
    siteUrl?: string;
    defaultImage?: string;
  }
): SEOMetadata {
  const siteUrl = options?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || '';
  const defaultImage = options?.defaultImage || `${siteUrl}/og-image.jpg`;
  const image = content.image || defaultImage;
  const description = content.description || content.excerpt || '';
  
  // Ensure title is SEO-friendly (50-60 chars)
  const seoTitle = content.title.length > 60 
    ? content.title.substring(0, 57) + '...'
    : content.title;
  
  // Ensure description is SEO-friendly (150-160 chars)
  const seoDescription = description.length > 160
    ? description.substring(0, 157) + '...'
    : description;

  const metadata: SEOMetadata = {
    title: seoTitle,
    description: seoDescription,
    keywords: content.keywords || [],
    og_title: seoTitle,
    og_description: seoDescription,
    og_image: image,
    twitter_title: seoTitle,
    twitter_description: seoDescription,
    twitter_image: image,
    robots: 'index, follow',
  };

  // Add canonical URL if slug is provided
  if (content.slug && siteUrl) {
    metadata.canonical_url = `${siteUrl}/${content.locale || 'tr'}/${content.slug}`;
  }

  return metadata;
}

/**
 * Generate meta tags HTML string
 * 
 * @param metadata - SEO metadata
 * @returns HTML string
 */
export function generateMetaTags(metadata: SEOMetadata): string {
  const tags: string[] = [];

  // Basic meta tags
  tags.push(`<title>${metadata.title}</title>`);
  tags.push(`<meta name="description" content="${metadata.description}" />`);
  
  if (metadata.keywords && metadata.keywords.length > 0) {
    tags.push(`<meta name="keywords" content="${metadata.keywords.join(', ')}" />`);
  }
  
  if (metadata.robots) {
    tags.push(`<meta name="robots" content="${metadata.robots}" />`);
  }

  // Open Graph tags
  if (metadata.og_title) {
    tags.push(`<meta property="og:title" content="${metadata.og_title}" />`);
  }
  if (metadata.og_description) {
    tags.push(`<meta property="og:description" content="${metadata.og_description}" />`);
  }
  if (metadata.og_image) {
    tags.push(`<meta property="og:image" content="${metadata.og_image}" />`);
  }
  tags.push('<meta property="og:type" content="article" />');

  // Twitter Card tags
  if (metadata.twitter_title) {
    tags.push(`<meta name="twitter:title" content="${metadata.twitter_title}" />`);
  }
  if (metadata.twitter_description) {
    tags.push(`<meta name="twitter:description" content="${metadata.twitter_description}" />`);
  }
  if (metadata.twitter_image) {
    tags.push(`<meta name="twitter:image" content="${metadata.twitter_image}" />`);
  }
  tags.push('<meta name="twitter:card" content="summary_large_image" />');

  // Canonical URL
  if (metadata.canonical_url) {
    tags.push(`<link rel="canonical" href="${metadata.canonical_url}" />`);
  }

  // Hreflang tags
  if (metadata.hreflang && metadata.hreflang.length > 0) {
    metadata.hreflang.forEach(({ lang, url }) => {
      tags.push(`<link rel="alternate" hreflang="${lang}" href="${url}" />`);
    });
  }

  return tags.join('\n');
}

/**
 * Validate SEO metadata
 * 
 * @param metadata - SEO metadata to validate
 * @returns Validation result
 */
export function validateSEOMetadata(metadata: SEOMetadata): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Title validation
  if (!metadata.title || metadata.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (metadata.title.length > 60) {
    warnings.push('Title should be 60 characters or less for optimal SEO');
  } else if (metadata.title.length < 10) {
    warnings.push('Title should be at least 10 characters');
  }

  // Description validation
  if (!metadata.description || metadata.description.trim().length === 0) {
    errors.push('Description is required');
  } else if (metadata.description.length > 160) {
    warnings.push('Description should be 160 characters or less for optimal SEO');
  } else if (metadata.description.length < 50) {
    warnings.push('Description should be at least 50 characters');
  }

  // Image validation
  if (!metadata.og_image) {
    warnings.push('OG image is recommended for better social media sharing');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Generate Article structured data (JSON-LD)
 * 
 * @param article - Article data
 * @param options - Optional parameters
 * @returns JSON-LD string
 */
export function generateArticleStructuredData(
  article: {
    title: string;
    description?: string;
    excerpt?: string;
    image?: string;
    author?: string;
    publishedAt?: string;
    modifiedAt?: string;
    url?: string;
  },
  options?: {
    siteUrl?: string;
    siteName?: string;
  }
): string {
  const siteUrl = options?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || '';
  const siteName = options?.siteName || 'Karasu Emlak';
  const image = article.image || `${siteUrl}/og-image.jpg`;
  const url = article.url || `${siteUrl}/blog/${article.title.toLowerCase().replace(/\s+/g, '-')}`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description || article.excerpt || '',
    image: image,
    datePublished: article.publishedAt || new Date().toISOString(),
    dateModified: article.modifiedAt || article.publishedAt || new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: article.author || siteName,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return JSON.stringify(structuredData, null, 2);
}

