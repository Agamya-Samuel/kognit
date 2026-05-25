'use client';

import { useState, useCallback } from 'react';
import { authService, type ExistingUserEmailVerificationVerifyResponse } from '../services/auth';
import { isApiError } from '../index';

export interface UseEmailVerificationResult {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  resendCooldown: number;
  requestCode: () => Promise<boolean>;
  verifyCode: (code: string) => Promise<ExistingUserEmailVerificationVerifyResponse | null>;
  reset: () => void;
}

const RESEND_COOLDOWN_SECONDS = 60;

export function useEmailVerification(): UseEmailVerificationResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const requestCode = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.requestEmailVerification();
      setSuccess(true);
      
      // Start cooldown countdown
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return true;
    } catch (err: unknown) {
      if (isApiError(err)) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to send verification code. Please try again.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyCode = useCallback(async (code: string): Promise<ExistingUserEmailVerificationVerifyResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.verifyEmail(code);
      setSuccess(true);
      return result;
    } catch (err: unknown) {
      if (isApiError(err)) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid verification code. Please try again.');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setSuccess(false);
    setResendCooldown(0);
  }, []);

  return {
    isLoading,
    error,
    success,
    resendCooldown,
    requestCode,
    verifyCode,
    reset,
  };
}