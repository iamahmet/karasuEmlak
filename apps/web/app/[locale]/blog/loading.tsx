import { Skeleton } from '@karasu/ui';

export default function BlogLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Hero */}
        <div className="rounded-2xl p-6 md:p-8 space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-5 w-full max-w-2xl" />
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-40 rounded-lg" />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden border">
              <Skeleton className="h-48 w-full" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center gap-2 pt-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
