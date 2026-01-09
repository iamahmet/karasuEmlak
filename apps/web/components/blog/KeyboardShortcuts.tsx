'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface KeyboardShortcutsProps {
  basePath: string;
  articleId: string;
}

export function KeyboardShortcuts({ basePath, articleId }: KeyboardShortcutsProps) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // J/K navigation (like Medium, GitHub)
      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        // Scroll down
        window.scrollBy({ top: window.innerHeight * 0.7, behavior: 'smooth' });
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        // Scroll up
        window.scrollBy({ top: -window.innerHeight * 0.7, behavior: 'smooth' });
      }

      // B - Back to blog
      if (e.key === 'b' || e.key === 'B') {
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          router.push(`${basePath}/blog`);
        }
      }

      // S - Share
      if (e.key === 's' || e.key === 'S') {
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          if (navigator.share) {
            navigator.share({
              title: document.title,
              url: window.location.href,
            });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [basePath, router]);

  return null; // This component doesn't render anything
}
