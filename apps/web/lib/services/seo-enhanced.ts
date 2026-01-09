/**
 * Enhanced SEO APIs Integration
 * 
 * Integrates multiple SEO-related APIs:
 * - Google Autocomplete (keyword suggestions)
 * - Keyword difficulty estimation
 * - Content optimization suggestions
 */

export interface KeywordSuggestion {
  keyword: string;
  searchVolume?: number;
  difficulty?: number;
  cpc?: number;
}

export interface SEOAnalysis {
  keyword: string;
  difficulty: number;
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  suggestions: string[];
  relatedKeywords: string[];
}

/**
 * Get keyword suggestions from Google Autocomplete
 * Free, no API key required
 */
export async function getGoogleAutocompleteSuggestions(
  keyword: string,
  language: string = 'tr',
  country: string = 'tr'
): Promise<string[]> {
  try {
    // Google Autocomplete API (unofficial but works)
    const response = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(keyword)}&hl=${language}&gl=${country}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
        return data[1].slice(0, 10); // Return top 10 suggestions
      }
    }

    return [];
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Google Autocomplete error:', error);
    }
    return [];
  }
}

/**
 * Estimate keyword difficulty (heuristic-based)
 * For production, integrate with Ahrefs/SEMrush API
 */
export function estimateKeywordDifficulty(keyword: string): number {
  // Simple heuristic: longer keywords = easier
  // In production, use real API like Ahrefs/SEMrush
  const wordCount = keyword.split(/\s+/).length;
  const length = keyword.length;
  
  // Base difficulty on length and word count
  let difficulty = 50; // Base difficulty
  
  if (wordCount >= 3) {
    difficulty -= 20; // Long-tail keywords are easier
  }
  
  if (length > 30) {
    difficulty -= 10; // Very long keywords are easier
  }
  
  if (wordCount === 1) {
    difficulty += 30; // Single-word keywords are harder
  }
  
  // Clamp between 0-100
  return Math.max(0, Math.min(100, difficulty));
}

/**
 * Get search volume estimate (heuristic-based)
 * For production, integrate with Google Keyword Planner API
 */
export function estimateSearchVolume(keyword: string, language: string = 'tr'): number {
  // Simple heuristic based on keyword characteristics
  // In production, use Google Keyword Planner API
  
  const wordCount = keyword.split(/\s+/).length;
  const length = keyword.length;
  
  // Base volume
  let volume = 1000;
  
  // Adjust based on characteristics
  if (wordCount === 1) {
    volume *= 10; // Single-word keywords have higher volume
  } else if (wordCount >= 3) {
    volume *= 0.1; // Long-tail keywords have lower volume
  }
  
  // Location-specific adjustments
  if (language === 'tr' && keyword.toLowerCase().includes('karasu')) {
    volume *= 0.5; // Local keywords have lower volume
  }
  
  return Math.round(volume);
}

/**
 * Analyze keyword for SEO
 */
export async function analyzeKeyword(keyword: string): Promise<SEOAnalysis> {
  const suggestions = await getGoogleAutocompleteSuggestions(keyword);
  const difficulty = estimateKeywordDifficulty(keyword);
  const searchVolume = estimateSearchVolume(keyword);
  
  // Get related keywords
  const relatedKeywords: string[] = [];
  for (const suggestion of suggestions.slice(0, 5)) {
    if (suggestion.toLowerCase() !== keyword.toLowerCase()) {
      relatedKeywords.push(suggestion);
    }
  }
  
  // Determine competition
  let competition: 'low' | 'medium' | 'high' = 'medium';
  if (difficulty < 30) {
    competition = 'low';
  } else if (difficulty > 70) {
    competition = 'high';
  }
  
  return {
    keyword,
    difficulty,
    searchVolume,
    competition,
    suggestions,
    relatedKeywords,
  };
}

/**
 * Generate SEO-optimized title suggestions
 */
export async function generateSEOTitleSuggestions(
  baseTitle: string,
  keyword: string
): Promise<string[]> {
  const suggestions: string[] = [];
  
  // Pattern 1: Keyword at the beginning
  suggestions.push(`${keyword} | ${baseTitle}`);
  
  // Pattern 2: Keyword in the middle
  const words = baseTitle.split(' ');
  if (words.length > 2) {
    const midPoint = Math.floor(words.length / 2);
    suggestions.push([...words.slice(0, midPoint), keyword, ...words.slice(midPoint)].join(' '));
  }
  
  // Pattern 3: Keyword at the end
  suggestions.push(`${baseTitle} | ${keyword}`);
  
  // Pattern 4: Question format
  suggestions.push(`${keyword} Nedir? | ${baseTitle}`);
  
  // Get autocomplete suggestions and combine
  const autocomplete = await getGoogleAutocompleteSuggestions(keyword);
  for (const ac of autocomplete.slice(0, 3)) {
    if (!suggestions.includes(ac)) {
      suggestions.push(ac);
    }
  }
  
  return suggestions.slice(0, 10);
}

/**
 * Generate meta description suggestions
 */
export function generateMetaDescriptionSuggestions(
  title: string,
  keyword: string,
  content?: string
): string[] {
  const suggestions: string[] = [];
  
  // Extract first 150 characters from content if available
  if (content) {
    const cleanContent = content.replace(/<[^>]*>/g, '').trim();
    if (cleanContent.length > 0) {
      const excerpt = cleanContent.substring(0, 150).trim();
      if (excerpt.length >= 120) {
        suggestions.push(`${excerpt}...`);
      }
    }
  }
  
  // Generate description with keyword
  const patterns = [
    `${keyword} hakkında detaylı bilgi. ${title} konusunda uzman görüşleri ve güncel fiyatlar.`,
    `${title} - ${keyword} için en güncel bilgiler, fiyatlar ve uzman tavsiyeleri.`,
    `${keyword} rehberi: ${title} hakkında bilmeniz gereken her şey.`,
  ];
  
  suggestions.push(...patterns);
  
  return suggestions.filter(desc => desc.length >= 120 && desc.length <= 160);
}
