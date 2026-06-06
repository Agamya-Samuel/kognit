'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService, usersService } from '@edutech/api-client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@edutech/ui';
import { Button, Input, PhoneInput, Field, FieldGroup, FieldLabel, FieldDescription } from '@edutech/ui';
import { onboardingSchema } from '@edutech/validation';

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any>(null);

  const form = useForm({
    resolver: zodResolver(onboardingSchema),
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
    async function fetchProfile() {
      try {
        const response = await authService.getMe() as any;
        setProfile(response);
        form.reset({
          mobile: response.studentProfile?.mobile || '',
          address: response.studentProfile?.address || '',
          city: response.studentProfile?.city || '',
          state: response.studentProfile?.state || '',
          pinCode: response.studentProfile?.pinCode || '',
          country: response.studentProfile?.country || '',
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile. Please try again.');
      } finally {
        setIsFetchingProfile(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSubmit = async (data: { mobile: string; address: string; city: string; state: string; pinCode: string; country: string }) => {
    setIsLoading(true);
    setError('');

    try {
      await usersService.updateProfile(data as any);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingProfile) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">Loading your profile...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Complete Your Profile</CardTitle>
        <CardDescription>
          Please provide your contact details to complete your registration
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                type="text"
                defaultValue={profile?.name}
                disabled
                className="bg-muted"
              />
              <FieldDescription className="text-xs">Name cannot be changed after onboarding.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                defaultValue={profile?.email}
                disabled
                className="bg-muted"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="mobile">Mobile Number</FieldLabel>
              <Controller
                name="mobile"
                control={form.control}
                render={({ field }) => (
                  <PhoneInput
                    id="mobile"
                    value={field.value}
                    onChange={field.onChange}
                    error={form.formState.errors.mobile?.message}
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
                {...form.register('address')}
                error={form.formState.errors.address?.message}
              />
            </Field>

            <Field className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="city">City</FieldLabel>
                <Input
                  id="city"
                  type="text"
                  placeholder="New York"
                  {...form.register('city')}
                  error={form.formState.errors.city?.message}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="state">State / Province</FieldLabel>
                <Input
                  id="state"
                  type="text"
                  placeholder="NY"
                  {...form.register('state')}
                  error={form.formState.errors.state?.message}
                />
              </Field>
            </Field>

            <Field className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="pinCode">PIN / ZIP Code</FieldLabel>
                <Input
                  id="pinCode"
                  type="text"
                  placeholder="10001"
                  {...form.register('pinCode')}
                  error={form.formState.errors.pinCode?.message}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="country">Country</FieldLabel>
                <Input
                  id="country"
                  type="text"
                  placeholder="United States"
                  {...form.register('country')}
                  error={form.formState.errors.country?.message}
                />
              </Field>
            </Field>

            <div className="rounded-lg border bg-muted/50 px-4 py-3">
              <p className="text-center text-sm text-muted-foreground">
                Affiliated Institute:{' '}
                <span className="font-medium text-foreground">
                  {profile?.studentProfile?.affiliatedInstituteId
                    ? `Institution #${profile.studentProfile.affiliatedInstituteId}`
                    : 'NA (Not Applicable)'}
                </span>
              </p>
            </div>

            <Field>
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Complete Profile
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
