'use client';

import { useEffect, useState } from 'react';
import { List, ChevronDown } from 'lucide-react';
import { cn } from '@karasu/lib';
import { trackTOCClick } from '@/lib/analytics/blog-events';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
  articleId?: string;
  articleSlug?: string;
  articleTitle?: string;
}

export function TableOfContents({ content, className, articleId, articleSlug, articleTitle }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const articleContent = document.querySelector('.blog-content-editorial');
      if (!articleContent) return;

      const headingElements = articleContent.querySelectorAll('h2, h3, h4');
      
      const extractedHeadings: Heading[] = [];
      headingElements.forEach((heading) => {
        const text = heading.textContent || '';
        const level = parseInt(heading.tagName.charAt(1));
        
        let id = heading.id;
        if (!id) {
          id = text
            .toLowerCase()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          heading.id = id;
        }
        
        extractedHeadings.push({ id, text, level });
      });

      setHeadings(extractedHeadings);
    }, 100);

    return () => clearTimeout(timer);
  }, [content]);

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
      
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        if (element && element.getBoundingClientRect().top <= 100) {
          setActiveId(element.id);
          break;
        }
      }
    };

    if (headings.length > 0) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <>
      {/* Mobile - Collapsible */}
      <div className={cn("lg:hidden mb-6", className)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <List className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-gray-900">İçindekiler</span>
            <span className="text-xs text-gray-500">({headings.length})</span>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-gray-500 transition-transform", isOpen && "rotate-180")} />
        </button>
        {isOpen && (
          <nav className="mt-2 p-4 bg-white rounded-lg border border-gray-200 space-y-2">
            {headings.map((heading) => (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                className={cn(
                  "block text-sm transition-colors hover:text-primary",
                  heading.level === 2 && "font-semibold pl-0",
                  heading.level === 3 && "font-medium pl-4 text-gray-600",
                  heading.level === 4 && "font-normal pl-8 text-gray-500 text-xs",
                  activeId === heading.id && "text-primary font-semibold"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  const element = document.getElementById(heading.id);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setActiveId(heading.id);
                  }
                }}
              >
                {heading.text}
              </a>
            ))}
          </nav>
        )}
      </div>

      {/* Desktop - Sticky */}
      <div className={cn("hidden lg:block", className)}>
        <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-24">
          <div className="flex items-center gap-2 mb-4">
            <List className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-gray-900">İçindekiler</h3>
          </div>
          <nav className="space-y-1.5">
            {headings.map((heading) => (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                className={cn(
                  "block text-sm transition-colors hover:text-primary",
                  heading.level === 2 && "font-medium pl-0",
                  heading.level === 3 && "font-normal pl-3 text-gray-600",
                  heading.level === 4 && "font-normal pl-6 text-gray-500 text-xs",
                  activeId === heading.id && "text-primary font-semibold"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(heading.id);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setActiveId(heading.id);
                    // Track TOC click
                    if (articleId && articleSlug && articleTitle) {
                      trackTOCClick(
                        {
                          articleId,
                          articleSlug,
                          articleTitle,
                        },
                        heading.text
                      );
                    }
                  }
                }}
              >
                {heading.text}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
