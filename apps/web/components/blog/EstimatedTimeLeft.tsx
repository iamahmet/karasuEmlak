'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@karasu/lib';

interface EstimatedTimeLeftProps {
  totalReadingTime: number; // Total reading time in minutes
  articleContentSelector?: string; // CSS selector for article content
  articleId?: string; // Optional for tracking
}

export function EstimatedTimeLeft({
  totalReadingTime,
  articleContentSelector = '.blog-content-editorial, article',
  articleId,
}: EstimatedTimeLeftProps) {
  const [timeLeft, setTimeLeft] = useState(totalReadingTime);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const articleContent = document.querySelector(articleContentSelector);
      if (!articleContent) return;

      const rect = articleContent.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleHeight = rect.height;
      const articleBottom = articleTop + articleHeight;

      const scrollPosition = window.scrollY + window.innerHeight;
      const viewportHeight = window.innerHeight;

      // Calculate how much of the article has been scrolled through
      const scrolledInArticle = Math.max(0, scrollPosition - articleTop);
      const progressPercent = Math.min(100, (scrolledInArticle / articleHeight) * 100);

      setProgress(progressPercent);

      // Calculate remaining time
      const remainingPercent = Math.max(0, 100 - progressPercent);
      const remaining = Math.ceil((remainingPercent / 100) * totalReadingTime);
      setTimeLeft(remaining);

      // Show widget after scrolling into article, hide when done
      const shouldShow = window.scrollY > articleTop - viewportHeight / 2 && progressPercent < 95;
      setIsVisible(shouldShow);
    };

    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(calculateTimeLeft);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [totalReadingTime, articleContentSelector]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-300',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}
    >
      {/* Progress Circle */}
      <div className="relative w-10 h-10">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
          {/* Background circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="3"
          />
          {/* Progress circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="#006AFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${progress} 100`}
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Clock className="h-4 w-4 text-primary" />
        </div>
      </div>

      {/* Time Text */}
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 font-medium">Kalan süre</span>
        <span className="text-sm font-bold text-gray-900">
          {timeLeft === 0 ? 'Bitti!' : `${timeLeft} dk`}
        </span>
      </div>
    </div>
  );
}
