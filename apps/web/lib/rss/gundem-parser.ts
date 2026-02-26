/**
 * Karasu Gündem RSS Feed Parser
 * 
 * Karasu Gündem sitesinden RSS feed'i parse eder ve
 * Karasu Emlak sitesinde kullanılabilir formata dönüştürür.
 */

export interface GundemArticle {
  title: string;
  link: string;
  description: string;
  content?: string;
  pubDate: string;
  guid?: string;
  author?: string;
  category?: string[];
  image?: string;
  slug: string;
}

export interface ParsedRSSFeed {
  title: string;
  description: string;
  link: string;
  lastBuildDate: string;
  articles: GundemArticle[];
}

/**
 * Extract slug from URL
 */
function extractSlug(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    return pathParts[pathParts.length - 1] || 'article';
  } catch {
    return url.split('/').filter(Boolean).pop() || 'article';
  }
}

/**
 * Extract image from RSS item (multiple sources)
 */
function extractImage(item: any, content: string, description: string, link: string): string | undefined {
  // 1. Try RSS enclosure tag (standard RSS media)
  if (item.enclosure) {
    const enclosure = Array.isArray(item.enclosure) ? item.enclosure[0] : item.enclosure;
    if (enclosure && enclosure['@_type'] && enclosure['@_type'].startsWith('image/')) {
      return enclosure['@_url'] || enclosure['@_href'];
    }
  }

  // 2. Try Media RSS namespace (media:content, media:thumbnail)
  if (item['media:content']) {
    const mediaContent = Array.isArray(item['media:content']) ? item['media:content'][0] : item['media:content'];
    if (mediaContent && mediaContent['@_url']) {
      return mediaContent['@_url'];
    }
  }

  if (item['media:thumbnail']) {
    const thumbnail = Array.isArray(item['media:thumbnail']) ? item['media:thumbnail'][0] : item['media:thumbnail'];
    if (thumbnail && thumbnail['@_url']) {
      return thumbnail['@_url'];
    }
  }

  // 3. Try featured image or image tag
  if (item['image'] || item['featured_image']) {
    const image = item['image']?.['#text'] || item['image'] || item['featured_image']?.['#text'] || item['featured_image'];
    if (image && typeof image === 'string' && image.match(/^https?:\/\//i)) {
      return image;
    }
  }

  // 4. Try to find img tag in content (before stripping HTML)
  const imgTagPattern = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
  const imgMatch = content.match(imgTagPattern) || description.match(imgTagPattern);

  if (imgMatch && imgMatch[1]) {
    let imageUrl = imgMatch[1];
    // Handle relative URLs
    if (imageUrl.startsWith('//')) {
      imageUrl = `https:${imageUrl}`;
    } else if (imageUrl.startsWith('/')) {
      try {
        const urlObj = new URL(link);
        imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
      } catch {
        // Keep as is
      }
    }
    return imageUrl;
  }

  // 5. Try to find image URL in text (regex pattern)
  const urlPatterns = [
    /(https?:\/\/[^\s<>"']+\.(jpg|jpeg|png|webp|gif|svg))(?:\?[^\s<>"']*)?/i,
    /(https?:\/\/[^\s<>"']+\.(jpg|jpeg|png|webp|gif|svg))/i,
  ];

  for (const pattern of urlPatterns) {
    const urlMatch = content.match(pattern) || description.match(pattern);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1];
    }
  }

  return undefined;
}

/**
 * Fetch Open Graph image from article page (fallback)
 */
async function fetchOpenGraphImage(articleUrl: string): Promise<string | undefined> {
  try {
    const response = await fetch(articleUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        'User-Agent': 'Karasu Emlak RSS Parser/1.0',
      },
    });

    if (!response.ok) {
      return undefined;
    }

    const html = await response.text();

    // Try Open Graph image
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (ogImageMatch && ogImageMatch[1]) {
      return ogImageMatch[1];
    }

    // Try Twitter Card image
    const twitterImageMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (twitterImageMatch && twitterImageMatch[1]) {
      return twitterImageMatch[1];
    }

    // Try first large image in content
    const largeImageMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*(?:width=["']\d{3,}["']|height=["']\d{3,}["'])/i);
    if (largeImageMatch && largeImageMatch[1]) {
      return largeImageMatch[1];
    }

    return undefined;
  } catch (error) {
    console.error(`Failed to fetch OG image for ${articleUrl}:`, error);
    return undefined;
  }
}

import { decodeHtmlEntities } from '../entities';

/**
 * Clean HTML tags from text
 */
function stripHtml(html: string): string {
  if (!html) return '';
  // First remove tags
  const text = html.replace(/<[^>]*>/g, '').trim();
  // Then decode entities
  return decodeHtmlEntities(text);
}

/**
 * Parse RSS XML feed
 */
export async function parseGundemRSS(rssUrl: string): Promise<ParsedRSSFeed> {
  try {
    const response = await fetch(rssUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        'User-Agent': 'Karasu Emlak RSS Parser/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`RSS feed fetch failed: ${response.status}`);
    }

    const xmlText = await response.text();

    // Parse XML using fast-xml-parser (server-side compatible)
    const { XMLParser } = await import('fast-xml-parser');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: true,
      trimValues: true,
      parseTagValue: true,
    });

    let json;
    try {
      json = parser.parse(xmlText);
    } catch (parseError: any) {
      console.error('[Gundem RSS] XML parse error:', parseError?.message);
      console.error('[Gundem RSS] XML text length:', xmlText?.length);
      console.error('[Gundem RSS] XML preview:', xmlText?.substring(0, 500));
      throw parseError;
    }

    // Extract channel data
    const channel = json.rss?.channel || json.feed;
    if (!channel) {
      throw new Error('Invalid RSS feed format');
    }

    // Extract items from RSS feed (handle both RSS 2.0 and Atom formats)
    let items = channel.item || channel.entry || [];
    // Handle case where item might be a single object instead of array
    if (!Array.isArray(items)) {
      items = [items];
    }

    if (items.length === 0) {
      console.warn('[Gundem RSS] No items found in RSS feed');
      return {
        title: channel.title?.['#text'] || channel.title || 'Karasu Gündem',
        description: channel.description?.['#text'] || channel.description || '',
        link: channel.link?.['#text'] || channel.link || 'https://karasugundem.com',
        lastBuildDate: channel.lastBuildDate || channel.updated || new Date().toISOString(),
        articles: [],
      };
    }

    // Extract images for all articles (parallel processing for better performance)
    const articles: GundemArticle[] = await Promise.all(
      items.map(async (item: any) => {
        const title = item.title?.['#text'] || item.title || '';
        const link = item.link?.['#text'] || item.link?.['@_href'] || item.link || '';
        const description = item.description?.['#text'] || item.description || item.summary?.['#text'] || item.summary || '';
        const content = item['content:encoded']?.['#text'] || item.content?.['#text'] || item.content || description;
        const pubDate = item.pubDate || item.published || item.updated || new Date().toISOString();
        const guid = item.guid?.['#text'] || item.guid || item.id || link;
        const author = item['dc:creator'] || item.author?.name || item.author || 'Karasu Gündem';
        const categories = item.category
          ? (Array.isArray(item.category)
            ? item.category.map((c: any) => c['#text'] || c)
            : [item.category['#text'] || item.category])
          : [];

        // Extract image from multiple sources
        let image = extractImage(item, content, description, link);

        // Fallback: Try to fetch Open Graph image if no image found in RSS
        // Only do this for first few articles to avoid rate limiting
        if (!image && link) {
          // Limit to first 5 articles to avoid too many requests
          const itemIndex = items.indexOf(item);
          if (itemIndex < 5) {
            image = await fetchOpenGraphImage(link);
          }
        }

        return {
          title: stripHtml(title),
          link,
          description: stripHtml(description),
          content: stripHtml(content),
          pubDate,
          guid,
          author: typeof author === 'string' ? author : author?.name || 'Karasu Gündem',
          category: categories,
          image,
          slug: extractSlug(link),
        };
      })
    );

    return {
      title: channel.title?.['#text'] || channel.title || 'Karasu Gündem',
      description: channel.description?.['#text'] || channel.description || '',
      link: channel.link?.['#text'] || channel.link || 'https://karasugundem.com',
      lastBuildDate: channel.lastBuildDate || channel.updated || new Date().toISOString(),
      articles,
    };
  } catch (error: any) {
    console.error('[Gundem RSS] Parsing error:', error?.message || error);
    if (error?.stack) {
      console.error('[Gundem RSS] Stack:', error.stack);
    }
    // Don't throw - return empty feed to prevent page crashes
    return {
      title: 'Karasu Gündem',
      description: '',
      link: 'https://karasugundem.com',
      lastBuildDate: new Date().toISOString(),
      articles: [],
    };
  }
}

/**
 * Get latest articles from Karasu Gündem
 */
export async function getLatestGundemArticles(limit = 10): Promise<GundemArticle[]> {
  const rssUrl = process.env.KARASU_GUNDEM_RSS_URL || 'https://karasugundem.com/feed';

  try {
    const feed = await parseGundemRSS(rssUrl);
    return feed.articles.slice(0, limit);
  } catch (error) {
    console.error('Failed to fetch Karasu Gündem articles:', error);
    return [];
  }
}

