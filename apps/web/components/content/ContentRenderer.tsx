'use client';

import { memo, useMemo } from 'react';
import { renderContent, type ContentFormat, type RenderContentOptions } from '@/lib/utils/render-content';
import { processArticleContentImages } from '@/lib/utils/article-content-processor';
import { cn } from '@karasu/lib';

export interface ContentRendererProps {
  /**
   * Content to render (HTML, HTML-escaped, Markdown, or plain text)
   */
  content: string | null | undefined;
  
  /**
   * Explicit format (auto-detect if not provided)
   */
  format?: ContentFormat;
  
  /**
   * Sanitization options
   */
  sanitize?: boolean;
  allowImages?: boolean;
  allowTables?: boolean;
  allowCode?: boolean;
  
  /**
   * Process images (lazy loading, alt text, etc.)
   */
  processImages?: boolean;
  imageTitle?: string;
  
  /**
   * CSS classes for the container
   */
  className?: string;
  
  /**
   * Prose classes (Tailwind Typography)
   */
  prose?: boolean;
  proseSize?: 'sm' | 'base' | 'lg' | 'xl';
  
  /**
   * Custom prose classes
   */
  proseClassName?: string;
}

/**
 * Universal Content Renderer Component
 * 
 * Single source of truth for rendering content across the entire application.
 * Handles:
 * - Auto-detection of content format
 * - HTML entity decoding
 * - HTML sanitization
 * - Markdown to HTML conversion
 * - Image processing
 * - XSS protection
 * 
 * Usage:
 * ```tsx
 * <ContentRenderer 
 *   content={article.content}
 *   processImages
 *   imageTitle={article.title}
 *   prose
 *   proseSize="lg"
 * />
 * ```
 */
export const ContentRenderer = memo(function ContentRenderer({
  content,
  format,
  sanitize = true,
  allowImages = true,
  allowTables = true,
  allowCode = true,
  processImages = false,
  imageTitle,
  className,
  prose = true,
  proseSize = 'lg',
  proseClassName,
}: ContentRendererProps) {
  const renderedContent = useMemo(() => {
    if (!content) {
      return '<p></p>';
    }

    // Step 1: Render content (format detection, decoding, sanitization)
    let processed = renderContent(content, {
      format,
      sanitize,
      allowImages,
      allowTables,
      allowCode,
    });

    // Step 2: Process images if requested
    if (processImages && imageTitle) {
      processed = processArticleContentImages(processed, imageTitle);
    }

    return processed;
  }, [content, format, sanitize, allowImages, allowTables, allowCode, processImages, imageTitle]);

  // Build prose classes
  const proseClasses = prose
    ? cn(
        'prose',
        `prose-${proseSize}`,
        'prose-slate',
        'dark:prose-invert',
        'max-w-prose', // Better reading width
        // Headings
        'prose-headings:font-bold',
        'prose-headings:text-slate-900',
        'dark:prose-headings:text-slate-100',
        'prose-headings:tracking-tight',
        'prose-headings:scroll-mt-24',
        'prose-h2:text-2xl',
        'md:prose-h2:text-3xl',
        'prose-h2:mt-12',
        'prose-h2:mb-6',
        'prose-h2:pb-3',
        'prose-h2:border-b',
        'prose-h2:border-slate-200',
        'dark:prose-h2:border-slate-700',
        'prose-h3:text-xl',
        'md:prose-h3:text-2xl',
        'prose-h3:mt-10',
        'prose-h3:mb-5',
        // Paragraphs - better spacing
        'prose-p:leading-relaxed',
        'prose-p:mb-6',
        'prose-p:text-slate-700',
        'dark:prose-p:text-slate-300',
        // Lists
        'prose-ul:my-6',
        'prose-ol:my-6',
        'prose-li:my-2',
        'prose-li:leading-relaxed',
        // Blockquotes
        'prose-blockquote:border-l-4',
        'prose-blockquote:border-primary',
        'prose-blockquote:pl-6',
        'prose-blockquote:italic',
        'prose-blockquote:my-6',
        // Tables
        'prose-table:w-full',
        'prose-table:border-collapse',
        'prose-th:border',
        'prose-th:border-gray-300',
        'prose-th:bg-gray-50',
        'prose-th:p-3',
        'prose-th:text-left',
        'prose-td:border',
        'prose-td:border-gray-300',
        'prose-td:p-3',
        // Paragraphs
        'prose-p:text-base',
        'prose-p:leading-relaxed',
        'prose-p:text-slate-700',
        'dark:prose-p:text-slate-300',
        'prose-p:mb-6',
        // Links
        'prose-a:text-[#006AFF]',
        'dark:prose-a:text-blue-400',
        'prose-a:font-medium',
        'prose-a:no-underline',
        'prose-a:border-b',
        'prose-a:border-[#006AFF]/30',
        'dark:prose-a:border-blue-400/40',
        'hover:prose-a:border-[#006AFF]',
        'dark:hover:prose-a:border-blue-400',
        // Images
        'prose-img:rounded-xl',
        'prose-img:my-8',
        'prose-img:w-full',
        'prose-img:h-auto',
        'prose-img:border',
        'prose-img:border-slate-200',
        'dark:prose-img:border-slate-700',
        // Lists
        'prose-ul:my-6',
        'prose-ul:space-y-2',
        'prose-ol:my-6',
        'prose-ol:space-y-2',
        'prose-li:text-slate-700',
        'dark:prose-li:text-slate-300',
        'prose-li:leading-relaxed',
        // Code
        'prose-code:bg-slate-100',
        'dark:prose-code:bg-slate-800',
        'prose-code:text-slate-800',
        'dark:prose-code:text-slate-200',
        'prose-code:px-1.5',
        'prose-code:py-0.5',
        'prose-code:rounded',
        'prose-code:text-sm',
        'prose-code:font-mono',
        // Blockquotes
        'prose-blockquote:border-l-4',
        'prose-blockquote:border-[#006AFF]',
        'dark:prose-blockquote:border-blue-400',
        'prose-blockquote:bg-slate-50',
        'dark:prose-blockquote:bg-slate-800/50',
        'prose-blockquote:py-4',
        'prose-blockquote:px-6',
        'prose-blockquote:rounded-r-lg',
        'prose-blockquote:my-8',
        'prose-blockquote:text-slate-700',
        'dark:prose-blockquote:text-slate-300',
        proseClassName
      )
    : '';

  return (
    <div
      className={cn(proseClasses, className)}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
});
