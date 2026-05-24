# Contributing to EduTech Frontend

Thank you for your interest in contributing to the EduTech frontend codebase! This document provides guidelines for working with the centralized API client system and maintaining code quality standards.

## Table of Contents

- [Code Standards](#code-standards)
- [Working with the API Client](#working-with-the-api-client)
- [Adding New API Endpoints](#adding-new-api-endpoints)
- [Testing](#testing)
- [Type Safety](#type-safety)
- [Performance Best Practices](#performance-best-practices)
- [Common Patterns](#common-patterns)

## Code Standards

### Import Order

Group imports in this order:

1. External libraries
2. Internal packages (`@edutech/*`)
3. App-specific imports (`@/`)
4. Types

```typescript
// 1. External libraries
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// 2. Internal packages
import { coursesService } from '@edutech/api-client';
import type { Course, CourseFilters } from '@edutech/types';

// 3. App-specific imports
import { Button } from '@edutech/ui';
import { formatDate } from '@/lib/utils';

// 4. Types (if any local types remain)
import type { LocalInterface } from '@/types/local';
```

### Component Structure

```tsx
'use client';

// 1. Imports
import { useState } from 'react';
import { Button } from '@edutech/ui';
import { coursesService } from '@edutech/api-client';

// 2. Types
interface Props {
  courseId: number;
  onBack: () => void;
}

// 3. Component
export function MyComponent({ courseId, onBack }: Props) {
  // 3a. Hooks
  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesService.getById(courseId),
  });

  // 3b. Handlers
  const handleClick = () => {
    // ...
  };

  // 3c. Effects
  useEffect(() => {
    // ...
  }, []);

  // 3d. Conditional returns
  if (isLoading) return <div>Loading...</div>;
  if (!course) return <div>Course not found</div>;

  // 3e. Render
  return (
    <div>
      <Button onClick={handleClick}>Action</Button>
    </div>
  );
}
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `UserProfile`, `CourseCard` |
| Hooks | camelCase with `use` prefix | `useCourseDetail`, `useStudentProgress` |
| Functions | camelCase | `formatDate`, `validateEmail` |
| Variables | camelCase | `isLoading`, `courseList` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL` |
| Types/Interfaces | PascalCase | `CourseFilters`, `UserProfileProps` |
| Services | camelCase with `Service` suffix | `coursesService`, `paymentsService` |

### File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase | `UserProfile.tsx`, `CourseCard.tsx` |
| Hooks | PascalCase | `useCourseDetail.ts`, `useStudentProgress.ts` |
| Utilities | camelCase | `formatDate.ts`, `validateEmail.ts` |
| Types | camelCase | `course.types.ts`, `user.types.ts` |
| API Routes | lowercase with hyphens | `course-detail.ts`, `user-profile.ts` |

## Working with the API Client

### Fetching Data

Always use React Query with service modules:

```typescript
import { useQuery } from '@tanstack/react-query';
import { coursesService } from '@edutech/api-client';

export function useCourses(filters?: CourseFilters) {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: () => coursesService.list(filters),
  });
}
```

### Mutating Data

Always use React Query mutations with query invalidation:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesService } from '@edutech/api-client';

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateCourseDto) => coursesService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course'] });
    },
  });
}
```

### Query Keys

Follow a consistent pattern for query keys:

```typescript
// Generic resource
['courses']
['courses', courseId]
['courses', { domain: 'programming' }]

// Nested resources
['assignments']
['assignments', assignmentId]
['assignments', 'course', courseId]
['submissions', 'assignment', assignmentId]
```

### Error Handling

Use the `isApiError` type guard:

```typescript
import { isApiError } from '@edutech/api-client';

const mutation = useMutation({
  mutationFn: (dto: CreateCourseDto) => coursesService.create(dto),
  onError: (error) => {
    if (isApiError(error)) {
      // Type-safe error handling
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      if (error.details) {
        // Handle field-level errors
        error.details.forEach(({ field, message }) => {
          console.error(`${field}: ${message}`);
        });
      }
    }
  },
});
```

### Server Components

Use `createServerApiClient()` for data fetching:

```tsx
import { createServerApiClient } from '@edutech/api-client';

export async function MyServerComponent({ id }: { id: string }) {
  const client = createServerApiClient(process.env.API_URL!);
  const course = await client.get(`/courses/${id}`);

  return <div>{course.title}</div>;
}
```

## Adding New API Endpoints

### Step 1: Add Types to `@edutech/types`

Define the types first:

```typescript
// packages/types/src/index.ts

interface NewResource {
  id: number;
  name: string;
  // ... other fields
}

interface CreateNewResourceDto {
  name: string;
  // ... other fields
}

interface UpdateNewResourceDto extends Partial<CreateNewResourceDto> {}

interface NewResourceFilters extends PaginationQuery {
  [key: string]: unknown;
}
```

### Step 2: Add Service Module

Create a new service file:

```typescript
// packages/api-client/src/services/new-resource.ts

import { getApiClient } from '../index';
import type {
  NewResource,
  CreateNewResourceDto,
  UpdateNewResourceDto,
  NewResourceFilters
} from '@edutech/types';

export const newResourceService = {
  async list(filters?: NewResourceFilters) {
    return getApiClient().get<NewResource[]>('/new-resources', filters);
  },

  async getById(id: number | string) {
    return getApiClient().get<NewResource>(`/new-resources/${id}`);
  },

  async create(dto: CreateNewResourceDto) {
    return getApiClient().post<NewResource>('/new-resources', dto);
  },

  async update(id: number | string, dto: UpdateNewResourceDto) {
    return getApiClient().put<NewResource>(`/new-resources/${id}`, dto);
  },

  async delete(id: number | string) {
    return getApiClient().delete<void>(`/new-resources/${id}`);
  },
};
```

### Step 3: Export from Index

Add to the exports:

```typescript
// packages/api-client/src/index.ts

export * from './services/new-resource';
```

### Step 4: Create React Query Hooks

Create hooks in the consuming app:

```typescript
// src/hooks/useNewResource.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { newResourceService } from '@edutech/api-client';
import type { NewResourceFilters, CreateNewResourceDto, UpdateNewResourceDto } from '@edutech/types';

export function useNewResources(filters?: NewResourceFilters) {
  return useQuery({
    queryKey: ['new-resources', filters],
    queryFn: () => newResourceService.list(filters),
  });
}

export function useNewResource(id: number | string) {
  return useQuery({
    queryKey: ['new-resource', id],
    queryFn: () => newResourceService.getById(id),
    enabled: !!id,
  });
}

export function useCreateNewResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateNewResourceDto) => newResourceService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['new-resources'] });
    },
  });
}

export function useUpdateNewResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateNewResourceDto }) =>
      newResourceService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['new-resources'] });
      queryClient.invalidateQueries({ queryKey: ['new-resource'] });
    },
  });
}

export function useDeleteNewResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => newResourceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['new-resources'] });
    },
  });
}
```

### Step 5: Document the Service

Add to the `@edutech/api-client` README:

```markdown
### New Resource Service

```typescript
import { newResourceService } from '@edutech/api-client';

await newResourceService.list(filters);              // Get resources
await newResourceService.getById(id);                  // Get specific resource
await newResourceService.create(dto);                 // Create resource
await newResourceService.update(id, dto);              // Update resource
await newResourceService.delete(id);                  // Delete resource
```
```

## Testing

### Unit Testing Services

```typescript
// packages/api-client/src/services/__tests__/new-resource.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { newResourceService } from '../new-resource';
import { getApiClient } from '../../index';

vi.mock('../../index');

describe('newResourceService', () => {
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.mocked(getApiClient).mockReturnValue({
      get: mockGet,
    } as any);
  });

  it('should list resources', async () => {
    const mockData = [{ id: 1, name: 'Test' }];
    mockGet.mockResolvedValue(mockData);

    const result = await newResourceService.list();

    expect(mockGet).toHaveBeenCalledWith('/new-resources', undefined);
    expect(result).toEqual(mockData);
  });

  it('should get resource by ID', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockGet.mockResolvedValue(mockData);

    const result = await newResourceService.getById(1);

    expect(mockGet).toHaveBeenCalledWith('/new-resources/1');
    expect(result).toEqual(mockData);
  });
});
```

### Integration Testing Hooks

```typescript
// src/hooks/__tests__/useNewResources.test.tsx

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNewResources } from '../useNewResources';
import { newResourceService } from '@edutech/api-client';

vi.mock('@edutech/api-client');

describe('useNewResources', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should fetch resources', async () => {
    const mockData = [{ id: 1, name: 'Test' }];
    vi.mocked(newResourceService.list).mockResolvedValue(mockData);

    const { result } = renderHook(() => useNewResources(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });
  });
});
```

### Testing Components with Hooks

```typescript
// src/components/__tests__/CourseList.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CourseList } from '../CourseList';
import { coursesService } from '@edutech/api-client';

vi.mock('@edutech/api-client');

describe('CourseList', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should render courses', async () => {
    const mockCourses = [{ id: 1, title: 'Test Course' }];
    vi.mocked(coursesService.list).mockResolvedValue(mockCourses);

    render(<CourseList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });
  });
});
```

## Type Safety

### Prefer Type Inference

```typescript
// Bad - explicit typing can be brittle
const courses: Course[] = await coursesService.list();

// Good - let TypeScript infer
const courses = await coursesService.list();
// courses is automatically Course[]
```

### Use Proper Type Imports

```typescript
// Good - use `type` keyword for type-only imports
import type { Course, Assignment } from '@edutech/types';

// Also Good - type imports with other imports
import { useQuery } from '@tanstack/react-query';
import type { Course } from '@edutech/types';
import { coursesService } from '@edutech/api-client';
```

### Index Signatures for Filters

```typescript
// Good - enables flexible query params
interface CourseFilters extends PaginationQuery {
  [key: string]: unknown;
  domain?: string;
  pricingType?: PricingType;
}

// Bad - missing index signature causes `as any` casts
interface CourseFilters extends PaginationQuery {
  domain?: string;  // Error: doesn't satisfy Record<string, unknown>
}
```

### Type Guards

```typescript
import { isApiError } from '@edutech/api-client';

function handleError(error: unknown) {
  if (isApiError(error)) {
    // error is now ApiClientError in this block
    console.error(error.code);
    console.error(error.status);
  } else {
    // error is unknown
    console.error('Unknown error:', error);
  }
}
```

## Performance Best Practices

### Optimize Query Keys

```typescript
// Bad - too specific, causes unnecessary refetches
const { data } = useQuery({
  queryKey: ['courses', 'list', { domain, pricingType, page, limit }],
  queryFn: () => coursesService.list({ domain, pricingType, page, limit }),
});

// Good - logical grouping, easier to invalidate
const { data } = useQuery({
  queryKey: ['courses', { domain, pricingType, page, limit }],
  queryFn: () => coursesService.list({ domain, pricingType, page, limit }),
});

// Invalidate related queries efficiently
queryClient.invalidateQueries({ queryKey: ['courses'] });  // All courses
queryClient.invalidateQueries({ queryKey: ['courses', { domain: 'programming' }] });  // Only programming courses
```

### Use Stale Time

```typescript
// Cache for 5 minutes to reduce server load
const { data } = useQuery({
  queryKey: ['courses'],
  queryFn: () => coursesService.list(),
  staleTime: 5 * 60 * 1000,  // 5 minutes
});

// Never stale (perfect for static data)
const { data } = useQuery({
  queryKey: ['domains'],
  queryFn: () => coursesService.getDomains(),
  staleTime: Infinity,
});
```

### Background Refetching

```typescript
// Refetch when window regains focus (default: true)
const { data } = useQuery({
  queryKey: ['notifications'],
  queryFn: () => notificationsService.list(),
  refetchOnWindowFocus: true,
});

// Disable for expensive operations
const { data } = useQuery({
  queryKey: ['reports'],
  queryFn: () => reportsService.generate(),
  refetchOnWindowFocus: false,
});
```

### Pagination

```typescript
// Infinite scroll
import { useInfiniteQuery } from '@tanstack/react-query';

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['courses', { domain }],
  queryFn: ({ pageParam = 1 }) =>
    coursesService.list({ domain: 'programming', page: pageParam, limit: 10 }),
  getNextPageParam: (lastPage, allPages) => {
    if (lastPage.length < 10) return undefined;  // No more pages
    return allPages.length + 1;
  },
});
```

## Common Patterns

### Optimistic Updates

```typescript
const mutation = useMutation({
  mutationFn: (dto: UpdateCourseDto) => coursesService.update(id, dto),
  onMutate: async (newCourse) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['course', id] });

    // Snapshot previous value
    const previousCourse = queryClient.getQueryData(['course', id]);

    // Optimistically update
    queryClient.setQueryData(['course', id], (old: Course) => ({
      ...old,
      ...newCourse,
    }));

    return { previousCourse };
  },
  onError: (err, newCourse, context) => {
    // Rollback on error
    queryClient.setQueryData(['course', id], context.previousCourse);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['course', id] });
  },
});
```

### Dependent Queries

```typescript
const { data: course } = useQuery({
  queryKey: ['course', courseId],
  queryFn: () => coursesService.getById(courseId),
  enabled: !!courseId,
});

const { data: lectures } = useQuery({
  queryKey: ['lectures', courseId],
  queryFn: () => lecturesService.getByCourse(courseId),
  enabled: !!courseId && !!course?.isPublished,  // Only fetch if course exists and is published
});
```

### Polling

```typescript
const { data: status } = useQuery({
  queryKey: ['upload-status', uploadId],
  queryFn: () => uploadsService.getStatus(uploadId),
  refetchInterval: 2000,  // Poll every 2 seconds
  enabled: uploadId !== null,  // Only poll if uploadId exists
});
```

### Custom Hooks

```typescript
// Combine related queries
export function useCourseWithProgress(courseId: number) {
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesService.getById(courseId),
    enabled: !!courseId,
  });

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['progress', 'course', courseId],
    queryFn: () => progressService.getCourseProgress(courseId),
    enabled: !!courseId && !!course?.isEnrolled,
  });

  return {
    course,
    progress,
    isLoading: courseLoading || progressLoading,
    completionPercentage: course && progress
      ? Math.round((progress.completedLectures / course.totalLectures) * 100)
      : 0,
  };
}
```

## Code Review Checklist

Before submitting a PR, ensure:

- [ ] All imports are properly ordered and grouped
- [ ] No unused imports
- [ ] No unused variables
- [ ] No `any` types (use proper types)
- [ ] All API calls go through `@edutech/api-client` services
- [ ] React Query is used for all data fetching
- [ ] Mutations invalidate related queries
- [ ] Error handling uses `isApiError` guard
- [ ] Component follows the structure guidelines
- [ ] File follows naming conventions
- [ ] TypeScript compiles without errors
- [ ] Linting passes
- [ ] Tests are added (if applicable)
- [ ] Documentation is updated (if adding new features)

## Getting Help

- Check the [API Client README](../packages/api-client/README.md) for API documentation
- Check the [Migration Guide](./api-client-migration.md) for migration patterns
- Check the [Types README](../packages/types/README.md) for type reference
- Review existing hooks in `src/hooks/` for examples
- Review existing components in `src/components/` for patterns

Thank you for contributing! 🎉