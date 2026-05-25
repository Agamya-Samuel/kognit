import { getApiClient } from '../index';

export interface LoginResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    avatarUrl?: string;
    isVerified: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface EmailVerificationResponse {
  message: string;
  code?: string; // Only in dev/development environments
}

export interface RegistrationVerificationResponse {
  message: string;
  verified: boolean;
  email: string;
}

export interface ExistingUserEmailVerificationResponse {
  message: string;
  code?: string; // Only in dev environments
}

export interface ExistingUserEmailVerificationVerifyResponse {
  verified: boolean;
}

export interface RegistrationCompleteResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    isVerified: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authService = {
  // ─── Registration (Email-First Flow) ──────────────────────────────────────

  /**
   * Step 1: Request verification code for registration
   * @param email - User's email address
   * @returns Response with message (and code in development)
   */
  async requestRegistrationVerification(email: string): Promise<EmailVerificationResponse> {
    return getApiClient().post<EmailVerificationResponse>('/auth/register/request', { email });
  },

  /**
   * Step 2: Verify the registration code
   * @param email - User's email address
   * @param code - 6-digit verification code
   * @returns Verified status and email
   */
  async verifyRegistrationCode(email: string, code: string): Promise<RegistrationVerificationResponse> {
    return getApiClient().post<RegistrationVerificationResponse>('/auth/register/verify', { email, code });
  },

  /**
   * Step 3: Complete registration with name and password
   * @param email - User's email address
   * @param code - 6-digit verification code
   * @param name - User's display name
   * @param password - User's password
   * @returns User profile and authentication tokens
   */
  async completeRegistration(email: string, code: string, name: string, password: string): Promise<RegistrationCompleteResponse> {
    return getApiClient().post<RegistrationCompleteResponse>('/auth/register/complete', { email, code, name, password });
  },

  // ─── Login / Logout ──────────────────────────────────────────────────────

  /**
   * Authenticate user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @returns User profile and authentication tokens
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    return getApiClient().post<LoginResponse>('/auth/login', { email, password });
  },

  /**
   * Logout user (requires authentication)
   * @returns Logout confirmation message
   */
  async logout(): Promise<{ message: string }> {
    return getApiClient().post<{ message: string }>('/auth/logout', {});
  },

  // ─── Existing User Email Verification ────────────────────────────────────

  /**
   * Request email verification for existing user (authenticated)
   * @returns Response with message (and code in development)
   */
  async requestEmailVerification(): Promise<ExistingUserEmailVerificationResponse> {
    return getApiClient().post<ExistingUserEmailVerificationResponse>('/auth/email-verification/request', {});
  },

  /**
   * Verify email for existing authenticated user
   * @param code - 6-digit verification code
   * @returns Verified status
   */
  async verifyEmail(code: string): Promise<ExistingUserEmailVerificationVerifyResponse> {
    return getApiClient().post<ExistingUserEmailVerificationVerifyResponse>('/auth/email-verification/verify', { code });
  },

  // ─── Password Reset ──────────────────────────────────────────────────────

  /**
   * Request password reset (forgot password)
   * @param email - User's email address
   * @returns Success message (always, to prevent email enumeration)
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return getApiClient().post<{ message: string }>('/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   * @param email - User's email address
   * @param token - Password reset token from email
   * @param password - New password
   * @param confirmPassword - Password confirmation
   * @returns Success message
   */
  async resetPassword(email: string, token: string, password: string, confirmPassword: string): Promise<{ message: string }> {
    return getApiClient().post<{ message: string }>('/auth/reset-password', { email, token, password, confirmPassword });
  },

  // ─── Token Refresh ───────────────────────────────────────────────────────

  /**
   * Refresh access token
   * @param refreshToken - Current refresh token
   * @returns New access token and refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    return getApiClient().post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken });
  },
};