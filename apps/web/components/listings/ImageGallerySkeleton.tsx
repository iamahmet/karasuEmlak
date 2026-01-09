import { Skeleton } from '@karasu/ui';

export function ImageGallerySkeleton() {
  return (
    <div className="mb-8">
      <Skeleton className="h-[400px] md:h-[500px] w-full rounded-xl mb-4" />
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

