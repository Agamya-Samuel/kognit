'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@edutech/ui';
import { Button } from '@edutech/ui';
import { Input } from '@edutech/ui';
import { Label } from '@edutech/ui';
import { ArrowRight, Mail, ShieldCheck, User, Lock } from 'lucide-react';

type Step = 'email' | 'verify' | 'complete';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Email input
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  // Step 2: Verification code
  const [code, setCode] = useState('');

  // Step 3: Complete registration
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // TODO: Call API to request verification code
      console.log('Requesting code for:', email);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEmailSent(true);
      setStep('verify');
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // TODO: Call API to verify code
      console.log('Verifying code:', code);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStep('complete');
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Call API to complete registration
      console.log('Completing registration:', { email, name, password });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {step === 'email' && 'Create Account'}
          {step === 'verify' && 'Verify Email'}
          {step === 'complete' && 'Complete Registration'}
        </CardTitle>
        <CardDescription className="text-center">
          {step === 'email' && 'Start by entering your email address'}
          {step === 'verify' && 'Enter the 6-digit code sent to your email'}
          {step === 'complete' && 'Set your name and password to complete registration'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md">
            {error}
          </div>
        )}

        {/* Step 1: Email Input */}
        {step === 'email' && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="instructor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isLoading || !email}
            >
              {isLoading ? 'Sending...' : isEmailSent ? 'Resend Code' : 'Send Verification Code'}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
              </span>
              <a href="/auth/login" className="text-primary hover:underline font-medium">
                Sign in
              </a>
            </div>
          </form>
        )}

        {/* Step 2: Verify Code */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="flex justify-center pb-4">
              <ShieldCheck className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl tracking-widest"
                required
              />
              <p className="text-xs text-center text-gray-500">
                Code sent to {email}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </Button>

            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Change email address
            </button>
          </form>
        )}

        {/* Step 3: Complete Registration */}
        {step === 'complete' && (
          <form onSubmit={handleCompleteRegistration} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="•••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="•••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="showPassword" className="text-sm cursor-pointer">
                Show password
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isLoading || !name || !password || password !== confirmPassword}
            >
              {isLoading ? 'Creating account...' : 'Complete Registration'}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
