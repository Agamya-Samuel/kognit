export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400" aria-hidden="true">Loading...</p>
      </div>
    </div>
  );
}
