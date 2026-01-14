/**
 * AI Checker Helper
 * Utility functions for adding AI checker to content pages
 */

import { calculateReadingTime } from '@/lib/utils/reading-time';

export interface PageContentInfo {
  content: string;
  title: string;
  readingTime: number;
  wordCount: number;
}

/**
 * Generate HTML content structure from page sections
 */
export function generatePageContentHTML(sections: Array<{ id: string; title: string; content?: string }>): string {
  return sections
    .map((section) => {
      const h2 = `<h2 id="${section.id}">${section.title}</h2>`;
      const p = section.content ? `<p>${section.content}</p>` : '';
      return h2 + p;
    })
    .join('\n');
}

/**
 * Calculate content metrics for AI checker
 */
export function calculateContentMetrics(content: string): { readingTime: number; wordCount: number } {
  const readingTime = calculateReadingTime(content);
  const wordCount = content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter((w) => w.length > 0).length;
  return { readingTime, wordCount };
}

/**
 * Generate page content info for AI checker
 */
export function generatePageContentInfo(
  title: string,
  sections: Array<{ id: string; title: string; content?: string }>
): PageContentInfo {
  const htmlContent = generatePageContentHTML(sections);
  const { readingTime, wordCount } = calculateContentMetrics(htmlContent);
  
  return {
    content: htmlContent,
    title,
    readingTime,
    wordCount,
  };
}
