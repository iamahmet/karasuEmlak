'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@karasu/ui';
import { cn } from '@karasu/lib';
import { useFavoritesQuery } from '@/hooks/useFavoritesQuery';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  listingId: string;
  listingTitle?: string;
  variant?: 'card' | 'detail' | 'mobile';
  className?: string;
}

export function FavoriteButton({
  listingId,
  listingTitle = 'İlan',
  variant = 'card',
  className
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite: toggleFavoriteQuery, isLoading } = useFavoritesQuery();
  const isFavoriteLocal = isFavorite(listingId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;

    // Tracking event
    if (!isFavoriteLocal) {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'favorite_added', {
          event_category: 'engagement',
          event_label: listingId,
        });
      }
    }

    // Trigger optimistic update
    toggleFavoriteQuery(listingId);

    if (!isFavoriteLocal) {
      toast.success('Favorilere eklendi', {
        description: `${listingTitle} favorilerinize eklendi`,
        duration: 3000,
      });
    } else {
      toast.info('Favorilerden kaldırıldı', {
        description: `${listingTitle} favorilerinizden kaldırıldı`,
        duration: 3000,
      });
    }
  };

  if (variant === 'card') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={cn(
          "p-2 rounded-full transition-all duration-200 z-10",
          "bg-white/95 backdrop-blur-sm shadow-md",
          "hover:scale-110 active:scale-95",
          isFavoriteLocal
            ? "text-red-500 hover:text-red-600"
            : "text-gray-600 hover:text-gray-800",
          className
        )}
        aria-label={isFavoriteLocal ? 'Favorilerden kaldır' : 'Favorilere ekle'}
        title={isFavoriteLocal ? 'Favorilerden kaldır' : 'Favorilere ekle'}
      >
        <Heart className={cn("h-5 w-5", isFavoriteLocal && "fill-current")} />
      </button>
    );
  }

  if (variant === 'mobile') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={cn(
          "p-3 rounded-xl border-2 transition-all duration-200",
          isFavoriteLocal
            ? "bg-red-50 border-red-200 text-red-500"
            : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300",
          className
        )}
        aria-label={isFavoriteLocal ? 'Favorilerden kaldır' : 'Favorilere ekle'}
      >
        <Heart className={cn("h-5 w-5", isFavoriteLocal && "fill-current")} />
      </button>
    );
  }

  // Detail variant
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        "border-2",
        isFavoriteLocal
          ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
          : "border-gray-300 hover:border-gray-400",
        className
      )}
      aria-label={isFavoriteLocal ? 'Favorilerden Kaldır' : 'Favorilere Ekle'}
    >
      <Heart className={cn("h-4 w-4 mr-2", isFavoriteLocal && "fill-current")} />
      {isFavoriteLocal ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
    </Button>
  );
}
