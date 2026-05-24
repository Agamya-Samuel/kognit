'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@edutech/ui';
import { Button, Input, Field, FieldGroup, FieldLabel, FieldDescription, cn } from '@edutech/ui';
import { forgotPasswordSchema } from '@edutech/validation';

export interface ForgotPasswordFormProps extends React.ComponentProps<'div'> {
  onSubmit: (email: string) => void | Promise<void>;
  onBackClick?: () => void;
  isLoading?: boolean;
}

type FormData = { email: string };

export const ForgotPasswordForm = React.forwardRef<HTMLDivElement, ForgotPasswordFormProps>(
  ({ className, onSubmit, onBackClick, isLoading, ...props }, ref) => {
    const [isSuccess, setIsSuccess] = React.useState(false);
    const [submittedEmail, setSubmittedEmail] = React.useState('');

    const {
      register,
      handleSubmit,
      formState: { errors },
      reset,
    } = useForm<FormData>({
      resolver: zodResolver(forgotPasswordSchema),
    });

    const handleFormSubmit = async (data: FormData) => {
      try {
        await onSubmit(data.email);
        setSubmittedEmail(data.email);
        setIsSuccess(true);
      } catch {
        // Error handled by parent
      }
    };

    const handleSendAgain = () => {
      setIsSuccess(false);
      reset();
    };

    return (
      <div className={cn('flex flex-col gap-6', className)} ref={ref} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {isSuccess ? 'Check Your Email' : 'Forgot Password'}
            </CardTitle>
            <CardDescription>
              {isSuccess
                ? "We've sent you a password reset link"
                : 'Enter your email to receive a password reset link'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="flex flex-col gap-6">
                <div className="flex justify-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <svg className="size-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    We've sent a password reset link to{' '}
                    <span className="font-medium text-foreground">{submittedEmail}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The link will expire in 1 hour. If you don't receive the email, check your spam folder.
                  </p>
                  <Button onClick={handleSendAgain} variant="outline" className="w-full">
                    Send Again
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(handleFormSubmit)}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input id="email" type="email" placeholder="you@example.com" {...register('email')} error={errors.email?.message} />
                  </Field>
                  <Field>
                    <Button type="submit" className="w-full" isLoading={isLoading}>
                      Send Reset Link
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            )}
          </CardContent>
        </Card>
        {onBackClick && (
          <button onClick={onBackClick} className="mx-auto text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
            Back to Sign In
          </button>
        )}
      </div>
    );
  },
);
ForgotPasswordForm.displayName = 'ForgotPasswordForm';
