"use client";

import { Skeleton } from "@karasu/ui";
import { Card, CardContent, CardHeader } from "@karasu/ui";

export function PageSkeleton() {
  return (
    <div className="admin-container responsive-padding space-section">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-64 bg-[#E7E7E7] dark:bg-[#062F28] rounded-lg" />
        <Skeleton className="h-4 w-96 bg-[#E7E7E7] dark:bg-[#062F28] rounded-lg" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="admin-grid-4 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="card-professional">
            <CardHeader className="pb-2 px-4 pt-4">
              <Skeleton className="h-3 w-20 skeleton-professional" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <Skeleton className="h-8 w-16 skeleton-professional rounded-lg mb-2" />
              <Skeleton className="h-2 w-full skeleton-professional rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="admin-grid-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="card-professional">
            <CardHeader className="pb-3 px-4 pt-4">
              <Skeleton className="h-5 w-32 skeleton-professional" />
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {[1, 2, 3].map((j) => (
                <Skeleton
                  key={j}
                  className="h-16 w-full skeleton-professional rounded-lg"
                />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-[#E7E7E7] dark:border-[#062F28] bg-white dark:bg-[#0a3d35]">
      <div className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                className="h-4 w-full skeleton-professional"
              />
            ))}
          </div>
          {/* Rows */}
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 pt-3">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton
                  key={j}
                  className="h-4 w-full skeleton-professional"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <Card className="card-professional">
      <CardHeader className="pb-3 px-4 pt-4">
        <Skeleton className="h-5 w-32 skeleton-professional" />
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <Skeleton className="h-4 w-full skeleton-professional" />
        <Skeleton className="h-4 w-3/4 skeleton-professional" />
        <Skeleton className="h-4 w-1/2 skeleton-professional" />
      </CardContent>
    </Card>
  );
}

