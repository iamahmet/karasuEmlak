'use client';

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@karasu/lib';

interface ReadingProgressProps {
  showPercentage?: boolean;
  position?: 'top' | 'bottom';
}

export function ReadingProgress({ showPercentage = false, position = 'top' }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const updateProgress = useCallback(() => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const scrollableHeight = documentHeight - windowHeight;
    const scrolled = scrollTop / scrollableHeight;

    const newProgress = Math.min(100, Math.max(0, scrolled * 100));
    setProgress(newProgress);

    // Show progress bar after scrolling a bit
    setIsVisible(scrollTop > 100);
  }, []);

  useEffect(() => {
    // Use requestAnimationFrame for smoother updates
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateProgress();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [updateProgress]);

  return (
    <>
      {/* Main progress bar */}
      <div
        className={cn(
          "fixed left-0 right-0 h-1 z-50 transition-all duration-300",
          position === 'top' ? 'top-0' : 'bottom-0',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Background track */}
        <div className="absolute inset-0 bg-gray-200/50 backdrop-blur-sm" />

        {/* Progress fill with gradient and glow */}
        <div
          className="relative h-full bg-gradient-to-r from-primary via-blue-500 to-primary transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />

          {/* Glow effect at the end */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary blur-md opacity-75"
            style={{ display: progress > 5 ? 'block' : 'none' }}
          />
        </div>
      </div>

      {/* Floating percentage indicator */}
      {showPercentage && isVisible && (
        <div
          className={cn(
            "fixed right-4 z-50 transition-all duration-300",
            position === 'top' ? 'top-4' : 'bottom-4',
            progress > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          )}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-200/50">
            <div className="relative w-8 h-8">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-gray-200"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="text-primary transition-all duration-200"
                  strokeDasharray={`${progress * 0.94}, 100`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
