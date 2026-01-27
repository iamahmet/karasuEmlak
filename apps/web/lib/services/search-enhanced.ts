/**
 * Enhanced Search Functionality
 * 
 * Advanced search with suggestions, history, and analytics
 */

import { safeJsonParse } from '@/lib/utils/safeJsonParse';

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'article' | 'category' | 'tag';
  url?: string;
  count?: number;
}

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  resultsCount?: number;
}

/**
 * Get search suggestions based on query
 */
export async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const suggestions: SearchSuggestion[] = [];
  const queryLower = query.toLowerCase().trim();

  try {
    // Get popular queries (from localStorage or API)
    const popularQueries = getPopularQueries();
    const matchingPopular = popularQueries
      .filter(q => q.toLowerCase().includes(queryLower))
      .slice(0, 3)
      .map(q => ({
        text: q,
        type: 'query' as const,
      }));

    suggestions.push(...matchingPopular);

    // Get matching articles (from API)
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.articles) {
          suggestions.push(
            ...data.articles.slice(0, 5).map((article: any) => ({
              text: article.title,
              type: 'article' as const,
              url: article.url,
            }))
          );
        }
        if (data.categories) {
          suggestions.push(
            ...data.categories.slice(0, 3).map((category: string) => ({
              text: category,
              type: 'category' as const,
              url: `/blog/kategori/${category.toLowerCase()}`,
            }))
          );
        }
        if (data.tags) {
          suggestions.push(
            ...data.tags.slice(0, 3).map((tag: string) => ({
              text: tag,
              type: 'tag' as const,
              url: `/blog/etiket/${tag.toLowerCase()}`,
            }))
          );
        }
      }
    } catch (error) {
      console.warn('Failed to fetch search suggestions:', error);
    }
  } catch (error) {
    console.error('Error generating search suggestions:', error);
  }

  return suggestions.slice(0, 10);
}

/**
 * Get popular search queries
 */
function getPopularQueries(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem('search-popular-queries');
    if (stored) {
      const queries = safeJsonParse(stored, [], {
        context: 'search-popular-queries',
        dedupeKey: 'search-popular-queries',
      });
      return queries.sort((a: any, b: any) => (b.count || 0) - (a.count || 0))
        .slice(0, 20)
        .map((q: any) => q.query);
    }
  } catch (error) {
    console.warn('Failed to get popular queries:', error);
  }

  // Default popular queries
  return [
    'karasu satılık ev',
    'karasu kiralık daire',
    'karasu emlak fiyatları',
    'karasu yatırım',
    'karasu mahalleler',
  ];
}

/**
 * Save search query to history
 */
export function saveSearchHistory(query: string, resultsCount?: number): void {
  if (typeof window === 'undefined' || !query || query.trim().length < 2) {
    return;
  }

  try {
    const history = getSearchHistory();
    const trimmedQuery = query.trim();

    // Remove duplicate
    const filtered = history.filter(item => item.query.toLowerCase() !== trimmedQuery.toLowerCase());

    // Add to beginning
    filtered.unshift({
      query: trimmedQuery,
      timestamp: Date.now(),
      resultsCount,
    });

    // Keep only last 20
    const limited = filtered.slice(0, 20);

    localStorage.setItem('search-history', JSON.stringify(limited));

    // Update popular queries
    updatePopularQueries(trimmedQuery);
  } catch (error) {
    console.warn('Failed to save search history:', error);
  }
}

/**
 * Get search history
 */
export function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem('search-history');
    if (stored) {
      return safeJsonParse(stored, [], {
        context: 'search-history',
        dedupeKey: 'search-history',
      });
    }
  } catch (error) {
    console.warn('Failed to get search history:', error);
  }

  return [];
}

/**
 * Clear search history
 */
export function clearSearchHistory(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem('search-history');
  } catch (error) {
    console.warn('Failed to clear search history:', error);
  }
}

/**
 * Update popular queries
 */
function updatePopularQueries(query: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const stored = localStorage.getItem('search-popular-queries');
    const queries: Array<{ query: string; count: number }> = stored
      ? safeJsonParse(stored, [], {
          context: 'search-popular-queries',
          dedupeKey: 'search-popular-queries',
        })
      : [];

    const existing = queries.find(q => q.query.toLowerCase() === query.toLowerCase());
    if (existing) {
      existing.count = (existing.count || 0) + 1;
    } else {
      queries.push({ query, count: 1 });
    }

    // Sort by count and keep top 50
    queries.sort((a, b) => b.count - a.count);
    const limited = queries.slice(0, 50);

    localStorage.setItem('search-popular-queries', JSON.stringify(limited));
  } catch (error) {
    console.warn('Failed to update popular queries:', error);
  }
}

/**
 * Track search event
 */
export function trackSearch(query: string, resultsCount: number, filters?: Record<string, any>): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Track in analytics
  if ((window as any).gtag) {
    (window as any).gtag('event', 'search', {
      search_term: query,
      results_count: resultsCount,
      ...filters,
    });
  }

  // Track in custom analytics
  try {
    fetch('/api/analytics/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        resultsCount,
        filters,
        timestamp: Date.now(),
      }),
      keepalive: true,
    }).catch(() => {
      // Silently fail
    });
  } catch (error) {
    console.warn('Failed to track search:', error);
  }
}
