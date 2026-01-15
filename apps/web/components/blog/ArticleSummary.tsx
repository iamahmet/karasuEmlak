'use client';

import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArticleSummaryProps {
  content: string;
  className?: string;
}

/**
 * ArticleSummary Component (TL;DR)
 * 
 * Extracts and displays a summary from article content
 * Typically shows first 2-3 paragraphs as "Özet"
 */
export function ArticleSummary({ content, className }: ArticleSummaryProps) {
  // Extract first 2-3 paragraphs from content
  const extractSummary = (html: string): string => {
    // Remove HTML tags temporarily to extract text
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Get first 2-3 sentences or ~200 characters
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const summary = sentences.slice(0, 3).join('. ').trim();
    
    if (summary.length > 250) {
      return summary.substring(0, 247) + '...';
    }
    
    return summary || text.substring(0, 200) + '...';
  };

  const summary = extractSummary(content);

  if (!summary || summary.length < 50) {
    return null;
  }

  return (
    <div className={cn(
      "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-lg p-6 mb-8",
      className
    )}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Özet
          </h3>
          <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
}
