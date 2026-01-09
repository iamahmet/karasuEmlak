/**
 * Clean description_long from AI-generated content patterns
 * Removes common AI writing patterns and unwanted sections
 * 
 * GLOBAL CONTENT FIX & SANITIZATION
 * - Removes blog-style content from listings
 * - Removes placeholders and broken tags
 * - Enforces listing-specific content rules
 */

export function cleanDescription(description: string): string {
  if (!description) return '';

  let cleaned = description;

  // ============================================
  // PART 1: Remove Blog-Style Structure
  // ============================================
  
  // Remove H2/H3 headings (listings should not have headings)
  cleaned = cleaned.replace(/<h[23][^>]*>.*?<\/h[23]>/gi, '');
  
  // Remove heading patterns without tags
  cleaned = cleaned.replace(/^#{1,3}\s+.+$/gm, '');
  
  // Remove conclusion paragraphs (common AI pattern)
  cleaned = cleaned.replace(/<p>.*?(sonuç|özet|kısaca|özetlemek gerekirse|son olarak).*?<\/p>/gi, '');
  
  // Remove FAQ sections
  cleaned = cleaned.replace(/<h[23][^>]*>.*?SSS.*?<\/h[23]>/gi, '');
  cleaned = cleaned.replace(/SSS:[^]*?(?=\n\n|\n<h|\n<p|$)/gi, '');
  cleaned = cleaned.replace(/<p>.*?Sık Sorulan Sorular.*?<\/p>/gi, '');
  
  // ============================================
  // PART 2: Remove AI Writing Patterns
  // ============================================
  
  const aiPatterns = [
    // Common AI starters
    /Bu yazıda[^.]*\./gi,
    /Günümüzde[^.]*\./gi,
    /Son yıllarda[^.]*\./gi,
    /Günümüzün[^.]*\./gi,
    /Modern dünyada[^.]*\./gi,
    
    // Marketing clichés
    /hayalinizdeki[^.]*\./gi,
    /tatil cenneti[^.]*\./gi,
    /eşsiz fırsat[^.]*\./gi,
    /kaçırmayın[^.]*\./gi,
    /fırsat[^.]*\./gi,
    /özel[^.]*\./gi,
    
    // Comment requests
    /Bu yazılık cenneti hakkında sizin düşünceleriniz neler\?[^]*?yorumlarınızı bekliyorum[^]*?/gi,
    /Aşağıda yorumlarınızı bekliyorum[^]*?/gi,
    /Bu yazılık cenneti hakkında[^]*?yorumlarınızı bekliyorum[^]*?/gi,
    /yorumlarınızı bekliyorum[^]*?/gi,
    /düşünceleriniz neler[^]*?/gi,
    /yorum yapabilirsiniz[^]*?/gi,
    /yorumlarınız[^]*?/gi,
    
    // Placeholders
    /image idea/gi,
    /\[IMAGE[^\]]*\]/gi,
    /\(IMAGE[^\)]*\)/gi,
    /\[Alt Text\]/gi,
    /\[Görsel açıklaması\]/gi,
    /\*\*:\*\*/gi,
    /\[.*?\]/g, // Generic placeholders in brackets
  ];

  aiPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // ============================================
  // PART 3: Remove Placeholders & Broken Tags
  // ============================================
  
  // Remove empty markdown captions
  cleaned = cleaned.replace(/\*\*:\*\*/g, '');
  cleaned = cleaned.replace(/\*\*:\s*\*\*/g, '');
  
  // Remove broken image labels
  cleaned = cleaned.replace(/<img[^>]*alt=["']\s*["'][^>]*>/gi, '');
  cleaned = cleaned.replace(/alt=["']\s*["']/gi, '');
  
  // Remove empty captions
  cleaned = cleaned.replace(/<figcaption>\s*<\/figcaption>/gi, '');
  cleaned = cleaned.replace(/<caption>\s*<\/caption>/gi, '');
  
  // ============================================
  // PART 4: Clean Up Structure
  // ============================================
  
  // Clean up multiple newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Clean up empty paragraphs
  cleaned = cleaned.replace(/<p>\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<p><\/p>/gi, '');
  cleaned = cleaned.replace(/<p>\s*&nbsp;\s*<\/p>/gi, '');
  
  // Remove empty list items
  cleaned = cleaned.replace(/<li>\s*<\/li>/gi, '');
  
  // Remove empty divs
  cleaned = cleaned.replace(/<div>\s*<\/div>/gi, '');
  
  // ============================================
  // PART 5: Enforce Listing Rules
  // ============================================
  
  // Limit paragraphs (if more than 10, keep first 10)
  const paragraphMatches = cleaned.match(/<p[^>]*>.*?<\/p>/gi);
  if (paragraphMatches && paragraphMatches.length > 10) {
    cleaned = paragraphMatches.slice(0, 10).join('\n');
  }
  
  // Remove lists (listings should be paragraph-based)
  cleaned = cleaned.replace(/<ul[^>]*>.*?<\/ul>/gi, '');
  cleaned = cleaned.replace(/<ol[^>]*>.*?<\/ol>/gi, '');
  
  // ============================================
  // PART 6: Final Cleanup
  // ============================================
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  // Remove leading/trailing HTML tags if empty
  cleaned = cleaned.replace(/^<[^>]+>\s*<\/[^>]+>$/gm, '');
  
  // Ensure proper paragraph spacing
  cleaned = cleaned.replace(/<\/p>\s*<p>/gi, '</p>\n<p>');
  
  return cleaned;
}

/**
 * Check if description contains AI patterns
 */
export function hasAIPatterns(description: string): boolean {
  if (!description) return false;

  const aiIndicators = [
    /Bu yazıda/gi,
    /Günümüzde/gi,
    /Son yıllarda/gi,
    /yorumlarınızı bekliyorum/gi,
    /image idea/gi,
    /SSS:/gi,
  ];

  return aiIndicators.some(pattern => pattern.test(description));
}
