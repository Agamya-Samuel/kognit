import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoles = pgEnum('user_role', ['student', 'instructor', 'admin', 'institution_admin']);

export const approvalStatus = pgEnum('approval_status', ['pending', 'approved', 'rejected']);

export const pricingType = pgEnum('pricing_type', ['free', 'paid']);

export const lectureType = pgEnum('lecture_type', ['video', 'live', 'text', 'assignment', 'quiz']);

export const liveClassStatus = pgEnum('live_class_status', ['scheduled', 'live', 'ended']);

export const assignmentType = pgEnum('assignment_type', ['mcq', 'short', 'code']);

export const accessType = pgEnum('access_type', ['purchased', 'free']);

export const paymentStatus = pgEnum('payment_status', ['pending', 'paid', 'failed', 'refunded']);

export const channelType = pgEnum('channel_type', ['course', 'general', 'dm']);

export const notificationDelivery = pgEnum('notification_delivery', ['in_app', 'email', 'both']);

export const moderationStatus = pgEnum('moderation_status', ['visible', 'flagged', 'hidden']);

export const waitlistSource = pgEnum('waitlist_source', ['landing_page', 'invite_flow']);

export const permissionsLevel = pgEnum('permissions_level', ['super_admin', 'moderator', 'support']);

export const uploadStatus = pgEnum('upload_status', ['pending', 'uploading', 'complete', 'failed', 'cancelled']);
