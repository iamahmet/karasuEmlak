'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';
import { cn } from '@karasu/lib';
import { LoadingState } from '@/components/ui/LoadingState';

interface InfiniteScrollProps {
  children: ReactNode;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void | Promise<void>;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  loadingComponent?: ReactNode;
  endMessage?: ReactNode;
  error?: Error | null;
  onRetry?: () => void;
}

export function InfiniteScroll({
  children,
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 0.1,
  rootMargin = '100px',
  className,
  loadingComponent,
  endMessage,
  error,
  onRetry,
}: InfiniteScrollProps) {
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: false,
  });

  const hasLoadedMoreRef = useRef(false);

  useEffect(() => {
    if (inView && hasMore && !isLoading && !hasLoadedMoreRef.current) {
      hasLoadedMoreRef.current = true;
      Promise.resolve(onLoadMore()).finally(() => {
        // Reset after a short delay to allow for loading state
        setTimeout(() => {
          hasLoadedMoreRef.current = false;
        }, 500);
      });
    }
  }, [inView, hasMore, isLoading, onLoadMore]);

  return (
    <div className={cn('space-y-4', className)}>
      {children}

      {/* Loading trigger element */}
      {hasMore && (
        <div ref={ref} className="h-1 w-full" aria-hidden="true" />
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="py-8">
          {loadingComponent || (
            <LoadingState
              variant="skeleton"
              skeletonCount={3}
              message="Daha fazla ilan yükleniyor..."
            />
          )}
        </div>
      )}

      {/* Error state */}
      {error && onRetry && (
        <div className="py-8 text-center">
          <p className="text-sm text-red-600 mb-4">
            Yükleme sırasında bir hata oluştu
          </p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-[#006AFF] text-white rounded-lg font-medium hover:bg-[#0052CC] transition-colors touch-manipulation min-h-[44px]"
            style={{ touchAction: 'manipulation' }}
          >
            Tekrar Dene
          </button>
        </div>
      )}

      {/* End message */}
      {!hasMore && !isLoading && endMessage && (
        <div className="py-8 text-center">
          {endMessage}
        </div>
      )}
    </div>
  );
}
