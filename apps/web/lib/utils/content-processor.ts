/**
 * Content Processor Utilities
 * Process article content to add callout boxes, code blocks, etc.
 */

import { CalloutBox } from '@/components/blog/CalloutBox';
import { CodeBlock } from '@/components/blog/CodeBlock';

/**
 * Process content to detect and wrap callout patterns
 * Supports: [info], [warning], [tip], [success] patterns
 */
export function processCallouts(content: string): string {
  // Pattern: [info]...[/info], [warning]...[/warning], etc.
  const calloutPattern = /\[(info|warning|tip|success)(?:\s+title="([^"]+)")?\]\s*([\s\S]*?)\[\/\1\]/gi;
  
  return content.replace(calloutPattern, (match, type, title, content) => {
    // This will be processed on the client side
    // For now, we'll use a placeholder that React can replace
    return `<div data-callout="${type}" data-title="${title || ''}">${content.trim()}</div>`;
  });
}

/**
 * Process code blocks with language detection
 */
export function processCodeBlocks(content: string): string {
  // Pattern: ```language\ncode\n```
  const codePattern = /```(\w+)?\n([\s\S]*?)```/g;
  
  return content.replace(codePattern, (match, language, code) => {
    return `<div data-code-block="${language || ''}">${code.trim()}</div>`;
  });
}

/**
 * Process all content enhancements
 */
export function processContent(content: string): string {
  let processed = content;
  processed = processCallouts(processed);
  processed = processCodeBlocks(processed);
  return processed;
}
