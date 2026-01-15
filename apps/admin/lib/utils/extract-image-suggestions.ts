/**
 * Extract image suggestions from content
 * Finds patterns like:
 * > **Image Idea:** [description] | **Alt Text:** [alt text]
 */

export interface ImageSuggestion {
  imageIdea: string;
  altText: string;
  position: number; // Character position in content
  originalText: string; // Full matched text
}

/**
 * Extract image suggestions from content
 */
export function extractImageSuggestions(content: string): ImageSuggestion[] {
  const suggestions: ImageSuggestion[] = [];
  
  if (!content) return suggestions;

  // Pattern 1: > **Image Idea:** [text] | **Alt Text:** [text]
  const pattern1 = />\s*\*\*Image Idea:\*\*\s*\[([^\]]+)\]\s*\|\s*\*\*Alt Text:\*\*\s*\[([^\]]+)\]/gi;
  let match: RegExpExecArray | null;
  
  while ((match = pattern1.exec(content)) !== null) {
    suggestions.push({
      imageIdea: match[1].trim(),
      altText: match[2].trim(),
      position: match.index,
      originalText: match[0],
    });
  }

  // Pattern 2: **Image Idea:** [text] | **Alt Text:** [text] (without >)
  const pattern2 = /\*\*Image Idea:\*\*\s*\[([^\]]+)\]\s*\|\s*\*\*Alt Text:\*\*\s*\[([^\]]+)\]/gi;
  while ((match = pattern2.exec(content)) !== null) {
    // Skip if already matched by pattern1
    if (match && !suggestions.some(s => s.position === match!.index)) {
      suggestions.push({
        imageIdea: match[1].trim(),
        altText: match[2].trim(),
        position: match.index,
        originalText: match[0],
      });
    }
  }

  // Pattern 3: Image Idea: [text] Alt Text: [text] (simpler format)
  const pattern3 = /Image Idea:\s*\[([^\]]+)\]\s*Alt Text:\s*\[([^\]]+)\]/gi;
  while ((match = pattern3.exec(content)) !== null) {
    if (match && !suggestions.some(s => s.position === match!.index)) {
      suggestions.push({
        imageIdea: match[1].trim(),
        altText: match[2].trim(),
        position: match.index,
        originalText: match[0],
      });
    }
  }

  return suggestions;
}

/**
 * Replace image suggestion with actual image tag
 */
export function replaceImageSuggestion(
  content: string,
  suggestion: ImageSuggestion,
  imageUrl: string
): string {
  // Create image tag
  const imageTag = `<img src="${imageUrl}" alt="${suggestion.altText}" class="w-full rounded-lg my-6" />`;
  
  // Replace the suggestion text with image tag
  return content.replace(suggestion.originalText, imageTag);
}
