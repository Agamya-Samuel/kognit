# Student Platform Features

> **Purpose:** All student-facing features
> **Source:** PROJECT_DOCUMENTATION.md §6.1

---

## UX States Overview

The student platform implements comprehensive UX states to ensure seamless user experiences across all features. All loading states use skeleton screens and progress indicators, error states provide clear recovery options, and success states offer appropriate feedback.

### Loading States
- **Skeleton Screens**: Consistent placeholder animations that match final content dimensions
- **Progress Indicators**: Linear and circular progress bars with descriptive labels
- **Spinners**: For page-level and button-level operations
- **Staggered Loading**: Natural fade-in animations for list items

### Error Handling
- **Toast Notifications**: For non-critical errors and success messages
- **Error Boundaries**: React components that catch and display errors gracefully
- **Retry Mechanisms**: For recoverable errors with user-friendly retry options
- **Fallback Content**: For non-critical failures (images, maps, third-party services)

### Success States
- **Toast Notifications**: For successful operations with auto-dismiss
- **Inline Success Messages**: For form submissions and saves
- **Progress Completion**: Visual indicators for completed processes

---

## Course Discovery & Enrollment

### Features
- Browse courses by domain (Coding/Tech, Business)
- Free preview of instructor-marked lectures — no enrollment or login required. The playback URL endpoint allows unauthenticated access for lectures marked `is_free_preview = true`.
- Search and filter (domain, instructor, price, rating)
- Course detail page: syllabus, instructor bio, reviews, preview
- One-click enrollment after purchase

### UX States

#### Course Listing Page
**Loading State:**
- Skeleton screens for course cards with shimmer animation
- Progress indicator for initial load and pagination
- Empty state with search tips when no results found

```tsx
// Course Card Skeleton
<div className="animate-pulse">
  <div className="bg-gray-200 rounded-lg h-48 w-full mb-4"></div>
  <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
  <div className="bg-gray-200 h-3 w-1/2 rounded mb-2"></div>
  <div className="bg-gray-200 h-6 w-20 rounded"></div>
</div>
```

**Error State:**
- Toast notification with retry option
- Fallback to cached data if available
- Clear error message with suggested actions

```tsx
<Toast
  variant="error"
  title="Failed to load courses"
  description="We couldn't fetch the course list. Please check your connection and try again."
  action={
    <button onClick={retryCourses}>
      Retry
    </button>
  }
/>
```

**Success State:**
- Smooth transition from skeleton to actual content
- Staggered fade-in animation for course cards
- Toast notification for successful search/filter

#### Search and Filter
**Loading State:**
- Debounced API calls (300ms delay)
- Search in progress indicator with descriptive text
- Maintain current results while new search loads

**Error State:**
- Toast notification for search failures
- Suggested search terms or corrections
- Option to clear search and start over

**Success State:**
- Instant visual feedback for search results
- Update result count and filter chips
- Smooth transition between result sets

#### Course Detail Page
**Loading State:**
- Skeleton screen for course details
- Progress indicator for video preview loading
- Loading states for instructor bio and reviews

**Error State:**
- Course not found message with similar courses suggestion
- Retry option for failed video preview
- Link back to course listing

**Success State:**
- Rich content with proper typography hierarchy
- Interactive elements with hover states
- Smooth scroll to sections

#### Enrollment Process
**Loading State:**
- Button-level spinner during enrollment
- Progress indicator for payment processing
- Loading message with estimated time

**Error State:**
- Enrollment failed toast with retry option
- Payment failure with alternative payment method
- Already enrolled message with link to course

**Success State:**
- Success toast with course access link
- Automatic redirect to course dashboard
- Welcome email confirmation

---

## Video Player

### Features
- HLS adaptive bitrate streaming via Mux
- Signed playback URLs (no unauthorized sharing)
- Progress tracking (resume from last position)
- Playback speed control (0.5x – 2x)
- Quality selector

### UX States

#### Video Loading
**Loading State:**
- Circular progress overlay on video player
- Buffering indicator with progress bar
- Estimated time remaining for video start

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

**Error State:**
- Video unavailable overlay with error icon
- Specific error message (transcoding failed, access denied)
- Retry and contact support options

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

**Success State:**
- Smooth video playback with controls
- Progress bar with resume position indicator
- Quality selector with current quality highlighted

#### Progress Tracking
**Loading State:**
- Initial progress load spinner
- Resume position calculation indicator
- Synchronization with server progress

**Error State:**
- Progress save failure notification
- Option to manually set watch position
- Fallback to local storage progress

**Success State:**
- Real-time progress updates
- Visual completion indicators
- Resume position clearly marked

---

## Live Classes

### Features
- Join live class via embedded LiveKit player
- Chat during class (Socket.IO)
- Raise hand / reaction system (Phase 2)
- Attendance tracking
- Class recording available post-session

### UX States

#### Joining Live Class
**Loading State:**
- Connection progress indicator
- LiveKit room establishment spinner
- "Connecting to live class..." message

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

**Error State:**
- Connection failed message
- Retry connection option
- Alternative access method (phone dial-in)

**Success State:**
- Live indicator with pulsing animation
- Connection quality meter
- Interactive class interface

#### Live Class Interface
**Loading State:**
- Chat messages loading spinner
- Participant list loading indicator
- Resources/materials loading state

**Error State:**
- Chat send failure notification
- Connection quality warnings
- Audio/video troubleshooting options

**Success State:**
- Real-time chat with typing indicators
- Live participant list with online status
- Smooth video/audio streaming

#### Recording Access
**Loading State:**
- Recording processing indicator
- Transcoding progress bar
- "Preparing recording..." message

**Error State:**
- Recording unavailable message
- Retry option for failed processing
- Contact support for manual assistance

**Success State:**
- Recording ready notification
- Direct access to playback
- Download and share options

---

## Assignments & Quizzes

### Features
- Per-lecture and per-course assignments
- Multiple choice, short answer, code submission
- Auto-graded quizzes (MCQ)
- Manual-graded assignments (instructor reviews)
- Submission history and feedback

### UX States

#### Assignment Submission
**Loading State:**
- File upload progress bar
- Submission processing spinner
- "Submitting assignment..." message

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

**Error State:**
- Submission failed toast with retry option
- File validation error with specific feedback
- Size limit exceeded with helpful suggestions

**Success State:**
- Submission confirmation toast
- Automatic redirect to assignment status
- Email confirmation sent

#### Grading and Feedback
**Loading State:**
- Grading progress indicator
- "Under review" status badge
- Estimated grading time display

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

**Error State:**
- Grade retrieval failure notification
- Feedback loading error
- Option to request manual grading

**Success State:**
- Grade display with visual indicators
- Feedback rich text with comments
- Performance summary and improvement suggestions

#### Quiz Taking
**Loading State:**
- Quiz questions loading spinner
- Timer initialization indicator
- "Loading quiz..." message

**Error State:**
- Quiz loading failure with retry option
- Timer sync issues with correction
- Question rendering errors with skip option

**Success State:**
- Auto-grade immediate feedback
- Score display with performance breakdown
- Review incorrect answers option

---

## Certificates

### Features
- Auto-generated on course completion
- Unique certificate ID (verifiable link)
- Downloadable as PDF
- Shareable (LinkedIn-ready)

### UX States

#### Certificate Generation
**Loading State:**
- PDF generation progress indicator
- "Processing certificate..." message
- Animated generation spinner

```tsx
<div className="text-center py-8">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
  <h3 className="text-lg font-medium text-gray-900 mb-2">Generating certificate...</h3>
  <p className="text-gray-600">
    Please wait while we prepare your certificate.
  </p>
</div>
```

**Error State:**
- Generation failure notification
- Manual generation request option
- Contact support for assistance

**Success State:**
- Certificate preview with completion badge
- Download and share buttons
- Verification link display

#### Certificate Verification
**Loading State:**
- Verification processing indicator
- "Checking certificate validity..." message
- Loading spinner for verification

**Error State:**
- Invalid certificate message
- Tampered certificate warning
- Contact support option

**Success State:**
- Valid certificate confirmation
- Certificate details display
- Share and download options

---

## Community / Forums

### Features
- Course-level discussion channels
- General domain channels (Coding, Business)
- Instructor can post announcements
- Reply threads
- Basic moderation (flag/report)

### UX States

#### Chat Interface
**Loading State:**
- Message history loading spinner
- Channel list skeleton
- "Loading messages..." indicator

**Error State:**
- Message send failure notification
- Connection quality warnings
- Offline mode indicator

**Success State:**
- Real-time message delivery
- Typing indicators with animation
- Online presence indicators

#### Message Moderation
**Loading State:**
- Flag submission processing
- Moderation queue loading
- "Processing report..." message

**Error State:**
- Flag submission failure
- Already flagged message
- Invalid report reason

**Success State:**
- Flag confirmation message
- Moderation action feedback
- Resolution status updates

---

## Placement Support

### Features
- Profile builder (student can fill skills, resume, projects)
- Job board (curated listings relevant to course)
- Resume review requests to instructors
- Phase 2: Mock interviews, referrals

### UX States

#### Profile Builder
**Loading State:**
- Profile save processing spinner
- Image upload progress bar
- "Saving profile..." message

**Error State:**
- Save failure with retry option
- Validation error highlighting
- Character count overflow warnings

**Success State:**
- Profile update confirmation
- Progress completion indicators
- Profile preview option

#### Resume Review Request
**Loading State:**
- Request submission spinner
- "Sending review request..." message
- Instructor notification status

**Error State:**
- Request failure notification
- Instructor availability issues
- Alternative request options

**Success State:**
- Request confirmation with timeline
- Review status tracking
- Feedback delivery notifications

---

## Progress & Dashboard

### Features
- Course progress bars
- Watch history
- Assignment submission status
- Upcoming live classes calendar
- Earned certificates

### UX States

#### Dashboard Loading
**Loading State:**
- Skeleton screens for all dashboard cards
- Progress indicators for data fetch
- "Loading dashboard..." message

```tsx
// Dashboard Card Skeleton
<div className="animate-pulse bg-white rounded-lg p-6 shadow-sm">
  <div className="bg-gray-200 h-6 w-24 rounded mb-4"></div>
  <div className="bg-gray-200 h-8 w-16 rounded mb-2"></div>
  <div className="bg-gray-200 h-4 w-32 rounded"></div>
</div>
```

**Error State:**
- Dashboard load failure notification
- Retry option with cached fallback
- Partial dashboard display

**Success State:**
- Animated card transitions
- Real-time progress updates
- Interactive calendar with event indicators

#### Progress Tracking
**Loading State:**
- Progress bar loading animation
- "Calculating progress..." message
- Synchronization indicator

**Error State:**
- Progress sync failure
- Manual progress update option
- Local vs server progress discrepancy handling

**Success State:**
- Visual progress completion
- Achievement unlock animations
- Detailed progress breakdown
