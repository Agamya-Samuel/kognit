// Mock authentication service with validation
export interface AuthError {
  code: string;
  message: string;
}

export interface LoginResponse {
  success: boolean;
  user?: { id: string; email: string; name: string };
  error?: AuthError;
  requiresEmailVerification?: boolean;
  verificationToken?: string;
}

export interface RegisterResponse {
  success: boolean;
  user?: { id: string; email: string; name: string };
  error?: AuthError;
  requiresEmailVerification?: boolean;
  verificationToken?: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  error?: AuthError;
}

export interface ResetPasswordResponse {
  success: boolean;
  error?: AuthError;
}

// Mock user database
const mockUsers: Record<string, { email: string; password: string; name: string; verified: boolean }> = {
  'demo@example.com': {
    email: 'demo@example.com',
    password: 'Demo@1234',
    name: 'Demo User',
    verified: true,
  },
};

// Mock verification codes (in real app, stored in DB with expiry)
const mockVerificationCodes: Record<string, { code: string; email: string; expiresAt: number }> = {};

// Account lockout tracking (mock)
const failedAttempts: Record<string, { count: number; lockedUntil: number }> = {};

const isAccountLocked = (email: string): boolean => {
  const attempt = failedAttempts[email];
  if (!attempt) return false;
  if (Date.now() > attempt.lockedUntil) {
    delete failedAttempts[email];
    return false;
  }
  return attempt.count >= 5;
};

const recordFailedAttempt = (email: string) => {
  if (!failedAttempts[email]) {
    failedAttempts[email] = { count: 0, lockedUntil: 0 };
  }
  failedAttempts[email].count += 1;
  if (failedAttempts[email].count >= 5) {
    failedAttempts[email].lockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
  }
};

const clearFailedAttempts = (email: string) => {
  delete failedAttempts[email];
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const normalizedEmail = email.toLowerCase();

  // Check if account is locked
  if (isAccountLocked(normalizedEmail)) {
    return {
      success: false,
      error: {
        code: 'ACCOUNT_LOCKED',
        message: 'Account temporarily locked due to too many failed attempts. Try again in 15 minutes.',
      },
    };
  }

  const user = mockUsers[normalizedEmail];

  if (!user || user.password !== password) {
    recordFailedAttempt(normalizedEmail);
    return {
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    };
  }

  clearFailedAttempts(normalizedEmail);

  if (!user.verified) {
    // Generate verification code
    const code = Math.random().toString().slice(2, 8);
    mockVerificationCodes[normalizedEmail] = {
      code,
      email: normalizedEmail,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    };

    return {
      success: false,
      requiresEmailVerification: true,
      verificationToken: normalizedEmail,
      error: {
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email address',
      },
    };
  }

  return {
    success: true,
    user: {
      id: '1',
      email: user.email,
      name: user.name,
    },
  };
}

export async function register(
  email: string,
  password: string,
  name: string
): Promise<RegisterResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const normalizedEmail = email.toLowerCase();

  // Check if user already exists
  if (mockUsers[normalizedEmail]) {
    return {
      success: false,
      error: {
        code: 'USER_EXISTS',
        message: 'This email is already registered',
      },
    };
  }

  // Validate password strength
  if (password.length < 8) {
    return {
      success: false,
      error: {
        code: 'WEAK_PASSWORD',
        message: 'Password must be at least 8 characters',
      },
    };
  }

  // Create new user
  mockUsers[normalizedEmail] = {
    email: normalizedEmail,
    password,
    name,
    verified: false,
  };

  // Generate verification code
  const code = Math.random().toString().slice(2, 8);
  mockVerificationCodes[normalizedEmail] = {
    code,
    email: normalizedEmail,
    expiresAt: Date.now() + 10 * 60 * 1000,
  };

  return {
    success: true,
    requiresEmailVerification: true,
    verificationToken: normalizedEmail,
    user: {
      id: '1',
      email: normalizedEmail,
      name,
    },
  };
}

export async function verifyEmail(email: string, code: string): Promise<VerifyEmailResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  const normalizedEmail = email.toLowerCase();
  const verification = mockVerificationCodes[normalizedEmail];

  if (!verification) {
    return {
      success: false,
      error: {
        code: 'INVALID_CODE',
        message: 'No verification code found. Please request a new one.',
      },
    };
  }

  if (Date.now() > verification.expiresAt) {
    delete mockVerificationCodes[normalizedEmail];
    return {
      success: false,
      error: {
        code: 'CODE_EXPIRED',
        message: 'Verification code has expired. Please request a new one.',
      },
    };
  }

  if (verification.code !== code) {
    return {
      success: false,
      error: {
        code: 'INVALID_CODE',
        message: 'Invalid verification code',
      },
    };
  }

  // Mark user as verified
  const user = mockUsers[normalizedEmail];
  if (user) {
    user.verified = true;
  }

  delete mockVerificationCodes[normalizedEmail];

  return { success: true };
}

export async function requestPasswordReset(email: string): Promise<ResetPasswordResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  const normalizedEmail = email.toLowerCase();
  const user = mockUsers[normalizedEmail];

  if (!user) {
    // Security: Don't reveal if email exists
    return { success: true };
  }

  // In real app, would send email with reset link
  const resetCode = Math.random().toString().slice(2, 8);
  mockVerificationCodes[normalizedEmail] = {
    code: resetCode,
    email: normalizedEmail,
    expiresAt: Date.now() + 1 * 60 * 60 * 1000, // 1 hour
  };

  return { success: true };
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<ResetPasswordResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  const normalizedEmail = email.toLowerCase();
  const verification = mockVerificationCodes[normalizedEmail];

  if (!verification || verification.code !== code) {
    return {
      success: false,
      error: {
        code: 'INVALID_CODE',
        message: 'Invalid or expired reset code',
      },
    };
  }

  const user = mockUsers[normalizedEmail];
  if (!user) {
    return {
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      },
    };
  }

  user.password = newPassword;
  delete mockVerificationCodes[normalizedEmail];

  return { success: true };
}

export function getPasswordStrength(password: string): {
  strength: 'weak' | 'fair' | 'strong';
  score: number;
} {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z\d]/.test(password)) score += 1;

  if (score <= 2) return { strength: 'weak', score };
  if (score <= 4) return { strength: 'fair', score };
  return { strength: 'strong', score };
}
