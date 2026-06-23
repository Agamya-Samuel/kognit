export default function Loading() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}