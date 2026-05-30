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
   * @param intent - Registration intent: 'student' | 'instructor'
   * @returns Response with message (and code in development)
   */
  async requestRegistrationVerification(email: string, intent?: string): Promise<EmailVerificationResponse> {
    return getApiClient().post<EmailVerificationResponse>('/auth/register/request', { email, intent });
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
   * @param intent - Registration intent: 'student' | 'instructor'
   * @returns User profile and authentication tokens
   */
  async completeRegistration(email: string, code: string, name: string, password: string, intent?: string): Promise<RegistrationCompleteResponse> {
    return getApiClient().post<RegistrationCompleteResponse>('/auth/register/complete', { email, code, name, password, intent });
  },

  // ─── Login / Logout ──────────────────────────────────────────────────────

  /**
   * Authenticate user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @param portal - Portal being accessed: 'student' | 'instructor' | 'admin'
   * @returns User profile and authentication tokens
   */
  async login(email: string, password: string, portal?: string): Promise<LoginResponse> {
    return getApiClient().post<LoginResponse>('/auth/login', { email, password, portal });
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

  // ─── Password Change ─────────────────────────────────────────────────────

  /**
   * Change password (authenticated)
   * @param currentPassword - Current password
   * @param newPassword - New password
   * @returns Success message
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return getApiClient().post<{ message: string }>('/auth/change-password', { currentPassword, newPassword });
  },

  // ─── Two-Factor Authentication (2FA) ────────────────────────────────────

  /**
   * Enable 2FA for user
   * @returns Secret and QR code for setup
   */
  async enableTwoFactor(): Promise<{ secret: string; qrCode: string }> {
    return getApiClient().post<{ secret: string; qrCode: string }>('/auth/2fa/enable', {});
  },

  /**
   * Disable 2FA for user
   * @param token - 2FA verification token
   * @returns Success message
   */
  async disableTwoFactor(token: string): Promise<{ message: string }> {
    return getApiClient().post<{ message: string }>('/auth/2fa/disable', { token });
  },

  /**
   * Verify 2FA token
   * @param token - 2FA verification token
   * @returns Verification status
   */
  async verifyTwoFactor(token: string): Promise<{ verified: boolean }> {
    return getApiClient().post<{ verified: boolean }>('/auth/2fa/verify', { token });
  },

  /**
   * Get 2FA QR code
   * @returns QR code for 2FA setup
   */
  async getTwoFactorQrCode(): Promise<{ qrCode: string }> {
    return getApiClient().get<{ qrCode: string }>('/auth/2fa/qr-code');
  },

  // ─── Student Activation (Bulk Import) ──────────────────────────────────

  /**
   * Validate a student activation token from bulk import
   * @param token - Activation token from email
   * @returns User info if valid
   */
  async validateActivationToken(token: string): Promise<{ valid: boolean; email: string; name: string; institutionName: string | null }> {
    return getApiClient().post<{ valid: boolean; email: string; name: string; institutionName: string | null }>('/auth/student-activation/validate', { token });
  },

  /**
   * Complete student activation with password and profile
   * @param token - Activation token from email
   * @param password - Password to set
   * @param name - Full name
   * @param mobile - Mobile phone
   * @param address - Street address
   * @param city - City
   * @param state - State
   * @param pinCode - PIN/ZIP code
   * @param country - Country
   * @returns User profile and tokens (auto-login)
   */
  async completeActivation(
    token: string,
    password: string,
    name: string,
    mobile: string,
    address: string,
    city: string,
    state: string,
    pinCode: string,
    country: string,
  ): Promise<RegistrationCompleteResponse> {
    return getApiClient().post<RegistrationCompleteResponse>('/auth/student-activation/complete', {
      token,
      password,
      name,
      mobile,
      address,
      city,
      state,
      pinCode,
      country,
    });
  },
};