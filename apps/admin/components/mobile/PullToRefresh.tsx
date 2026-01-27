'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@karasu/lib';
import { triggerHaptic } from '@/lib/mobile/haptics';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  threshold?: number;
  disabled?: boolean;
  className?: string;
  pullDownContent?: ReactNode;
  releaseContent?: ReactNode;
  refreshingContent?: ReactNode;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  disabled = false,
  className,
  pullDownContent,
  releaseContent,
  refreshingContent,
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [canRelease, setCanRelease] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  useEffect(() => {
    if (disabled || isRefreshing) return;

    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if at the top of the page
      if (window.scrollY > 10) return;
      
      startYRef.current = e.touches[0].clientY;
      currentYRef.current = startYRef.current;
      isDraggingRef.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;

      currentYRef.current = e.touches[0].clientY;
      const distance = currentYRef.current - startYRef.current;

      // Only allow downward pull
      if (distance > 0 && window.scrollY === 0) {
        e.preventDefault();
        setIsPulling(true);
        setPullDistance(Math.min(distance, threshold * 1.5));
        setCanRelease(distance >= threshold);
        
        // Haptic feedback when threshold is reached
        if (distance >= threshold && !canRelease) {
          triggerHaptic('light');
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!isDraggingRef.current) return;

      isDraggingRef.current = false;

      if (canRelease && pullDistance >= threshold) {
        setIsRefreshing(true);
        setPullDistance(threshold);
        triggerHaptic('medium');
        
        try {
          await onRefresh();
        } catch (error) {
          console.error('Pull to refresh failed:', error);
        } finally {
          setIsRefreshing(false);
          setIsPulling(false);
          setPullDistance(0);
          setCanRelease(false);
        }
      } else {
        // Spring back
        setIsPulling(false);
        setPullDistance(0);
        setCanRelease(false);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [disabled, isRefreshing, onRefresh, threshold, canRelease, pullDistance]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const rotation = pullProgress * 180;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Pull to refresh indicator */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200',
          isPulling || isRefreshing ? 'opacity-100' : 'opacity-0',
          isRefreshing ? 'translate-y-0' : '-translate-y-full'
        )}
        style={{
          transform: `translateY(${isRefreshing ? 0 : -100 + pullDistance * 0.5}px)`,
          height: `${Math.min(pullDistance, threshold * 1.5)}px`,
        }}
      >
        {isRefreshing ? (
          refreshingContent || (
            <div className="flex items-center gap-2 text-primary">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Yenileniyor...</span>
            </div>
          )
        ) : canRelease ? (
          releaseContent || (
            <div className="flex items-center gap-2 text-primary">
              <Loader2
                className="h-5 w-5 transition-transform duration-200"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
              <span className="text-sm font-medium">Bırakın, yenilensin</span>
            </div>
          )
        ) : (
          pullDownContent || (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2
                className="h-5 w-5 transition-transform duration-200"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
              <span className="text-sm font-medium">Aşağı çekin, yenileyin</span>
            </div>
          )
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          'transition-transform duration-200',
          isPulling && !isRefreshing && 'translate-y-0'
        )}
        style={{
          transform: isRefreshing
            ? 'translateY(0)'
            : isPulling
            ? `translateY(${Math.min(pullDistance * 0.3, threshold * 0.3)}px)`
            : 'translateY(0)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
