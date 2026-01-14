'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ReadingProgressProps {
  className?: string;
  showTimeRemaining?: boolean;
  estimatedReadingTime?: number; // in minutes
}

/**
 * Reading Progress Indicator
 * 
 * Shows reading progress as user scrolls through content
 * Displays progress bar and optionally time remaining
 */
export function ReadingProgress({
  className,
  showTimeRemaining = false,
  estimatedReadingTime,
}: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector('article, main, .content');
      if (!article) return;

      const articleTop = article.getBoundingClientRect().top + window.scrollY;
      const articleHeight = article.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY;

      // Calculate progress
      const scrolled = scrollTop - articleTop + windowHeight;
      const total = articleHeight;
      const percentage = Math.min(100, Math.max(0, (scrolled / total) * 100));
      
      setProgress(percentage);

      // Calculate time remaining
      if (showTimeRemaining && estimatedReadingTime) {
        const remaining = Math.max(0, estimatedReadingTime * (1 - percentage / 100));
        setTimeRemaining(Math.ceil(remaining));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showTimeRemaining, estimatedReadingTime]);

  if (progress === 0) return null;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200 dark:bg-gray-800',
        className
      )}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Okuma ilerlemesi"
    >
      <div
        className="h-full bg-primary transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
      {showTimeRemaining && timeRemaining !== null && timeRemaining > 0 && (
        <div className="absolute top-2 right-4 text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 px-2 py-1 rounded shadow-sm">
          ~{timeRemaining} dk kaldı
        </div>
      )}
    </div>
  );
}
