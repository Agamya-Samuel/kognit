import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">404</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Dashboard page not found</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}