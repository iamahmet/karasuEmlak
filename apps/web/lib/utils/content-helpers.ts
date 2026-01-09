/**
 * Content Helper Utilities
 * 
 * Helper functions for content processing and enhancement
 */

/**
 * Extract keywords from content
 */
export function extractKeywords(content: string, limit: number = 10): string[] {
  const cleanContent = content
    .replace(/<[^>]*>/g, ' ')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ');

  const words = cleanContent
    .split(/\s+/)
    .filter(word => word.length > 4) // Filter short words
    .filter(word => !isStopWord(word)); // Filter stop words

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

/**
 * Check if word is a stop word (Turkish)
 */
function isStopWord(word: string): boolean {
  const turkishStopWords = [
    'bir', 'bu', 'şu', 'o', 've', 'ile', 'için', 'gibi', 'kadar', 'daha',
    'çok', 'en', 'da', 'de', 'ki', 'mi', 'mı', 'mu', 'mü', 'ise', 'ise',
    'olan', 'olarak', 'oldu', 'olduğu', 'olduğunu', 'olmak', 'olması',
    'olmuş', 'olsa', 'olsun', 'olur', 'olursa', 'oluyor', 'oluyordu',
    'var', 'vardı', 'vardır', 'vardı', 'yok', 'yoktu', 'yoktur',
    'ile', 'için', 'gibi', 'kadar', 'daha', 'çok', 'en', 'da', 'de',
    'ki', 'mi', 'mı', 'mu', 'mü', 'ise', 'olan', 'olarak',
  ];

  return turkishStopWords.includes(word.toLowerCase());
}

/**
 * Extract headings from HTML content
 */
export function extractHeadings(content: string): Array<{ level: number; text: string; id: string }> {
  const headings: Array<{ level: number; text: string; id: string }> = [];
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = parseInt(match[1], 10);
    const text = match[2].replace(/<[^>]*>/g, '').trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    if (text.length > 0) {
      headings.push({ level, text, id });
    }
  }

  return headings;
}

/**
 * Generate table of contents from headings
 */
export function generateTOC(headings: Array<{ level: number; text: string; id: string }>): Array<{
  level: number;
  text: string;
  id: string;
  children?: Array<{ level: number; text: string; id: string }>;
}> {
  const toc: Array<{
    level: number;
    text: string;
    id: string;
    children?: Array<{ level: number; text: string; id: string }>;
  }> = [];

  let currentH2: typeof toc[0] | null = null;

  for (const heading of headings) {
    if (heading.level === 2) {
      // New H2 section
      if (currentH2) {
        toc.push(currentH2);
      }
      currentH2 = { ...heading, children: [] };
    } else if (heading.level === 3 && currentH2) {
      // H3 under current H2
      currentH2.children = currentH2.children || [];
      currentH2.children.push(heading);
    } else if (heading.level === 2) {
      // Standalone H2
      toc.push(heading);
    }
  }

  if (currentH2) {
    toc.push(currentH2);
  }

  return toc;
}

/**
 * Estimate content engagement score
 */
export function estimateEngagementScore(content: string): number {
  let score = 0;

  // Has headings
  const hasH2 = /<h2[^>]*>/i.test(content);
  const hasH3 = /<h3[^>]*>/i.test(content);
  if (hasH2) score += 20;
  if (hasH3) score += 10;

  // Has lists
  const hasLists = /<ul[^>]*>|<ol[^>]*>/i.test(content);
  if (hasLists) score += 15;

  // Has images
  const hasImages = /<img[^>]*>/i.test(content);
  if (hasImages) score += 15;

  // Has blockquotes
  const hasBlockquotes = /<blockquote[^>]*>/i.test(content);
  if (hasBlockquotes) score += 10;

  // Has tables
  const hasTables = /<table[^>]*>/i.test(content);
  if (hasTables) score += 10;

  // Has internal links
  const hasInternalLinks = /<a[^>]*href=["'][^"']*["']/i.test(content);
  if (hasInternalLinks) score += 10;

  // Word count (optimal range)
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  if (wordCount >= 800 && wordCount <= 2000) {
    score += 10;
  } else if (wordCount >= 300 && wordCount < 800) {
    score += 5;
  }

  return Math.min(100, score);
}

/**
 * Check if content is empty or has minimal text
 */
export function hasMinimalContent(content: string | null | undefined): boolean {
  if (!content || typeof content !== 'string') {
    return true;
  }

  const textContent = content.replace(/<[^>]*>/g, '').trim();
  return textContent.length < 50; // Less than 50 characters of actual text
}

/**
 * Get content preview (first paragraph)
 */
export function getContentPreview(content: string, maxLength: number = 200): string {
  const cleanContent = content.replace(/<[^>]*>/g, ' ').trim();
  const firstParagraph = cleanContent.split(/\n\n|\. /)[0];

  if (firstParagraph.length <= maxLength) {
    return firstParagraph;
  }

  return firstParagraph.substring(0, maxLength).trim() + '...';
}
