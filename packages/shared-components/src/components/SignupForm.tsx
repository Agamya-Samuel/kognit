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
import { signupSchema, type SignupInput } from '@edutech/validation';

export interface SignupFormProps extends Omit<React.ComponentProps<'div'>, 'onSubmit'> {
  onSubmit: (data: SignupInput) => void | Promise<void>;
  onLoginClick?: () => void;
  isLoading?: boolean;
}

export const SignupForm = React.forwardRef<HTMLDivElement, SignupFormProps>(
  ({ className, onSubmit, onLoginClick, isLoading, ...props }, ref) => {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm({
      resolver: zodResolver(signupSchema),
    });

    return (
      <div className={cn('flex flex-col gap-6', className)} ref={ref} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Create your account</CardTitle>
            <CardDescription>Enter your email below to create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <Input id="name" type="text" placeholder="John Doe" {...register('name')} error={errors.name?.message} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input id="email" type="email" placeholder="m@example.com" {...register('email')} error={errors.email?.message} />
                </Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input id="password" type="password" {...register('password')} error={errors.password?.message} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                    <Input id="confirmPassword" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
                  </Field>
                  <FieldDescription>
                    Must be at least 8 characters long, 1 uppercase, 1 lowercase, and 1 number.
                  </FieldDescription>
                </Field>
                <Field>
                  <Button type="submit" className="w-full" isLoading={isLoading}>
                    Create Account
                  </Button>
                  <FieldDescription className="text-center">
                    {onLoginClick ? (
                      <>
                        Already have an account?{' '}
                        <button type="button" onClick={onLoginClick} className="underline-offset-4 hover:underline">
                          Sign in
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account? <a href="#">Sign in</a>
                      </>
                    )}
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
        <FieldDescription className="px-6 text-center">
          By clicking continue, you agree to our{' '}
          <a href="#" className="underline-offset-4 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="underline-offset-4 hover:underline">
            Privacy Policy
          </a>
          .
        </FieldDescription>
      </div>
    );
  },
);
SignupForm.displayName = 'SignupForm';