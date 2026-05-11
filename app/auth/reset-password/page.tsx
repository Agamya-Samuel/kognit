'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth-layout';
import { InputField, Button, PasswordStrengthMeter } from '@/components/auth-components';
import { resetPassword, getPasswordStrength } from '@/lib/auth-service';
import { Lock, ArrowLeft } from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const code = searchParams.get('code') || '';

  const [verificationCode, setVerificationCode] = useState(code);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordStrength = getPasswordStrength(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;
  const isFormValid =
    verificationCode &&
    newPassword &&
    confirmPassword &&
    passwordsMatch &&
    passwordStrength.strength !== 'weak';

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('Please fill in all fields correctly');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(email, verificationCode, newPassword);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        setError(result.error?.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Password reset" showLinks={false}>
        <div className="text-center py-8 space-y-4">
          <div className="text-5xl mb-4">✓</div>
          <p className="text-muted-foreground">
            Your password has been reset successfully.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to login...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Enter your verification code and new password"
      showLinks={false}
    >
      <form onSubmit={handleResetPassword} className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <InputField
          label="Verification code"
          type="text"
          placeholder="000000"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          required
          disabled={loading}
          helperText="6-digit code from the reset email"
        />

        <InputField
          label="New password"
          type="password"
          icon={<Lock size={18} />}
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          disabled={loading}
          helperText="At least 8 characters with uppercase, lowercase, and number"
        />

        {newPassword && (
          <div className="pt-2">
            <PasswordStrengthMeter {...passwordStrength} />
          </div>
        )}

        <InputField
          label="Confirm password"
          type="password"
          icon={<Lock size={18} />}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={confirmPassword && !passwordsMatch ? 'Passwords do not match' : undefined}
          required
          disabled={loading}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          disabled={!isFormValid}
          className="w-full"
        >
          Reset password
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
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout title="Set new password" showLinks={false}>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </AuthLayout>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
