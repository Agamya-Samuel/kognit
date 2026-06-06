'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@edutech/shared-components';
import { useAuth } from '@edutech/shared-components';
import { authService } from '@edutech/api-client';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string>();

  const handleGoogleLogin = () => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    window.location.href = authService.getGoogleAuthUrl(redirectUrl, 'instructor');
  };

  return (
    <LoginForm
      error={error}
      onSubmit={async (data) => {
        try {
          setError(undefined);
          await login(data.email, data.password, 'instructor');
          router.push('/dashboard');
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Login failed';
          setError(message);
        }
      }}
      onForgotPassword={() => router.push('/auth/forgot-password')}
      onSignUpClick={() => router.push('/auth/register')}
      onGoogleLogin={handleGoogleLogin}
    />
  );
}