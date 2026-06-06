'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, usersService } from '@edutech/api-client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@edutech/ui';
import { Button, Input, Field, FieldGroup, FieldLabel, FieldDescription } from '@edutech/ui';

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await authService.getMe();
        setProfile(response as any);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile. Please try again.');
      } finally {
        setIsFetchingProfile(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      mobile: formData.get('mobile') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      pinCode: formData.get('pinCode') as string,
      country: formData.get('country') as string,
    };

    // Validate required fields
    if (!data.mobile || !data.address || !data.city || !data.state || !data.pinCode || !data.country) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }

    try {
      await usersService.updateProfile(data);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingProfile) {
    return (
      <div className="container mx-auto flex max-w-2xl items-center justify-center py-16">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Please provide your contact details to complete your registration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  name="name"
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
                <Input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  placeholder="+1234567890"
                  defaultValue={profile?.studentProfile?.mobile}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="address">Street Address</FieldLabel>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="123 Main Street, Apt 4B"
                  defaultValue={profile?.studentProfile?.address}
                  required
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="city">City</FieldLabel>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="New York"
                    defaultValue={profile?.studentProfile?.city}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="state">State / Province</FieldLabel>
                  <Input
                    id="state"
                    name="state"
                    type="text"
                    placeholder="NY"
                    defaultValue={profile?.studentProfile?.state}
                    required
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="pinCode">PIN / ZIP Code</FieldLabel>
                  <Input
                    id="pinCode"
                    name="pinCode"
                    type="text"
                    placeholder="10001"
                    defaultValue={profile?.studentProfile?.pinCode}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="country">Country</FieldLabel>
                  <Input
                    id="country"
                    name="country"
                    type="text"
                    placeholder="United States"
                    defaultValue={profile?.studentProfile?.country}
                    required
                  />
                </Field>
              </div>

              <Field>
                <FieldDescription className="text-center text-muted-foreground">
                  Affiliated Institute:{' '}
                  <span className="font-medium">
                    {profile?.studentProfile?.affiliatedInstituteId
                      ? `Institution #${profile.studentProfile.affiliatedInstituteId}`
                      : 'NA (Not Applicable)'}
                  </span>
                </FieldDescription>
              </Field>

              <Field>
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  {isLoading ? 'Saving...' : 'Complete Profile'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
