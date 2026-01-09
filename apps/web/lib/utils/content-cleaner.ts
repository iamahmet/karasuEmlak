/**
 * Content Cleaner
 * 
 * Removes AI placeholders, repetitive content, empty sections,
 * and improves content structure and natural language.
 */

/**
 * Clean AI placeholders from content
 */
export function cleanAIPlaceholders(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  let cleaned = content;

  // Remove image placeholders
  cleaned = cleaned.replace(/\[image[^\]]*\]/gi, '');
  cleaned = cleaned.replace(/\(image[^\)]*\)/gi, '');
  cleaned = cleaned.replace(/image idea/gi, '');
  cleaned = cleaned.replace(/görsel fikri/gi, '');

  // Remove alt text placeholders
  cleaned = cleaned.replace(/\[alt text\]/gi, '');
  cleaned = cleaned.replace(/\[görsel açıklaması\]/gi, '');
  cleaned = cleaned.replace(/\[Alt Text\]/gi, '');

  // Remove generic placeholders
  cleaned = cleaned.replace(/\[.*?\]/g, '');
  cleaned = cleaned.replace(/\(.*?\)/g, ''); // Be careful with this - might remove valid parentheses

  // Remove AI-specific markers
  cleaned = cleaned.replace(/\*\*:\*\*/g, '');
  cleaned = cleaned.replace(/<!--.*?-->/gs, ''); // HTML comments

  // Remove "TODO" and "FIXME" type markers
  cleaned = cleaned.replace(/TODO:|FIXME:|NOTE:/gi, '');

  return cleaned;
}

/**
 * Remove repetitive content
 */
export function removeRepetitiveContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  let cleaned = content;

  // Split into sentences
  const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const seenSentences = new Set<string>();
  const uniqueSentences: string[] = [];

  sentences.forEach(sentence => {
    const normalized = sentence.trim().toLowerCase();
    // Check for similarity (not exact match)
    let isDuplicate = false;
    
    for (const seen of seenSentences) {
      // Simple similarity check - if 80% of words match, consider duplicate
      const sentenceWords = new Set(normalized.split(/\s+/).filter(w => w.length > 2));
      const seenWords = new Set(seen.split(/\s+/).filter(w => w.length > 2));
      const intersection = new Set([...sentenceWords].filter(x => seenWords.has(x)));
      const union = new Set([...sentenceWords, ...seenWords]);
      const similarity = union.size > 0 ? intersection.size / union.size : 0;

      if (similarity > 0.8) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      seenSentences.add(normalized);
      uniqueSentences.push(sentence.trim());
    }
  });

  // Reconstruct content (simplified - in real implementation, preserve HTML structure)
  if (uniqueSentences.length < sentences.length) {
    // If we removed duplicates, reconstruct
    cleaned = uniqueSentences.join('. ') + (cleaned.endsWith('.') ? '.' : '');
  }

  // Remove repetitive phrases
  const repetitivePhrases = [
    /günümüzde[^.]*\./gi,
    /son yıllarda[^.]*\./gi,
    /bu yazıda[^.]*\./gi,
    /bu makalede[^.]*\./gi,
  ];

  repetitivePhrases.forEach(phrase => {
    const matches = cleaned.match(phrase);
    if (matches && matches.length > 1) {
      // Keep only first occurrence
      let first = true;
      cleaned = cleaned.replace(phrase, () => {
        if (first) {
          first = false;
          return matches[0];
        }
        return '';
      });
    }
  });

  return cleaned;
}

/**
 * Remove empty sections
 */
export function removeEmptySections(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  let cleaned = content;

  // Remove empty paragraphs
  cleaned = cleaned.replace(/<p>\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<p><\/p>/gi, '');
  cleaned = cleaned.replace(/<p>\s*&nbsp;\s*<\/p>/gi, '');

  // Remove empty divs
  cleaned = cleaned.replace(/<div>\s*<\/div>/gi, '');
  cleaned = cleaned.replace(/<div><\/div>/gi, '');

  // Remove empty list items
  cleaned = cleaned.replace(/<li>\s*<\/li>/gi, '');
  cleaned = cleaned.replace(/<li><\/li>/gi, '');

  // Remove empty headings
  cleaned = cleaned.replace(/<h[1-6][^>]*>\s*<\/h[1-6]>/gi, '');

  // Remove empty sections (divs with only whitespace)
  cleaned = cleaned.replace(/<section[^>]*>\s*<\/section>/gi, '');

  // Remove empty blockquotes
  cleaned = cleaned.replace(/<blockquote[^>]*>\s*<\/blockquote>/gi, '');

  // Remove multiple consecutive empty lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

/**
 * Improve content structure
 */
export function improveContentStructure(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  let improved = content.trim();

  // Ensure proper heading hierarchy
  // If content has h2 but no h1, that's okay for articles (h1 is usually in page title)
  // But if it has h3 without h2, that's a problem
  const h2Count = (improved.match(/<h2[^>]*>/gi) || []).length;
  const h3Count = (improved.match(/<h3[^>]*>/gi) || []).length;

  if (h3Count > 0 && h2Count === 0) {
    // Convert first h3 to h2 (non-global regex matches only first occurrence)
    improved = improved.replace(/<h3([^>]*)>/, '<h2$1>');
    improved = improved.replace(/<\/h3>/, '</h2>');
  }

  // Ensure paragraphs are properly wrapped
  // If content starts with plain text (not a tag), wrap in paragraph
  if (improved.trim() && !improved.trim().startsWith('<')) {
    const firstTagIndex = improved.indexOf('<');
    if (firstTagIndex > 0) {
      const textBefore = improved.substring(0, firstTagIndex).trim();
      if (textBefore.length > 0) {
        improved = `<p>${textBefore}</p>${improved.substring(firstTagIndex)}`;
      }
    } else if (firstTagIndex === -1) {
      // No tags at all, wrap entire content
      improved = `<p>${improved}</p>`;
    }
  }

  // Ensure list items are in proper lists
  const orphanListItems = improved.match(/<li[^>]*>.*?<\/li>/gi);
  if (orphanListItems && !improved.includes('<ul') && !improved.includes('<ol')) {
    // Wrap orphan list items in ul
    improved = improved.replace(/(<li[^>]*>.*?<\/li>)/gi, '<ul>$1</ul>');
  }

  // Fix nested paragraphs (invalid HTML)
  improved = improved.replace(/<p([^>]*)>([^<]*)<p([^>]*)>/gi, '<p$1>$2');

  // Ensure proper spacing between sections
  improved = improved.replace(/(<\/h[1-6]>)\s*(<h[1-6])/gi, '$1\n\n$2');
  improved = improved.replace(/(<\/p>)\s*(<h[1-6])/gi, '$1\n\n$2');

  return improved;
}

/**
 * Enhance natural language (remove AI-like patterns)
 */
export function enhanceNaturalLanguage(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  let enhanced = content;

  // Replace generic AI conclusions
  enhanced = enhanced.replace(/sonuç olarak[^.]*\./gi, (match) => {
    // Remove or replace with more natural transition
    return ''; // Remove generic conclusions
  });

  enhanced = enhanced.replace(/özetlemek gerekirse[^.]*\./gi, '');
  enhanced = enhanced.replace(/kısaca[^.]*\./gi, '');

  // Replace generic transitions
  enhanced = enhanced.replace(/furthermore/gi, 'ayrıca');
  enhanced = enhanced.replace(/moreover/gi, 'bunun yanı sıra');
  enhanced = enhanced.replace(/in addition/gi, 'ek olarak');

  // Remove generic call-to-action phrases
  enhanced = enhanced.replace(/yorumlarınızı bekliyoruz[^.]*\./gi, '');
  enhanced = enhanced.replace(/düşünceleriniz neler[^.]*\./gi, '');
  enhanced = enhanced.replace(/görüşlerinizi paylaşın[^.]*\./gi, '');

  // Remove excessive exclamation marks (AI often overuses them)
  enhanced = enhanced.replace(/!{2,}/g, '!');

  // Fix excessive ellipsis
  enhanced = enhanced.replace(/\.{4,}/g, '...');

  // Remove "In conclusion" type phrases at the end
  const conclusionPatterns = [
    /sonuç olarak[^.]*\.\s*$/i,
    /özetlemek gerekirse[^.]*\.\s*$/i,
    /kısaca[^.]*\.\s*$/i,
  ];

  conclusionPatterns.forEach(pattern => {
    enhanced = enhanced.replace(pattern, '');
  });

  return enhanced.trim();
}

/**
 * Comprehensive content cleaning (all functions combined)
 */
export function cleanContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  let cleaned = content;

  // Step 1: Remove AI placeholders
  cleaned = cleanAIPlaceholders(cleaned);

  // Step 2: Remove repetitive content
  cleaned = removeRepetitiveContent(cleaned);

  // Step 3: Remove empty sections
  cleaned = removeEmptySections(cleaned);

  // Step 4: Improve structure
  cleaned = improveContentStructure(cleaned);

  // Step 5: Enhance natural language
  cleaned = enhanceNaturalLanguage(cleaned);

  return cleaned.trim();
}
