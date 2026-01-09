'use client';

import { useState, useEffect, useRef } from 'react';
import { List, ChevronDown, ChevronUp, Hash } from 'lucide-react';
import { cn } from '@karasu/lib';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface EnhancedTableOfContentsProps {
  content: string;
  articleId: string;
  articleTitle: string;
  className?: string;
}

function extractHeadings(htmlContent: string): TOCItem[] {
  const tempDiv = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (!tempDiv) return [];

  tempDiv.innerHTML = htmlContent;
  const headings = tempDiv.querySelectorAll('h2, h3, h4');
  const items: TOCItem[] = [];

  headings.forEach((heading, index) => {
    const text = heading.textContent?.trim() || '';
    if (text) {
      // Generate ID from text if not present
      let id = heading.id;
      if (!id) {
        id = text
          .toLowerCase()
          .replace(/[^a-z0-9\u00C0-\u017F]+/gi, '-')
          .replace(/(^-|-$)/g, '')
          .substring(0, 50) || `heading-${index}`;
      }

      items.push({
        id,
        text,
        level: parseInt(heading.tagName.charAt(1), 10),
      });
    }
  });

  return items;
}

export function EnhancedTableOfContents({
  content,
  articleId,
  articleTitle,
  className,
}: EnhancedTableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [readProgress, setReadProgress] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Extract headings from content
  useEffect(() => {
    const items = extractHeadings(content);
    setHeadings(items);

    // Add IDs to actual headings in DOM
    if (typeof document !== 'undefined') {
      setTimeout(() => {
        const articleEl = document.querySelector('.blog-content-editorial, article');
        if (articleEl) {
          const domHeadings = articleEl.querySelectorAll('h2, h3, h4');
          domHeadings.forEach((heading, index) => {
            if (!heading.id && items[index]) {
              heading.id = items[index].id;
            }
          });
        }
      }, 100);
    }
  }, [content]);

  // Intersection Observer for active heading
  useEffect(() => {
    if (headings.length === 0) return;

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: '-80px 0px -80% 0px',
      threshold: 0,
    });

    // Observe all headings
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [headings]);

  // Reading progress
  useEffect(() => {
    const handleScroll = () => {
      const articleEl = document.querySelector('.blog-content-editorial, article');
      if (!articleEl) return;

      const rect = articleEl.getBoundingClientRect();
      const scrollTop = window.scrollY;
      const docHeight = articleEl.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;

      setReadProgress(Math.min(100, Math.max(0, scrollPercent)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // Track TOC click
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'toc_click', {
          article_id: articleId,
          heading_id: id,
        });
      }
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav
      className={cn(
        'bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm',
        className
      )}
      aria-label="İçindekiler"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-3 p-4 hover:bg-gray-50 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <List className="h-4 w-4 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 text-sm">İçindekiler</h3>
            <span className="text-xs text-gray-500">{headings.length} bölüm</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Progress indicator */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${readProgress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-8">{Math.round(readProgress)}%</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* TOC List */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <ul className="space-y-1 border-l-2 border-gray-100">
            {headings.map((heading) => {
              const isActive = activeId === heading.id;
              const paddingLeft = (heading.level - 2) * 12 + 12;

              return (
                <li key={heading.id}>
                  <button
                    onClick={() => scrollToHeading(heading.id)}
                    className={cn(
                      'w-full text-left py-2 pr-3 text-sm transition-all duration-200 border-l-2 -ml-0.5 flex items-start gap-2',
                      isActive
                        ? 'text-primary font-medium border-primary bg-primary/5'
                        : 'text-gray-600 hover:text-gray-900 border-transparent hover:border-gray-300'
                    )}
                    style={{ paddingLeft: `${paddingLeft}px` }}
                  >
                    {heading.level === 2 && (
                      <Hash className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 opacity-50" />
                    )}
                    <span className="line-clamp-2">{heading.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
}
