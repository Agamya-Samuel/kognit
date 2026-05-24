'use client';

import { useRouter } from 'next/navigation';
import { LoginForm, useAuth } from '@edutech/shared-components';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const redirectUrl = `${window.location.origin}/auth/callback`;
    window.location.href = `${apiUrl}/auth/google?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <LoginForm
      onSubmit={async (data) => {
        await login(data.email, data.password);
        router.push('/dashboard');
      }}
      onForgotPassword={() => router.push('/auth/forgot-password')}
      onSignUpClick={() => router.push('/auth/register')}
      onGoogleLogin={handleGoogleLogin}
    />
  );
}
