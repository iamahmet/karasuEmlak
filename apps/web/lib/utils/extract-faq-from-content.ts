/**
 * Extract FAQ pairs from article content (HTML or Markdown)
 * Used when article has embedded "Sık Sorulan Sorular" section
 */

export interface ExtractedFAQ {
  question: string;
  answer: string;
}

/**
 * Extract Q&A pairs from content that has FAQ section
 * Handles: <h2>Sık Sorulan Sorular</h2> followed by <p><strong>Q</strong> A</p>
 * Or: ## Sık Sorulan Sorular \n **Q** A
 */
export function extractFaqsFromContent(content: string | null | undefined): ExtractedFAQ[] {
  if (!content || typeof content !== 'string') return [];

  const faqs: ExtractedFAQ[] = [];
  const lower = content.toLowerCase();

  // Find FAQ section start (Sık Sorulan Sorular, SSS, FAQ)
  const faqMarkers = [
    'sık sorulan sorular',
    'sss',
    '<h2>sık sorulan sorular</h2>',
    '<h3>sık sorulan sorular</h3>',
    '<h4>sık sorulan sorular</h4>',
    '<p>sık sorulan sorular</p>',
    '## sık sorulan sorular',
    '### sık sorulan sorular',
  ];

  let startIndex = -1;
  for (const marker of faqMarkers) {
    const idx = lower.indexOf(marker);
    if (idx !== -1) {
      startIndex = idx;
      break;
    }
  }

  const faqSection = startIndex >= 0 ? content.substring(startIndex) : content;

  // Pattern: bold text (question) followed by non-bold (answer)
  // <p><strong>Question?</strong> Answer</p> or **Question?** Answer
  // Also: plain "Question? Answer" (AI output without HTML)
  const qaPatterns = [
    /<p>\s*<strong>([^<]+)<\/strong>\s*([^<]*)<\/p>/gi,
    /<p>\s*<b>([^<]+)<\/b>\s*([^<]*)<\/p>/gi,
    /\*\*([^*]+)\*\*\s*([^\n*]+)/g,
    /<h[34]>([^<]+)<\/h[34]>\s*<p>([^<]*)<\/p>/gi,
    // Plain text: "Question? Answer" per line (AI output)
    /([^.!?\n]+[?])\s+([^\n]+)/g,
  ];

  const stripHtml = (s: string) => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  for (const pattern of qaPatterns) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(faqSection)) !== null) {
      let question = stripHtml(match[1].trim());
      let answer = stripHtml((match[2] || '').trim());
      if (
        question.length > 8 &&
        question.length < 200 &&
        question.includes('?') &&
        !faqs.some((f) => f.question === question)
      ) {
        faqs.push({ question, answer: answer || 'Detaylı bilgi için yazının devamını okuyun.' });
      }
    }
  }

  // Fallback: plain text "Question? Answer" when HTML patterns fail
  if (faqs.length === 0) {
    const plain = stripHtml(faqSection);
    const qaRe = /([^.!?\n]{12,}[?])\s+([^.!?\n]+(?:[.!?][^.!?\n]*)*)/g;
    let m;
    while ((m = qaRe.exec(plain)) !== null) {
      const question = m[1].trim();
      const answer = (m[2] || '').trim();
      if (answer.length > 5 && !faqs.some((f) => f.question === question)) {
        faqs.push({ question, answer: answer || 'Detaylı bilgi için yazının devamını okuyun.' });
      }
    }
  }

  return faqs.slice(0, 10);
}

/**
 * Remove FAQ section from content to avoid duplication when we render accordion
 */
export function removeFaqSectionFromContent(content: string | null | undefined): string {
  if (!content || typeof content !== 'string') return content;

  const markers = [
    /<h2[^>]*>sık sorulan sorular<\/h2>[\s\S]*/i,
    /<h3[^>]*>sık sorulan sorular<\/h3>[\s\S]*/i,
    /<h4[^>]*>sık sorulan sorular<\/h4>[\s\S]*/i,
    /<p[^>]*>\s*<strong>sık sorulan sorular<\/strong>\s*<\/p>[\s\S]*/i,
    /<p[^>]*>\s*sık sorulan sorular\s*<\/p>[\s\S]*/i,
    /##\s*sık sorulan sorular[\s\S]*/i,
    /###\s*sık sorulan sorular[\s\S]*/i,
    /####\s*sık sorulan sorular[\s\S]*/i,
    // Plain text "Sık Sorulan Sorular" at start of line (common in AI output)
    /\n\s*sık sorulan sorular\s*\n[\s\S]*/i,
  ];

  let result = content;
  for (const marker of markers) {
    result = result.replace(marker, '').trim();
  }

  // Fallback: remove from "Sık Sorulan Sorular" or "SSS" to end (catches plain text AI output)
  const faqStart = result.toLowerCase().search(/\b(sık sorulan sorular|sss)\b/);
  if (faqStart !== -1) {
    result = result.substring(0, faqStart).trim();
  }

  return result;
}
