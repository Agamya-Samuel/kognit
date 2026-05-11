# UX States Specification

> **Purpose:** Comprehensive specifications for loading indicators, skeleton screens, and error handling across all user flows
> **Source:** Comprehensive analysis of 47 data interaction points across student, instructor, and admin platforms

---

## Table of Contents

- [Design System](#design-system)
- [Loading States](#loading-states)
- [Error Handling States](#error-handling-states)
- [Success States](#success-states)
- [Real-time States](#realtime-states)
- [Cross-Platform Patterns](#cross-platform-patterns)
- [Feature-Specific Specifications](#feature-specific-specifications)
- [Implementation Guidelines](#implementation-guidelines)

---

## Design System

### Core UX Principles

1. **Progressive Enhancement**: Core functionality works without JavaScript; enhanced experience with JS
2. **Graceful Degradation**: Features degrade gracefully when services are unavailable
3. **Clear Feedback**: Always inform users what's happening and what will happen next
4. **Error Recovery**: Provide clear paths to recover from errors
5. **Performance First**: Optimize for perceived performance with skeleton screens and progressive loading

### Color System for States

| State | Primary Color | Secondary Color | Background | Text |
|---|---|---|---|---|
| **Loading** | Blue-500 | Blue-400 | Blue-50 | Blue-700 |
| **Error** | Red-500 | Red-400 | Red-50 | Red-700 |
| **Success** | Green-500 | Green-400 | Green-50 | Green-700 |
| **Warning** | Yellow-500 | Yellow-400 | Yellow-50 | Yellow-800 |
| **Info** | Indigo-500 | Indigo-400 | Indigo-50 | Indigo-700 |

### Animation System

- **Duration**: Fast (150ms), Medium (300ms), Slow (500ms)
- **Easing**: `ease-out` for most animations, `ease-in-out` for transitions
- **Stagger**: 50ms between elements in lists for natural feel

---

## Loading States

### 1. Skeleton Screens

#### Course Listing Skeleton

```tsx
// CourseCard Skeleton
<div className="animate-pulse">
  <div className="bg-gray-200 rounded-lg h-48 w-full mb-4"></div>
  <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
  <div className="bg-gray-200 h-3 w-1/2 rounded mb-2"></div>
  <div className="bg-gray-200 h-6 w-20 rounded"></div>
</div>
```

**Visual Design:**
- Gray placeholders with subtle shimmer effect
- Same dimensions as actual content
- Maintains layout consistency

**Transition Logic:**
1. Initial render: Show skeleton
2. Data fetch: Continue skeleton
3. Data received: Fade out skeleton, fade in content
4. Error: Fade out skeleton, show error state

#### Dashboard Overview Skeleton

```tsx
// Dashboard Card Skeleton
<div className="animate-pulse bg-white rounded-lg p-6 shadow-sm">
  <div className="bg-gray-200 h-6 w-24 rounded mb-4"></div>
  <div className="bg-gray-200 h-8 w-16 rounded mb-2"></div>
  <div className="bg-gray-200 h-4 w-32 rounded"></div>
</div>
```

**User Feedback:**
- Subtle pulsing animation to indicate loading
- No spinner for skeleton screens (reduces visual noise)
- Maintains expected layout dimensions

### 2. Progress Indicators

#### Linear Progress

**Use Cases:**
- File uploads
- Video transcoding
- Bulk operations

**Visual Design:**
```tsx
<div className="w-full bg-gray-200 rounded-full h-2">
  <div 
    className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
    style={{ width: `${progress}%` }}
  ></div>
</div>
```

**Progress Labels:**
- 0-25%: "Initializing..."
- 25-75%: "Processing..."
- 75-95%: "Finalizing..."
- 95-100%: "Almost complete..."

#### Circular Progress

**Use Cases:**
- API calls
- Authentication
- Single operations

**Visual Design:**
```tsx
<div className="relative w-16 h-16">
  <svg className="w-16 h-16 transform -rotate-90">
    <circle
      cx="32"
      cy="32"
      r="28"
      stroke="#e5e7eb"
      strokeWidth="4"
      fill="none"
    />
    <circle
      cx="32"
      cy="32"
      r="28"
      stroke="#3b82f6"
      strokeWidth="4"
      fill="none"
      strokeDasharray="176"
      strokeDashoffset={176 - (176 * progress) / 100}
      strokeLinecap="round"
      className="transition-all duration-300 ease-out"
    />
  </svg>
  <div className="absolute inset-0 flex items-center justify-center">
    <span className="text-sm font-medium">{progress}%</span>
  </div>
</div>
```

### 3. Spinners

#### Page-Level Spinner

**Use Cases:**
- Initial page load
- Full-page operations

**Visual Design:**
```tsx
<div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
</div>
```

#### Button-Level Spinner

**Use Cases:**
- Form submissions
- Action buttons

**Visual Design:**
```tsx
<button disabled className="flex items-center justify-center space-x-2">
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
  <span>Processing...</span>
</button>
```

### 4. Loading Messages

#### Dynamic Loading Messages

**Pattern:**
- Update message based on progress
- Use specific, actionable language
- Include estimated time when available

**Examples:**
```tsx
// File upload
"Uploading video... (2MB of 10MB)"

// Video processing
"Processing video... 45% complete (ETA: 2 minutes)"

// API call
"Fetching your courses... This may take a few moments"
```

#### Staggered Loading

**Use Cases:**
- Large data sets
- Paginated content

**Visual Design:**
```tsx
// Each item fades in with 50ms delay
{items.map((item, index) => (
  <div 
    key={item.id}
    className="animate-fade-in"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    {item.content}
  </div>
))}
```

---

## Error Handling States

### 1. Error Display Patterns

#### Toast Notifications

**Use Cases:**
- Non-critical errors
- Success messages
- Informational updates

**Visual Design:**
```tsx
<Toast
  variant="error"
  title="Upload failed"
  description="The video file is corrupted. Please try a different file."
  action={
    <button onClick={retryUpload}>
      Retry
    </button>
  }
  onDismiss={dismissToast}
/>
```

**Error Types:**
- **Error**: Red background, destructive action
- **Warning**: Yellow background, caution action
- **Success**: Green background, positive action
- **Info**: Blue background, informational action

#### Error Boundaries

**Implementation:**
```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 rounded-lg">
          <h3 className="text-lg font-medium text-red-800">Something went wrong</h3>
          <p className="text-red-600 mt-2">
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

### 2. Error Recovery Patterns

#### Retry Mechanism

**Visual Design:**
```tsx
<div className="text-center py-8">
  <div className="text-red-500 mb-4">
    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  </div>
  <h3 className="text-lg font-medium text-gray-900 mb-2">
    Failed to load content
  </h3>
  <p className="text-gray-600 mb-4">
    We couldn't load the requested content. Please check your connection and try again.
  </p>
  <div className="space-x-3">
    <button 
      onClick={retry}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Retry
    </button>
    <button 
      onClick={fallback}
      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
    >
      Use cached version
    </button>
  </div>
</div>
```

#### Fallback Content

**Use Cases:**
- Image loading failures
- Map loading failures
- Third-party service failures

**Visual Design:**
```tsx
// Image fallback
<img 
  src={imageUrl}
  alt="Course thumbnail"
  onError={(e) => {
    e.target.src = '/fallback-course.jpg'
    e.target.onerror = null // Prevent infinite loop
  }}
  className="w-full h-48 object-cover rounded-lg"
/>

// Component fallback
<Suspense fallback={<div>Loading...</div>}>
  <MapComponent />
</Suspense>
```

### 3. Network Error Handling

#### Offline Detection

**Implementation:**
```tsx
const [isOnline, setIsOnline] = useState(navigator.onLine)

useEffect(() => {
  const handleOnline = () => setIsOnline(true)
  const handleOffline = () => setIsOnline(false)

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}, [])

if (!isOnline) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center">
        <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <span className="text-yellow-800 font-medium">You're offline</span>
      </div>
      <p className="text-yellow-700 mt-1 text-sm">
        Some features may not work properly. Please check your internet connection.
      </p>
    </div>
  )
}
```

#### Timeout Handling

**Implementation:**
```tsx
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState(null)

const fetchData = async () => {
  setIsLoading(true)
  setError(null)
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const response = await fetch('/api/data', {
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    const data = await response.json()
    return data
  } catch (err) {
    if (err.name === 'AbortError') {
      setError('Request timed out. Please try again.')
    } else {
      setError('Failed to fetch data. Please try again.')
    }
    throw err
  } finally {
    setIsLoading(false)
  }
}
```

---

## Success States

### 1. Success Messages

#### Toast Notifications

**Visual Design:**
```tsx
<Toast
  variant="success"
  title="Upload complete!"
  description="Your video has been uploaded and is being processed."
  duration={5000}
  onDismiss={dismissToast}
/>
```

#### Inline Success

**Visual Design:**
```tsx
<div className="bg-green-50 border border-green-200 rounded-lg p-4">
  <div className="flex items-center">
    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
    <span className="text-green-800 font-medium">Success!</span>
  </div>
  <p className="text-green-700 mt-1 text-sm">
    Your changes have been saved successfully.
  </p>
</div>
```

### 2. Progress Completion

**Visual Design:**
```tsx
// Progress bar completion
<div className="w-full bg-gray-200 rounded-full h-2">
  <div 
    className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
    style={{ width: '100%' }}
  ></div>
</div>

// Completion checkmark
<div className="text-center">
  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
  </div>
  <h3 className="text-lg font-medium text-gray-900">Processing complete!</h3>
  <p className="text-gray-600 mt-2">Your video is ready to view.</p>
</div>
```

---

## Real-time States

### 1. Connection States

#### Socket.IO Connection

**Visual Design:**
```tsx
const [connectionStatus, setConnectionStatus] = useState('connecting')

// Connection status indicator
<div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
  connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
  connectionStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
  'bg-red-100 text-red-800'
}`}>
  <div className={`w-2 h-2 rounded-full ${
    connectionStatus === 'connected' ? 'bg-green-500' :
    connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
    'bg-red-500'
  }`}></div>
  <span>
    {connectionStatus === 'connected' ? 'Connected' :
     connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
  </span>
</div>
```

### 2. Typing Indicators

**Visual Design:**
```tsx
// Typing indicator
<div className="flex items-center space-x-1 text-gray-500">
  <div className="flex space-x-1">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
  </div>
  <span className="text-sm">Someone is typing...</span>
</div>
```

### 3. Online Presence

**Visual Design:**
```tsx
// Online status
<div className="relative">
  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
</div>

// Offline status
<div className="relative">
  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full opacity-60" />
  <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 border-2 border-white rounded-full"></div>
</div>
```

---

## Cross-Platform Patterns

### 1. Authentication States

#### Login Flow

**Loading State:**
```tsx
<div className="space-y-4">
  <div className="animate-pulse">
    <div className="bg-gray-200 h-10 rounded-lg mb-4"></div>
    <div className="bg-gray-200 h-10 rounded-lg mb-4"></div>
    <div className="bg-gray-200 h-10 rounded-lg"></div>
  </div>
</div>
```

**Error State:**
```tsx
<div className="bg-red-50 border border-red-200 rounded-lg p-4">
  <div className="flex items-center">
    <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    <span className="text-red-800 font-medium">Invalid credentials</span>
  </div>
  <p className="text-red-700 mt-1 text-sm">
    Please check your email and password and try again.
  </p>
  {attempts >= 5 && (
    <p className="text-red-700 mt-2 text-sm">
      Account locked for 15 minutes due to too many failed attempts.
    </p>
  )}
</div>
```

#### Email Verification

**Success State:**
```tsx
<div className="text-center py-8">
  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
  </div>
  <h3 className="text-lg font-medium text-gray-900 mb-2">Email verified!</h3>
  <p className="text-gray-600 mb-4">
    Your email has been successfully verified. You can now complete your registration.
  </p>
  <button 
    onClick={continueRegistration}
    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
  >
    Continue
  </button>
</div>
```

### 2. File Upload States

#### Upload Progress

**Visual Design:**
```tsx
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-gray-700">Uploading video.mp4</span>
    <span className="text-sm text-gray-500">45%</span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div 
      className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
      style={{ width: '45%' }}
    ></div>
  </div>
  <div className="flex items-center justify-between text-xs text-gray-500">
    <span>2.1 MB of 5.0 MB</span>
    <span>~2 minutes remaining</span>
  </div>
</div>
```

#### Upload Complete

**Visual Design:**
```tsx
<div className="bg-green-50 border border-green-200 rounded-lg p-4">
  <div className="flex items-center">
    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
    <span className="text-green-800 font-medium">Upload complete!</span>
  </div>
  <p className="text-green-700 mt-1 text-sm">
    Your video is being processed. You'll be notified when it's ready.
  </p>
  <div className="mt-3 flex space-x-2">
    <button className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
      View processing status
    </button>
    <button className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300">
      Upload another
    </button>
  </div>
</div>
```

### 3. Payment States

#### Payment Processing

**Visual Design:**
```tsx
<div className="text-center py-8">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
  <h3 className="text-lg font-medium text-gray-900 mb-2">Processing payment...</h3>
  <p className="text-gray-600">
    Please don't close this window while we process your payment.
  </p>
  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
    <p className="text-sm text-blue-800">
      Order ID: {orderId}
    </p>
  </div>
</div>
```

#### Payment Success

**Visual Design:**
```tsx
<div className="text-center py-8">
  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
  </div>
  <h3 className="text-lg font-medium text-gray-900 mb-2">Payment successful!</h3>
  <p className="text-gray-600 mb-4">
    You've been enrolled in the course successfully.
  </p>
  <div className="space-y-2">
    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Start Learning
    </button>
    <button className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
    View Receipt
  </button>
</div>
```

---

## Feature-Specific Specifications

### 1. Video Player States

#### Loading State

**Visual Design:**
```tsx
<div className="relative bg-black aspect-video rounded-lg overflow-hidden">
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
  </div>
  <div className="absolute bottom-4 left-4 right-4">
    <div className="bg-gray-800 bg-opacity-75 rounded-lg p-2">
      <div className="bg-gray-600 h-2 rounded-full">
        <div className="bg-blue-500 h-2 rounded-full w-0 transition-all duration-300"></div>
      </div>
    </div>
  </div>
</div>
```

#### Error State

**Visual Design:**
```tsx
<div className="relative bg-black aspect-video rounded-lg overflow-hidden">
  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    <h3 className="text-lg font-medium mb-2">Video unavailable</h3>
    <p className="text-gray-300 text-center mb-4">
      This video is currently processing or may be unavailable.
    </p>
    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Try again
    </button>
  </div>
</div>
```

### 2. Live Class States

#### Connecting State

**Visual Design:**
```tsx
<div className="relative bg-black aspect-video rounded-lg overflow-hidden">
  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
    <div className="animate-pulse mb-4">
      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
      </div>
    </div>
    <h3 className="text-lg font-medium mb-2">Connecting to live class...</h3>
    <p className="text-gray-300 text-center">
      Please wait while we establish your connection.
    </p>
  </div>
</div>
```

#### Live State

**Visual Design:**
```tsx
<div className="relative bg-black aspect-video rounded-lg overflow-hidden">
  {/* Video content */}
  <video 
    ref={videoRef}
    autoPlay
    playsInline
    className="w-full h-full object-cover"
  />
  
  {/* Live indicator */}
  <div className="absolute top-4 left-4">
    <div className="bg-red-600 text-white px-2 py-1 rounded text-sm font-medium flex items-center">
      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
      LIVE
    </div>
  </div>
  
  {/* Connection quality indicator */}
  <div className="absolute top-4 right-4">
    <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
      <div className="flex items-center">
        <div className={`w-2 h-2 rounded-full mr-1 ${
          connectionQuality > 70 ? 'bg-green-500' :
          connectionQuality > 40 ? 'bg-yellow-500' : 'bg-red-500'
        }`}></div>
        <span>{connectionQuality}%</span>
      </div>
    </div>
  </div>
</div>
```

### 3. Assignment States

#### Submitting State

**Visual Design:**
```tsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
  <div className="flex items-center">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
    <span className="text-blue-800 font-medium">Submitting assignment...</span>
  </div>
  <p className="text-blue-700 text-sm mt-1">
    Please don't close this window while we submit your assignment.
  </p>
</div>
```

#### Grading State

**Visual Design:**
```tsx
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
  <div className="flex items-center">
    <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    <span className="text-yellow-800 font-medium">Under review</span>
  </div>
  <p className="text-yellow-700 text-sm mt-1">
    Your assignment is being reviewed by the instructor.
  </p>
  <div className="mt-2 bg-yellow-100 rounded p-2">
    <p className="text-xs text-yellow-700">
      Estimated grading time: 24-48 hours
    </p>
  </div>
</div>
```

### 4. Analytics States

#### Loading Analytics

**Visual Design:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {[1, 2, 3].map((i) => (
    <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
      <div className="animate-pulse">
        <div className="bg-gray-200 h-6 w-24 rounded mb-4"></div>
        <div className="bg-gray-200 h-8 w-16 rounded mb-2"></div>
        <div className="bg-gray-200 h-4 w-32 rounded"></div>
      </div>
    </div>
  ))}
</div>
```

#### Empty Analytics

**Visual Design:**
```tsx
<div className="bg-white rounded-lg p-8 text-center">
  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
  </svg>
  <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
  <p className="text-gray-600">
    There's no analytics data available for the selected time period.
  </p>
  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    Select different period
  </button>
</div>
```

---

## Implementation Guidelines

### 1. State Management

#### TanStack Query Configuration

```typescript
// TanStack Query configuration with loading states
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (error instanceof AuthenticationError) return false
        // Retry other errors up to 3 times
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    mutations: {
      retry: false, // Don't retry mutations automatically
    },
  },
})
```

#### Loading State Components

```typescript
// Reusable loading component
const LoadingSpinner = ({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  }

  return (
    <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`} />
  )
}

// Skeleton component
const Skeleton = ({ className, lines = 3 }: { className?: string; lines?: number }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="bg-gray-200 rounded h-4 mb-2" />
      ))}
    </div>
  )
}
```

### 2. Error Handling Patterns

#### Error Boundary Implementation

```typescript
// Error boundary for React components
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo)
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

#### API Error Handling

```typescript
// Centralized error handling
class ApiError {
  constructor(
    public message: string,
    public code: string,
    public status: number,
    public details?: any
  ) {}

  static isRecoverable(error: ApiError): boolean {
    // Retry on network errors and 5xx server errors
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

// API hook with error handling
const useApi = <T,>(url: string, options?: RequestInit) => {
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

### 3. Performance Optimization

#### Loading Performance

```typescript
// Progressive image loading
const ProgressiveImage = ({ src, alt, ...props }: any) => {
  const [imgSrc, setImgSrc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImgSrc(src)
      setLoading(false)
    }
    img.onerror = () => {
      setError(true)
      setLoading(false)
    }
    img.src = src
  }, [src])

  if (error) {
    return <div className="bg-gray-200 w-full h-48 flex items-center justify-center">Image failed to load</div>
  }

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 w-full h-48 rounded-lg">
        <div className="bg-gray-300 w-full h-full rounded-lg"></div>
      </div>
    )
  }

  return <img src={imgSrc} alt={alt} {...props} />
}

// Lazy loading with intersection observer
const LazyComponent = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref}>
      {isVisible ? children : <div className="h-64 bg-gray-100 animate-pulse"></div>}
    </div>
  )
}
```

### 4. Accessibility Guidelines

#### Loading States Accessibility

```typescript
// Loading screen with accessibility
const AccessibleLoading = () => {
  return (
    <div 
      role="status"
      aria-live="polite"
      className="flex items-center justify-center py-8"
    >
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      <span className="ml-3 text-gray-700">Loading...</span>
    </div>
  )
}

// Error message accessibility
const AccessibleError = ({ message }: { message: string }) => {
  return (
    <div 
      role="alert"
      className="bg-red-50 border border-red-200 rounded-lg p-4"
    >
      <div className="flex items-center">
        <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span className="text-red-800 font-medium">{message}</span>
      </div>
    </div>
  )
}
```

#### Keyboard Navigation

```typescript
// Keyboard navigation for loading states
const KeyboardNavigable = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async () => {
    setIsLoading(true)
    try {
      await performAction()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleAction()
        }
      }}
      className={`p-4 rounded-lg border-2 ${
        isLoading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
      }`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2" />
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </div>
  )
}
```

### 5. Testing Guidelines

#### Loading State Tests

```typescript
// Test for loading states
describe('Loading States', () => {
  it('should show skeleton while loading', () => {
    render(<Component />)
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('should show content after data loads', async () => {
    render(<Component />)
    await waitFor(() => {
      expect(screen.getByTestId('content')).toBeInTheDocument()
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
    })
  })

  it('should show error message on failure', async () => {
    render(<Component />)
    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument()
      expect(screen.getByText('Failed to load data')).toBeInTheDocument()
    })
  })
})
```

#### Error State Tests

```typescript
// Test for error states
describe('Error States', () => {
  it('should show retry button on error', () => {
    render(<Component error={true} />)
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('should retry action when retry button clicked', async () => {
    const mockRetry = jest.fn()
    render(<Component error={true} onRetry={mockRetry} />)
    
    const retryButton = screen.getByText('Retry')
    fireEvent.click(retryButton)
    
    expect(mockRetry).toHaveBeenCalled()
  })

  it('should show loading state during retry', async () => {
    const mockRetry = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
    render(<Component error={true} onRetry={mockRetry} />)
    
    fireEvent.click(screen.getByText('Retry'))
    expect(screen.getByText('Retrying...')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.queryByText('Retrying...')).not.toBeInTheDocument()
    })
  })
})
```

---

This comprehensive UX States Specification provides detailed guidelines for creating consistent, accessible, and user-friendly loading indicators, skeleton screens, and error handling states across all 47 data interaction points in the EduTech platform. The specifications ensure a seamless user experience that gracefully manages asynchronous operations and potential system failures.