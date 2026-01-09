'use client';

import { Card } from '@karasu/ui';

interface ListingCardSkeletonProps {
  variant?: 'grid' | 'list';
}

/**
 * Listing Card Skeleton
 * Loading state for listing cards
 * Follows design system: subtle, professional
 */
export function ListingCardSkeleton({ variant = 'grid' }: ListingCardSkeletonProps) {
  if (variant === 'list') {
    return (
      <Card className="border border-gray-200 rounded-xl bg-white animate-fade-in">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-64 h-48 md:h-auto bg-gradient-to-br from-gray-100 to-gray-200 loading-shimmer">
          </div>
          <div className="p-5 flex-1 space-y-3">
            <div className="h-5 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-3/4 loading-shimmer"></div>
            <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-1/2 loading-shimmer"></div>
            <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-2/3 loading-shimmer"></div>
            <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
              <div className="h-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-24 loading-shimmer"></div>
              <div className="h-9 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-20 loading-shimmer"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 rounded-xl overflow-hidden bg-white animate-fade-in">
      <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 loading-shimmer">
      </div>
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-full loading-shimmer"></div>
        <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-2/3 loading-shimmer"></div>
        <div className="flex gap-4 mt-4">
          <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-16 loading-shimmer"></div>
          <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-16 loading-shimmer"></div>
          <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-16 loading-shimmer"></div>
        </div>
        <div className="pt-3 border-t border-gray-100">
          <div className="h-7 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-1/3 loading-shimmer"></div>
        </div>
      </div>
    </Card>
  );
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} variant="grid" />
      ))}
    </div>
  );
}

export function ListingListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} variant="list" />
      ))}
    </div>
  );
}
