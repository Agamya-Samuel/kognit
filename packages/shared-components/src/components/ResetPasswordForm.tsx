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
import { resetPasswordSchema } from '@edutech/validation';

export interface ResetPasswordFormProps extends React.ComponentProps<'div'> {
  token: string | null;
  onSubmit: (token: string, password: string, confirmPassword: string) => void | Promise<void>;
  onBackClick?: () => void;
  isLoading?: boolean;
}

type FormData = { password: string; confirmPassword: string };

export const ResetPasswordForm = React.forwardRef<HTMLDivElement, ResetPasswordFormProps>(
  ({ className, token, onSubmit, onBackClick, isLoading, ...props }, ref) => {
    const [isSuccess, setIsSuccess] = React.useState(false);

    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<FormData>({
      resolver: zodResolver(resetPasswordSchema),
    });

    const handleFormSubmit = async (data: FormData) => {
      if (!token) return;
      try {
        await onSubmit(token, data.password, data.confirmPassword);
        setIsSuccess(true);
      } catch {
        // Error handled by parent
      }
    };

    return (
      <div className={cn('flex flex-col gap-6', className)} ref={ref} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {isSuccess ? 'Password Reset' : 'Reset Password'}
            </CardTitle>
            <CardDescription>
              {isSuccess
                ? 'Your password has been successfully reset'
                : 'Enter your new password below'}
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
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Your password has been reset successfully. You can now sign in with your new password.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(handleFormSubmit)}>
                <FieldGroup>
                  {!token && (
                    <Field>
                      <div className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-400">
                        Invalid or missing reset token. Please request a new password reset.
                      </div>
                    </Field>
                  )}
                  <Field>
                    <FieldLabel htmlFor="password">New Password</FieldLabel>
                    <Input id="password" type="password" {...register('password')} error={errors.password?.message} />
                    <FieldDescription>
                      Must be at least 8 characters with uppercase, lowercase, and number.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
                    <Input id="confirmPassword" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
                  </Field>
                  <Field>
                    <Button type="submit" className="w-full" isLoading={isLoading} disabled={!token}>
                      Reset Password
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
ResetPasswordForm.displayName = 'ResetPasswordForm';
