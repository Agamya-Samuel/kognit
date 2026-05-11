'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth-layout';
import { InputField, Button } from '@/components/auth-components';
import { login } from '@/lib/auth-service';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        // In real app, would store session
        router.push('/dashboard');
      } else if (result.requiresEmailVerification) {
        // Redirect to email verification
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        setError(result.error?.message || 'Login failed');
        setAttemptCount((prev) => prev + 1);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your EduTech account"
      showLinks={true}
    >
      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <InputField
          label="Email address"
          type="email"
          icon={<Mail size={18} />}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading || attemptCount >= 5}
        />

        <InputField
          label="Password"
          type="password"
          icon={<Lock size={18} />}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading || attemptCount >= 5}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="rounded border-input"
              defaultChecked={false}
              disabled={loading || attemptCount >= 5}
            />
            <span className="text-foreground">Remember me</span>
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          disabled={attemptCount >= 5}
          className="w-full"
        >
          Sign in
        </Button>

        {attemptCount >= 3 && attemptCount < 5 && (
          <p className="text-xs text-amber-600 text-center">
            {5 - attemptCount} attempt{(5 - attemptCount) !== 1 ? 's' : ''} remaining before lockout
          </p>
        )}

        {attemptCount >= 5 && (
          <p className="text-xs text-destructive text-center">
            Account locked. Please try again in 15 minutes or{' '}
            <Link href="/auth/forgot-password" className="underline hover:no-underline">
              reset your password
            </Link>
            .
          </p>
        )}
      </form>

      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-center text-sm text-muted-foreground mb-4">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-primary font-semibold hover:underline">
            Create one
          </Link>
        </p>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={loading}
            className="w-full"
          >
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={loading}
            className="w-full"
          >
            GitHub
          </Button>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground mt-4">
        Try demo@example.com / Demo@1234
      </p>
    </AuthLayout>
  );
}
