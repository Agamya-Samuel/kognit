'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Button } from '@edutech/ui';
import { AlertCircle, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-lg">Dashboard Error</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              An error occurred while loading the dashboard. This has been logged and
              our team will investigate.
            </p>
            {error.message && (
              <div className="rounded-md bg-gray-100 p-3 dark:bg-gray-800">
                <p className="text-xs font-mono text-gray-700 dark:text-gray-300">
                  {error.message}
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={reset} variant="outline" className="gap-2">
                Try Again
              </Button>
              <Link href="/dashboard">
                <Button className="gap-2">
                  <Home className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
