// ─── Shared Enums ──────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'instructor' | 'admin' | 'institution_admin';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type PricingType = 'free' | 'paid';
export type LectureType = 'video' | 'live' | 'text' | 'assignment' | 'quiz';
export type LiveClassStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';
export type AssignmentType = 'mcq' | 'short' | 'code';
export type AccessType = 'purchased' | 'free';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type ChannelType = 'course' | 'general' | 'dm';
export type NotificationDelivery = 'in_app' | 'email' | 'both';
export type ModerationStatus = 'visible' | 'flagged' | 'hidden';
export type WaitlistSource = 'landing_page' | 'invite_flow';
export type PermissionsLevel = 'super_admin' | 'moderator' | 'support';

// ─── API Response Envelope ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
  error: null;
}

export interface ApiErrorResponse {
  success: false;
  data: null;
  error: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}

export type ApiResponseOrError<T> = ApiResponse<T> | ApiErrorResponse;

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  role: UserRole;
  name: string;
  avatarUrl?: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ─── Instructor Profile ───────────────────────────────────────────────────────

export interface InstructorProfile {
  id: number;
  userId: number;
  bio?: string | null;
  expertise?: string[] | null;
  socialLinks?: Record<string, string> | null;
  approvalStatus: ApprovalStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ─── Student Profile ──────────────────────────────────────────────────────────

export interface StudentProfile {
  id: number;
  userId: number;
  grade?: string | null;
  institution?: string | null;
  interests?: string[] | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ─── Course ───────────────────────────────────────────────────────────────────

export interface Course {
  id: number;
  instructorId: number;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  domain: string;
  pricingType: PricingType;
  priceInr: number;
  isPublished: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ─── Section ──────────────────────────────────────────────────────────────────

export interface Section {
  id: number;
  courseId: number;
  title: string;
  orderIndex: number;
  createdAt: Date | string;
}

// ─── Lecture ──────────────────────────────────────────────────────────────────

export interface Lecture {
  id: number;
  sectionId: number;
  title: string;
  description?: string | null;
  orderIndex: number;
  type: LectureType;
  muxAssetId?: string | null;
  muxPlaybackId?: string | null;
  durationSeconds: number;
  isFreePreview: boolean;
  isPublished: boolean;
  createdAt: Date | string;
}

// ─── Course with nested structures ────────────────────────────────────────────

export interface CourseWithSections extends Course {
  sections: SectionWithLectures[];
}

export interface SectionWithLectures extends Section {
  lectures: Lecture[];
}

// ─── Enrollment ───────────────────────────────────────────────────────────────

export interface Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  enrolledAt: Date | string;
  paymentId?: number | null;
  accessType: AccessType;
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export interface Payment {
  id: number;
  studentId: number;
  courseId: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  providerPaymentId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ─── Recording Status ──────────────────────────────────────────────────────────

export type RecordingStatus = 'none' | 'recording' | 'processing' | 'ready' | 'failed';

// ─── Live Class ──────────────────────────────────────────────────────────────────

export interface LiveClassSchedule {
  id: number;
  lectureId: number;
  instructorId: number;
  scheduledAt: Date | string;
  durationMinutes: number;
  status: LiveClassStatus;
  livekitRoomName: string;
  recordingStatus: RecordingStatus;
  recordingUrl: string | null;
}

export interface CalendarEvent {
  id: number;
  lectureId: number;
  lectureTitle: string;
  sectionId: number;
  courseId: number;
  courseTitle: string;
  instructorId: number;
  scheduledAt: string;
  durationMinutes: number;
  status: LiveClassStatus;
  livekitRoomName: string;
  recordingStatus: RecordingStatus;
  recordingUrl: string | null;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD in target timezone
  events: CalendarEvent[];
}

export interface RecordingInfo {
  liveClassId: number;
  status: RecordingStatus;
  s3Key: string | null;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  playbackUrl: string | null;
  error: string | null;
}

export interface NotificationPayload {
  liveClassId: number;
  type: 'class_scheduled' | 'class_reminder_1hr' | 'class_reminder_15min' | 'class_cancelled' | 'class_started' | 'recording_ready';
  title: string;
  body: string;
}
