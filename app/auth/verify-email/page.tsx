'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth-layout';
import { InputField, Button } from '@/components/auth-components';
import { verifyEmail } from '@/lib/auth-service';
import { Mail, ArrowLeft } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer > 0) {
      const interval = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(interval);
    }
  }, [timer]);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);

    if (value && index < 5) {
      const nextInput = document.querySelector(
        `input[data-index="${index + 1}"]`
      ) as HTMLInputElement;
      nextInput?.focus();
    }

    setCode(newCode);
    setError('');
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.querySelector(
        `input[data-index="${index - 1}"]`
      ) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  const fullCode = code.join('');
  const isComplete = fullCode.length === 6;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;

    setError('');
    setLoading(true);

    try {
      const result = await verifyEmail(email, fullCode);

      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error?.message || 'Verification failed');
        setCode(['', '', '', '', '', '']);
        const firstInput = document.querySelector(
          'input[data-index="0"]'
        ) as HTMLInputElement;
        firstInput?.focus();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');

    try {
      // In real app, would call resend endpoint
      await new Promise((resolve) => setTimeout(resolve, 500));

      setResendCount((prev) => prev + 1);
      setTimer(60);
      setCode(['', '', '', '', '', '']);

      const firstInput = document.querySelector(
        'input[data-index="0"]'
      ) as HTMLInputElement;
      firstInput?.focus();
    } catch (err) {
      setError('Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return (
      <AuthLayout title="Verify email" showLinks={false}>
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Email not provided</p>
          <Link href="/auth/register" className="text-primary hover:underline">
            Back to registration
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`Enter the 6-digit code sent to ${email}`}
      showLinks={false}
    >
      <form onSubmit={handleVerify} className="space-y-6">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex justify-center gap-2">
          {code.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              data-index={index}
              disabled={loading || resendLoading}
              className="w-12 h-12 text-center text-2xl font-bold border-2 border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          disabled={!isComplete || loading || resendLoading}
          className="w-full"
        >
          Verify email
        </Button>

        <div className="text-center">
          {timer > 0 ? (
            <p className="text-sm text-muted-foreground">
              Resend code in {timer}s
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || loading}
              className="text-sm text-primary hover:underline disabled:text-muted-foreground"
            >
              {resendLoading ? 'Resending...' : 'Didn&apos;t receive code? Resend'}
            </button>
          )}
        </div>
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
        Didn&apos;t get an email? Check your spam folder or{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          try again
        </Link>
        .
      </p>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout title="Verify your email" showLinks={false}>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </AuthLayout>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
