'use client';

import { Suspense, useState, useEffect } from 'react';
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
import { instructorActivationPasswordSchema, instructorActivationProfileSchema } from '@edutech/validation';

type Step = 'validate' | 'password' | 'profile';

export default function InstructorActivationPage() {
  return (
    <Suspense fallback={<div className="container mx-auto max-w-2xl py-8"><div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div></div>}>
      <ActivationContent />
    </Suspense>
  );
}

function ActivationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [step, setStep] = useState<Step>('validate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [userInfo, setUserInfo] = useState<{ userId: number; email: string; name: string } | null>(null);
  const [editableName, setEditableName] = useState('');

  const passwordForm = useForm({
    resolver: zodResolver(instructorActivationPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const profileForm = useForm({
    resolver: zodResolver(instructorActivationProfileSchema),
    defaultValues: {
      bio: '',
      expertise: '',
      mobile: '',
      linkedinUrl: '',
      websiteUrl: '',
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
      const response = await authService.validateInstructorActivationToken(token);
      setUserInfo({
        userId: response.userId,
        email: response.email,
        name: response.name,
      });
      setEditableName(response.name);
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

  const handleProfileSubmit = async (data: { bio: string; expertise: string; mobile?: string; linkedinUrl?: string; websiteUrl?: string }) => {
    setIsLoading(true);
    setError('');

    try {
      // Parse expertise as comma-separated list
      const expertiseList = data.expertise
        ? data.expertise.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      await authService.completeInstructorActivation(
        token,
        passwordForm.getValues().password,
        editableName,
        data.bio || '',
        expertiseList,
        data.mobile || '',
        data.linkedinUrl || '',
        data.websiteUrl || '',
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
          <CardTitle className="text-xl">Activate Your Instructor Account</CardTitle>
          <CardDescription>
            {step === 'validate' && 'Validating your activation link...'}
            {step === 'password' && 'Set your password to continue'}
            {step === 'profile' && 'Complete your instructor profile'}
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
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    value={editableName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditableName(e.target.value)}
                    placeholder="Your full name"
                  />
                  <FieldDescription className="text-xs">
                    You can edit your name now. It will become permanent after activation.
                  </FieldDescription>
                </Field>

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
                  <FieldLabel htmlFor="profile-name">Full Name</FieldLabel>
                  <Input
                    id="profile-name"
                    type="text"
                    value={editableName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditableName(e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="bio">Bio / About</FieldLabel>
                  <textarea
                    id="bio"
                    placeholder="Tell students about yourself, your experience, and teaching style..."
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                    maxLength={2000}
                    {...profileForm.register('bio')}
                  />
                  <FieldDescription className="text-xs">
                    Optional. Max 2000 characters.
                  </FieldDescription>
                  {profileForm.formState.errors.bio && (
                    <p className="text-xs text-destructive">{profileForm.formState.errors.bio.message}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="expertise">Areas of Expertise</FieldLabel>
                  <Input
                    id="expertise"
                    type="text"
                    placeholder="e.g., JavaScript, React, Node.js, Machine Learning"
                    {...profileForm.register('expertise')}
                    error={profileForm.formState.errors.expertise?.message}
                  />
                  <FieldDescription className="text-xs">
                    Separate multiple areas with commas.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="mobile">Mobile Number (Optional)</FieldLabel>
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
                  <FieldLabel htmlFor="linkedinUrl">LinkedIn Profile URL (Optional)</FieldLabel>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    {...profileForm.register('linkedinUrl')}
                    error={profileForm.formState.errors.linkedinUrl?.message}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="websiteUrl">Website / Portfolio URL (Optional)</FieldLabel>
                  <Input
                    id="websiteUrl"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    {...profileForm.register('websiteUrl')}
                    error={profileForm.formState.errors.websiteUrl?.message}
                  />
                </Field>

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
