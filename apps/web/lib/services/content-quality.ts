/**
 * Content Quality Assessment
 * 
 * Analyzes content quality and provides improvement suggestions
 */

export interface ContentQualityScore {
  overall: number; // 0-100
  readability: number; // 0-100
  seo: number; // 0-100
  engagement: number; // 0-100
  suggestions: string[];
  strengths: string[];
}

/**
 * Assess content quality
 */
export function assessContentQuality(
  content: string,
  title: string,
  keywords: string[] = []
): ContentQualityScore {
  const cleanContent = content.replace(/<[^>]*>/g, '').trim();
  const wordCount = cleanContent.split(/\s+/).filter(w => w.length > 0).length;
  
  // Readability score (0-100)
  const readability = calculateReadabilityScore(cleanContent);
  
  // SEO score (0-100)
  const seoScore = calculateSEOScore(content, title, keywords);
  
  // Engagement score (0-100)
  const engagementScore = calculateEngagementScore(content, wordCount);
  
  // Overall score (weighted average)
  const overall = (readability * 0.3) + (seoScore * 0.4) + (engagementScore * 0.3);
  
  // Generate suggestions
  const suggestions: string[] = [];
  const strengths: string[] = [];
  
  // Readability suggestions
  if (readability < 30) {
    suggestions.push('İçerik çok zor okunuyor. Daha kısa cümleler ve basit kelimeler kullanın.');
  } else if (readability > 70) {
    strengths.push('İçerik kolay okunuyor.');
  }
  
  // SEO suggestions
  if (seoScore < 50) {
    suggestions.push('SEO optimizasyonu yapılmalı. Anahtar kelimeleri daha doğal şekilde kullanın.');
  } else if (seoScore > 80) {
    strengths.push('SEO optimizasyonu iyi.');
  }
  
  // Engagement suggestions
  if (engagementScore < 50) {
    suggestions.push('İçerik daha etkileşimli hale getirilebilir. Görseller, listeler ve örnekler ekleyin.');
  } else if (engagementScore > 80) {
    strengths.push('İçerik etkileşimli ve ilgi çekici.');
  }
  
  // Word count suggestions
  if (wordCount < 300) {
    suggestions.push('İçerik çok kısa. En az 300 kelime hedefleyin.');
  } else if (wordCount > 3000) {
    suggestions.push('İçerik çok uzun. Bölümlere ayırmayı düşünün.');
  } else if (wordCount >= 800 && wordCount <= 2000) {
    strengths.push('İdeal kelime sayısı.');
  }
  
  // Heading structure
  const h2Count = (content.match(/<h2[^>]*>/gi) || []).length;
  const h3Count = (content.match(/<h3[^>]*>/gi) || []).length;
  
  if (h2Count === 0) {
    suggestions.push('İçerikte başlık yapısı eksik. H2 başlıkları ekleyin.');
  } else if (h2Count >= 3 && h2Count <= 8) {
    strengths.push('İyi başlık yapısı.');
  }
  
  return {
    overall: Math.round(overall),
    readability: Math.round(readability),
    seo: Math.round(seoScore),
    engagement: Math.round(engagementScore),
    suggestions,
    strengths,
  };
}

/**
 * Calculate readability score (Flesch Reading Ease adapted for Turkish)
 */
function calculateReadabilityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((acc, word) => {
    const vowelCount = (word.match(/[aeıioöuü]/gi) || []).length;
    return acc + Math.max(1, vowelCount);
  }, 0);

  if (sentences.length === 0 || words.length === 0) {
    return 0;
  }

  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calculate SEO score
 */
function calculateSEOScore(content: string, title: string, keywords: string[]): number {
  let score = 50; // Base score
  
  // Title contains keywords
  const titleLower = title.toLowerCase();
  const keywordInTitle = keywords.some(kw => titleLower.includes(kw.toLowerCase()));
  if (keywordInTitle) score += 15;
  
  // Content contains keywords
  const contentLower = content.toLowerCase();
  const keywordsInContent = keywords.filter(kw => contentLower.includes(kw.toLowerCase())).length;
  if (keywordsInContent > 0) {
    score += Math.min(20, (keywordsInContent / keywords.length) * 20);
  }
  
  // Has headings
  const hasH2 = /<h2[^>]*>/i.test(content);
  const hasH3 = /<h3[^>]*>/i.test(content);
  if (hasH2) score += 5;
  if (hasH3) score += 5;
  
  // Has lists
  const hasLists = /<ul[^>]*>|<ol[^>]*>/i.test(content);
  if (hasLists) score += 5;
  
  // Has images (alt text)
  const hasImages = /<img[^>]*>/i.test(content);
  if (hasImages) {
    const hasAltText = /<img[^>]*alt=["'][^"']+["']/i.test(content);
    if (hasAltText) score += 5;
  }
  
  // Content length
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  if (wordCount >= 300 && wordCount <= 2000) {
    score += 5;
  }
  
  return Math.min(100, score);
}

/**
 * Calculate engagement score
 */
function calculateEngagementScore(content: string, wordCount: number): number {
  let score = 50; // Base score
  
  // Has questions
  const hasQuestions = /[?]/.test(content);
  if (hasQuestions) score += 10;
  
  // Has lists
  const hasLists = /<ul[^>]*>|<ol[^>]*>/i.test(content);
  if (hasLists) score += 10;
  
  // Has images
  const hasImages = /<img[^>]*>/i.test(content);
  if (hasImages) score += 10;
  
  // Has blockquotes
  const hasBlockquotes = /<blockquote[^>]*>/i.test(content);
  if (hasBlockquotes) score += 5;
  
  // Has tables
  const hasTables = /<table[^>]*>/i.test(content);
  if (hasTables) score += 5;
  
  // Word count (optimal range)
  if (wordCount >= 800 && wordCount <= 2000) {
    score += 10;
  } else if (wordCount >= 300 && wordCount < 800) {
    score += 5;
  }
  
  // Has internal links
  const hasInternalLinks = /<a[^>]*href=["'][^"']*["']/i.test(content);
  if (hasInternalLinks) score += 5;
  
  return Math.min(100, score);
}
