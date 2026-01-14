'use client';

import { useEffect, useState } from 'react';
import { List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@karasu/ui';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface CornerstoneTableOfContentsProps {
  className?: string;
  headings?: Heading[];
}

/**
 * Table of Contents for Cornerstone Pages
 * 
 * Automatically extracts headings from page content
 * Provides sticky navigation with active section highlighting
 */
export function CornerstoneTableOfContents({
  className,
  headings: providedHeadings,
}: CornerstoneTableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>(providedHeadings || []);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  // Extract headings from DOM if not provided
  useEffect(() => {
    if (providedHeadings && providedHeadings.length > 0) {
      setHeadings(providedHeadings);
      return;
    }

    const timer = setTimeout(() => {
      const article = document.querySelector('article, main, .content');
      if (!article) return;

      const headingElements = article.querySelectorAll('h2, h3');
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
  }, [providedHeadings]);

  // Track active heading on scroll
  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
      
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        if (element && element.getBoundingClientRect().top <= 150) {
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

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      setActiveId(id);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile - Floating Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="icon"
          className="rounded-full shadow-lg h-14 w-14"
          aria-label="İçindekiler"
        >
          <List className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile - Drawer */}
      {isOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl z-50 max-h-[60vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <List className="h-5 w-5" />
                  İçindekiler
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  aria-label="Kapat"
                >
                  ✕
                </Button>
              </div>
            </div>
            <nav className="p-4 space-y-2">
              {headings.map((heading) => (
                <button
                  key={heading.id}
                  onClick={() => scrollToHeading(heading.id)}
                  className={cn(
                    'block w-full text-left text-sm transition-colors hover:text-primary',
                    heading.level === 2 && 'font-medium pl-0',
                    heading.level === 3 && 'font-normal pl-4 text-gray-600 dark:text-gray-400',
                    activeId === heading.id && 'text-primary font-semibold'
                  )}
                >
                  {heading.text}
                </button>
              ))}
            </nav>
          </div>
        </>
      )}

      {/* Desktop - Sticky Sidebar */}
      <div className={cn('hidden lg:block', className)}>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sticky top-24 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <List className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">İçindekiler</h3>
          </div>
          <nav className="space-y-1.5">
            {headings.map((heading) => (
              <button
                key={heading.id}
                onClick={() => scrollToHeading(heading.id)}
                className={cn(
                  'block w-full text-left text-sm transition-colors hover:text-primary',
                  heading.level === 2 && 'font-medium pl-0',
                  heading.level === 3 && 'font-normal pl-3 text-gray-600 dark:text-gray-400',
                  activeId === heading.id && 'text-primary font-semibold'
                )}
              >
                {heading.text}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
