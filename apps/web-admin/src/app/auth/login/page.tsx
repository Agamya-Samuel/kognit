'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm, useAuth } from '@edutech/shared-components';
import { authService } from '@edutech/api-client';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string>();

  // Display error messages from OAuth callback (e.g., portal access denial)
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(urlError);
    }
  }, [searchParams]);

  const handleGoogleLogin = () => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    window.location.href = authService.getGoogleAuthUrl(redirectUrl, 'admin');
  };

  return (
    <LoginForm
      error={error}
      onSubmit={async (data) => {
        try {
          setError(undefined);
          await login(data.email, data.password, 'admin');
          router.push('/dashboard');
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Login failed';
          setError(message);
        }
      }}
      onForgotPassword={() => router.push('/auth/forgot-password')}
      onGoogleLogin={handleGoogleLogin}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginFormContent />
    </Suspense>
  );
}