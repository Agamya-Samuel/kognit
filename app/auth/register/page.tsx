'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth-layout';
import { InputField, Button, PasswordStrengthMeter } from '@/components/auth-components';
import { register, getPasswordStrength } from '@/lib/auth-service';
import { Mail, Lock, User } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isFormValid =
    email &&
    name &&
    password &&
    confirmPassword &&
    passwordsMatch &&
    passwordStrength.strength !== 'weak' &&
    agreedToTerms;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('Please fill in all fields correctly');
      return;
    }

    setLoading(true);

    try {
      const result = await register(email, password, name);

      if (result.success && result.requiresEmailVerification) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
      } else if (!result.success) {
        setError(result.error?.message || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Join EduTech today" showLinks={true}>
      <form onSubmit={handleRegister} className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <InputField
          label="Full name"
          type="text"
          icon={<User size={18} />}
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />

        <InputField
          label="Email address"
          type="email"
          icon={<Mail size={18} />}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <InputField
          label="Password"
          type="password"
          icon={<Lock size={18} />}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          helperText="At least 8 characters with uppercase, lowercase, and number"
        />

        {password && (
          <div className="pt-2">
            <PasswordStrengthMeter {...passwordStrength} />
          </div>
        )}

        <InputField
          label="Confirm password"
          type="password"
          icon={<Lock size={18} />}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={confirmPassword && !passwordsMatch ? 'Passwords do not match' : undefined}
          required
          disabled={loading}
        />

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            disabled={loading}
            className="mt-1"
          />
          <span className="text-sm text-muted-foreground">
            I agree to the{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          disabled={!isFormValid}
          className="w-full"
        >
          Create account
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-center text-sm text-muted-foreground mb-4">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={loading}
            className="w-full"
          >
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={loading}
            className="w-full"
          >
            GitHub
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
