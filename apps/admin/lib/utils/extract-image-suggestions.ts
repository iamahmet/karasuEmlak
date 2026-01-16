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

  // Pattern 1: > **Image Idea:** [text] | **Alt Text:** [text] (with brackets)
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

  // Pattern 2: > **Image Idea:** text | **Alt Text:** text (without brackets - most common)
  // Matches: > **Image Idea:** Karasu sahilinde... | **Alt Text:** Karasu sahilinde...
  // Also matches: > > **Image Idea:** ... (with double >)
  // This pattern matches the most common format from AI-generated content
  // Split by "> >" first, then match each block to handle multiple suggestions
  const blocks = content.split(/>\s*>/).filter(block => block.trim().length > 0);
  
  for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
    const block = blocks[blockIndex];
    const blockPattern = />*\s*\*\*Image Idea:\*\*\s*([^|]+?)\s*\|\s*\*\*Alt Text:\*\*\s*([^\n>]+?)(?=\s*$|>)/gi;
    let blockMatch: RegExpExecArray | null;
    
    while ((blockMatch = blockPattern.exec(block)) !== null) {
      // Reconstruct the full match text
      const isFirstBlock = blockIndex === 0;
      const fullMatch = isFirstBlock ? `>${blockMatch[0]}` : `> >${blockMatch[0]}`;
      
      // Find position in original content
      let position = content.indexOf(fullMatch);
      if (position === -1) {
        // Try without leading >
        position = content.indexOf(blockMatch[0]);
      }
      
      if (position >= 0 && !suggestions.some(s => Math.abs(s.position - position) < 10)) {
        suggestions.push({
          imageIdea: blockMatch[1].trim(),
          altText: blockMatch[2].trim(),
          position,
          originalText: fullMatch,
        });
      }
    }
  }
  
  // Also try direct pattern for single matches (fallback)
  const pattern2 = />+\s*\*\*Image Idea:\*\*\s*([^|]+?)\s*\|\s*\*\*Alt Text:\*\*\s*([^\n>]+?)(?=\s*>+\s*\*\*Image Idea:|$)/gi;
  let match2: RegExpExecArray | null;
  while ((match2 = pattern2.exec(content)) !== null) {
    // Skip if already matched
    if (match2 && !suggestions.some(s => Math.abs(s.position - match2!.index) < 10)) {
      suggestions.push({
        imageIdea: match2[1].trim(),
        altText: match2[2].trim(),
        position: match2.index,
        originalText: match2[0],
      });
    }
  }

  // Pattern 3: **Image Idea:** [text] | **Alt Text:** [text] (without >)
  const pattern3 = /\*\*Image Idea:\*\*\s*\[([^\]]+)\]\s*\|\s*\*\*Alt Text:\*\*\s*\[([^\]]+)\]/gi;
  let match3: RegExpExecArray | null;
  while ((match3 = pattern3.exec(content)) !== null) {
    if (match3 && !suggestions.some(s => Math.abs(s.position - match3!.index) < 10)) {
      suggestions.push({
        imageIdea: match3[1].trim(),
        altText: match3[2].trim(),
        position: match3.index,
        originalText: match3[0],
      });
    }
  }

  // Pattern 4: **Image Idea:** text | **Alt Text:** text (without > and brackets)
  const pattern4 = /\*\*Image Idea:\*\*\s*([^|]+?)\s*\|\s*\*\*Alt Text:\*\*\s*([^\n*]+?)(?=\s*\*\*|$)/gi;
  let match4: RegExpExecArray | null;
  while ((match4 = pattern4.exec(content)) !== null) {
    if (match4 && !suggestions.some(s => Math.abs(s.position - match4!.index) < 10)) {
      suggestions.push({
        imageIdea: match4[1].trim(),
        altText: match4[2].trim(),
        position: match4.index,
        originalText: match4[0],
      });
    }
  }

  // Pattern 5: Image Idea: [text] Alt Text: [text] (simpler format)
  const pattern5 = /Image Idea:\s*\[([^\]]+)\]\s*Alt Text:\s*\[([^\]]+)\]/gi;
  let match5: RegExpExecArray | null;
  while ((match5 = pattern5.exec(content)) !== null) {
    if (match5 && !suggestions.some(s => Math.abs(s.position - match5!.index) < 10)) {
      suggestions.push({
        imageIdea: match5[1].trim(),
        altText: match5[2].trim(),
        position: match5.index,
        originalText: match5[0],
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
