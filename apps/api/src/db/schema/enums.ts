import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoles = pgEnum('user_role', ['student', 'instructor', 'admin', 'institution_admin']);

export const UserRole = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
  INSTITUTION_ADMIN: 'institution_admin',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export const approvalStatus = pgEnum('approval_status', ['pending', 'approved', 'rejected']);

export const pricingType = pgEnum('pricing_type', ['free', 'paid']);

export const lectureType = pgEnum('lecture_type', ['video', 'live', 'text', 'assignment', 'quiz']);

export const liveClassStatus = pgEnum('live_class_status', ['scheduled', 'live', 'ended', 'cancelled']);

export const recordingStatus = pgEnum('recording_status', ['none', 'recording', 'processing', 'ready', 'failed']);

export const assignmentType = pgEnum('assignment_type', ['mcq', 'short', 'code']);

export const accessType = pgEnum('access_type', ['purchased', 'free']);
export type AccessType = 'purchased' | 'free';

export const paymentStatus = pgEnum('payment_status', ['pending', 'paid', 'failed', 'refunded']);

export const channelType = pgEnum('channel_type', ['course', 'general', 'dm']);

export const notificationDelivery = pgEnum('notification_delivery', ['in_app', 'email', 'both']);

export const moderationStatus = pgEnum('moderation_status', ['visible', 'flagged', 'hidden']);

export const waitlistSource = pgEnum('waitlist_source', ['landing_page', 'invite_flow']);

export const permissionsLevel = pgEnum('permissions_level', ['super_admin', 'moderator', 'support']);

export const uploadStatus = pgEnum('upload_status', ['pending', 'uploading', 'complete', 'failed', 'cancelled']);
export const emailVerificationPurpose = pgEnum('email_verification_purpose', ['email_verify', 'student_activation', 'instructor_activation']);

// ─── Course Creation Enums ───────────────────────────────────────────────────

export const courseStatus = pgEnum('course_status', ['draft', 'in_review', 'revision_requested', 'published', 'archived']);

export const courseStructure = pgEnum('course_structure', ['live', 'normal']);

export const sessionType = pgEnum('session_type', ['one_time', 'recurring']);

export const dayOfWeek = pgEnum('day_of_week', ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
