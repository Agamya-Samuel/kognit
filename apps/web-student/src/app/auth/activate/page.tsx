'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '@edutech/api-client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@edutech/ui';
import { Button, Input, PhoneInput, Field, FieldGroup, FieldLabel, FieldDescription } from '@edutech/ui';
import { activationPasswordSchema, activationProfileSchema } from '@edutech/validation';

type Step = 'validate' | 'password' | 'profile';

export default function ActivationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [step, setStep] = useState<Step>('validate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [userInfo, setUserInfo] = useState<{ email: string; name: string; institutionName: string | null } | null>(null);

  const passwordForm = useForm({
    resolver: zodResolver(activationPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const profileForm = useForm({
    resolver: zodResolver(activationProfileSchema),
    defaultValues: {
      mobile: '',
      address: '',
      city: '',
      state: '',
      pinCode: '',
      country: '',
    },
  });

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      setError('No activation token provided');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authService.validateActivationToken(token);
      setUserInfo({
        email: response.email,
        name: response.name,
        institutionName: response.institutionName,
      });
      setStep('password');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired activation token.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = (_data: { password: string; confirmPassword: string }) => {
    setStep('profile');
  };

  const handleProfileSubmit = async (data: { mobile: string; address: string; city: string; state: string; pinCode: string; country: string }) => {
    setIsLoading(true);
    setError('');

    try {
      await authService.completeActivation(
        token,
        passwordForm.getValues().password,
        userInfo?.name || '',
        data.mobile,
        data.address,
        data.city,
        data.state,
        data.pinCode,
        data.country,
      );
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to activate account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-600">Invalid Link</CardTitle>
            <CardDescription>
              This activation link is invalid or has expired. Please contact your administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Activate Your Account</CardTitle>
          <CardDescription>
            {step === 'validate' && 'Validating your activation link...'}
            {step === 'password' && 'Set your password to continue'}
            {step === 'profile' && 'Complete your profile information'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {isLoading && step === 'validate' && (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          )}

          {step === 'password' && userInfo && (
            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
              <FieldGroup>
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input value={userInfo.email} disabled className="bg-muted" />
                </Field>

                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <Input value={userInfo.name} disabled className="bg-muted" />
                </Field>

                {userInfo.institutionName && (
                  <Field>
                    <FieldLabel>Institution</FieldLabel>
                    <Input value={userInfo.institutionName} disabled className="bg-muted" />
                  </Field>
                )}

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    {...passwordForm.register('password')}
                    error={passwordForm.formState.errors.password?.message}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    {...passwordForm.register('confirmPassword')}
                    error={passwordForm.formState.errors.confirmPassword?.message}
                  />
                </Field>

                <Field>
                  <Button type="submit" className="w-full" isLoading={isLoading}>
                    Continue
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          )}

          {step === 'profile' && userInfo && (
            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
              <FieldGroup>
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input value={userInfo.email} disabled className="bg-muted" />
                </Field>

                <Field>
                  <FieldLabel htmlFor="mobile">Mobile Number</FieldLabel>
                  <Controller
                    name="mobile"
                    control={profileForm.control}
                    render={({ field }) => (
                      <PhoneInput
                        id="mobile"
                        value={field.value}
                        onChange={field.onChange}
                        error={profileForm.formState.errors.mobile?.message}
                      />
                    )}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="address">Street Address</FieldLabel>
                  <Input
                    id="address"
                    type="text"
                    placeholder="123 Main Street, Apt 4B"
                    {...profileForm.register('address')}
                    error={profileForm.formState.errors.address?.message}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="city">City</FieldLabel>
                    <Input
                      id="city"
                      type="text"
                      placeholder="New York"
                      {...profileForm.register('city')}
                      error={profileForm.formState.errors.city?.message}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="state">State / Province</FieldLabel>
                    <Input
                      id="state"
                      type="text"
                      placeholder="NY"
                      {...profileForm.register('state')}
                      error={profileForm.formState.errors.state?.message}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="pinCode">PIN / ZIP Code</FieldLabel>
                    <Input
                      id="pinCode"
                      type="text"
                      placeholder="10001"
                      {...profileForm.register('pinCode')}
                      error={profileForm.formState.errors.pinCode?.message}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="country">Country</FieldLabel>
                    <Input
                      id="country"
                      type="text"
                      placeholder="United States"
                      {...profileForm.register('country')}
                      error={profileForm.formState.errors.country?.message}
                    />
                  </Field>
                </div>

                {userInfo.institutionName && (
                  <Field>
                    <FieldDescription className="text-center">
                      Affiliated Institute: <span className="font-medium">{userInfo.institutionName}</span>
                    </FieldDescription>
                  </Field>
                )}

                <Field>
                  <Button type="submit" className="w-full" isLoading={isLoading}>
                    Activate Account
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
