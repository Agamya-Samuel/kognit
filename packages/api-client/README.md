# @edutech/api-client

Centralized API client package for EduTech frontend applications. Provides a unified, type-safe HTTP client with React Query integration, authentication handling, and domain-specific service modules.

## Installation

```bash
npm install @edutech/api-client
# or
pnpm add @edutech/api-client
```

## Quick Start

### 1. Wrap your app with ApiProvider

In your root layout or provider file:

```tsx
import { ApiProvider } from '@edutech/api-client';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApiProvider>
      {children}
    </ApiProvider>
  );
}
```

### 2. Use service modules in your components

```tsx
import { useQuery } from '@tanstack/react-query';
import { coursesService, assignmentsService } from '@edutech/api-client';

function MyComponent() {
  // Get all courses
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesService.list(),
  });

  // Get specific assignment
  const { data: assignment } = useQuery({
    queryKey: ['assignment', 123],
    queryFn: () => assignmentsService.getById(123),
  });
}
```

## Features

- **🔐 Bearer Token Authentication** - Automatic JWT token injection from localStorage
- **🔄 React Query Integration** - Seamless data fetching and caching
- **📦 Domain Services** - Organized service modules for each business domain
- **🎯 Type Safety** - Full TypeScript support with shared types
- **⚡ Automatic Envelope Unwrapping** - No need to extract `data.data`
- **🛡️ Error Handling** - Structured errors with `ApiClientError` class
- **🖥️ Server-Side Support** - `createServerApiClient()` for Server Components

## Configuration

### Environment Variables

Set these in your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### ApiProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | Required | App content |
| `loginPath` | `string` | `'/auth/login'` | Redirect path on 401 errors |

### Token Storage

By default, `ApiProvider` reads the JWT token from `localStorage.getItem('accessToken')`. On 401 responses, it automatically clears both `accessToken` and `refreshToken` and redirects to `loginPath`.

## Available Services

### Courses Service

```typescript
import { coursesService } from '@edutech/api-client';

await coursesService.list(filters);              // Get courses
await coursesService.getById(id);                  // Get course with sections
await coursesService.getDomains();                // Get all domains
await coursesService.getCurriculum(id);            // Get course curriculum
await coursesService.getInstructorProfile(id);     // Get instructor profile
await coursesService.create(dto);                 // Create course (instructor only)
await coursesService.update(id, dto);              // Update course
await coursesService.delete(id);                  // Delete course
```

### Assignments Service

```typescript
import { assignmentsService } from '@edutech/api-client';

await assignmentsService.list(filters);           // Get assignments
await assignmentsService.getById(id);              // Get assignment details
await assignmentsService.create(dto);              // Create assignment
await assignmentsService.update(id, dto);           // Update assignment
await assignmentsService.delete(id);               // Delete assignment
```

### Quiz Service (Instructor)

```typescript
import { quizService } from '@edutech/api-client';

await quizService.addQuestion(assignmentId, dto);       // Add quiz question
await quizService.updateQuestion(questionId, dto);       // Update question
await quizService.deleteQuestion(questionId);           // Delete question
```

### Submissions Service

```typescript
import { submissionsService } from '@edutech/api-client';

await submissionsService.list(filters);                 // Get submissions
await submissionsService.getById(id);                    // Get submission
await submissionsService.getByAssignment(id, filters);   // Get submissions for assignment
await submissionsService.submit(assignmentId, dto);      // Submit assignment (student)
await submissionsService.grade(id, dto);                 // Grade submission (instructor)
await submissionsService.autoGrade(id);                 // Auto-grade submission
await submissionsService.bulkGrade(dto);                // Bulk grade
```

### Payments Service (Student)

```typescript
import { paymentsService } from '@edutech/api-client';

await paymentsService.createOrder(courseId);            // Create payment order
await paymentsService.verifyPayment(orderId, paymentId); // Verify payment
await paymentsService.getHistory(filters);              // Get payment history
```

### Chat Service (Student)

```typescript
import { chatService } from '@edutech/api-client';

await chatService.getChannels();                       // Get chat channels
await chatService.getMessages(channelId);               // Get messages
await chatService.sendMessage(channelId, dto);          // Send message
await chatService.editMessage(messageId, dto);          // Edit message
await chatService.deleteMessage(messageId);             // Delete message
```

### Certificates Service (Student)

```typescript
import { certificatesService } from '@edutech/api-client';

await certificatesService.getMyCertificates();         // Get student certificates
await certificatesService.getByCode(code);              // Verify certificate
await certificatesService.getForCourse(courseId);       // Get course certificates
```

### Live Classes Service (Student)

```typescript
import { liveClassesService } from '@edutech/api-client';

await liveClassesService.getStudentCalendar(startDate, endDate); // Get calendar
await liveClassesService.getUpcomingClasses(limit);              // Get upcoming
await liveClassesService.getRecordingInfo(liveClassId);          // Get recording
```

### Progress Service (Student)

```typescript
import { progressService } from '@edutech/api-client';

await progressService.getLectureProgress(lectureId);     // Get progress
await progressService.updateProgress(lectureId, seconds); // Update progress
await progressService.getWatchHistory(offset, limit);    // Get history
```

### Admin Service (Admin)

```typescript
import { adminService } from '@edutech/api-client';

await adminService.getInstructors(filters);              // Get instructors
await adminService.approveInstructor(id);                 // Approve instructor
await adminService.rejectInstructor(id, reason);         // Reject instructor
await adminService.getCourses(filters);                   // Get courses
await adminService.approveCourse(id);                    // Approve course
await adminService.rejectCourse(id, reason);             // Reject course
await adminService.suspendCourse(id, reason);            // Suspend course
await adminService.getUsers(filters);                    // Get users
```

### Auth Service (Instructor)

```typescript
import { authService } from '@edutech/api-client';

await authService.requestVerificationCode(email);        // Request registration code
await authService.verifyCode(email, code);               // Verify email code
await authService.completeRegistration(email, code, name, password); // Complete registration
await authService.forgotPassword(email);                 // Request password reset
await authService.resetPassword(token, password, confirmPassword); // Reset password
```

### Schedule Service (Instructor)

```typescript
import { scheduleService } from '@edutech/api-client';

await scheduleService.getSchedule(filters);              // Get instructor schedule
```

### Recordings Service (Instructor)

```typescript
import { recordingsService } from '@edutech/api-client';

await recordingsService.getRecordings(filters);          // Get recordings
await recordingsService.updateRecording(id, data);       // Update recording
```

### Uploads Service (Instructor)

```typescript
import { uploadsService } from '@edutech/api-client';

await uploadsService.requestUrl(lectureId, file);        // Get upload URL
await uploadsService.uploadToUrl(url, file, onProgress); // Upload to signed URL
await uploadsService.completeUpload(uploadId);           // Mark upload complete
await uploadsService.getStatus(uploadId);                // Get upload status
```

## Server-Side Usage

For Server Components, `generateMetadata`, or Route Handlers, use `createServerApiClient()`:

```tsx
import { createServerApiClient } from '@edutech/api-client';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const client = createServerApiClient(process.env.API_URL!);

  const course = await client.get(`/courses/${params.id}`);

  return {
    title: course.title,
  };
}
```

Note: Server-side client doesn't use localStorage. Pass a token directly or omit for unauthenticated requests.

## Error Handling

All API errors are thrown as `ApiClientError`:

```tsx
import { useMutation } from '@tanstack/react-query';
import { isApiError, ApiClientError } from '@edutech/api-client';

const mutation = useMutation({
  mutationFn: () => coursesService.create(dto),
  onError: (error) => {
    if (isApiError(error)) {
      console.error('API Error:', error.code, error.message);
      console.error('Status:', error.status);
      console.error('Details:', error.details);
    } else {
      console.error('Unknown error:', error);
    }
  },
});
```

### Error Structure

```typescript
interface ApiClientError extends Error {
  code: string;                    // Error code from backend
  status: number;                  // HTTP status code
  details?: Array<{               // Field-level errors
    field: string;
    message: string;
  }>;
}
```

## React Query Patterns

### Query

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['courses', { domain: 'programming' }],
  queryFn: () => coursesService.list({ domain: 'programming' }),
});
```

### Mutation

```tsx
const mutation = useMutation({
  mutationFn: (dto: CreateAssignmentDto) => assignmentsService.create(dto),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['assignments'] });
  },
});
```

### Pagination

```tsx
const { data, isLoading } = useQuery({
  queryKey: ['courses', { page: 1, limit: 10 }],
  queryFn: () => coursesService.list({ page: 1, limit: 10 }),
});
```

## Best Practices

1. **Always use React Query** - Never call services directly in components
2. **Invalidate queries after mutations** - Keep data in sync
3. **Use `isApiError` type guard** - Safe error handling
4. **Handle loading states** - Provide good UX
5. **Use query keys strategically** - Group related queries
6. **Leverage caching** - Avoid unnecessary refetches

## Migration from Local API Files

### Before

```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const getCourses = async () => api.get('/courses');
```

### After

```typescript
import { coursesService } from '@edutech/api-client';

// No axios import, no manual config
await coursesService.list();
```

## TypeScript Support

All service methods are fully typed. Return types are automatically inferred from `@edutech/types`:

```typescript
const courses = await coursesService.list();
// courses: Course[]

const course = await coursesService.getById(1);
// course: CourseWithSections
```

## License

MIT