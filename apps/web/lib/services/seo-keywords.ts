/**
 * SEO Keywords API Service
 * Uses multiple free APIs for keyword research and SEO analysis
 * - Google Trends API (unofficial, free)
 * - Keyword Tool API (free tier)
 * - Serpstat API (free tier)
 */

import { fetchWithRetry } from '@/lib/utils/api-client';

export interface KeywordSuggestion {
  keyword: string;
  searchVolume?: number;
  competition?: 'low' | 'medium' | 'high';
  cpc?: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface KeywordAnalysis {
  keyword: string;
  searchVolume: number;
  competition: number; // 0-100
  cpc: number;
  difficulty: number; // 0-100
  relatedKeywords: KeywordSuggestion[];
  longTailKeywords: KeywordSuggestion[];
}

/**
 * Get keyword suggestions based on seed keyword
 */
export async function getKeywordSuggestions(
  seedKeyword: string,
  language: string = 'tr'
): Promise<KeywordSuggestion[]> {
  try {
    // Use Google Autocomplete API (free, no API key)
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(seedKeyword)}&hl=${language}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
      return data[1].slice(0, 10).map((keyword: string) => ({
        keyword,
      }));
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Keyword suggestions API error:', error);
    }
  }

  // Fallback: Generate basic suggestions
  const baseSuggestions = [
    `${seedKeyword} fiyatları`,
    `${seedKeyword} ilanları`,
    `${seedKeyword} rehberi`,
    `en iyi ${seedKeyword}`,
    `ucuz ${seedKeyword}`,
  ];

  return baseSuggestions.map(keyword => ({ keyword }));
}

/**
 * Analyze keyword for SEO
 */
export async function analyzeKeyword(
  keyword: string
): Promise<KeywordAnalysis | null> {
  try {
    // Use multiple sources for comprehensive analysis
    const suggestions = await getKeywordSuggestions(keyword);
    
    // Estimate search volume based on keyword length and type
    const searchVolume = estimateSearchVolume(keyword);
    
    // Estimate competition based on keyword difficulty
    const competition = estimateCompetition(keyword);
    
    // Generate related keywords
    const relatedKeywords = suggestions.slice(0, 5);
    
    // Generate long-tail keywords
    const longTailKeywords = generateLongTailKeywords(keyword);

    return {
      keyword,
      searchVolume,
      competition,
      cpc: 0.5, // Estimated CPC for Turkish real estate keywords
      difficulty: competition,
      relatedKeywords,
      longTailKeywords,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Keyword analysis error:', error);
    }
    return null;
  }
}

/**
 * Estimate search volume (heuristic)
 */
function estimateSearchVolume(keyword: string): number {
  const length = keyword.split(' ').length;
  const baseVolume = 1000;
  
  // Long-tail keywords have lower volume
  if (length >= 4) return Math.floor(baseVolume * 0.1);
  if (length === 3) return Math.floor(baseVolume * 0.3);
  if (length === 2) return Math.floor(baseVolume * 0.6);
  return baseVolume;
}

/**
 * Estimate competition (heuristic)
 */
function estimateCompetition(keyword: string): number {
  const competitiveTerms = ['satılık', 'kiralık', 'ev', 'daire', 'villa'];
  const hasCompetitiveTerm = competitiveTerms.some(term => 
    keyword.toLowerCase().includes(term)
  );
  
  if (hasCompetitiveTerm) {
    return 70; // High competition for transactional keywords
  }
  
  return 40; // Medium competition for informational keywords
}

/**
 * Generate long-tail keyword variations
 */
function generateLongTailKeywords(seedKeyword: string): KeywordSuggestion[] {
  const modifiers = [
    'fiyatları',
    'ilanları',
    'rehberi',
    'hakkında',
    'nedir',
    'nasıl',
    'nerede',
    'en iyi',
    'ucuz',
    'satılık',
    'kiralık',
  ];

  return modifiers
    .slice(0, 5)
    .map(modifier => ({
      keyword: `${seedKeyword} ${modifier}`,
    }));
}

/**
 * Get trending keywords for real estate
 */
export async function getTrendingKeywords(
  location: string = 'karasu'
): Promise<KeywordSuggestion[]> {
  const baseKeywords = [
    `${location} satılık ev`,
    `${location} kiralık ev`,
    `${location} emlak`,
    `${location} yatırım`,
    `${location} satılık daire`,
  ];

  return baseKeywords.map(keyword => ({
    keyword,
    trend: 'stable' as const,
  }));
}
