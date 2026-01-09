/**
 * Content Quality Checker
 * 
 * Advanced content quality assessment with AI pattern detection,
 * HTML validation, SEO compliance, and readability scoring.
 */

export interface QualityIssue {
  type: 'ai-pattern' | 'html-structure' | 'seo' | 'readability' | 'engagement' | 'uniqueness' | 'structure';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion?: string;
}

export interface AIPattern {
  pattern: string;
  type: 'generic-phrase' | 'repetitive' | 'placeholder' | 'conclusion' | 'transition';
  confidence: number; // 0-1
  location?: number; // Character position
}

export interface HTMLValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fixedHTML?: string;
}

export interface SEOReport {
  score: number; // 0-100
  passed: boolean;
  issues: QualityIssue[];
  suggestions: string[];
  keywordDensity: number;
  metaDescriptionLength: number;
  titleLength: number;
}

export interface ReadabilityScore {
  score: number; // 0-100 (higher = easier to read)
  gradeLevel: string;
  issues: string[];
}

export interface DuplicateReport {
  isDuplicate: boolean;
  similarity: number; // 0-1
  similarArticles: Array<{
    id: string;
    title: string;
    slug: string;
    similarity: number;
  }>;
}

export interface QualityScore {
  overall: number; // 0-100
  readability: number;
  seo: number;
  engagement: number;
  uniqueness: number;
  issues: QualityIssue[];
  suggestions: string[];
  aiProbability: number; // 0-1, AI ile yazılmış olma olasılığı
}

/**
 * Detect low quality content
 */
export function detectLowQualityContent(
  content: string,
  title: string,
  existingArticles?: Array<{ id: string; title: string; slug: string; content: string }>
): QualityScore {
  const cleanContent = content.replace(/<[^>]*>/g, '').trim();
  const wordCount = cleanContent.split(/\s+/).filter(w => w.length > 0).length;

  // Calculate individual scores
  const readability = calculateReadability(content);
  const seo = checkSEOCompliance(content, title, {});
  const engagement = calculateEngagementScore(content, wordCount);
  const uniqueness = existingArticles 
    ? detectDuplicateContent(content, existingArticles).similarity === 0 ? 100 : 50
    : 100; // Assume unique if no comparison data
  const aiProbability = detectAIPatterns(content).reduce((acc, p) => acc + p.confidence, 0) / Math.max(1, detectAIPatterns(content).length);

  // Collect issues
  const issues: QualityIssue[] = [];
  const suggestions: string[] = [];

  // AI pattern issues
  const aiPatterns = detectAIPatterns(content);
  if (aiPatterns.length > 0) {
    const highConfidencePatterns = aiPatterns.filter(p => p.confidence > 0.7);
    if (highConfidencePatterns.length > 0) {
      issues.push({
        type: 'ai-pattern',
        severity: 'high',
        message: `${highConfidencePatterns.length} yüksek güvenilirlikli AI pattern tespit edildi`,
        suggestion: 'İçeriği daha doğal ve özgün hale getirin',
      });
    }
  }

  // Readability issues
  if (readability.score < 30) {
    issues.push({
      type: 'readability',
      severity: 'high',
      message: 'İçerik çok zor okunuyor',
      suggestion: 'Daha kısa cümleler ve basit kelimeler kullanın',
    });
    suggestions.push('Cümleleri kısaltın ve karmaşık kelimeleri basitleştirin');
  }

  // SEO issues
  if (seo.score < 50) {
    issues.push({
      type: 'seo',
      severity: 'medium',
      message: 'SEO optimizasyonu yetersiz',
      suggestion: seo.suggestions.join(', '),
    });
    suggestions.push(...seo.suggestions);
  }

  // Engagement issues
  if (engagement < 50) {
    issues.push({
      type: 'engagement',
      severity: 'medium',
      message: 'İçerik yeterince etkileşimli değil',
      suggestion: 'Görseller, listeler, sorular ve örnekler ekleyin',
    });
    suggestions.push('İçeriğe görseller, listeler ve interaktif elementler ekleyin');
  }

  // Structure issues
  const htmlValidation = validateHTMLStructure(content);
  if (!htmlValidation.isValid) {
    issues.push({
      type: 'html-structure',
      severity: htmlValidation.errors.length > 0 ? 'high' : 'medium',
      message: 'HTML yapısında sorunlar var',
      suggestion: 'HTML tag\'lerini düzeltin',
    });
  }

  // Calculate overall score (weighted average)
  const overall = (
    readability.score * 0.25 +
    seo.score * 0.30 +
    engagement * 0.20 +
    uniqueness * 0.15 +
    (1 - aiProbability) * 100 * 0.10 // Lower AI probability = higher score
  );

  return {
    overall: Math.round(overall),
    readability: readability.score,
    seo: seo.score,
    engagement,
    uniqueness,
    issues,
    suggestions: [...new Set(suggestions)], // Remove duplicates
    aiProbability: Math.min(1, aiProbability),
  };
}

/**
 * Detect AI patterns in content
 */
export function detectAIPatterns(content: string): AIPattern[] {
  const patterns: AIPattern[] = [];
  const cleanContent = content.toLowerCase();

  // Generic AI phrases (Turkish)
  const genericPhrases = [
    { pattern: /bu yazıda|bu makalede|bu içerikte/gi, type: 'generic-phrase' as const, confidence: 0.6 },
    { pattern: /günümüzde|son yıllarda|günümüz dünyasında/gi, type: 'generic-phrase' as const, confidence: 0.5 },
    { pattern: /hayalinizdeki|düşlediğiniz|arzuladığınız/gi, type: 'generic-phrase' as const, confidence: 0.7 },
    { pattern: /tatil cenneti|eşsiz fırsat|kaçırılmayacak/gi, type: 'generic-phrase' as const, confidence: 0.8 },
    { pattern: /in conclusion|sonuç olarak|özetlemek gerekirse/gi, type: 'conclusion' as const, confidence: 0.9 },
    { pattern: /furthermore|ayrıca|bunun yanı sıra/gi, type: 'transition' as const, confidence: 0.4 },
    { pattern: /yorumlarınızı bekliyoruz|düşünceleriniz neler|görüşlerinizi paylaşın/gi, type: 'generic-phrase' as const, confidence: 0.8 },
  ];

  genericPhrases.forEach(({ pattern, type, confidence }) => {
    const matches = cleanContent.match(pattern);
    if (matches) {
      matches.forEach((match, index) => {
        const position = content.toLowerCase().indexOf(match, index > 0 ? patterns[patterns.length - 1].location || 0 : 0);
        patterns.push({
          pattern: match,
          type,
          confidence,
          location: position,
        });
      });
    }
  });

  // Placeholder patterns
  const placeholderPatterns = [
    { pattern: /\[image[^\]]*\]/gi, type: 'placeholder' as const, confidence: 0.95 },
    { pattern: /\(image[^\)]*\)/gi, type: 'placeholder' as const, confidence: 0.95 },
    { pattern: /\[alt text\]|\[görsel açıklaması\]/gi, type: 'placeholder' as const, confidence: 0.9 },
    { pattern: /image idea|görsel fikri/gi, type: 'placeholder' as const, confidence: 0.9 },
  ];

  placeholderPatterns.forEach(({ pattern, type, confidence }) => {
    const matches = cleanContent.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        patterns.push({
          pattern: match,
          type,
          confidence,
        });
      });
    }
  });

  // Repetitive content detection
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const sentenceGroups = new Map<string, number>();
  
  sentences.forEach(sentence => {
    const normalized = sentence.trim().toLowerCase().substring(0, 50);
    sentenceGroups.set(normalized, (sentenceGroups.get(normalized) || 0) + 1);
  });

  sentenceGroups.forEach((count, sentence) => {
    if (count > 2) {
      patterns.push({
        pattern: sentence,
        type: 'repetitive',
        confidence: Math.min(0.9, count * 0.3),
      });
    }
  });

  return patterns;
}

/**
 * Validate HTML structure
 */
export function validateHTMLStructure(content: string): HTMLValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let fixedHTML = content;

  // Check for unclosed tags
  const openTags: string[] = [];
  const tagRegex = /<\/?([a-z][a-z0-9]*)[^>]*>/gi;
  let match;

  while ((match = tagRegex.exec(content)) !== null) {
    const tagName = match[1].toLowerCase();
    const isClosing = match[0].startsWith('</');

    if (isClosing) {
      const lastOpen = openTags.lastIndexOf(tagName);
      if (lastOpen === -1) {
        warnings.push(`Kapatılmamış tag: </${tagName}>`);
      } else {
        openTags.splice(lastOpen, 1);
      }
    } else if (!['br', 'hr', 'img', 'input', 'meta', 'link'].includes(tagName)) {
      openTags.push(tagName);
    }
  }

  if (openTags.length > 0) {
    errors.push(`Açık kalan tag'ler: ${openTags.join(', ')}`);
    // Try to fix by closing tags
    openTags.reverse().forEach(tag => {
      fixedHTML += `</${tag}>`;
    });
  }

  // Check for broken image tags
  const brokenImages = content.match(/<img[^>]*(?!src=)[^>]*>/gi);
  if (brokenImages) {
    errors.push(`${brokenImages.length} adet bozuk görsel tag'i bulundu`);
  }

  // Check for empty tags
  const emptyTags = content.match(/<(p|div|span|h[1-6])[^>]*>\s*<\/\1>/gi);
  if (emptyTags) {
    warnings.push(`${emptyTags.length} adet boş tag bulundu`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fixedHTML: errors.length > 0 ? fixedHTML : undefined,
  };
}

/**
 * Check SEO compliance
 */
export function checkSEOCompliance(
  content: string,
  title: string,
  meta: { description?: string; keywords?: string[] }
): SEOReport {
  const issues: QualityIssue[] = [];
  const suggestions: string[] = [];
  let score = 50; // Base score

  const cleanContent = content.replace(/<[^>]*>/g, '').toLowerCase();
  const titleLower = title.toLowerCase();
  const wordCount = cleanContent.split(/\s+/).filter(w => w.length > 0).length;

  // Title length check
  const titleLength = title.length;
  if (titleLength < 30) {
    issues.push({
      type: 'seo',
      severity: 'medium',
      message: 'Başlık çok kısa (30 karakterden az)',
      suggestion: 'Başlığı 30-60 karakter arası yapın',
    });
    suggestions.push('Başlığı 30-60 karakter arası yapın');
  } else if (titleLength > 60) {
    issues.push({
      type: 'seo',
      severity: 'low',
      message: 'Başlık çok uzun (60 karakterden fazla)',
      suggestion: 'Başlığı 60 karakter altına indirin',
    });
  } else {
    score += 10;
  }

  // Meta description check
  const metaDescriptionLength = meta.description?.length || 0;
  if (metaDescriptionLength === 0) {
    issues.push({
      type: 'seo',
      severity: 'high',
      message: 'Meta açıklama eksik',
      suggestion: '120-155 karakter arası meta açıklama ekleyin',
    });
    suggestions.push('Meta açıklama ekleyin (120-155 karakter)');
  } else if (metaDescriptionLength < 120) {
    issues.push({
      type: 'seo',
      severity: 'medium',
      message: 'Meta açıklama çok kısa',
      suggestion: 'Meta açıklamayı 120-155 karakter arası yapın',
    });
  } else if (metaDescriptionLength > 155) {
    issues.push({
      type: 'seo',
      severity: 'low',
      message: 'Meta açıklama çok uzun',
      suggestion: 'Meta açıklamayı 155 karakter altına indirin',
    });
  } else {
    score += 10;
  }

  // Keyword usage
  if (meta.keywords && meta.keywords.length > 0) {
    const keywordsInTitle = meta.keywords.some(kw => titleLower.includes(kw.toLowerCase()));
    if (keywordsInTitle) score += 10;

    const keywordsInContent = meta.keywords.filter(kw => cleanContent.includes(kw.toLowerCase())).length;
    const keywordDensity = (keywordsInContent / meta.keywords.length) * 100;
    
    if (keywordDensity < 50) {
      issues.push({
        type: 'seo',
        severity: 'medium',
        message: 'Anahtar kelimeler içerikte yeterince kullanılmamış',
        suggestion: 'Anahtar kelimeleri içeriğe doğal şekilde ekleyin',
      });
    } else {
      score += 10;
    }
  }

  // Heading structure
  const h2Count = (content.match(/<h2[^>]*>/gi) || []).length;
  const h3Count = (content.match(/<h3[^>]*>/gi) || []).length;
  
  if (h2Count === 0) {
    issues.push({
      type: 'seo',
      severity: 'high',
      message: 'H2 başlıkları eksik',
      suggestion: 'En az 2-3 H2 başlığı ekleyin',
    });
    suggestions.push('H2 başlıkları ekleyin');
  } else if (h2Count >= 2 && h2Count <= 8) {
    score += 5;
  }

  if (h3Count > 0) {
    score += 5;
  }

  // Content length
  if (wordCount >= 300 && wordCount <= 2000) {
    score += 10;
  } else if (wordCount < 300) {
    issues.push({
      type: 'seo',
      severity: 'high',
      message: 'İçerik çok kısa (300 kelimeden az)',
      suggestion: 'İçeriği en az 300 kelimeye çıkarın',
    });
    suggestions.push('İçeriği en az 300 kelimeye çıkarın');
  }

  // Images with alt text
  const imageCount = (content.match(/<img[^>]*>/gi) || []).length;
  if (imageCount > 0) {
    const imagesWithAlt = (content.match(/<img[^>]*alt=["'][^"']+["'][^>]*>/gi) || []).length;
    if (imagesWithAlt === imageCount) {
      score += 5;
    } else {
      issues.push({
        type: 'seo',
        severity: 'medium',
        message: `${imageCount - imagesWithAlt} görselde alt text eksik`,
        suggestion: 'Tüm görsellere alt text ekleyin',
      });
    }
  }

  // Internal links
  const internalLinks = (content.match(/<a[^>]*href=["'][^"']*["'][^>]*>/gi) || []).length;
  if (internalLinks > 0) {
    score += 5;
  } else {
    suggestions.push('İç linkler ekleyin');
  }

  return {
    score: Math.min(100, score),
    passed: score >= 70,
    issues,
    suggestions,
    keywordDensity: meta.keywords ? (meta.keywords.filter(kw => cleanContent.includes(kw.toLowerCase())).length / meta.keywords.length) * 100 : 0,
    metaDescriptionLength,
    titleLength,
  };
}

/**
 * Calculate readability score (Turkish optimized)
 */
export function calculateReadability(content: string): ReadabilityScore {
  const cleanContent = content.replace(/<[^>]*>/g, ' ').trim();
  const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = cleanContent.split(/\s+/).filter(w => w.length > 0);
  
  if (sentences.length === 0 || words.length === 0) {
    return {
      score: 0,
      gradeLevel: 'Çok zor',
      issues: ['İçerik boş veya çok kısa'],
    };
  }

  // Calculate syllables (Turkish vowels)
  const syllables = words.reduce((acc, word) => {
    const vowelCount = (word.match(/[aeıioöuü]/gi) || []).length;
    return acc + Math.max(1, vowelCount);
  }, 0);

  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  // Flesch Reading Ease adapted for Turkish
  const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Determine grade level
  let gradeLevel = 'Çok kolay';
  const issues: string[] = [];

  if (normalizedScore < 30) {
    gradeLevel = 'Çok zor';
    issues.push('Cümleler çok uzun veya kelimeler çok karmaşık');
  } else if (normalizedScore < 50) {
    gradeLevel = 'Zor';
    issues.push('Cümleleri kısaltmayı ve basit kelimeler kullanmayı düşünün');
  } else if (normalizedScore < 70) {
    gradeLevel = 'Orta';
  } else if (normalizedScore < 90) {
    gradeLevel = 'Kolay';
  }

  if (avgSentenceLength > 20) {
    issues.push('Ortalama cümle uzunluğu çok fazla (20 kelimeden fazla)');
  }

  if (avgSyllablesPerWord > 3) {
    issues.push('Kelimeler çok karmaşık, daha basit alternatifler kullanın');
  }

  return {
    score: normalizedScore,
    gradeLevel,
    issues,
  };
}

/**
 * Calculate engagement score
 */
function calculateEngagementScore(content: string, wordCount: number): number {
  let score = 50; // Base score

  // Has questions
  if (/[?]/.test(content)) score += 10;

  // Has lists
  if (/<ul[^>]*>|<ol[^>]*>/i.test(content)) score += 10;

  // Has images
  if (/<img[^>]*>/i.test(content)) score += 10;

  // Has blockquotes
  if (/<blockquote[^>]*>/i.test(content)) score += 5;

  // Has tables
  if (/<table[^>]*>/i.test(content)) score += 5;

  // Word count (optimal range)
  if (wordCount >= 800 && wordCount <= 2000) {
    score += 10;
  } else if (wordCount >= 300 && wordCount < 800) {
    score += 5;
  }

  // Has internal links
  if (/<a[^>]*href=["'][^"']*["']/i.test(content)) score += 5;

  return Math.min(100, score);
}

/**
 * Detect duplicate content
 */
export function detectDuplicateContent(
  content: string,
  existingArticles: Array<{ id: string; title: string; slug: string; content: string }>
): DuplicateReport {
  const cleanContent = content.replace(/<[^>]*>/g, '').toLowerCase().trim();
  const contentWords = new Set(cleanContent.split(/\s+/).filter(w => w.length > 2));

  const similarArticles: Array<{ id: string; title: string; slug: string; similarity: number }> = [];

  existingArticles.forEach(article => {
    const articleContent = article.content.replace(/<[^>]*>/g, '').toLowerCase().trim();
    const articleWords = new Set(articleContent.split(/\s+/).filter(w => w.length > 2));

    // Calculate Jaccard similarity
    const intersection = new Set([...contentWords].filter(x => articleWords.has(x)));
    const union = new Set([...contentWords, ...articleWords]);
    const similarity = union.size > 0 ? intersection.size / union.size : 0;

    if (similarity > 0.3) {
      similarArticles.push({
        id: article.id,
        title: article.title,
        slug: article.slug,
        similarity,
      });
    }
  });

  // Sort by similarity
  similarArticles.sort((a, b) => b.similarity - a.similarity);

  return {
    isDuplicate: similarArticles.length > 0 && similarArticles[0].similarity > 0.7,
    similarity: similarArticles.length > 0 ? similarArticles[0].similarity : 0,
    similarArticles: similarArticles.slice(0, 5), // Top 5 similar
  };
}
