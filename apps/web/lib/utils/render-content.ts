/**
 * Content Rendering Pipeline
 * 
 * Single source of truth for content rendering across the entire application.
 * Handles:
 * - Auto-detection of content format (HTML, HTML-escaped, Markdown, Plain text)
 * - HTML entity decoding
 * - HTML sanitization
 * - Markdown to HTML conversion (if needed)
 * - XSS protection
 */

import he from 'he';
import { sanitizeAndRepairHTML } from './html-content-processor';

export type ContentFormat = 'html' | 'html-escaped' | 'markdown' | 'plain' | 'auto';

export interface RenderContentOptions {
  format?: ContentFormat;
  sanitize?: boolean;
  allowImages?: boolean;
  allowTables?: boolean;
  allowCode?: boolean;
}

/**
 * Auto-detect content format
 */
export function detectContentFormat(content: string | null | undefined): ContentFormat {
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return 'plain';
  }

  const trimmed = content.trim();

  // Check for HTML entity escaped (e.g., &lt;h2&gt;)
  if (trimmed.includes('&lt;') || trimmed.includes('&gt;') || trimmed.includes('&amp;')) {
    // Check if it's actually escaped HTML (not just text with & symbols)
    if (trimmed.match(/&lt;[a-z][a-z0-9]*[^&]*&gt;/i)) {
      return 'html-escaped';
    }
  }

  // Check for HTML tags
  if (trimmed.match(/<[a-z][a-z0-9]*[^>]*>/i)) {
    return 'html';
  }

  // Check for Markdown patterns
  if (
    trimmed.match(/^#{1,6}\s+/m) || // Headings
    trimmed.match(/^\*\s+/m) || // Unordered lists
    trimmed.match(/^\d+\.\s+/m) || // Ordered lists
    trimmed.match(/\*\*.*\*\*/) || // Bold
    trimmed.match(/\[.*\]\(.*\)/) || // Links
    (trimmed.match(/^\s*\|.*\|\s*$/m) && trimmed.match(/^\s*\|[\s:|-]+\|\s*$/m)) // Tables
  ) {
    return 'markdown';
  }

  return 'plain';
}

/**
 * Decode HTML entities
 */
export function decodeHTMLEntities(content: string): string {
  try {
    return he.decode(content);
  } catch (error) {
    console.warn('[render-content] Failed to decode HTML entities:', error);
    return content;
  }
}

/**
 * Convert plain text to HTML paragraphs
 */
export function plainTextToHTML(content: string): string {
  if (!content || content.trim().length === 0) {
    return '<p></p>';
  }

  // Split by double newlines to create paragraphs
  const paragraphs = content
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`);

  return paragraphs.length > 0 ? paragraphs.join('\n') : `<p>${content}</p>`;
}

/**
 * Basic Markdown to HTML conversion (simple patterns)
 * For full Markdown support, consider using remark/rehype
 */
export function markdownToHTML(content: string): string {
  let html = content;

  // Markdown tables: | A | B | \n|---|---|\n| 1 | 2 |
  // Run before generic list/paragraph transforms to preserve table rows.
  const tableRegex = /(^\s*\|.*\|\s*\n^\s*\|[\s:|-]+\|\s*\n(?:^\s*\|.*\|\s*(?:\n|$))+)/gm;
  html = html.replace(tableRegex, (tableBlock) => {
    const rows = tableBlock
      .trim()
      .split('\n')
      .map((row) => row.trim())
      .filter(Boolean);
    if (rows.length < 2) return tableBlock;

    const headerCells = rows[0].split('|').slice(1, -1).map((c) => c.trim());
    const dataRows = rows.slice(2);

    let tableHtml = '<table><thead><tr>';
    headerCells.forEach((cell) => {
      tableHtml += `<th>${cell}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';
    dataRows.forEach((row) => {
      const cells = row.split('|').slice(1, -1).map((c) => c.trim());
      if (cells.length === 0) return;
      tableHtml += '<tr>';
      cells.forEach((cell) => {
        tableHtml += `<td>${cell}</td>`;
      });
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';
    return tableHtml;
  });

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Unordered lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    return `<ul>${match}</ul>`;
  });

  // Ordered lists
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
  // Wrap consecutive numbered <li> in <ol>
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    // Check if previous line was a list item
    return `<ol>${match}</ol>`;
  });

  // Paragraphs (lines that don't start with HTML tags)
  html = html.split('\n').map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<')) return trimmed; // Already HTML
    return `<p>${trimmed}</p>`;
  }).join('\n');

  return html;
}

function wrapTablesForResponsiveScroll(html: string): string {
  if (!html || !html.includes('<table')) {
    return html;
  }

  return html.replace(/<table\b([^>]*)>([\s\S]*?)<\/table>/gi, (_match, attrs, inner) => {
    const attrsText = typeof attrs === 'string' ? attrs : '';
    const classMatch = attrsText.match(/\bclass=(["'])(.*?)\1/i);
    const existingClasses = classMatch?.[2] || '';
    const mergedClasses = Array.from(
      new Set(
        `${existingClasses} min-w-full border-collapse`
          .trim()
          .split(/\s+/)
          .filter(Boolean)
      )
    ).join(' ');

    const tableAttrs = classMatch
      ? attrsText.replace(/\bclass=(["'])(.*?)\1/i, `class="${mergedClasses}"`)
      : `${attrsText} class="${mergedClasses}"`;

    return `<div data-table-scroll="true" class="my-8 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700"><table${tableAttrs}>${inner}</table></div>`;
  });
}

/**
 * Render content to safe HTML
 * This is the main function that should be used everywhere
 */
export function renderContent(
  content: string | null | undefined,
  options: RenderContentOptions = {}
): string {
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return '<p></p>';
  }

  let processed = content.trim();

  // Step 0: Decode HTML entities first (fixes &lt;strong&gt; showing as literal)
  if (processed.includes('&lt;') || processed.includes('&gt;') || processed.includes('&amp;')) {
    processed = decodeHTMLEntities(processed);
  }

  // Remove redundant ** around <strong> (AI sometimes outputs **<strong>X</strong>**)
  processed = processed.replace(/\*\*<strong>(.*?)<\/strong>\*\*/g, '<strong>$1</strong>');
  processed = processed.replace(/__<strong>(.*?)<\/strong>__/g, '<strong>$1</strong>');

  const format = options.format || detectContentFormat(processed);

  // Step 1: Handle format-specific conversion
  switch (format) {
    case 'html-escaped':
      // Already decoded above; ensure no double-encoding
      break;

    case 'markdown':
      // Convert Markdown to HTML
      processed = markdownToHTML(processed);
      break;

    case 'plain':
      // Convert plain text to HTML
      processed = plainTextToHTML(processed);
      break;

    case 'html':
    case 'auto':
      // HTML or auto-detected HTML - use as-is
      break;
  }

  // Step 2: Sanitize HTML (XSS protection)
  if (options.sanitize !== false) {
    processed = sanitizeAndRepairHTML(processed, {
      allowImages: options.allowImages !== false,
      allowTables: options.allowTables !== false,
      allowCode: options.allowCode !== false,
    });
  }

  if (options.allowTables !== false) {
    processed = wrapTablesForResponsiveScroll(processed);
  }

  return processed;
}

/**
 * Get content preview (first N characters, stripped of HTML)
 */
export function getContentPreview(
  content: string | null | undefined,
  maxLength: number = 160
): string {
  if (!content) return '';

  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, '');
  // Decode HTML entities
  const decoded = he.decode(text);
  // Trim and limit
  const trimmed = decoded.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return trimmed.substring(0, maxLength).trim() + '...';
}
