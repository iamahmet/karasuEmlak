import { ListingGridSkeleton } from '@/components/listings/ListingCardSkeleton';
import { Skeleton } from '@karasu/ui';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-8">
        {/* Hero Section Skeleton */}
        <div className="text-center py-20">
          <Skeleton className="h-16 w-96 mx-auto mb-6" />
          <Skeleton className="h-6 w-2/3 mx-auto mb-8" />
          <Skeleton className="h-12 w-full max-w-3xl mx-auto mb-8 rounded-lg" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-12 w-32 rounded-lg" />
            <Skeleton className="h-12 w-32 rounded-lg" />
          </div>
        </div>

        {/* Content Grid Skeleton */}
        <ListingGridSkeleton count={6} />
      </div>
    </div>
  );
}

