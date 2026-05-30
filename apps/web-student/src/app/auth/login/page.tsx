'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm, useAuth } from '@edutech/shared-components';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string>();

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const redirectUrl = `${window.location.origin}/auth/callback`;
    window.location.href = `${apiUrl}/auth/google?redirect=${encodeURIComponent(redirectUrl)}&portal=student`;
  };

  return (
    <LoginForm
      error={error}
      onSubmit={async (data) => {
        try {
          setError(undefined);
          await login(data.email, data.password, 'student');
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