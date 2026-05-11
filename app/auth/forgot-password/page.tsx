'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth-layout';
import { InputField, Button } from '@/components/auth-components';
import { requestPasswordReset } from '@/lib/auth-service';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await requestPasswordReset(email);

      if (result.success) {
        setSuccess(true);
        // In real app, would navigate to reset page after email is confirmed
        setTimeout(() => {
          router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        setError(result.error?.message || 'Failed to request password reset');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Check your email" showLinks={false}>
        <div className="text-center py-8 space-y-4">
          <div className="text-5xl mb-4">✓</div>
          <p className="text-muted-foreground">
            If an account exists for {email}, we&apos;ve sent a password reset link.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to reset page...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email to receive a reset link"
      showLinks={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
          disabled={loading}
          helperText="Enter the email address associated with your account"
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          disabled={!email || loading}
          className="w-full"
        >
          Send reset link
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-border">
        <Link
          href="/auth/login"
          className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft size={16} />
          Back to sign in
        </Link>
      </div>

      <p className="text-xs text-center text-muted-foreground mt-4">
        Remember your password?{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          Sign in instead
        </Link>
      </p>
    </AuthLayout>
  );
}
