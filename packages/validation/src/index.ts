import { z } from 'zod';

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name must be at most 255 characters'),
});

export const forgotPasswordSchema = z.object({
  email: z.email('Please enter a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be at most 128 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─── User Schemas ─────────────────────────────────────────────────────────────

export const updateUserSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  avatarUrl: z.string().url().max(500).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be at most 128 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
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

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type PaginationInput = z.infer<typeof paginationQuerySchema>;
