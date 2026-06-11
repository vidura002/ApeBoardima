interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[#F1F5F9] rounded-lg ${className}`}
    />
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
      <div className="animate-pulse bg-[#F1F5F9] w-full" style={{ paddingBottom: '66%' }} />
      <div className="p-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <Skeleton className="h-6 w-28 rounded-md" />
          <Skeleton className="h-4 w-10 rounded-md" />
        </div>
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-4 w-1/2 rounded-md" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-16 rounded-lg" />
          <Skeleton className="h-6 w-12 rounded-lg" />
          <Skeleton className="h-6 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
