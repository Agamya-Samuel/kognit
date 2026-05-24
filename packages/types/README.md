# @edutech/types

Shared TypeScript type definitions for EduTech applications. Provides a single source of truth for all data models, API contracts, and domain types across frontend and backend.

## Installation

```bash
npm install @edutech/types
# or
pnpm add @edutech/types
```

## Type Categories

### Core Types

#### API Response Envelope

All API responses follow this envelope pattern:

```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
  error: null;
}

interface ApiErrorResponse {
  success: false;
  data: null;
  error: ApiError;
}

type ApiResponseOrError<T> = ApiResponse<T> | ApiErrorResponse;
```

#### Error Types

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: FieldError[];
}

interface FieldError {
  field: string;
  message: string;
}
```

#### Pagination

```typescript
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}
```

### User & Authentication

#### Enums

```typescript
type UserRole = 'student' | 'instructor' | 'admin' | 'institution_admin';
type ApprovalStatus = 'pending' | 'approved' | 'rejected';
```

#### Interfaces

```typescript
interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
}

interface JwtPayload {
  sub: number;      // user ID
  email: string;
  role: UserRole;
  exp: number;
  iat: number;
}
```

#### Instructor Profile

```typescript
interface InstructorProfile {
  id: number;
  userId: number;
  bio: string | null;
  expertise: string[];
  rating: number | null;
  totalStudents: number;
  totalCourses: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
```

#### Student Profile

```typescript
interface StudentProfile {
  id: number;
  userId: number;
  bio: string | null;
  interests: string[];
  completedCourses: number;
  inProgressCourses: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
```

### Courses

#### Enums

```typescript
type PricingType = 'free' | 'paid';
type LectureType = 'video' | 'live' | 'text' | 'assignment' | 'quiz';
```

#### Interfaces

```typescript
interface Course {
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

interface Section {
  id: number;
  courseId: number;
  title: string;
  orderIndex: number;
  createdAt: Date | string;
}

interface Lecture {
  id: number;
  sectionId: number;
  title: string;
  description: string | null;
  type: LectureType;
  videoUrl?: string | null;
  durationSeconds?: number | null;
  orderIndex: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface CourseWithSections extends Course {
  sections: SectionWithLectures[];
}

interface SectionWithLectures extends Section {
  lectures: Lecture[];
}

interface CourseWithCurriculum extends CourseWithSections {
  totalDurationSeconds: number;
  totalLectures: number;
}
```

### Enrollments

```typescript
interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  enrolledAt: Date | string;
  progress: number;
  completedAt: Date | string | null;
}
```

### Payments

#### Enums

```typescript
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
type AccessType = 'purchased' | 'free';
```

#### Interfaces

```typescript
interface Payment {
  id: number;
  userId: number;
  courseId: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  transactionId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface PaymentHistory {
  id: number;
  courseId: number;
  courseTitle: string;
  amount: number;
  status: PaymentStatus;
  date: Date | string;
}

interface PaymentFilters extends PaginationQuery {
  [key: string]: unknown;
}

interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  paymentUrl: string;
}

interface VerifyPaymentResponse {
  success: boolean;
  payment?: Payment;
}
```

### Live Classes

#### Enums

```typescript
type LiveClassStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';
```

#### Interfaces

```typescript
interface LiveClassSchedule {
  id: number;
  courseId: number;
  sectionId: number | null;
  lectureId: number | null;
  title: string;
  description: string | null;
  scheduledAt: Date | string;
  durationMinutes: number;
  instructorId: number;
  status: LiveClassStatus;
  streamUrl?: string | null;
  recordingUrl?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: number;
  courseName?: string;
  status?: LiveClassStatus;
}

interface CalendarDay {
  date: string;
  events: CalendarEvent[];
}

interface RecordingInfo {
  id: number;
  liveClassId: number;
  recordingUrl: string;
  durationMinutes: number;
  recordedAt: Date | string;
}
```

### Notifications

```typescript
type NotificationDelivery = 'in_app' | 'email' | 'both';

interface NotificationPayload {
  userId: number;
  type: string;
  title: string;
  message: string;
  delivery: NotificationDelivery;
  data?: Record<string, unknown>;
}
```

### Chat

#### Enums

```typescript
type ChannelType = 'course' | 'general' | 'dm';
type ModerationStatus = 'visible' | 'flagged' | 'hidden';
```

#### Interfaces

```typescript
interface ChatMessage {
  id: number;
  channelId: number;
  senderId: number;
  content: string;
  replyToId: number | null;
  replyTo: ChatMessage | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string | null;
  moderationStatus: ModerationStatus;
  sender?: {
    id: number;
    name: string;
    avatarUrl: string | null;
  };
}

interface ChatChannel {
  id: number;
  type: ChannelType;
  courseId?: number | null;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface ChatChannelMember {
  channelId: number;
  userId: number;
  joinedAt: Date | string;
}

interface TypingIndicator {
  channelId: number;
  users: TypingUser[];
  timestamp: Date | string;
}

interface TypingUser {
  userId: number;
  userName: string;
}

interface SendMessagePayload {
  channelId: number;
  content: string;
  replyToId?: number;
}

interface EditMessagePayload {
  content: string;
}

interface DeleteMessagePayload {
  reason?: string;
}

// Socket events
interface ChatSocketEvents {
  sendMessage: SendMessagePayload;
  editMessage: { messageId: number; payload: EditMessagePayload };
  deleteMessage: { messageId: number; payload: DeleteMessagePayload };
  typingStart: void;
  typingStop: void;
}

interface ChatServerEvents {
  messageCreated: ChatMessage;
  messageUpdated: ChatMessage;
  messageDeleted: { messageId: number; reason: string | null };
  typingIndicator: TypingIndicator;
}
```

### Assignments

#### Enums

```typescript
type AssignmentType = 'mcq' | 'short' | 'code';
```

#### DTOs (Data Transfer Objects)

```typescript
interface CreateAssignmentDto {
  lectureId: number;
  title: string;
  description: string;
  type: AssignmentType;
  maxScore: number;
  dueAt: string;
  lateWindowHours: number;
  latePenaltyPercent: number;
  questions?: QuizQuestionDto[];
}

interface UpdateAssignmentDto extends Partial<CreateAssignmentDto> {}

interface QuizQuestionDto {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  points: number;
}

interface SubmitAssignmentDto {
  content: string;
  files?: Array<{
    name: string;
    url: string;
  }>;
}

interface GradeSubmissionDto {
  score: number;
  feedback?: string;
}

interface BulkGradeItemDto {
  submissionId: number;
  score: number;
  feedback?: string;
}

interface BulkGradeDto {
  items: BulkGradeItemDto[];
}
```

#### Filters

```typescript
interface AssignmentFilters extends PaginationQuery {
  [key: string]: unknown;
}

interface SubmissionFilters extends PaginationQuery {
  [key: string]: unknown;
}
```

#### Interfaces

```typescript
interface Assignment {
  id: number;
  courseId: number;
  lectureId: number;
  title: string;
  description: string;
  type: AssignmentType;
  maxScore: number;
  dueAt: Date | string;
  lateWindowHours: number;
  latePenaltyPercent: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  course?: {
    id: number;
    title: string;
  };
  lecture?: {
    id: number;
    title: string;
  };
}

interface QuizQuestion {
  id: number;
  assignmentId: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  points: number;
  orderIndex: number;
  createdAt: Date | string;
}

interface Submission {
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

interface LateSubmissionStatus {
  isLate: boolean;
  isAccepted: boolean;
  hoursLate: number;
  penaltyApplied: boolean;
  penaltyPercent: number;
  penaltyAmount: number;
}

interface GradingResult {
  submission: Submission;
  originalScore: number;
  penaltyPercent: number;
  finalScore: number;
}
```

### Certificates

```typescript
interface Certificate {
  id: number;
  userId: number;
  courseId: number;
  certificateNumber: string;
  issuedAt: Date | string;
  expiryDate?: Date | string | null;
  certificateUrl: string;
}

interface CertificateListResponse {
  certificates: Certificate[];
  total: number;
}

interface VerifyCertificateResponse {
  valid: boolean;
  certificate?: Certificate;
}
```

### Uploads

```typescript
interface UploadRequest {
  fileName: string;
  contentType: string;
  fileSize: number;
}

interface UploadResponse {
  uploadId: string;
  uploadUrl: string;
  uploadIdNumber: number;
  expiresAt: string;
}

interface UploadPart {
  partNumber: number;
  uploadUrl: string;
  uploadId: string;
  expiresAt: string;
}

interface UploadData {
  uploadId: string;
  uploadIdNumber: number;
  file: File;
  fileName: string;
  fileSize: number;
  contentType: string;
}

interface UploadCompleteResponse {
  success: boolean;
  fileUrl: string;
}

interface UploadStatus {
  uploadId: number;
  fileName: string;
  fileSize: number;
  status: 'pending' | 'uploading' | 'complete' | 'failed' | 'cancelled';
  progress: number;
  errorMessage?: string;
  uploadUrl?: string;
}
```

### Progress Tracking

```typescript
interface LectureProgress {
  id: number;
  userId: number;
  lectureId: number;
  watchedSeconds: number;
  totalSeconds: number;
  completed: boolean;
  lastWatchedAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface UpdateProgressResponse {
  success: boolean;
  progress: LectureProgress;
}

interface WatchHistoryItem {
  id: number;
  userId: number;
  courseId: number;
  lectureId: number;
  watchedAt: Date | string;
  durationSeconds: number;
}

interface WatchHistoryResponse {
  items: WatchHistoryItem[];
  total: number;
}
```

### Auth (Instructor Registration)

```typescript
interface RegisterPayload {
  email: string;
  name: string;
  password: string;
}

interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
}
```

### Additional Utility Types

```typescript
type WaitlistSource = 'landing_page' | 'invite_flow';
type PermissionsLevel = 'super_admin' | 'moderator' | 'support';
```

## Usage Examples

### Import Types

```typescript
import type {
  Course,
  Assignment,
  Submission,
  CreateAssignmentDto,
  AssignmentFilters
} from '@edutech/types';

// Use in function signatures
function updateAssignment(
  id: number,
  dto: UpdateAssignmentDto
): Promise<Assignment> {
  // ...
}

// Use as component props
interface AssignmentListProps {
  filters?: AssignmentFilters;
  onAssignmentSelect: (assignment: Assignment) => void;
}
```

### Type Guards

```typescript
import type { ApiResponse, ApiErrorResponse, ApiError } from '@edutech/types';

function isApiSuccess<T>(
  response: ApiResponseOrError<T>
): response is ApiResponse<T> {
  return response.success === true;
}

function isApiError(
  response: ApiResponseOrError<unknown>
): response is ApiErrorResponse {
  return response.success === false;
}

// Usage
const response = await fetch('/api/courses');
if (isApiSuccess(response)) {
  console.log(response.data); // Course[]
}
```

### Utility Types

```typescript
import type { PaginationQuery } from '@edutech/types';

// Build filter types with pagination
interface CourseFilters extends PaginationQuery {
  domain?: string;
  pricingType?: PricingType;
  isPublished?: boolean;
}

// Use with index signature for flexibility
const filters: CourseFilters & Record<string, unknown> = {
  page: 1,
  limit: 10,
  domain: 'programming',
  // Custom query params work too
  search: 'react'
};
```

## Best Practices

1. **Always import from `@edutech/types`** - Don't duplicate type definitions in your app
2. **Use `PaginationQuery` for paginated endpoints** - Standardizes pagination
3. **Add index signatures to filter types** - Enables flexible query params: `interface Filters extends PaginationQuery { [key: string]: unknown }`
4. **Prefer string date types** - Use `string` instead of `Date | string` for API responses
5. **Use proper DTO types** - For `create`/`update` operations, use the appropriate DTO interfaces
6. **Leverage enums** - Use type aliases like `AssignmentType`, `PaymentStatus` for consistency

## Type Safety with React Query

```typescript
import { useQuery } from '@tanstack/react-query';
import type { Course, PaginationQuery } from '@edutech/types';
import { coursesService } from '@edutech/api-client';

const { data: courses, isLoading } = useQuery<Course[]>({
  queryKey: ['courses'],
  queryFn: () => coursesService.list(),
});

// courses is automatically typed as Course[] | undefined
```

## Generating Type Definitions

If you need to regenerate types from a backend API schema, consider using:

- **OpenAPI-to-TypeScript**: `openapi-typescript` from npm
- **GraphQL Code Generator**: `@graphql-codegen/cli`
- **tRPC**: End-to-end type safety for RPC

## Versioning

This package follows semantic versioning. Breaking changes in types will trigger a major version bump.

## License

MIT