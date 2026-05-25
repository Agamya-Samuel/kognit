'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@edutech/shared-components';
import { useEmailVerification } from '@edutech/api-client';
import { existingUserEmailVerificationVerifySchema } from '@edutech/validation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@edutech/ui';
import { Button, Input, Field, FieldGroup, FieldLabel } from '@edutech/ui';
import { Mail, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

type Step = 'request' | 'verify' | 'success';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('request');
  const {
    isLoading,
    error,
    resendCooldown,
    requestCode,
    verifyCode,
    reset,
  } = useEmailVerification();

  const form = useForm({
    resolver: zodResolver(existingUserEmailVerificationVerifySchema),
  });

  useEffect(() => {
    if (user?.isVerified) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleRequestCode = async () => {
    reset();
    const result = await requestCode();
    if (result) {
      setStep('verify');
    }
  };

  const handleVerifyCode = async (data: { code: string }) => {
    const result = await verifyCode(data.code);
    if (result?.verified) {
      setStep('success');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    await handleRequestCode();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {step === 'success' ? (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            ) : (
              <Mail className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-xl">
            {step === 'request' && 'Verify Your Email'}
            {step === 'verify' && 'Enter Verification Code'}
            {step === 'success' && 'Email Verified!'}
          </CardTitle>
          <CardDescription>
            {step === 'request' && `We've sent a verification code to ${user.email}`}
            {step === 'verify' && 'Enter the 6-digit code from your email'}
            {step === 'success' && 'Your email has been verified successfully'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {step === 'request' && (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Click the button below to receive a verification code at{' '}
                <span className="font-medium text-foreground">{user.email}</span>
              </p>
              <Button
                onClick={handleRequestCode}
                className="w-full"
                isLoading={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          )}

          {step === 'verify' && (
            <form onSubmit={form.handleSubmit(handleVerifyCode)}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="code">Verification Code</FieldLabel>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="123456"
                    className="text-center text-2xl tracking-widest"
                    {...form.register('code')}
                    error={form.formState.errors.code?.message}
                  />
                </Field>
                <Field>
                  <Button type="submit" className="w-full" isLoading={isLoading}>
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                  </Button>
                </Field>
                <Field>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                  >
                    {resendCooldown > 0
                      ? `Resend code in ${resendCooldown}s`
                      : 'Resend verification code'}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          )}

          {step === 'success' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-950/30">
                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-600" />
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Your email {user.email} has been verified!
                </p>
              </div>
              <Button onClick={() => router.push('/dashboard')} className="w-full">
                Back to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}