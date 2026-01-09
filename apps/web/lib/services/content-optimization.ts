/**
 * Content Optimization API Service
 * Analyzes content for SEO optimization
 * Provides suggestions for improving content
 */

import { fetchWithRetry } from '@/lib/utils/api-client';

export interface ContentAnalysis {
  wordCount: number;
  keywordDensity: number;
  readabilityScore: number;
  suggestions: string[];
  missingElements: string[];
  strengths: string[];
}

export interface SEORecommendation {
  type: 'keyword' | 'structure' | 'meta' | 'links' | 'content';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
}

/**
 * Analyze content for SEO
 */
export async function analyzeContent(
  content: string,
  targetKeyword: string
): Promise<ContentAnalysis | null> {
  try {
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    const keywordCount = (content.toLowerCase().match(
      new RegExp(targetKeyword.toLowerCase(), 'g')
    ) || []).length;
    const keywordDensity = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;
    
    // Calculate readability (simplified Flesch Reading Ease)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0;
    const readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence * 1.5)));
    
    const suggestions: string[] = [];
    const missingElements: string[] = [];
    const strengths: string[] = [];
    
    // Check keyword density
    if (keywordDensity < 1) {
      suggestions.push(`Anahtar kelime yoğunluğu düşük (${keywordDensity.toFixed(2)}%). Hedef: %1-2`);
    } else if (keywordDensity > 3) {
      suggestions.push(`Anahtar kelime yoğunluğu yüksek (${keywordDensity.toFixed(2)}%). Hedef: %1-2`);
    } else {
      strengths.push(`Anahtar kelime yoğunluğu optimal (${keywordDensity.toFixed(2)}%)`);
    }
    
    // Check word count
    if (wordCount < 300) {
      suggestions.push(`İçerik çok kısa (${wordCount} kelime). En az 300 kelime önerilir.`);
    } else if (wordCount >= 1000) {
      strengths.push(`İçerik uzunluğu yeterli (${wordCount} kelime)`);
    }
    
    // Check for headings
    if (!content.includes('<h1>') && !content.includes('# ')) {
      missingElements.push('H1 başlığı eksik');
    }
    
    if (!content.includes('<h2>') && !content.includes('## ')) {
      missingElements.push('H2 başlıkları eksik');
    }
    
    // Check for internal links
    const internalLinkCount = (content.match(/href=["'][^"']*karasuemlak\.net/g) || []).length;
    if (internalLinkCount < 2) {
      suggestions.push('Daha fazla internal link ekleyin (en az 2-3)');
    } else {
      strengths.push(`${internalLinkCount} internal link bulundu`);
    }
    
    // Check for images
    const imageCount = (content.match(/<img|<Image/g) || []).length;
    if (imageCount === 0) {
      suggestions.push('İçeriğe görsel ekleyin');
    } else {
      strengths.push(`${imageCount} görsel bulundu`);
    }
    
    return {
      wordCount,
      keywordDensity,
      readabilityScore,
      suggestions,
      missingElements,
      strengths,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Content analysis error:', error);
    }
    return null;
  }
}

/**
 * Get SEO recommendations for a page
 */
export async function getSEORecommendations(
  url: string,
  content: string,
  targetKeyword: string
): Promise<SEORecommendation[]> {
  const recommendations: SEORecommendation[] = [];
  const analysis = await analyzeContent(content, targetKeyword);
  
  if (!analysis) return recommendations;
  
  // Keyword recommendations
  if (analysis.keywordDensity < 1) {
    recommendations.push({
      type: 'keyword',
      priority: 'high',
      title: 'Anahtar Kelime Yoğunluğu Düşük',
      description: `Hedef anahtar kelime "${targetKeyword}" içerikte yeterince geçmiyor.`,
      action: `"${targetKeyword}" kelimesini doğal bir şekilde içeriğe ekleyin.`,
    });
  }
  
  // Structure recommendations
  if (analysis.missingElements.includes('H1 başlığı eksik')) {
    recommendations.push({
      type: 'structure',
      priority: 'high',
      title: 'H1 Başlığı Eksik',
      description: 'Sayfada H1 başlığı bulunmuyor.',
      action: 'Sayfanın en üstüne H1 başlığı ekleyin ve anahtar kelimeyi içermesini sağlayın.',
    });
  }
  
  // Content recommendations
  if (analysis.wordCount < 300) {
    recommendations.push({
      type: 'content',
      priority: 'medium',
      title: 'İçerik Çok Kısa',
      description: `İçerik sadece ${analysis.wordCount} kelime.`,
      action: 'İçeriği en az 300 kelimeye çıkarın. Daha detaylı bilgi ekleyin.',
    });
  }
  
  // Links recommendations
  if (analysis.suggestions.some(s => s.includes('internal link'))) {
    recommendations.push({
      type: 'links',
      priority: 'medium',
      title: 'Internal Link Eksik',
      description: 'İçerikte yeterince internal link yok.',
      action: 'İlgili sayfalara internal linkler ekleyin.',
    });
  }
  
  return recommendations;
}
