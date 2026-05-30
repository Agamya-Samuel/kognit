# Instructor Platform Features

> **Purpose:** All instructor-facing features
> **Source:** PROJECT_DOCUMENTATION.md §6.2

---

## UX States Overview

The instructor platform implements comprehensive UX states optimized for content creation, student management, and analytics. All loading states use skeleton screens and progress indicators, error states provide clear recovery options, and success states offer appropriate feedback for professional workflows.

### Loading States
- **Skeleton Screens**: Consistent placeholder animations matching final content dimensions
- **Progress Indicators**: Detailed progress bars with ETA for file uploads and processing
- **Spinners**: For page-level and button-level operations
- **Staggered Loading**: Natural fade-in animations for list items and tables

### Error Handling
- **Toast Notifications**: For non-critical errors and success messages
- **Error Boundaries**: React components that catch and display errors gracefully
- **Retry Mechanisms**: For recoverable errors with user-friendly retry options
- **Validation Feedback**: Real-time form validation with specific error messages

### Success States
- **Toast Notifications**: For successful operations with auto-dismiss
- **Inline Success Messages**: For form submissions and saves
- **Progress Completion**: Visual indicators for completed processes
- **Status Updates**: Real-time feedback for asynchronous operations

---

## Profile & Onboarding

### Features
- Application form (invite-only, admin-approved)
- Bio, expertise, social links
- Banking/payout setup (Razorpay Route — manual payout processing per negotiated revenue share)
- Profile page visible to students
- Pending state page after application submission

### UX States

#### Application Form
**Loading State:**
- Form submission processing spinner
- Application validation progress indicator
- "Submitting application..." message

```tsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
  <div className="flex items-center">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
    <span className="text-blue-800 font-medium">Submitting application...</span>
  </div>
  <p className="text-blue-700 text-sm mt-1">
    Please don't close this window while we process your application.
  </p>
</div>
```

**Error State:**
- Validation error highlighting with specific field messages
- Application failure notification with retry option
- Missing document requirements with upload prompts

**Success State:**
- Application confirmation with reference number
- Review timeline display
- Email notification setup

#### Profile Management
**Loading State:**
- Profile save processing spinner
- Image upload progress bar
- "Updating profile..." message

**Error State:**
- Save failure with retry option
- Validation error highlighting
- Character count overflow warnings

**Success State:**
- Profile update confirmation
- Live preview of changes
- Student-facing profile refresh notification

#### Banking Setup
**Loading State:**
- Bank verification processing
- Payout setup progress indicator
- "Processing banking details..." message

**Error State:**
- Bank validation failure with specific errors
- Account verification issues
- Retry option with updated details

**Success State:**
- Banking confirmation with payout schedule
- Revenue share percentage display
- Payout timeline information

---

## Course Creation

### Features
- Create course with title, description, thumbnail, domain tags
- Add sections and lectures (video, text, assignment, quiz)
- Set pricing (free, paid)
- Publish / draft toggle
- Reorder sections and lectures via drag-and-drop

### UX States

#### Course Creation Wizard
**Loading State:**
- Multi-step form progress indicator
- Auto-save progress spinner
- "Saving draft..." message

```tsx
<div className="mb-6">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm font-medium text-gray-700">Course Progress</span>
    <span className="text-sm text-gray-500">Step 2 of 4</span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: '50%' }}></div>
  </div>
</div>
```

**Error State:**
- Form validation with field-specific errors
- Title/duplicate course detection
- Image upload validation errors

**Success State:**
- Course creation confirmation
- Automatic redirect to course editor
- Draft save confirmation

#### Section & Lecture Management
**Loading State:**
- Drag-and-drop operation spinner
- Reorder processing indicator
- "Reordering sections..." message

**Error State:**
- Reorder failure notification
- Invalid drop zone feedback
- Conflict resolution options

**Success State:**
- Reorder confirmation animation
- Auto-save indicator
- Version history update

#### Pricing & Publishing
**Loading State:**
- Publish/unpublish processing spinner
- Price update progress indicator
- "Publishing course..." message

**Error State:**
- Publishing validation errors
- Price format validation
- Publishing failure retry option

**Success State:**
- Publish confirmation with course link
- Student notification status
- Analytics refresh trigger

---

## Content Upload Pipeline

### Features
- Direct-to-S3 upload via signed URLs
- Upload progress indicator
- Auto-ingestion to Mux on upload complete
- Transcoding status feedback
- Bulk upload support (Phase 2)

### UX States

#### File Upload
**Loading State:**
- Real-time upload progress bar
- File validation processing
- "Uploading file..." message with ETA

```tsx
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-gray-700">Uploading video.mp4</span>
    <span className="text-sm text-gray-500">45%</span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: '45%' }}></div>
  </div>
  <div className="flex items-center justify-between text-xs text-gray-500">
    <span>2.1 MB of 5.0 MB</span>
    <span>~2 minutes remaining</span>
  </div>
</div>
```

**Error State:**
- File validation errors with specific feedback
- Upload failure with retry option
- File size limit exceeded with helpful suggestions

**Success State:**
- Upload completion confirmation
- Auto-ingestion status
- Transcoding queue position

#### Transcoding Status
**Loading State:**
- Transcoding progress indicator
- "Processing video..." message
- Quality conversion status

**Error State:**
- Transcoding failure notification
- File format compatibility issues
- Manual retry option

**Success State:**
- Transcoding completion
- Quality options available
- Playback URL generation

#### Bulk Upload
**Loading State:**
- Batch upload progress indicator
- File-by-file status tracking
- "Processing batch upload..." message

**Error State:**
- Individual file failure notifications
- Batch partial completion status
- Retry failed files option

**Success State:**
- Batch completion summary
- Success/failure statistics
- Bulk transcoding status

---

## Live Class Scheduling

### Features
- Schedule live class with date/time/duration
- Attach to course or standalone session
- Auto-notify enrolled students
- Start class → launches LiveKit room
- Post-session: recording auto-attached to course

### UX States

#### Class Scheduling
**Loading State:**
- Schedule creation processing spinner
- Student notification progress
- "Scheduling class..." message

**Error State:**
- Time conflict detection
- Student notification failure
- Schedule validation errors

**Success State:**
- Schedule confirmation with calendar invite
- Notification delivery status
- Class link generation

#### Live Class Start
**Loading State:**
- LiveKit room establishment spinner
- "Starting live class..." message
- Participant connection status

**Error State:**
- Room creation failure
- Participant limit reached
- Alternative access options

**Success State:**
- Live class launched indicator
- Participant count display
- Recording status active

#### Recording Management
**Loading State:**
- Recording processing indicator
- "Preparing recording..." message
- Transcoding progress

**Error State:**
- Recording failure notification
- Processing timeout
- Manual recovery options

**Success State:**
- Recording completion confirmation
- Lecture attachment status
- Student access notification

---

## Analytics Dashboard

### Features
- Student enrollment count
- Video watch completion rates
- Drop-off points per lecture
- Live class attendance
- Revenue earned (total, per course, per month)
- Assignment submission rates

### UX States

#### Analytics Loading
**Loading State:**
- Skeleton screens for all metric cards
- Chart loading spinners
- "Loading analytics..." message

```tsx
// Analytics Card Skeleton
<div className="animate-pulse bg-white rounded-lg p-6 shadow-sm">
  <div className="bg-gray-200 h-6 w-24 rounded mb-4"></div>
  <div className="bg-gray-200 h-8 w-16 rounded mb-2"></div>
  <div className="bg-gray-200 h-4 w-32 rounded"></div>
</div>
```

**Error State:**
- Analytics load failure notification
- Partial data display with retry option
- Data sync issues warning

**Success State:**
- Animated metric transitions
- Interactive chart hover states
- Real-time data updates

#### Revenue Analytics
**Loading State:**
- Revenue calculation processing
- Payout status loading
- "Calculating revenue..." message

**Error State:**
- Revenue calculation failure
- Payout processing issues
- Discrepancy notification

**Success State:**
- Revenue breakdown display
- Payout timeline information
- Historical comparison charts

#### Engagement Metrics
**Loading State:**
- Student engagement processing
- Completion rate calculation
- "Analyzing engagement..." message

**Error State:**
- Data collection failure
- Incomplete metrics warning
- Sampling issues notification

**Success State:**
- Engagement score display
- Improvement trend indicators
- Actionable insights

---

## Student Management

### Features
- View enrolled students
- Bulk message enrolled students (max 100 recipients per batch, queued via BullMQ)
- View individual student progress
- Grade manual assignments

### UX States

#### Student List
**Loading State:**
- Student table skeleton
- Search processing spinner
- "Loading students..." message

**Error State:**
- Student data fetch failure
- Search timeout notification
- Filter validation errors

**Success State:**
- Table with pagination controls
- Real-time student count
- Interactive search filters

#### Bulk Messaging
**Loading State:**
- Message queue processing
- Batch delivery progress
- "Sending messages..." message with progress

```tsx
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-gray-700">Sending to 85 students</span>
    <span className="text-sm text-gray-500">67%</span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: '67%' }}></div>
  </div>
  <div className="text-xs text-gray-500">
    57 messages delivered, 28 queued
  </div>
</div>
```

**Error State:**
- Delivery failure notifications
- Invalid student selection
- Message content validation errors

**Success State:**
- Delivery confirmation summary
- Failed delivery retry option
- Performance metrics display

#### Individual Progress
**Loading State:**
- Student profile loading spinner
- Progress data fetching
- "Loading student progress..." message

**Error State:**
- Progress data fetch failure
- Student not found notification
- Data sync issues

**Success State:**
- Comprehensive progress display
- Interactive progress charts
- Performance comparison

#### Grading Interface
**Loading State:**
- Grade submission processing
- Feedback save progress
- "Saving grade..." message

**Error State:**
- Grade validation errors
- Submission failure notification
- Conflict resolution options

**Success State:**
- Grade confirmation with timestamp
- Feedback delivery status
- Grade history display

---

## Advanced Features

### Content Moderation
**Loading State:**
- Flag review processing
- Moderation action progress
- "Reviewing content..." message

**Error State:**
- Review timeout notification
- Insufficient permissions
- Action failure feedback

**Success State:**
- Moderation confirmation
- Impact summary display
- Appeal process information

### Revenue Management
**Loading State:**
- Payout processing status
- Revenue calculation progress
- "Processing payout..." message

**Error State:**
- Payout failure notification
- Bank account issues
- Dispute resolution options

**Success State:**
- Payout confirmation details
- Tax summary display
- Next payout schedule
