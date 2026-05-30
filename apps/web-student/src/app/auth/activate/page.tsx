'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@edutech/api-client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@edutech/ui';
import { Button, Input, Field, FieldGroup, FieldLabel, FieldDescription } from '@edutech/ui';

type Step = 'validate' | 'password' | 'profile';

export default function ActivationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [step, setStep] = useState<Step>('validate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // User info from token validation
  const [userInfo, setUserInfo] = useState<{ email: string; name: string; institutionName: string | null } | null>(null);

  // Form data
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [country, setCountry] = useState('');

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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setStep('profile');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authService.completeActivation(
        token,
        password,
        userInfo?.name || '',
        mobile,
        address,
        city,
        state,
        pinCode,
        country,
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
            <form onSubmit={handlePasswordSubmit}>
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
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
            <form onSubmit={handleProfileSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input value={userInfo.email} disabled className="bg-muted" />
                </Field>

                <Field>
                  <FieldLabel htmlFor="mobile">Mobile Number</FieldLabel>
                  <Input
                    id="mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+1234567890"
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="address">Street Address</FieldLabel>
                  <Input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main Street, Apt 4B"
                    required
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="city">City</FieldLabel>
                    <Input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="New York"
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="state">State / Province</FieldLabel>
                    <Input
                      id="state"
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="NY"
                      required
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="pinCode">PIN / ZIP Code</FieldLabel>
                    <Input
                      id="pinCode"
                      type="text"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="10001"
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="country">Country</FieldLabel>
                    <Input
                      id="country"
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="United States"
                      required
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
