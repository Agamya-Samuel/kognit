import { z } from 'zod';

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

// Password policy: min 8 chars, 1 uppercase, 1 lowercase, 1 digit
export const passwordPolicy = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: passwordPolicy,
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name must be at most 255 characters'),
});

export const signupSchema = z
  .object({
    email: z.email('Please enter a valid email address'),
    password: passwordPolicy,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name must be at most 255 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Email-first registration: step 1 — request verification code
export const requestEmailVerificationSchema = z.object({
  email: z.email('Please enter a valid email address'),
});

// Email-first registration: step 2 — verify code
export const verifyEmailCodeSchema = z.object({
  email: z.email('Please enter a valid email address'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

// Email-first registration: step 3 — complete registration
export const completeRegistrationSchema = z.object({
  email: z.email('Please enter a valid email address'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name must be at most 255 characters'),
  password: passwordPolicy,
});

export const forgotPasswordSchema = z.object({
  email: z.email('Please enter a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordPolicy,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordPolicy,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ─── User Schemas ─────────────────────────────────────────────────────────────

export const updateUserSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  avatarUrl: z.string().url().max(500).optional(),
});

// ─── Course Schemas ───────────────────────────────────────────────────────────

export const createCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(255, 'Title must be at most 255 characters'),
  description: z.string().max(5000).optional(),
  domain: z.string().min(1, 'Domain is required').max(100),
  pricingType: z.enum(['free', 'paid']),
  priceInr: z.number().int().min(0).default(0),
});

export const updateCourseSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().max(5000).optional(),
  thumbnailUrl: z.string().url().max(500).optional(),
  domain: z.string().min(1).max(100).optional(),
  pricingType: z.enum(['free', 'paid']).optional(),
  priceInr: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
});

// ─── Enrollment Schemas ───────────────────────────────────────────────────────

export const createEnrollmentSchema = z.object({
  courseId: z.number().int().positive('Course ID must be a positive integer'),
  accessType: z.enum(['purchased', 'free']).default('purchased'),
});

// ─── Pagination Schemas ───────────────────────────────────────────────────────

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ─── Section Schemas ─────────────────────────────────────────────────────

export const createSectionSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(255, 'Title must be at most 255 characters'),
  orderIndex: z.number().int().min(0).optional(),
});

export const updateSectionSchema = z.object({
  title: z.string().min(2).max(255).optional(),
  orderIndex: z.number().int().min(0).optional(),
});

export const reorderSectionsSchema = z.object({
  sectionIds: z.array(z.number().int().positive()).min(1, 'At least one section ID is required'),
});

// ─── Lecture Schemas ─────────────────────────────────────────────────────

export const createLectureSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(255, 'Title must be at most 255 characters'),
  description: z.string().max(5000).optional(),
  type: z.enum(['video', 'live', 'text', 'assignment', 'quiz']).default('video'),
  orderIndex: z.number().int().min(0).optional(),
  isFreePreview: z.boolean().default(false),
  isPublished: z.boolean().default(false),
});

export const updateLectureSchema = z.object({
  title: z.string().min(2).max(255).optional(),
  description: z.string().max(5000).optional(),
  type: z.enum(['video', 'live', 'text', 'assignment', 'quiz']).optional(),
  orderIndex: z.number().int().min(0).optional(),
  isFreePreview: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export const reorderLecturesSchema = z.object({
  lectureIds: z.array(z.number().int().positive()).min(1, 'At least one lecture ID is required'),
});

// ─── Course Query Schemas ────────────────────────────────────────────────

export const courseQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  domain: z.string().optional(),
  isPublished: z.coerce.boolean().optional(),
  instructorId: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type RequestEmailVerificationInput = z.infer<typeof requestEmailVerificationSchema>;
export type VerifyEmailCodeInput = z.infer<typeof verifyEmailCodeSchema>;
export type CompleteRegistrationInput = z.infer<typeof completeRegistrationSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type PaginationInput = z.infer<typeof paginationQuerySchema>;
export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
export type ReorderSectionsInput = z.infer<typeof reorderSectionsSchema>;
export type CreateLectureInput = z.infer<typeof createLectureSchema>;
export type UpdateLectureInput = z.infer<typeof updateLectureSchema>;
export type ReorderLecturesInput = z.infer<typeof reorderLecturesSchema>;
export type CourseQueryInput = z.infer<typeof courseQuerySchema>;
