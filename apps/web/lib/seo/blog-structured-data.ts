import { siteConfig } from '@karasu-emlak/config';

interface ArticleSchemaInput {
  title: string;
  description?: string | null;
  excerpt?: string | null;
  content: string;
  slug: string;
  author?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  tags?: string[] | null;
  wordCount: number;
  readingTime: number;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generate comprehensive Article schema for blog posts
 */
export function generateBlogArticleSchema(input: ArticleSchemaInput) {
  const {
    title,
    description,
    excerpt,
    content,
    slug,
    author,
    publishedAt,
    updatedAt,
    imageUrl,
    category,
    tags,
    wordCount,
    readingTime,
  } = input;

  const articleUrl = `${siteConfig.url}/blog/${slug}`;
  const authorName = author || 'Karasu Emlak';

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${articleUrl}#article`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    headline: title,
    description: description || excerpt || content.substring(0, 160).replace(/<[^>]*>/g, ''),
    image: imageUrl
      ? {
          '@type': 'ImageObject',
          url: imageUrl,
          width: 1200,
          height: 630,
        }
      : undefined,
    datePublished: publishedAt || undefined,
    dateModified: updatedAt || publishedAt || undefined,
    author: {
      '@type': 'Person',
      name: authorName,
      url: `${siteConfig.url}/hakkimizda`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Karasu Emlak',
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
        width: 200,
        height: 60,
      },
    },
    articleSection: category || 'Emlak',
    keywords: tags?.join(', ') || undefined,
    wordCount,
    timeRequired: `PT${readingTime}M`,
    inLanguage: 'tr-TR',
    isAccessibleForFree: true,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['article h1', 'article h2', 'article p'],
    },
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQ schema
 */
export function generateFAQPageSchema(faqs: FAQItem[]) {
  if (faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate WebPage schema
 */
export function generateWebPageSchema(input: {
  title: string;
  description: string;
  url: string;
  datePublished?: string | null;
  dateModified?: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${input.url}#webpage`,
    url: input.url,
    name: input.title,
    description: input.description,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${siteConfig.url}/#website`,
      name: 'Karasu Emlak',
      url: siteConfig.url,
    },
    datePublished: input.datePublished || undefined,
    dateModified: input.dateModified || undefined,
    inLanguage: 'tr-TR',
    potentialAction: [
      {
        '@type': 'ReadAction',
        target: [input.url],
      },
    ],
  };
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${siteConfig.url}/#organization`,
    name: 'Karasu Emlak',
    url: siteConfig.url,
    logo: {
      '@type': 'ImageObject',
      url: `${siteConfig.url}/logo.png`,
      width: 200,
      height: 60,
    },
    description: 'Karasu ve çevresinde 15+ yıllık deneyimle emlak danışmanlığı hizmeti',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Plaj Caddesi',
      addressLocality: 'Karasu',
      addressRegion: 'Sakarya',
      postalCode: '54500',
      addressCountry: 'TR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 41.0969,
      longitude: 30.6934,
    },
    telephone: '+905466395461',
    email: 'info@karasuemlak.net',
    areaServed: [
      {
        '@type': 'City',
        name: 'Karasu',
      },
      {
        '@type': 'City',
        name: 'Kocaali',
      },
    ],
    priceRange: '₺₺',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '15:00',
      },
    ],
    sameAs: [
      'https://www.facebook.com/karasuemlak',
      'https://www.instagram.com/karasuemlak',
      'https://twitter.com/karasuemlak',
    ],
  };
}

/**
 * Generate all blog-related schemas in one call
 */
export function generateAllBlogSchemas(input: {
  article: ArticleSchemaInput;
  faqs: FAQItem[];
  breadcrumbs: BreadcrumbItem[];
}) {
  const schemas = [];

  // Article schema
  schemas.push(generateBlogArticleSchema(input.article));

  // WebPage schema
  schemas.push(
    generateWebPageSchema({
      title: input.article.title,
      description: input.article.description || input.article.excerpt || '',
      url: `${siteConfig.url}/blog/${input.article.slug}`,
      datePublished: input.article.publishedAt,
      dateModified: input.article.updatedAt,
    })
  );

  // Breadcrumb schema
  schemas.push(generateBreadcrumbSchema(input.breadcrumbs));

  // FAQ schema (if FAQs exist)
  const faqSchema = generateFAQPageSchema(input.faqs);
  if (faqSchema) {
    schemas.push(faqSchema);
  }

  // Organization schema
    // Organization schema is handled by layout
    // schemas.push(generateOrganizationSchema());

  return schemas;
}

/**
 * Generate ItemList schema for blog articles
 */
export function generateBlogItemListSchema(
  articles: Array<{
    title: string;
    slug: string;
    excerpt?: string | null;
    featured_image?: string | null;
    published_at?: string | null;
    category?: string | null;
  }>,
  baseUrl: string,
  options?: {
    name?: string;
    description?: string;
  }
) {
  const name = options?.name || 'Blog Yazıları';
  const description = options?.description || 'Karasu Emlak blog yazıları, rehberler ve haberler';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    numberOfItems: articles.length,
    itemListElement: articles.slice(0, 20).map((article, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt || undefined,
        url: `${baseUrl}/blog/${article.slug}`,
        image: article.featured_image ? {
          '@type': 'ImageObject',
          url: article.featured_image,
        } : undefined,
        datePublished: article.published_at || undefined,
        articleSection: article.category || undefined,
      },
    })),
  };
}

/**
 * Generate CollectionPage schema for blog listing pages
 */
export function generateBlogCollectionPageSchema(
  articles: Array<{
    title: string;
    slug: string;
    excerpt?: string | null;
    featured_image?: string | null;
    published_at?: string | null;
    category?: string | null;
  }>,
  baseUrl: string,
  total: number,
  options?: {
    name?: string;
    description?: string;
  }
) {
  const name = options?.name || 'Karasu Emlak Blog';
  const description = options?.description || 'Karasu emlak, yatırım ve bölge hakkında güncel haberler, rehberler ve uzman görüşleri.';
  
  const itemListSchema = generateBlogItemListSchema(articles, baseUrl, {
    name: `${name} - Yazılar`,
    description: description,
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: `${baseUrl}/blog`,
    mainEntity: itemListSchema,
    numberOfItems: total,
  };
}

/**
 * Generate Related Articles schema
 */
export function generateRelatedArticlesSchema(
  relatedArticles: Array<{
    title: string;
    slug: string;
    excerpt?: string | null;
    featured_image?: string | null;
    published_at?: string | null;
    category?: string | null;
  }>,
  baseUrl: string
) {
  if (!relatedArticles || relatedArticles.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'İlgili Yazılar',
    description: 'Bu yazıyla ilgili diğer blog yazıları',
    numberOfItems: relatedArticles.length,
    itemListElement: relatedArticles.map((article, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt || undefined,
        url: `${baseUrl}/blog/${article.slug}`,
        image: article.featured_image ? {
          '@type': 'ImageObject',
          url: article.featured_image,
        } : undefined,
        datePublished: article.published_at || undefined,
        articleSection: article.category || undefined,
      },
    })),
  };
}
