'use client';

import { Loader2 } from 'lucide-react';
import { Skeleton } from '@karasu/ui';
import { cn } from '@karasu/lib';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
  skeletonCount?: number;
  variant?: 'spinner' | 'skeleton' | 'cards' | 'grid';
}

/**
 * Loading State Component
 * Standardized loading states for web app
 */
export function LoadingState({
  message = 'Yükleniyor...',
  fullScreen = false,
  className,
  skeletonCount = 6,
  variant = 'spinner',
}: LoadingStateProps) {
  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-xl" style={{ animationDelay: `${i * 0.1}s` }} />
            <div className="space-y-2 px-4">
              <Skeleton className="h-4 w-3/4" style={{ animationDelay: `${i * 0.1 + 0.05}s` }} />
              <Skeleton className="h-4 w-1/2" style={{ animationDelay: `${i * 0.1 + 0.1}s` }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-xl" style={{ animationDelay: `${i * 0.1}s` }} />
            <div className="space-y-2 px-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <Skeleton className="h-56 w-full" style={{ animationDelay: `${i * 0.1}s` }} />
            <div className="p-5 space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        fullScreen ? 'min-h-screen' : 'py-12',
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-[#006AFF] mb-4" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
