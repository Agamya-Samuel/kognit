export function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="aspect-video animate-pulse bg-muted" />
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="mb-1 h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mb-3 h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
