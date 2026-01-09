/**
 * Quotes API Service
 * Uses various free quote APIs
 */

import { fetchWithRetry } from '@/lib/utils/api-client';

export interface Quote {
  text: string;
  author?: string;
  category?: string;
}

/**
 * Get random inspirational quote
 */
export async function getRandomQuote(): Promise<Quote | null> {
  try {
    // Use Quotable API (free, no API key)
    const url = 'https://api.quotable.io/random?tags=inspirational|motivational';
    
    const data = await fetchWithRetry<{
      content: string;
      author: string;
      tags: string[];
    }>(url);

    if (data.success && data.data) {
      return {
        text: data.data.content,
        author: data.data.author,
        category: data.data.tags[0],
      };
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Quote API error:', error);
    }
  }

  // Fallback quotes
  return {
    text: 'Yatırım yapmak, geleceğinizi bugünden inşa etmektir.',
    author: 'Karasu Emlak',
    category: 'yatırım',
  };
}

/**
 * Get programming/tech quote
 */
export async function getProgrammingQuote(): Promise<Quote | null> {
  try {
    const url = 'https://api.quotable.io/random?tags=technology|programming';
    
    const data = await fetchWithRetry<{
      content: string;
      author: string;
    }>(url);

    if (data.success && data.data) {
      return {
        text: data.data.content,
        author: data.data.author,
        category: 'technology',
      };
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Programming quote API error:', error);
    }
  }

  return null;
}
