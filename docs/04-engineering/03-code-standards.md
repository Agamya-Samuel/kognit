# Code Standards

> **Purpose:** Git workflow, code quality, error handling hierarchy, DB practices, frontend practices, UX patterns
> **Source:** cosmic-comet §2.1, §2.2, §2.3, §2.4, §2.7, UX States Specification

---

## Git Workflow

### Branch Strategy

- `main` — production-ready code only (protected, requires PR + CI pass)
- `develop` — integration branch for features
- `feature/*` — feature branches (e.g., `feature/day-1-monorepo-setup`)
- `hotfix/*` — urgent fixes for production

### Commit Conventions

Use Conventional Commits: `type(scope): description`

- `feat(auth): add JWT refresh token rotation`
- `fix(upload): resolve signed URL expiry calculation`
- `docs(api): update OpenAPI spec for course endpoints`
- `feat(ux): add loading states for course listing`
- `fix(ux): resolve error handling in video player`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Pull Request Standards

- PR template required: description, testing evidence, screenshots (if UI)
- Minimum 1 approval required (even for solo dev — forces self-review)
- All CI checks must pass before merge
- Squash merge to maintain clean main history
- **UX Review Required**: All PRs must include UX state implementation review

---

## Code Quality

### Pre-commit Hooks (Husky + lint-staged)

- ESLint with TypeScript strict mode
- Prettier formatting
- Type checking (`tsc --noEmit`)
- Test run for affected files only, coverage threshold check (≥80% general, ≥95% critical paths)
- **UX Component Validation**: Validate all UX state implementations follow standards

### Code Review Checklist (Self-Review)

- [ ] All public APIs have Zod validation
- [ ] Error handling covers all failure paths
- [ ] No hardcoded values (use env vars or config)
- [ ] RBAC enforced on all protected routes
- [ ] Tests cover happy path + error paths
- [ ] No secrets or credentials in code
- [ ] Database queries use parameterized inputs
- [ ] Frontend components are accessible (WCAG 2.1 AA)
- [ ] **Loading States**: All async operations have appropriate loading indicators
- [ ] **Error States**: All components have error boundaries and recovery options
- [ ] **Success States**: All successful operations provide user feedback
- [ ] **UX Patterns**: Follow established UX patterns from component library

---

## UX Component Library Standards

### Component Organization

```
packages/shared-components/
├── loading/
│   ├── Spinner.tsx
│   ├── Skeleton.tsx
│   ├── ProgressBar.tsx
│   └── LoadingCard.tsx
├── error/
│   ├── ErrorBoundary.tsx
│   ├── ErrorMessage.tsx
│   └── ErrorFallback.tsx
├── success/
│   ├── Toast.tsx
│   ├── SuccessMessage.tsx
│   └── CompletionIndicator.tsx
├── feedback/
│   ├── ToastContainer.tsx
│   ├── Notification.tsx
│   └── ProgressIndicator.tsx
└── forms/
    ├── FormWrapper.tsx
    ├── FormField.tsx
    └── FormValidation.tsx
```

### Loading Components

#### Spinner Component

```tsx
// packages/shared-components/loading/Spinner.tsx
interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'success' | 'error';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'medium', 
  color = 'primary',
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  }

  const colorClasses = {
    primary: 'border-blue-500',
    secondary: 'border-gray-500',
    success: 'border-green-500',
    error: 'border-red-500',
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-t-transparent ${colorClasses[color]} ${sizeClasses[size]} ${className}`} />
  )
}
```

#### Skeleton Component

```tsx
// packages/shared-components/loading/Skeleton.tsx
interface SkeletonProps {
  lines?: number;
  className?: string;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  lines = 3, 
  className = '',
  animate = true 
}) => {
  const animationClass = animate ? 'animate-pulse' : ''
  
  return (
    <div className={`${animationClass} ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="bg-gray-200 rounded h-4 mb-2" />
      ))}
    </div>
  )
}
```

### Error Components

#### Error Boundary

```tsx
// packages/shared-components/error/ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logErrorToService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 bg-red-50 rounded-lg">
          <h3 className="text-lg font-medium text-red-800 mb-2">Something went wrong</h3>
          <p className="text-red-600">
            We're sorry, but something unexpected happened. Please try again.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

### Toast Notification System

```tsx
// packages/shared-components/feedback/Toast.tsx
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  action?: React.ReactNode;
  onDismiss?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  type,
  title,
  description,
  duration = 5000,
  action,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onDismiss?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onDismiss])

  if (!isVisible) return null

  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  return (
    <div className={`${typeStyles[type]} border rounded-lg p-4`}>
      <div className="flex items-start">
        <div className="flex-1">
          <h4 className="font-medium">{title}</h4>
          {description && (
            <p className="text-sm mt-1 opacity-90">{description}</p>
          )}
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            onDismiss?.()
          }}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {action && (
        <div className="mt-3">
          {action}
        </div>
      )}
    </div>
  )
}
```

### Form Components with Validation

```tsx
// packages/shared-components/forms/FormField.tsx
interface FormFieldProps {
  label: string;
  error?: string;
  helper?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helper,
  required,
  children,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helper && !error && (
        <p className="text-sm text-gray-500">{helper}</p>
      )}
    </div>
  )
}
```

---

## UX State Implementation Patterns

### Core UX States Framework

All components must implement these four core states:

1. **Loading State** - Data fetching, processing, or async operation in progress
2. **Error State** - Operation failed with user-friendly recovery options
3. **Success State** - Operation completed successfully with appropriate feedback
4. **Empty State** - No data available with guidance for next steps

### Loading States Implementation

#### TanStack Query Integration

```tsx
// packages/shared-components/loading/WithLoadingStates.tsx
interface WithLoadingStatesProps<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  children: React.ReactNode;
  isEmpty?: (data: T) => boolean;
}

export const WithLoadingStates: React.FC<WithLoadingStatesProps<any>> = ({
  data,
  isLoading,
  error,
  loadingComponent,
  errorComponent,
  emptyComponent,
  children,
  isEmpty = (data) => !data || (Array.isArray(data) && data.length === 0),
}) => {
  if (isLoading) {
    return loadingComponent || <LoadingCard />;
  }

  if (error) {
    return errorComponent || <ErrorFallback error={error} />;
  }

  if (isEmpty(data)) {
    return emptyComponent || <EmptyState />;
  }

  return <>{children}</>;
};
```

#### Course Listing with Comprehensive States

```tsx
// packages/components/student/CourseList.tsx
const CourseList: React.FC = () => {
  const { data: courses, isLoading, error, refetch } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <WithLoadingStates
      data={courses}
      isLoading={isLoading}
      error={error}
      emptyComponent={
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No courses found
          </h3>
          <p className="text-gray-600 mb-4">
            We couldn't find any courses matching your criteria. Try adjusting your filters or check back later.
          </p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-blue-600 text-white rounded">
            Refresh courses
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </WithLoadingStates>
  );
};
```

### Skeleton Loading Patterns

#### Course Card Skeleton

```tsx
// packages/shared-components/loading/CourseCardSkeleton.tsx
export const CourseCardSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="aspect-video bg-gray-200"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};
```

#### Form Skeleton

```tsx
// packages/shared-components/loading/FormSkeleton.tsx
export const FormSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      ))}
      <div className="flex space-x-3">
        <div className="h-10 bg-gray-200 rounded flex-1"></div>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
};
```

### Error Handling Implementation

#### Comprehensive Error Boundary

```tsx
// packages/shared-components/error/ComprehensiveErrorBoundary.tsx
interface ComprehensiveErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ComprehensiveErrorBoundary extends React.Component<ComprehensiveErrorBoundaryProps> {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="text-red-500 mb-6">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try again or contact support if the problem persists.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Go to homepage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### API Error Handling with Retry Logic

```tsx
// packages/shared-components/error/ApiErrorHandler.tsx
interface ApiErrorHandlerProps {
  error: ApiError;
  onRetry?: () => void;
  action?: React.ReactNode;
}

export const ApiErrorHandler: React.FC<ApiErrorHandlerProps> = ({
  error,
  onRetry,
  action,
}) => {
  const getUserMessage = (error: ApiError): string => {
    const messages: Record<string, string> = {
      'NETWORK_ERROR': 'Network error. Please check your connection and try again.',
      'RATE_LIMITED': 'Too many requests. Please wait a moment and try again.',
      'AUTH_REQUIRED': 'Please log in to continue.',
      'PERMISSION_DENIED': 'You don\'t have permission to perform this action.',
      'VALIDATION_ERROR': 'Please check your information and try again.',
      'NOT_FOUND': 'The requested resource was not found.',
      'CONFLICT': 'This action conflicts with existing data. Please try again.',
    };

    return messages[error.code] || 'Something went wrong. Please try again.';
  };

  const isRecoverable = (error: ApiError): boolean => {
    return error.status >= 500 || error.status === 0 || error.code === 'NETWORK_ERROR';
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {error.status ? `Error ${error.status}` : 'Request Failed'}
          </h3>
          <p className="mt-1 text-sm text-red-700">
            {getUserMessage(error)}
          </p>
          {isRecoverable(error) && onRetry && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className="text-sm font-medium text-red-600 hover:text-red-800"
              >
                Try again
              </button>
            </div>
          )}
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

### Success Feedback Implementation

#### Toast Notification System

```tsx
// packages/shared-components/feedback/ToastManager.tsx
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  action?: React.ReactNode;
}

export const ToastManager: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const toast = {
    success: (title: string, description?: string, duration?: number) =>
      addToast({ type: 'success', title, description, duration }),
    error: (title: string, description?: string, duration?: number) =>
      addToast({ type: 'error', title, description, duration }),
    warning: (title: string, description?: string, duration?: number) =>
      addToast({ type: 'warning', title, description, duration }),
    info: (title: string, description?: string, duration?: number) =>
      addToast({ type: 'info', title, description, duration }),
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          title={toast.title}
          description={toast.description}
          duration={toast.duration}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};
```

### Form State Management

```tsx
// packages/shared-components/forms/FormWithStates.tsx
interface FormWithStatesProps<T> {
  onSubmit: (data: T) => Promise<void>;
  children: (state: {
    data: Partial<T>;
    errors: Record<string, string>;
    isSubmitting: boolean;
    handleChange: (field: keyof T, value: any) => void;
    handleSubmit: (e: React.FormEvent) => void;
  }) => React.ReactNode;
  initialValues: Partial<T>;
  validate?: (data: Partial<T>) => Record<string, string>;
}

export const FormWithStates = <T,>({
  onSubmit,
  children,
  initialValues,
  validate,
}: FormWithStatesProps<T>) => {
  const [data, setData] = useState<Partial<T>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (currentData: Partial<T>) => {
    if (!validate) return {};
    return validate(currentData);
  };

  const handleChange = (field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(data);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast.success({
        title: 'Success!',
        description: 'Your changes have been saved.',
        duration: 3000,
      });
    } catch (error) {
      toast.error({
        title: 'Save failed',
        description: 'Please check your information and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return children({
    data,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  });
};
```

### Data Interaction Patterns

#### Infinite Scroll with Loading States

```tsx
// packages/shared-components/loading/InfiniteScroll.tsx
interface InfiniteScrollProps<T> {
  fetchMore: (page: number) => Promise<T[]>;
  renderItem: (item: T) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  initialData: T[];
  pageSize?: number;
}

export const InfiniteScroll = <T,>({
  fetchMore,
  renderItem,
  loadingComponent,
  errorComponent,
  emptyComponent,
  initialData,
  pageSize = 10,
}: InfiniteScrollProps<T>) => {
  const [data, setData] = useState<T[]>(initialData);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || error) return;

    setIsLoading(true);
    try {
      const newData = await fetchMore(page + 1);
      if (newData.length < pageSize) {
        setHasMore(false);
      }
      setData(prev => [...prev, ...newData]);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchMore, page, isLoading, hasMore, error, pageSize]);

  const handleRetry = () => {
    setError(null);
    loadMore();
  };

  return (
    <div>
      {data.map(renderItem)}
      
      {isLoading && (
        <div className="flex justify-center py-4">
          {loadingComponent || <Spinner />}
        </div>
      )}
      
      {error && (
        <div className="text-center py-4">
          {errorComponent || (
            <button onClick={handleRetry} className="text-blue-600 hover:text-blue-800">
              Try again
            </button>
          )}
        </div>
      )}
      
      {!hasMore && data.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          No more items to load
        </div>
      )}
      
      {!data.length && !isLoading && !error && (
        <div>
          {emptyComponent || (
            <div className="text-center py-8 text-gray-500">
              No items found
            </div>
          )}
        </div>
      )}
      
      {hasMore && !isLoading && !error && (
        <div className="flex justify-center py-4">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
};
```

### Error Handling Patterns

#### API Error Handling with Retry

```tsx
// packages/shared-components/error/ApiError.ts
export class ApiError extends Error {
  constructor(
    public message: string,
    public code: string,
    public status: number,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static isRecoverable(error: ApiError): boolean {
    return (
      error.status >= 500 || 
      error.status === 0 || 
      error.code === 'NETWORK_ERROR'
    )
  }

  static getUserMessage(error: ApiError): string {
    const errorMessages: Record<string, string> = {
      'NETWORK_ERROR': 'Network error. Please check your connection.',
      'RATE_LIMITED': 'Too many requests. Please wait and try again.',
      'AUTH_REQUIRED': 'Please log in to continue.',
      'PERMISSION_DENIED': 'You don\'t have permission to perform this action.',
      'VALIDATION_ERROR': 'Please check your input and try again.',
    }

    return errorMessages[error.code] || 'Something went wrong. Please try again.'
  }
}

// Custom hook for API calls with error handling
export const useApi = <T,>(url: string, options?: RequestInit) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url, options)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new ApiError(
          errorData.message || 'Request failed',
          errorData.code || 'UNKNOWN_ERROR',
          response.status,
          errorData.details
        )
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err)
      } else {
        setError(new ApiError('Network error', 'NETWORK_ERROR', 0))
      }
      throw err
    } finally {
      setLoading(false)
    }
  }, [url, JSON.stringify(options)])

  return { data, loading, error, refetch: fetchData }
}
```

### Success Feedback Patterns

#### Toast Notifications for Success

```tsx
// Usage example
const handleFormSubmit = async (data: FormData) => {
  try {
    await saveCourse(data)
    toast.success({
      title: 'Course created successfully!',
      description: 'Your course has been created and is ready for publishing.',
      duration: 4000,
    })
    // Navigate to course edit page
    router.push(`/courses/${courseId}/edit`)
  } catch (error) {
    toast.error({
      title: 'Failed to create course',
      description: 'Please check your information and try again.',
      action: (
        <button onClick={() => handleFormSubmit(data)}>
          Try again
        </button>
      ),
    })
  }
}
```

---

## Animation and Transition Standards

### Animation System

```tsx
// packages/shared-components/animations/Animations.tsx
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 }
}

export const slideUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.3 }
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}
```

### Usage Example

```tsx
import { motion } from 'framer-motion'
import { fadeIn, slideUp, staggerContainer } from '@/packages/shared-components/animations/Animations'

const CourseList: React.FC = () => {
  return (
    <motion.div 
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {courses.map((course) => (
        <motion.div
          key={course.id}
          variants={fadeIn}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <motion.div
            variants={slideUp}
            className="aspect-video bg-gray-200 rounded-lg mb-4"
          />
          <motion.h3
            variants={slideUp}
            className="text-lg font-medium text-gray-900"
          >
            {course.title}
          </motion.h3>
        </motion.div>
      ))}
    </motion.div>
  )
}
```

---

## Performance Standards

### Loading Performance

- **First Contentful Paint** < 1.5s for all pages
- **Time to Interactive** < 3.0s for complex pages
- **Component Load Time** < 200ms for all components
- **Image Loading** Progressive loading with blur placeholders
- **Code Splitting** Route-based and component-based splitting

### Bundle Optimization

- **Bundle Size** < 200KB (gzipped) for initial load
- **Lazy Loading** All non-critical components and routes
- **Image Optimization** Next.js Image component with WebP/AVIF
- **Font Loading** Optimized font loading with display: swap

### Caching Strategy

- **TanStack Query** Stale time: 5 minutes, GC time: 10 minutes
- **Static Assets** Cache-Control: public, max-age=31536000, immutable
- **API Responses** Conditional caching based on data freshness

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

- **Color Contrast** ≥ 4.5:1 for all text
- **Focus Management** Visible focus indicators for all interactive elements
- **Keyboard Navigation** Full keyboard support for all features
- **Screen Readers** ARIA labels and live regions for dynamic content
- **Error Identification** Clear error messages with specific guidance

### Accessibility Testing

```tsx
// Example: Accessible button component
interface AccessibleButtonProps extends ButtonProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  loading?: boolean;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  loading = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  disabled,
  ...props
}) => {
  return (
    <button
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      aria-busy={loading}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Spinner size="small" className="mr-2" />
      )}
      {children}
    </button>
  )
}
```

---

## Error Handling Standards

### Backend Error Hierarchy

```
DomainError (base)
  ├── ValidationError (400)
  ├── AuthenticationError (401)
  ├── AuthorizationError (403)
  ├── NotFoundError (404)
  ├── ConflictError (409)
  └── ExternalServiceError (502)
```

### Standardized Error Responses

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is already registered",
    "details": [{ "field": "email", "message": "Email already exists" }]
  }
}
```

### Frontend Error Boundaries

- Each route has its own error boundary
- Errors logged to Sentry automatically
- User-friendly error messages (no stack traces)
- Retry buttons for network failures
- Graceful degradation for non-critical features

---

## Database Best Practices

### Soft Delete Query Enforcement

- All queries **must** use the repository pattern — no raw Drizzle queries outside of repository files
- Each repository has a base scope that automatically filters `deleted_at IS NULL`
- Example:
  ```typescript
  const activeScope = <T extends { deletedAt: Timestamp | null }>(table: T) =>
    isNull(table.deletedAt);

  const courses = await db.select().from(coursesTable).where(
    and(activeScope(coursesTable), eq(coursesTable.instructorId, instructorId))
  );
  ```
- Only the admin module can explicitly query soft-deleted records (with a clearly named method like `findIncludingDeleted`)
- Repository files live in `apps/api/src/repositories/` — one per table
- Pre-commit hook or CI check: any direct `db.select()` outside a repository file should be flagged during code review
