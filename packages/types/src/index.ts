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
  [key: string]: unknown;
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

// ─── Email Verification Types ──────────────────────────────────────────────────

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationResponse {
  message: string;
  code?: string; // Only in dev/development environments
}

export interface EmailVerificationCodeVerify {
  email: string;
  code: string;
}

export interface EmailVerificationCodeVerifyResponse {
  verified: boolean;
  email: string;
}

export interface ExistingUserEmailVerificationRequest {
  // Requires authentication
}

export interface ExistingUserEmailVerificationResponse {
  message: string;
  code?: string; // Only in dev environments
}

export interface ExistingUserEmailVerificationVerify {
  code: string;
}

export interface ExistingUserEmailVerificationVerifyResponse {
  verified: boolean;
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
  description: string | null;
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
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistory {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: string;
  courseId?: number;
  [key: string]: unknown;
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

// ─── Chat / Messaging ───────────────────────────────────────────────────────

export interface ChatMessage {
  id: number;
  channelId: number;
  senderId: number;
  content: string;
  replyToId: number | null;
  isEdited: boolean;
  isDeleted: boolean;
  moderationStatus: ModerationStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  replies?: ChatMessage[];
  senderName?: string;
  senderAvatarUrl?: string | null;
  senderEmail?: string;
  senderRole?: UserRole;
}

export interface ChatChannel {
  id: number;
  courseId: number | null;
  type: ChannelType;
  name: string;
  createdAt: Date | string;
  memberCount?: number;
}

export interface ChatChannelMember {
  id: number;
  channelId: number;
  userId: number;
  joinedAt: Date | string;
  lastReadAt: Date | string | null;
}

export interface TypingIndicator {
  channelId: number;
  typingUsers: TypingUser[];
}

export interface TypingUser {
  userId: number;
  email: string;
  channelId: number;
  startedAt: number;
}

export interface SendMessagePayload {
  channelId: number;
  content: string;
  replyToId?: number;
}

export interface EditMessagePayload {
  messageId: number;
  content: string;
}

export interface DeleteMessagePayload {
  messageId: number;
}

export interface ChatSocketEvents {
  'chat:send': (data: SendMessagePayload) => void;
  'chat:edit': (data: EditMessagePayload) => void;
  'chat:delete': (data: DeleteMessagePayload) => void;
  'chat:typing': (data: { channelId: number; isTyping: boolean }) => void;
  'chat:join': (data: { channelId: number }) => void;
  'chat:leave': (data: { channelId: number }) => void;
}

export interface ChatServerEvents {
  'chat:message': (data: ChatMessage) => void;
  'chat:message_edited': (data: { id: number; content: string; isEdited: boolean; updatedAt: string }) => void;
  'chat:message_deleted': (data: { messageId: number; deletedBy: number }) => void;
  'chat:typing': (data: TypingIndicator) => void;
  'chat:joined': (data: { channelId: number }) => void;
  'chat:user_joined': (data: { channelId: number; userId: number; email: string; role: string }) => void;
  'chat:user_left': (data: { channelId: number; userId: number }) => void;
}

// ─── Assignments ───────────────────────────────────────────────────────────────

export interface CreateAssignmentDto {
  lectureId: number;
  title: string;
  description?: string;
  type: AssignmentType;
  maxScore: number;
  dueAt: string;
  lateWindowHours?: number;
  latePenaltyPercent?: number;
}

export interface UpdateAssignmentDto {
  title?: string;
  description?: string;
  type?: AssignmentType;
  maxScore?: number;
  dueAt?: string;
  lateWindowHours?: number;
  latePenaltyPercent?: number;
}

export interface QuizQuestionDto {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  points?: number;
  orderIndex?: number;
}

export interface SubmitAssignmentDto {
  content: string;
}

export interface GradeSubmissionDto {
  score: number;
  feedback?: string;
}

export interface BulkGradeItemDto {
  submissionId: number;
  score: number;
  feedback?: string;
}

export interface BulkGradeDto {
  grades: BulkGradeItemDto[];
}

export interface AssignmentFilters {
  lectureId?: number;
  type?: AssignmentType;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export interface SubmissionFilters {
  assignmentId?: number;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export interface Assignment {
  id: number;
  lectureId: number;
  title: string;
  description: string | null;
  type: AssignmentType;
  maxScore: number;
  dueAt: string;
  lateWindowHours: number | null;
  latePenaltyPercent: number;
  createdAt: string;
  lecture?: Lecture;
}

export interface QuizQuestion {
  id: number;
  assignmentId: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  points: number;
  orderIndex: number;
  createdAt: string;
  correctOption?: string;
}

export interface Submission {
  id: number;
  assignmentId: number;
  studentId: number;
  content: string;
  submittedAt: string;
  gradedAt: string | null;
  score: number | null;
  feedback: string | null;
  graderId: number | null;
  createdAt: string;
  assignment?: Assignment;
}

export interface LateSubmissionStatus {
  isLate: boolean;
  isAccepted: boolean;
  hoursLate: number;
  penaltyApplied: boolean;
  penaltyPercent: number;
  penaltyAmount: number;
}

export interface GradingResult {
  submission: Submission;
  originalScore: number;
  penaltyPercent: number;
  finalScore: number;
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export interface PaymentHistory {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
  receipt: string;
  paymentRecordId: number;
}

export interface VerifyPaymentResponse {
  success: boolean;
  enrollmentId: number;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: string;
  courseId?: number;
}

// ─── Certificates ─────────────────────────────────────────────────────────────

export interface Certificate {
  id: number;
  studentId: number;
  courseId: number;
  certificateUid: string;
  issuedAt: string;
  pdfUrl: string | null;
  studentName: string;
  courseTitle: string;
  instructorName: string;
}

export interface CertificateListResponse {
  success: boolean;
  data: Certificate[];
  total: number;
  page: number;
  limit: number;
}

export interface VerifyCertificateResponse {
  success: boolean;
  data: {
    valid: boolean;
    certificate: Certificate | null;
  };
}

// ─── Uploads ─────────────────────────────────────────────────────────────────

export interface UploadRequest {
  fileName: string;
  fileSize: number;
  contentType: string;
}

export interface UploadResponse {
  uploadId: string;
  uploadUrl: string;
  parts: UploadPart[];
}

export interface UploadPart {
  partNumber: number;
  signedUrl: string;
}

export interface UploadData {
  uploadId: string;
  key: string;
  parts: { partNumber: number; etag: string }[];
}

export interface UploadCompleteResponse {
  videoUrl: string;
  muxAssetId: string;
  muxPlaybackId: string;
}

export interface UploadStatus {
  uploadId: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress?: number;
  videoUrl?: string;
  muxPlaybackId?: string;
  error?: string;
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface LectureProgress {
  lectureId: number;
  courseId: number;
  watchedSeconds: number;
  lectureDuration: number;
  progressPercentage: number;
  isCompleted: boolean;
  lastWatchedAt: string;
}

export interface UpdateProgressResponse {
  lectureId: number;
  watchedSeconds: number;
  progressPercentage: number;
  isCompleted: boolean;
}

export interface WatchHistoryItem {
  lectureId: number;
  lectureTitle: string;
  courseId: number;
  courseTitle: string;
  sectionId: number;
  sectionTitle: string;
  watchedSeconds: number;
  lectureDuration: number;
  progressPercentage: number;
  isCompleted: boolean;
  lastWatchedAt: string;
}

export interface WatchHistoryResponse {
  items: WatchHistoryItem[];
  total: number;
  offset: number;
  limit: number;
}

// ─── Live Classes ─────────────────────────────────────────────────────────────

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
  date: string; // YYYY-MM-DD
  events: CalendarEvent[];
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    tokens: AuthTokens;
  };
  error?: string;
}

// ─── Course with Curriculum ─────────────────────────────────────────────────

export interface CourseWithCurriculum extends CourseWithSections {
  instructor?: InstructorProfile;
}
