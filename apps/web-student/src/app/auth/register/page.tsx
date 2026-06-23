'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@edutech/api-client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@edutech/ui';
import { Button, Input, Field, FieldGroup, FieldLabel, FieldDescription } from '@edutech/ui';
import { requestEmailVerificationSchema, verifyEmailCodeSchema, completeRegistrationSchema } from '@edutech/validation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

type Step = 'email' | 'verify' | 'complete';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const emailForm = useForm({
    resolver: zodResolver(requestEmailVerificationSchema),
  });

  const verifyForm = useForm({
    resolver: zodResolver(verifyEmailCodeSchema),
  });

  const completeForm = useForm({
    resolver: zodResolver(completeRegistrationSchema),
  });

  const handleRequestCode = async (data: { email: string }) => {
    setIsLoading(true);
    setError('');
    setEmail(data.email);

    try {
      await authService.requestRegistrationVerification(data.email, 'student');
      setStep('verify');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (data: { code: string }) => {
    setIsLoading(true);
    setError('');
    setCode(data.code);

    try {
      await authService.verifyRegistrationCode(email, data.code);
      setStep('complete');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistration = async (data: { name: string; password: string }) => {
    setIsLoading(true);
    setError('');

    try {
      await authService.completeRegistration(email, code, data.name, data.password, 'student');
      // Redirect to onboarding after successful registration
      router.push('/onboarding');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          {step === 'email' && 'Create Account'}
          {step === 'verify' && 'Verify Email'}
          {step === 'complete' && 'Complete Registration'}
        </CardTitle>
        <CardDescription>
          {step === 'email' && 'Start by entering your email address'}
          {step === 'verify' && 'Enter the code sent to your email'}
          {step === 'complete' && 'Set your name and password to complete registration'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={emailForm.handleSubmit(handleRequestCode)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" placeholder="student@example.com" {...emailForm.register('email')} error={emailForm.formState.errors.email?.message} />
              </Field>
              <Field>
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{' '}
                  <a href="/auth/login" className="underline-offset-4 hover:underline">
                    Sign in
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={verifyForm.handleSubmit(handleVerifyCode)}>
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
                  {...verifyForm.register('code')}
                  error={verifyForm.formState.errors.code?.message}
                />
                <FieldDescription className="mt-2">Code sent to {email}</FieldDescription>
              </Field>
              <Field>
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="mt-3 w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  Change email address
                </button>
              </Field>
            </FieldGroup>
          </form>
        )}

        {step === 'complete' && (
          <form onSubmit={completeForm.handleSubmit(handleCompleteRegistration)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input id="name" type="text" placeholder="John Doe" {...completeForm.register('name')} error={completeForm.formState.errors.name?.message} />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" type="password" {...completeForm.register('password')} error={completeForm.formState.errors.password?.message} />
                <FieldDescription className="mt-2">Must be at least 8 characters with uppercase, lowercase, and number.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                <Input id="confirmPassword" type="password" {...completeForm.register('confirmPassword')} error={completeForm.formState.errors.confirmPassword?.message} />
              </Field>
              <Field>
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  {isLoading ? 'Creating account...' : 'Complete Registration'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
