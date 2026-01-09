/**
 * News API Service
 * Uses NewsAPI (free tier: 100 requests/day)
 * Alternative: GNews (free tier: 100 requests/day)
 * Alternative: Currents API (free tier: 200 requests/day)
 */

import { fetchWithRetry } from '@/lib/utils/api-client';

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    name: string;
  };
  author?: string;
}

export interface NewsResponse {
  articles: NewsArticle[];
  totalResults: number;
}

/**
 * Get real estate news
 */
export async function getRealEstateNews(
  country: string = 'tr',
  pageSize: number = 10
): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWSAPI_KEY;
  
  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('NEWSAPI_KEY not configured');
    }
    return [];
  }

  try {
    // Use NewsAPI
    const query = encodeURIComponent('gayrimenkul OR emlak OR real estate OR property');
    const url = `https://newsapi.org/v2/everything?q=${query}&language=tr&sortBy=publishedAt&pageSize=${pageSize}&apiKey=${apiKey}`;
    
    const data = await fetchWithRetry<NewsResponse>(url);

    if (data.success && data.data?.articles) {
      return data.data.articles.filter(article => article.title && article.url);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('News API error:', error);
    }
  }

  return [];
}

/**
 * Get top headlines for Turkey
 */
export async function getTopHeadlines(
  category: string = 'business',
  pageSize: number = 5
): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWSAPI_KEY;
  
  if (!apiKey) {
    return [];
  }

  try {
    const url = `https://newsapi.org/v2/top-headlines?country=tr&category=${category}&pageSize=${pageSize}&apiKey=${apiKey}`;
    
    const data = await fetchWithRetry<NewsResponse>(url);

    if (data.success && data.data?.articles) {
      return data.data.articles.filter(article => article.title && article.url);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('News headlines API error:', error);
    }
  }

  return [];
}
