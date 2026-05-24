'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@edutech/shared-components';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens } = useAuth();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      router.push('/dashboard');
    } else {
      router.push('/auth/login?error=oauth_failed');
    }
  }, [searchParams, router, setTokens]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]" />
        <p className="mt-4 text-sm text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
