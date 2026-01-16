'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, Trash2, ChevronRight } from 'lucide-react';
import { cn } from '@karasu/lib';
import { createSwipeHandlers } from '@/lib/mobile/swipe-gestures';
import { hapticButtonPress, hapticSuccess } from '@/lib/mobile/haptics';
import type { Listing } from '@/lib/supabase/queries';

interface SwipeableListingCardProps {
  listing: Listing;
  basePath: string;
  onFavorite?: (listingId: string) => void;
  onShare?: (listing: Listing) => void;
  onDelete?: (listingId: string) => void;
  isFavorite?: boolean;
  className?: string;
  children: React.ReactNode; // The card content
}

export function SwipeableListingCard({
  listing,
  basePath,
  onFavorite,
  onShare,
  onDelete,
  isFavorite = false,
  className,
  children,
}: SwipeableListingCardProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 100;
  const ACTION_WIDTH = 80;

  const swipeHandlers = createSwipeHandlers(
    {
      onSwipeLeft: () => {
        if (swipeOffset < -SWIPE_THRESHOLD) {
          hapticSuccess();
          setSwipeOffset(-ACTION_WIDTH * 2); // Show actions
        }
      },
      onSwipeRight: () => {
        if (swipeOffset < 0) {
          setSwipeOffset(0); // Hide actions
        }
      },
    },
    { threshold: 50, preventDefault: false }
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsSwiping(true);
    swipeHandlers.onTouchStart(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;

    const touch = e.touches[0];
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const deltaX = touch.clientX - rect.left - rect.width / 2;

    // Allow swiping left only
    if (deltaX < 0) {
      setSwipeOffset(Math.max(deltaX, -ACTION_WIDTH * 2));
    }

    swipeHandlers.onTouchMove(e);
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    swipeHandlers.onTouchEnd();

    // Snap to nearest position
    if (swipeOffset < -SWIPE_THRESHOLD) {
      setSwipeOffset(-ACTION_WIDTH * 2);
    } else {
      setSwipeOffset(0);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    hapticButtonPress();
    onFavorite?.(listing.id);
    setSwipeOffset(0);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    hapticButtonPress();
    onShare?.(listing);
    setSwipeOffset(0);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    hapticButtonPress();
    onDelete?.(listing.id);
    setSwipeOffset(0);
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Action buttons (behind card) */}
      <div className="absolute inset-y-0 right-0 flex items-center">
        <div className="flex h-full">
          {/* Favorite button */}
          {onFavorite && (
            <button
              onClick={handleFavorite}
              className={cn(
                'flex items-center justify-center w-20 h-full transition-colors touch-manipulation min-w-[80px]',
                isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              )}
              style={{ touchAction: 'manipulation' }}
              aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            >
              <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
            </button>
          )}

          {/* Share button */}
          {onShare && (
            <button
              onClick={handleShare}
              className="flex items-center justify-center w-20 h-full bg-[#006AFF] text-white transition-colors hover:bg-[#0052CC] touch-manipulation min-w-[80px]"
              style={{ touchAction: 'manipulation' }}
              aria-label="Paylaş"
            >
              <Share2 className="h-5 w-5" />
            </button>
          )}

          {/* Delete button (only if onDelete provided) */}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center justify-center w-20 h-full bg-red-600 text-white transition-colors hover:bg-red-700 touch-manipulation min-w-[80px]"
              style={{ touchAction: 'manipulation' }}
              aria-label="Sil"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Card content (swipeable) */}
      <motion.div
        ref={cardRef}
        className="relative bg-white"
        style={{
          x: swipeOffset,
        }}
        animate={{
          x: swipeOffset,
        }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 300,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        drag="x"
        dragConstraints={{ left: -ACTION_WIDTH * 2, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.x < -SWIPE_THRESHOLD) {
            setSwipeOffset(-ACTION_WIDTH * 2);
          } else {
            setSwipeOffset(0);
          }
        }}
      >
        {children}
      </motion.div>

      {/* Swipe hint (only on mobile, first time) */}
      {swipeOffset === 0 && typeof window !== 'undefined' && window.innerWidth < 768 && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none">
          <ChevronRight className="h-6 w-6 text-slate-400" />
        </div>
      )}
    </div>
  );
}
