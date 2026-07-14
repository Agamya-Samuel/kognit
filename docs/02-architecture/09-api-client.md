# API Client Architecture

> **Purpose:** Centralized HTTP client architecture, service modules, and React Query integration
> **Last Updated:** 24th May, 2026

---

## Overview

The EduTech platform uses a centralized API client architecture that provides a single source of truth for all HTTP communication across all frontend applications. The architecture ensures consistency, type safety, and maintainability while abstracting away the complexities of authentication, error handling, and data caching.

---

## Architecture Components

### 1. ApiClient Core

The `ApiClient` class in `packages/api-client/src/index.ts` provides the foundation:

- **HTTP Methods:** `get`, `post`, `patch`, `put`, `delete`
- **Authentication:** Automatic Bearer token injection from localStorage
- **Error Handling:** Structured `ApiClientError` with `code`, `status`, `details`
- **Envelope Unwrapping:** Automatically extracts `response.data.data`
- **Type Safety:** Full TypeScript support with generic methods

```typescript
// Basic usage
const client = new ApiClient({
  baseURL: "https://api.example.com/api",
  getToken: () => localStorage.getItem("accessToken"),
});

const courses = await client.get<Course[]>("/courses");
```

### 2. Authentication Strategy

All three frontend apps (student, instructor, admin) use a standardized authentication approach:

- **Token Storage:** `localStorage.getItem('accessToken')`
- **Token Format:** Bearer token in `Authorization` header
- **401 Handling:** Automatic token clear and redirect to login path
- **Provider:** `ApiProvider` component initializes client on app mount

```tsx
// apps/web-student/src/app/providers.tsx
import { ApiProvider } from "@edutech/api-client";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ApiProvider loginPath="/auth/login">{children}</ApiProvider>;
}
```

### 3. Service Modules

Service modules provide domain-specific API methods:

```
packages/api-client/src/services/
├── courses.ts              # Course CRUD, curriculum, instructor profiles
├── assignments.ts          # Assignment and quiz management
├── submissions.ts          # Submission handling and grading
├── payments.ts             # Razorpay integration and history
├── chat.ts                 # Chat channels and messages
├── certificates.ts         # Certificate generation and verification
├── uploads.ts              # S3 signed URL uploads
├── live-classes.ts         # Live class scheduling and recordings
├── progress.ts             # Lecture progress and watch history
├── admin.ts                # Admin operations (instructors, courses, users)
├── auth.ts                 # Instructor registration and password reset
├── schedule.ts             # Instructor calendar management
└── recordings.ts           # Recording management
```

### 4. React Query Integration

All data fetching uses React Query hooks built on service modules:

```typescript
// Student app
export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: () => coursesService.list(),
  });
}

// Instructor app
export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboard", "metrics"],
    queryFn: () => coursesService.getDashboardMetrics(),
  });
}

// Admin app
export function useInstructors(filters?: InstructorFilters) {
  return useQuery({
    queryKey: ["instructors", filters],
    queryFn: () => adminService.getInstructors(filters),
  });
}
```

### 5. Server-Side Support

For Server Components and metadata generation:

```typescript
import { createServerApiClient } from "@edutech/api-client";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const client = createServerApiClient(process.env.API_URL!);
  const course = await client.get(`/courses/${params.id}`);

  return {
    title: course.title,
  };
}
```

---

## Type Safety

### Type Sharing

All types are defined in `/packages/types` and shared across:

- Service modules (in `/packages/api-client/src/services/`)
- React Query hooks (in app `src/hooks/`)
- Components (using proper TypeScript props)

```typescript
// Same type used everywhere
import type { Course, AssignmentFilters } from "@edutech/types";

const { data: courses } = useQuery({
  queryKey: ["courses", { domain: "programming" }],
  queryFn: () => coursesService.list({ domain: "programming" }),
});
// courses: Course[] | undefined
```

### Type Guards

Structured error handling with type guards:

```typescript
import { isApiError, ApiClientError } from "@edutech/api-client";

try {
  await coursesService.create(dto);
} catch (error) {
  if (isApiError(error)) {
    console.error("Code:", error.code); // string
    console.error("Status:", error.status); // number
    console.error("Details:", error.details); // FieldError[] | undefined
  }
}
```

---

## Query Key Strategy

Consistent query key structure across all apps:

```typescript
// Resources
["courses"][("courses", courseId)][("courses", { domain: "programming" })][
  // Nested resources
  "assignments"
][("assignments", assignmentId)][("assignments", "course", courseId)][
  ("submissions", "assignment", assignmentId)
][
  // Dashboard
  ("dashboard", "metrics")
][("dashboard", "activity")][("live", "upcoming")];
```

---

## Error Handling

### Error Flow

1. Request interceptor adds Bearer token
2. Response interceptor handles 401 (clears tokens, redirects)
3. Envelope unwrapping extracts `data`
4. `ApiClientError` thrown with structured details
5. Components handle error with `isApiError` type guard

### Error Structure

```typescript
interface ApiClientError extends Error {
  code: string; // Backend error code (e.g., "VALIDATION_ERROR")
  status: number; // HTTP status code (e.g., 400, 401, 404, 500)
  details?: Array<{
    // Field-level validation errors
    field: string;
    message: string;
  }>;
}
```

---

## Performance Optimizations

### Client-Side Caching

React Query provides built-in caching:

- **Stale Time:** Data stays fresh for configurable period
- **Background Refetching:** Auto-refresh on window focus/reconnect
- **Deduplication:** Same requests shared across components
- **Cache Invalidation:** Automatic or manual invalidation after mutations

### Query Invalidation

```typescript
const mutation = useMutation({
  mutationFn: (dto: CreateCourseDto) => coursesService.create(dto),
  onSuccess: () => {
    // Invalidate all courses queries
    queryClient.invalidateQueries({ queryKey: ["courses"] });
  },
});
```

### Server-Side Caching

For Server Components, consider:

- Incremental Static Regeneration (ISR)
- On-demand revalidation
- Edge runtime for faster data fetching

---

## Security Considerations

### Token Management

- Tokens stored in `localStorage` (not cookies)
- Tokens automatically included in `Authorization: Bearer` header
- 401 responses trigger automatic cleanup and redirect
- No token sent to unauthenticated endpoints

### Rate Limiting

Backend rate limiting enforced per API conventions:

- Public endpoints: 100 req / 15 min per IP
- Authenticated: 1000 req / 15 min per user
- Uploads: 10 / hour per user

Rate limit headers included in all responses.

### CORS

Strict allow-list of origins:

- Production domains (student, instructor, admin)
- Localhost ports (3000, 3001, 3002) for development

---

## Best Practices

### Component Data Fetching

```typescript
export function CourseList({ domain }: { domain?: string }) {
  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['courses', domain ? { domain } : undefined],
    queryFn: () => coursesService.list(domain ? { domain } : undefined),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!courses?.length) return <EmptyState />;

  return <CourseGrid courses={courses} />;
}
```

### Mutation with Optimistic Update

```typescript
const mutation = useMutation({
  mutationFn: (dto: UpdateCourseDto) => coursesService.update(id, dto),
  onMutate: async (newCourse) => {
    await queryClient.cancelQueries({ queryKey: ["course", id] });
    const previous = queryClient.getQueryData(["course", id]);
    queryClient.setQueryData(["course", id], (old: Course) => ({
      ...old,
      ...newCourse,
    }));
    return { previous };
  },
  onError: (err, _newCourse, context) => {
    queryClient.setQueryData(["course", id], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["course", id] });
  },
});
```

### Dependent Queries

```typescript
const { data: course } = useQuery({
  queryKey: ["course", courseId],
  queryFn: () => coursesService.getById(courseId),
  enabled: !!courseId,
});

const { data: lectures } = useQuery({
  queryKey: ["lectures", courseId],
  queryFn: () => lecturesService.getByCourse(courseId),
  enabled: !!courseId && !!course?.isPublished,
});
```

---

## Monitoring & Debugging

### Error Tracking

All `ApiClientError` instances are automatically sent to Sentry with:

- Error code
- HTTP status
- Request URL
- Request method
- Response details

### Performance Tracking

React Query DevTools provides:

- Query state (loading, success, error)
- Cache inspection
- Query timing
- React Query logger for debugging

---

## Future Enhancements

Potential improvements to consider:

1. **Automatic Refresh Token** - Implement token refresh before expiration
2. **Request Retry Logic** - Retry failed requests with exponential backoff
3. **Request Cancellation** - Automatic cancellation of outdated requests
4. **Offline Support** - Service Worker for offline operations
5. **Query Polling** - Built-in polling for real-time updates
6. **Prefetching** - Preload data on hover/navigation
7. **Pagination Cursors** - Implement cursor-based pagination
8. **Optimistic Updates** - Rollback on error (partial implementation)

---

## Resources

- [API Client README](../../packages/api-client/README.md) - Full API documentation
- [Types README](../../packages/types/README.md) - Type reference
- [Contributing Guide](../../CONTRIBUTING.md) - Code standards and patterns
- [API Conventions](./08-api-conventions.md) - Backend API contract
