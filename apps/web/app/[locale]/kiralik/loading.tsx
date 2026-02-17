import { ListingGridSkeleton } from '@/components/listings/ListingCardSkeleton';
import { Skeleton } from '@karasu/ui';

export default function KiralikLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Hero / Page Intro */}
        <div className="rounded-2xl p-6 md:p-8 space-y-4">
          <Skeleton className="h-10 w-3/4 max-w-md" />
          <Skeleton className="h-6 w-full max-w-2xl" />
          <div className="flex flex-wrap gap-3 pt-4">
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </div>

        {/* Trust Bar */}
        <div className="flex flex-wrap gap-6 py-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-lg" />
          ))}
        </div>

        {/* Listings Grid */}
        <ListingGridSkeleton count={9} />
      </div>
    </div>
  );
}
