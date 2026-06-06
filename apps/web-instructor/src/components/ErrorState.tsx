import { XCircle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <XCircle className="h-6 w-6 text-red-600" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-red-900">Error</h3>
      <p className="mb-6 text-red-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
