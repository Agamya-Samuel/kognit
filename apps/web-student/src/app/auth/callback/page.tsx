'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@edutech/shared-components';
import { authService } from '@edutech/api-client';

const REQUIRED_ROLE = 'student';

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950"><div className="text-center"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" /><p className="mt-4 text-sm text-muted-foreground">Completing sign in...</p></div></div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens, clearAuth } = useAuth();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const handleCallback = async () => {
      // Handle portal access denial from backend OAuth callback
      const error = searchParams.get('error');
      if (error) {
        clearAuth();
        router.push(`/auth/login?error=${encodeURIComponent(error)}`);
        return;
      }

      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');

      if (!accessToken || !refreshToken) {
        router.push('/auth/login?error=oauth_failed');
        return;
      }

      // Store tokens temporarily to fetch profile for role validation
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      try {
        const profile = await authService.getMe() as { role?: string };
        // Validate role before redirecting to dashboard
        if (profile.role && profile.role !== REQUIRED_ROLE) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          clearAuth();
          router.push(`/auth/login?error=${encodeURIComponent('Access denied. This portal is for students only.')}`);
          return;
        }
        // Role is valid — set tokens via AuthProvider and proceed to dashboard
        setTokens(accessToken, refreshToken);
        router.push('/dashboard');
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/auth/login?error=oauth_failed');
      }
    };

    handleCallback();
  }, [searchParams, router, setTokens, clearAuth]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]" />
        <p className="mt-4 text-sm text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
