/**
 * Karasu Gündem Integration
 * 
 * Karasu Emlak ve Karasu Gündem siteleri arasındaki
 * SEO ve içerik entegrasyonu için yardımcı fonksiyonlar
 */

import { GundemArticle } from './gundem-parser';

/**
 * Check if article is related to real estate
 */
export function isRealEstateRelated(article: GundemArticle): boolean {
  const realEstateKeywords = [
    'emlak', 'gayrimenkul', 'konut', 'daire', 'villa', 'arsa',
    'satılık', 'kiralık', 'yapı', 'inşaat', 'proje', 'rezidans',
    'mahalle', 'bölge', 'karasu', 'sahil', 'deniz', 'yatırım',
    'fiyat', 'piyasa', 'değer', 'kira', 'satış'
  ];

  const text = `${article.title} ${article.description} ${article.content || ''}`.toLowerCase();
  
  return realEstateKeywords.some(keyword => text.includes(keyword));
}

/**
 * Extract related neighborhoods from article
 */
export function extractNeighborhoods(article: GundemArticle): string[] {
  const neighborhoods = [
    'merkez', 'liman', 'kıyı', 'sahil', 'plaj', 'iskele',
    'çamlı', 'çamlık', 'kumluk', 'kum', 'kumsal',
    'yeni', 'eski', 'üst', 'alt', 'doğu', 'batı',
    'karasu', 'kocaali', 'sapanca'
  ];

  const text = `${article.title} ${article.description} ${article.content || ''}`.toLowerCase();
  const found: string[] = [];

  neighborhoods.forEach(neighborhood => {
    if (text.includes(neighborhood)) {
      found.push(neighborhood);
    }
  });

  return [...new Set(found)]; // Remove duplicates
}

/**
 * Generate SEO-friendly link to Karasu Gündem article
 */
export function getGundemArticleLink(article: GundemArticle): string {
  return article.link;
}

/**
 * Generate canonical link for cross-site SEO
 */
export function getCanonicalLink(article: GundemArticle, emlakSiteUrl: string): string {
  // If article is on Karasu Gündem, use that as canonical
  // Otherwise, create a link on Karasu Emlak
  if (article.link.includes('karasugundem.com')) {
    return article.link;
  }
  
  // Create a link on Karasu Emlak that references the Gündem article
  return `${emlakSiteUrl}/haberler/${article.slug}`;
}

/**
 * Generate hreflang links for cross-site SEO
 */
export function getHreflangLinks(article: GundemArticle, emlakSiteUrl: string): Array<{ lang: string; url: string }> {
  return [
    { lang: 'tr', url: article.link },
    { lang: 'x-default', url: article.link },
  ];
}

/**
 * Generate internal linking suggestions
 */
export function generateInternalLinks(article: GundemArticle): Array<{ text: string; href: string; type: 'neighborhood' | 'listing' | 'article' }> {
  const links: Array<{ text: string; href: string; type: 'neighborhood' | 'listing' | 'article' }> = [];
  const neighborhoods = extractNeighborhoods(article);

  neighborhoods.forEach(neighborhood => {
    links.push({
      text: neighborhood,
      href: `/karasu/${neighborhood}`,
      type: 'neighborhood',
    });
  });

  return links;
}

/**
 * Enhance article with SEO metadata
 */
export function enhanceArticleSEO(article: GundemArticle, emlakSiteUrl: string) {
  const isRelated = isRealEstateRelated(article);
  const neighborhoods = extractNeighborhoods(article);
  
  return {
    ...article,
    isRealEstateRelated: isRelated,
    relatedNeighborhoods: neighborhoods,
    canonicalUrl: getCanonicalLink(article, emlakSiteUrl),
    hreflangLinks: getHreflangLinks(article, emlakSiteUrl),
    internalLinks: generateInternalLinks(article),
    seoKeywords: [
      ...neighborhoods,
      'karasu',
      'emlak',
      'gayrimenkul',
      ...(isRelated ? ['emlak haberleri', 'gayrimenkul gündemi'] : []),
    ],
  };
}

