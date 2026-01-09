/**
 * Content Improver Utility
 * 
 * Automatically improves low-quality content using OpenAI
 * and local content enhancement techniques.
 */

import { detectLowQualityContent } from './content-quality-checker';
import { sanitizeAndRepairHTML } from './html-content-processor';
import { cleanContent } from './content-cleaner';

export interface ContentImprovementOptions {
  useAI?: boolean;
  minQualityScore?: number;
  improveReadability?: boolean;
  improveSEO?: boolean;
  removeAIPatterns?: boolean;
}

export interface ImprovedContent {
  content: string;
  originalScore: number;
  improvedScore: number;
  improvements: string[];
  aiUsed: boolean;
}

/**
 * Improve content quality using local techniques
 */
function improveContentLocally(
  content: string,
  title: string,
  options: ContentImprovementOptions
): ImprovedContent {
  let improved = content;
  const improvements: string[] = [];
  const originalScore = detectLowQualityContent(content, title);

  // 1. Remove AI patterns
  if (options.removeAIPatterns !== false) {
    const beforeLength = improved.length;
    improved = cleanContent(improved);
    if (improved.length < beforeLength) {
      improvements.push('AI placeholder ve tekrarlayan içerik temizlendi');
    }
  }

  // 2. Fix HTML structure
  const beforeHTML = improved;
  improved = sanitizeAndRepairHTML(improved);
  if (improved !== beforeHTML) {
    improvements.push('HTML yapısı düzeltildi');
  }

  // 3. Improve readability (add paragraph breaks, fix spacing)
  if (options.improveReadability !== false) {
    // Ensure proper paragraph spacing
    improved = improved.replace(/(<\/p>)\s*(<p>)/gi, '$1\n\n$2');
    // Fix multiple spaces
    improved = improved.replace(/  +/g, ' ');
    // Fix multiple newlines
    improved = improved.replace(/\n{3,}/g, '\n\n');
    improvements.push('Okunabilirlik iyileştirildi');
  }

  // 4. Improve SEO (ensure headings, meta tags, etc.)
  if (options.improveSEO !== false) {
    // Ensure at least one H2 heading
    if (!improved.match(/<h[2-6][^>]*>/i)) {
              // Try to find first paragraph and convert to H2 if appropriate
              // Only do this if there are no headings at all
              const firstParagraph = improved.match(/<p>([^<]{20,100})<\/p>/);
              if (firstParagraph) {
                const text = firstParagraph[1];
                if (text.length > 20 && text.length < 100) {
                  improved = improved.replace(firstParagraph[0], `<h2>${text}</h2>`);
                }
              }
      improvements.push('SEO için başlık yapısı iyileştirildi');
    }
  }

  const improvedScore = detectLowQualityContent(improved, title);

  return {
    content: improved,
    originalScore: originalScore.overall,
    improvedScore: improvedScore.overall,
    improvements,
    aiUsed: false,
  };
}

/**
 * Improve content using OpenAI (if available)
 */
async function improveContentWithAI(
  content: string,
  title: string,
  options: ContentImprovementOptions
): Promise<ImprovedContent> {
  try {
    // First, improve locally
    const localImprovement = improveContentLocally(content, title, options);

    // If quality is already good, return local improvement
    if (localImprovement.improvedScore >= (options.minQualityScore || 70)) {
      return localImprovement;
    }

    // Check if OpenAI is available
    if (!process.env.OPENAI_API_KEY) {
      return localImprovement;
    }

    // Use OpenAI to improve content
    const { checkContentQuality, improveContentWithAI: improveAI } = await import('@/lib/services/content-quality-service');
    
    // Get AI improvement suggestions
    const qualityReport = await checkContentQuality(
      localImprovement.content,
      title,
      {}
    );

    // If AI suggests improvements, apply them
    if (qualityReport.suggestions.length > 0) {
      const aiImprovedContent = await improveAI(
        localImprovement.content,
        title,
        {}
      );

      const finalScore = detectLowQualityContent(aiImprovedContent, title);

      return {
        content: aiImprovedContent,
        originalScore: localImprovement.originalScore,
        improvedScore: finalScore.overall,
        improvements: [
          ...localImprovement.improvements,
          ...qualityReport.suggestions.slice(0, 3),
        ],
        aiUsed: true,
      };
    }

    return localImprovement;
  } catch (error) {
    console.error('[Content Improver] AI improvement failed:', error);
    // Fallback to local improvement
    return improveContentLocally(content, title, options);
  }
}

/**
 * Main function to improve content
 */
export async function improveContent(
  content: string,
  title: string,
  options: ContentImprovementOptions = {}
): Promise<ImprovedContent> {
  // Check if content needs improvement
  const qualityScore = detectLowQualityContent(content, title);
  const minScore = options.minQualityScore || 50;

  if (qualityScore.overall >= minScore) {
    // Content is already good enough
    return {
      content,
      originalScore: qualityScore.overall,
      improvedScore: qualityScore.overall,
      improvements: [],
      aiUsed: false,
    };
  }

  // Improve content
  if (options.useAI) {
    return improveContentWithAI(content, title, options);
  } else {
    return improveContentLocally(content, title, options);
  }
}

/**
 * Auto-improve content if quality is low (for runtime use)
 */
export function autoImproveContentIfNeeded(
  content: string,
  title: string,
  threshold: number = 50
): string {
  const qualityScore = detectLowQualityContent(content, title);

  if (qualityScore.overall >= threshold) {
    return content; // Good enough, return as-is
  }

  // Apply local improvements
  const improved = improveContentLocally(content, title, {
    removeAIPatterns: true,
    improveReadability: true,
    improveSEO: true,
  });

  return improved.content;
}
