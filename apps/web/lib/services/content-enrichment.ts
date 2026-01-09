/**
 * Content Enrichment APIs
 * 
 * Integrates APIs for content enhancement:
 * - Text analysis
 * - Content suggestions
 * - Related content discovery
 */

export interface ContentSuggestion {
  title: string;
  description: string;
  url: string;
  relevance: number;
}

/**
 * Analyze content for SEO and readability
 */
export interface ContentAnalysis {
  wordCount: number;
  readingTime: number;
  readabilityScore: number;
  keywordDensity: Record<string, number>;
  suggestions: string[];
}

/**
 * Calculate readability score (Flesch Reading Ease adapted for Turkish)
 */
export function calculateReadabilityScore(text: string, language: string = 'tr'): number {
  const cleanText = text.replace(/<[^>]*>/g, '').trim();
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((acc, word) => {
    // Simple syllable estimation for Turkish
    const vowelCount = (word.match(/[aeıioöuü]/gi) || []).length;
    return acc + Math.max(1, vowelCount);
  }, 0);

  if (sentences.length === 0 || words.length === 0) {
    return 0;
  }

  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  // Flesch Reading Ease formula (adapted)
  const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  
  // Clamp between 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Analyze keyword density
 */
export function analyzeKeywordDensity(text: string, keywords: string[]): Record<string, number> {
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  const words = cleanText.split(/\s+/).filter(w => w.length > 2);
  const totalWords = words.length;

  if (totalWords === 0) {
    return {};
  }

  const density: Record<string, number> = {};

  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    const keywordWords = keywordLower.split(/\s+/);
    
    if (keywordWords.length === 1) {
      // Single word keyword
      const count = words.filter(w => w === keywordLower).length;
      density[keyword] = (count / totalWords) * 100;
    } else {
      // Multi-word keyword
      const phrase = keywordLower;
      const phraseCount = (cleanText.match(new RegExp(phrase, 'g')) || []).length;
      density[keyword] = (phraseCount / totalWords) * 100;
    }
  }

  return density;
}

/**
 * Analyze content for SEO
 */
export function analyzeContent(
  content: string,
  keywords: string[],
  language: string = 'tr'
): ContentAnalysis {
  const cleanContent = content.replace(/<[^>]*>/g, '').trim();
  const wordCount = cleanContent.split(/\s+/).filter(w => w.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words/minute
  const readabilityScore = calculateReadabilityScore(cleanContent, language);
  const keywordDensity = analyzeKeywordDensity(cleanContent, keywords);

  // Generate suggestions
  const suggestions: string[] = [];
  
  if (readabilityScore < 30) {
    suggestions.push('İçerik çok zor okunuyor. Daha kısa cümleler ve basit kelimeler kullanın.');
  } else if (readabilityScore > 70) {
    suggestions.push('İçerik çok kolay okunuyor. Daha teknik terimler ekleyebilirsiniz.');
  }

  if (wordCount < 300) {
    suggestions.push('İçerik çok kısa. En az 300 kelime hedefleyin.');
  } else if (wordCount > 3000) {
    suggestions.push('İçerik çok uzun. Bölümlere ayırmayı düşünün.');
  }

  // Check keyword density
  for (const [keyword, density] of Object.entries(keywordDensity)) {
    if (density < 0.5) {
      suggestions.push(`"${keyword}" anahtar kelimesi yeterince kullanılmamış.`);
    } else if (density > 3) {
      suggestions.push(`"${keyword}" anahtar kelimesi çok fazla kullanılmış (keyword stuffing riski).`);
    }
  }

  return {
    wordCount,
    readingTime,
    readabilityScore,
    keywordDensity,
    suggestions,
  };
}

/**
 * Generate related content suggestions
 */
export function generateRelatedContentSuggestions(
  title: string,
  category?: string,
  tags?: string[]
): ContentSuggestion[] {
  // This is a placeholder - in production, integrate with:
  // - Internal content database
  // - External content APIs
  // - AI-powered recommendations

  const suggestions: ContentSuggestion[] = [];

  // Generate suggestions based on category
  if (category) {
    suggestions.push({
      title: `${category} Hakkında Daha Fazla Bilgi`,
      description: `${category} kategorisindeki diğer içerikler`,
      url: `/blog/kategori/${category.toLowerCase()}`,
      relevance: 0.8,
    });
  }

  // Generate suggestions based on tags
  if (tags && tags.length > 0) {
    for (const tag of tags.slice(0, 3)) {
      suggestions.push({
        title: `${tag} ile İlgili İçerikler`,
        description: `${tag} etiketiyle ilgili diğer yazılar`,
        url: `/blog/etiket/${tag.toLowerCase()}`,
        relevance: 0.7,
      });
    }
  }

  return suggestions;
}

/**
 * Optimize content for SEO
 */
export interface SEOOptimization {
  title: string;
  metaDescription: string;
  keywords: string[];
  suggestions: string[];
}

export function optimizeContentForSEO(
  title: string,
  content: string,
  targetKeywords: string[]
): SEOOptimization {
  // Extract keywords from content
  const contentKeywords = extractKeywords(content);
  
  // Combine target and extracted keywords
  const allKeywords = [...new Set([...targetKeywords, ...contentKeywords])];

  // Generate meta description
  const cleanContent = content.replace(/<[^>]*>/g, '').trim();
  const metaDescription = cleanContent.length > 0
    ? cleanContent.substring(0, 155).trim() + (cleanContent.length > 155 ? '...' : '')
    : `${title} hakkında detaylı bilgi ve uzman görüşleri.`;

  // Generate suggestions
  const suggestions: string[] = [];
  
  if (metaDescription.length < 120) {
    suggestions.push('Meta açıklama çok kısa. En az 120 karakter olmalı.');
  } else if (metaDescription.length > 160) {
    suggestions.push('Meta açıklama çok uzun. 160 karakteri geçmemeli.');
  }

  if (!metaDescription.includes(targetKeywords[0] || '')) {
    suggestions.push('Ana anahtar kelime meta açıklamada kullanılmalı.');
  }

  return {
    title,
    metaDescription,
    keywords: allKeywords.slice(0, 10), // Limit to 10 keywords
    suggestions,
  };
}

/**
 * Extract keywords from content
 */
function extractKeywords(content: string, limit: number = 10): string[] {
  const cleanContent = content.toLowerCase().replace(/[^\w\s]/g, ' ');
  const words = cleanContent.split(/\s+/).filter(w => w.length > 4);
  
  // Count word frequency
  const wordCount: Record<string, number> = {};
  for (const word of words) {
    wordCount[word] = (wordCount[word] || 0) + 1;
  }

  // Sort by frequency and return top keywords
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}
