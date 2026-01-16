'use client';

import { useState, useEffect, useCallback } from 'react';
import { InfiniteScroll } from '@/components/mobile/InfiniteScroll';
import { fetchListings, type FetchListingsParams } from '@/lib/api/listings-client';
import type { Listing, ListingFilters, ListingSort } from '@/lib/supabase/queries';
import { cn } from '@karasu/lib';

interface InfiniteScrollListingsProps {
  initialListings: Listing[];
  initialTotal: number;
  filters?: ListingFilters;
  sort?: ListingSort;
  basePath?: string;
  limit?: number;
  renderListing: (listing: Listing, index: number) => React.ReactNode;
  className?: string;
}

export function InfiniteScrollListings({
  initialListings,
  initialTotal,
  filters = {},
  sort = { field: 'created_at', order: 'desc' },
  basePath = '',
  limit = 18,
  renderListing,
  className,
}: InfiniteScrollListingsProps) {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [total, setTotal] = useState(initialTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);

  const hasMore = listings.length < total;

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const offset = page * limit;
      const result = await fetchListings({
        filters,
        sort,
        limit,
        offset,
        basePath,
      });

      setListings((prev) => [...prev, ...result.listings]);
      setTotal(result.total);
      setPage((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more listings'));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, limit, filters, sort, basePath]);

  const handleRetry = useCallback(() => {
    setError(null);
    loadMore();
  }, [loadMore]);

  // Reset when filters or sort change
  useEffect(() => {
    setListings(initialListings);
    setTotal(initialTotal);
    setPage(1);
    setError(null);
  }, [initialListings, initialTotal]);

  return (
    <InfiniteScroll
      hasMore={hasMore}
      isLoading={isLoading}
      onLoadMore={loadMore}
      error={error}
      onRetry={handleRetry}
      className={className}
      endMessage={
        <div className="py-8 text-center">
          <p className="text-sm text-slate-600">
            Tüm ilanlar gösterildi ({total} ilan)
          </p>
        </div>
      }
    >
      <div className="space-y-4">
        {listings.map((listing, index) => (
          <div key={listing.id}>
            {renderListing(listing, index)}
          </div>
        ))}
      </div>
    </InfiniteScroll>
  );
}
