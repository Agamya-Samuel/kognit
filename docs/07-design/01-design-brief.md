# EduTech Platform — Design Team Brief

> **Page-by-Page Screen Map**
> This document is the definitive UI/UX reference for the design team. It covers every page across all four platform apps, with entry/exit points, layout descriptions, UI elements, states, and mobile behavior. Designers define the visual design system (colors, typography, spacing) from scratch — this brief focuses on structure, content, and interaction.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Shared / Auth Pages](#2-shared--auth-pages)
   - 2.1 [Login](#21-login)
   - 2.2 [Email Verification](#22-email-verification)
   - 2.3 [Registration (Set Password + Name)](#23-registration-set-password--name)
   - 2.4 [Forgot Password](#24-forgot-password)
   - 2.5 [Reset Password](#25-reset-password)
   - 2.6 [OAuth Redirect](#26-oauth-redirect)
3. [Landing Page](#3-landing-page)
4. [Student App Pages](#4-student-app-pages)
   - 4.1 [Dashboard](#41-dashboard)
   - 4.2 [Course Catalog](#42-course-catalog)
   - 4.3 [Course Detail](#43-course-detail)
   - 4.4 [Video Player](#44-video-player)
   - 4.5 [Live Class](#45-live-class)
   - 4.6 [My Courses](#46-my-courses)
   - 4.7 [Assignment List](#47-assignment-list)
   - 4.8 [Assignment Submission](#48-assignment-submission)
   - 4.9 [Quiz](#49-quiz)
   - 4.10 [Community / Forums](#410-community--forums)
   - 4.11 [Certificates](#411-certificates)
   - 4.12 [Certificate Verification](#412-certificate-verification)
   - 4.13 [Placement Profile Builder](#413-placement-profile-builder)
   - 4.14 [Job Board](#414-job-board)
   - 4.15 [Notifications Center](#415-notifications-center)
   - 4.16 [Checkout / Payment](#416-checkout--payment)
   - 4.17 [Payment Success](#417-payment-success)
   - 4.18 [Profile / Settings](#418-profile--settings)
5. [Instructor App Pages](#5-instructor-app-pages)
   - 5.1 [Instructor Application Form](#51-instructor-application-form)
   - 5.2 [Application Status](#52-application-status)
   - 5.3 [Dashboard](#53-dashboard)
   - 5.4 [Course List](#54-course-list)
   - 5.5 [Course Creation Wizard](#55-course-creation-wizard)
   - 5.6 [Course Editor](#56-course-editor)
   - 5.7 [Content Upload](#57-content-upload)
   - 5.8 [Live Class Scheduler](#58-live-class-scheduler)
   - 5.9 [Live Class Room](#59-live-class-room)
   - 5.10 [Student Management](#510-student-management)
   - 5.11 [Student Progress Detail](#511-student-progress-detail)
   - 5.12 [Assignment Grading](#512-assignment-grading)
   - 5.13 [Analytics Dashboard](#513-analytics-dashboard)
   - 5.14 [Revenue Page](#514-revenue-page)
   - 5.15 [Banking / Payout Setup](#515-banking--payout-setup)
   - 5.16 [Profile / Settings](#516-profile--settings)
   - 5.17 [Notifications Center](#517-notifications-center)
6. [Admin App Pages](#6-admin-app-pages)
   - 6.1 [Dashboard](#61-dashboard)
   - 6.2 [User Management](#62-user-management)
   - 6.3 [User Detail](#63-user-detail)
   - 6.4 [Instructor Approval Queue](#64-instructor-approval-queue)
   - 6.5 [Course Moderation Queue](#65-course-moderation-queue)
   - 6.6 [Content Review](#66-content-review)
   - 6.7 [Platform Analytics](#67-platform-analytics)
   - 6.8 [Revenue Analytics](#68-revenue-analytics)
   - 6.9 [Report Generation](#69-report-generation)
   - 6.10 [Institution Management](#610-institution-management)
   - 6.11 [Support Tickets](#611-support-tickets)
   - 6.12 [Audit Log](#612-audit-log)
   - 6.13 [Security Monitoring](#613-security-monitoring)
   - 6.14 [System Settings](#614-system-settings)
   - 6.15 [Notifications Center](#615-notifications-center)
7. [Phase 2 Pages (Future Scope)](#7-phase-2-pages-future-scope)
8. [Cross-Platform UX Patterns](#8-cross-platform-ux-patterns)
   - 8.1 [Navigation Patterns](#81-navigation-patterns)
   - 8.2 [Toast Notifications](#82-toast-notifications)
   - 8.3 [Loading Skeletons](#83-loading-skeletons)
   - 8.4 [Progress Indicators](#84-progress-indicators)
   - 8.5 [Empty States](#85-empty-states)
   - 8.6 [Error States](#86-error-states)
   - 8.7 [Confirmation Dialogs](#87-confirmation-dialogs)
   - 8.8 [Real-time Patterns](#88-real-time-patterns)
   - 8.9 [Pagination & Infinite Scroll](#89-pagination--infinite-scroll)
   - 8.10 [Animation Timing Reference](#810-animation-timing-reference)

---

## 1. Introduction

### Platform Overview

A live-first EdTech platform connecting Indian college students with vetted instructors through structured online courses, live interactive classes, assignments, quizzes, and placement support. The platform operates on a freemium model — some courses are free, others are paid — with pricing in INR via Razorpay.

### Target Audience

| Attribute | Details |
|---|---|
| **Primary** | College students, age 18–26, India |
| **Secondary** | Instructors (industry professionals, domain experts) |
| **Tertiary** | Institutions (colleges, training centers) — Phase 2 |
| **Device** | Mobile-first (primary audience predominantly uses smartphones) |
| **Connectivity** | Variable network quality; optimize for low-bandwidth scenarios |

### Platform Zones

The platform is four separate web applications, each with its own subdomain:

| App | Subdomain | Purpose |
|---|---|---|
| **Landing** | `eduplatform.com` | Public-facing marketing and conversion page |
| **Student** | `student.eduplatform.com` | Course discovery, learning, community, placement |
| **Instructor** | `instructor.eduplatform.com` | Course creation, student management, analytics, revenue |
| **Admin** | `admin.eduplatform.com` | Platform administration, moderation, security |

Users have a single role (student OR instructor) — no role switching within an account.

### Design Ground Rules

- **Mobile-first**: All Student and Instructor pages must be designed mobile-first. Admin pages are desktop-first.
- **INR only**: All prices displayed in Indian Rupees (₹).
- **Email-first auth**: Registration starts with email verification (non-standard flow — see Section 2).
- **No prescribed design system**: Designers define colors, typography, spacing, and component styles from scratch.
- **Designer-friendly**: This document contains no code, API details, database schemas, or deployment information.

---

## 2. Shared / Auth Pages

> Auth pages are shared across Student, Instructor, and Admin apps. The flow is **email-first** — the user enters their email first, receives a 6-digit verification code, then sets their password and name. OAuth (Google, GitHub) skips the email verification step entirely.
>
> **Lockout policy**: After 5 consecutive failed login attempts, the account is locked for 15 minutes. An email notification is sent to the user. Admins can manually unlock accounts.

### 2.1 Login

- **Purpose**: Authenticate existing users with email/password or OAuth providers
- **Entry Points**: App homepage when not logged in, direct URL, session expiration redirect
- **Key UI Elements**:
  - Centered card layout with logo
  - Email input field
  - Password input field with show/hide toggle
  - "Sign in" primary button
  - OAuth buttons: Google, GitHub (side by side)
  - "Forgot password?" text link
  - "Create account" text link (routes to email entry / registration)
- **Data Displayed**: None (input-only form)
- **User Actions**: Enter email, enter password, sign in, sign in with Google/GitHub, navigate to forgot password, navigate to registration
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Default | Empty form | — |
  | Loading | Button spinner + disabled button | — |
  | Error (invalid credentials) | Red banner below form | "Invalid email or password. Please try again." |
  | Error (account locked) | Red banner with lock icon + timer | "Account locked for 15 minutes due to too many failed attempts." |
  | Error (account deactivated) | Red banner | "Your account has been deactivated. Contact support." |

- **Mobile Considerations**: Full-width card, stacked OAuth buttons, larger touch targets for inputs
- **Exit Points**: Successful login → respective app dashboard; OAuth → OAuth Redirect page; Forgot Password → Forgot Password page; Create Account → Email entry (start of registration)

### 2.2 Email Verification

- **Purpose**: Verify the user's email address with a 6-digit code before registration
- **Entry Points**: Registration flow (after entering email), "Resend code" action
- **Key UI Elements**:
  - Centered card with lock/mail icon
  - "Enter verification code" heading
  - 6 individual digit input boxes (auto-advance on entry, auto-focus first box)
  - "Resend code" text link with countdown timer (e.g., "Resend in 00:45")
  - "Verify" primary button
  - "Back" text link
- **Data Displayed**: Masked email address (e.g., "Code sent to a***@gmail.com")
- **User Actions**: Enter 6-digit code, verify, resend code (after timer expires), go back
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Default | Empty digit boxes | — |
  | Loading | Spinner replacing verify button | — |
  | Error (wrong code) | Red border on digit boxes + shake animation | "Invalid code. Please check and try again." |
  | Error (expired code) | Red banner | "This code has expired. Please request a new one." |
  | Success | Green checkmark animation on digit boxes | Auto-advance to Registration page |

- **Mobile Considerations**: Larger digit boxes for touch, numeric keyboard on mobile, auto-advance must work with tap
- **Exit Points**: Success → Registration (Set Password + Name); Back → Email entry; Resend → new code sent

### 2.3 Registration (Set Password + Name)

- **Purpose**: Complete account setup after email verification — set password and display name
- **Entry Points**: Email Verification success, OAuth callback (name may be pre-filled from OAuth)
- **Key UI Elements**:
  - Centered card
  - Display name input field
  - Password input field with show/hide toggle
  - Password strength indicator (bar or text: weak/fair/strong)
  - Confirm password input field
  - "Create Account" primary button
- **Data Displayed**: Password requirements hint (minimum 8 characters, uppercase, lowercase, digit)
- **User Actions**: Enter name, enter password, confirm password, create account
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Default | Empty form | — |
  | Validation error | Red border + message below field | Per-field: "Password must be at least 8 characters" / "Passwords do not match" / "Name is required" |
  | Loading | Button spinner + disabled button | "Creating your account..." |
  | Error | Red banner | "Registration failed. Please try again." |
  | Success | Success animation | Auto-redirect to respective app dashboard |

- **Mobile Considerations**: Full-width inputs, password strength indicator below field, stacked layout
- **Exit Points**: Success → respective app dashboard (Student/Instructor based on signup context)

### 2.4 Forgot Password

- **Purpose**: Initiate password reset by sending a reset link to the user's email
- **Entry Points**: Login page "Forgot password?" link
- **Key UI Elements**:
  - Centered card with mail icon
  - "Reset your password" heading
  - Email input field
  - "Send Reset Link" primary button
  - "Back to login" text link
- **Data Displayed**: None
- **User Actions**: Enter email, send reset link, navigate back to login
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Default | Empty form | — |
  | Loading | Button spinner | — |
  | Error (email not found) | Red banner | "No account found with this email address." |
  | Success | Green confirmation with envelope icon | "If an account exists with this email, a reset link has been sent." |

- **Mobile Considerations**: Full-width card and inputs
- **Exit Points**: Success → confirmation screen; Back → Login page

### 2.5 Reset Password

- **Purpose**: Set a new password using the reset link/token
- **Entry Points**: Email reset link
- **Key UI Elements**:
  - Centered card
  - "Set new password" heading
  - New password input field with show/hide toggle
  - Password strength indicator
  - Confirm password input field
  - "Reset Password" primary button
- **Data Displayed**: Password requirements hint
- **User Actions**: Enter new password, confirm password, reset password
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Default | Empty form | — |
  | Validation error | Red border + message below field | Per-field validation messages |
  | Loading | Button spinner | — |
  | Error (expired token) | Red banner | "This reset link has expired. Please request a new one." |
  | Success | Green checkmark + redirect | "Password reset successfully. Redirecting to login..." |

- **Mobile Considerations**: Same as Registration page
- **Exit Points**: Success → Login page (with auto-redirect)

### 2.6 OAuth Redirect

- **Purpose**: Intermediate processing screen while OAuth authentication completes
- **Entry Points**: OAuth provider callback (Google/GitHub)
- **Key UI Elements**:
  - Full-screen centered layout
  - Spinner animation
  - "Signing you in..." text
- **Data Displayed**: Provider name (e.g., "Connecting with Google...")
- **User Actions**: None (automatic)
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Processing | Full-screen spinner | "Signing you in with [Provider]..." |
  | Error (provider error) | Error card with retry button | "Unable to sign in with [Provider]. Please try again." |
  | Error (account conflict) | Error card with options | "An account already exists with this email. Sign in with password instead." |
  | Success | Brief flash then redirect | Auto-redirect to respective app dashboard |

- **Mobile Considerations**: Full-screen overlay, no navigation chrome
- **Exit Points**: Success → app dashboard; Error → Login page

---

## 3. Landing Page

> A single-page marketing site at `eduplatform.com`. Purpose: convert visitors into registered students. Keep it simple — headline, value proposition, and a clear CTA.

### 3.1 Landing Page

- **Purpose**: Convert visitors into registered students by showcasing the platform's value
- **Entry Points**: Direct domain access, marketing campaigns, search engines, social media links
- **Key UI Elements**:
  - **Hero Section**: Large headline, supporting subheading, primary CTA button ("Start Learning"), background visual or illustration
  - **Features Section**: Grid of feature cards showing course domains (Coding/Tech, Business) and key platform benefits
  - **Social Proof Section**: Student testimonials, platform statistics (students, courses, instructors)
  - **Bottom CTA Section**: Final call-to-action with "Start Learning" button
  - **Footer**: Navigation links (About, Contact, Terms, Privacy), social media icons, copyright
- **Data Displayed**: Platform value proposition text, course category names, student testimonials, platform stats
- **User Actions**: Click CTA buttons (navigate to student app), browse features, read testimonials, click footer links
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton placeholders for images, shimmer on text blocks | — |
  | Loaded | Fully rendered with entrance animations | — |
  | Error (assets failed) | Graceful fallback — text visible, images show placeholder | — |

- **Mobile Considerations**: Mobile-first responsive layout, compressed hero section, stacked feature cards, sticky CTA button at bottom on mobile, touch-friendly footer links
- **Exit Points**: CTA buttons → `student.eduplatform.com` (registration/login); Footer links → respective pages

---

## 4. Student App Pages

> All student pages live at `student.eduplatform.com`. Mobile-first design. Navigation uses a **bottom tab bar** on mobile and a **sidebar** on desktop.

### 4.1 Dashboard

- **Purpose**: Central hub showing course progress, upcoming events, and quick navigation
- **Entry Points**: Login redirect, bottom nav "Home" tab, logo click
- **Key UI Elements**:
  - Welcome header with user's first name
  - "Continue Learning" section with last-watched course card and progress bar
  - Enrolled courses grid (thumbnail, title, progress bar, last accessed)
  - Upcoming live classes list (date, time, course name, "Join" button)
  - Pending assignments count badge
  - Earned certificates count
  - Quick action buttons (Browse Courses, My Courses)
  - Notification bell icon with unread count badge
- **Data Displayed**: Course thumbnails/titles, progress percentages, upcoming class schedule, assignment counts, certificate count
- **User Actions**: Continue watching (resume last lecture), open a course, join upcoming live class, browse courses, open notifications
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton cards matching layout | — |
  | Empty (new user) | Welcome illustration + CTA | "Welcome! Start by browsing courses." |
  | Error | Toast notification + retry | "Failed to load dashboard. Tap to retry." |

- **Mobile Considerations**: Vertical card stack, swipeable course cards, collapsible sections, bottom tab navigation bar
- **Exit Points**: Course card → Course Detail; Continue Learning → Video Player; Join → Live Class; Browse Courses → Course Catalog; Notifications → Notifications Center

### 4.2 Course Catalog

- **Purpose**: Browse and discover available courses with search and filtering
- **Entry Points**: Dashboard "Browse Courses" button, bottom nav, direct URL
- **Key UI Elements**:
  - Search bar at top with text input
  - Filter controls: domain dropdown, price range (free/paid), rating, sort by
  - Active filter chips (dismissible)
  - Results count text
  - Course card grid (thumbnail, title, instructor name, price, star rating, domain tag)
  - Pagination or infinite scroll
- **Data Displayed**: Course thumbnails, titles, instructor names, prices (₹), ratings, domain tags
- **User Actions**: Search by keyword, apply/remove filters, sort results, click course card, browse pages
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton course cards in grid | — |
  | Empty (no results) | Illustration + search tips | "No courses found. Try adjusting your filters." |
  | Error | Toast + retry | "Failed to load courses." |

- **Mobile Considerations**: Single-column card layout, filter drawer (bottom sheet on mobile), touch-friendly filter chips
- **Exit Points**: Course card → Course Detail; Login wall → Login page (for paid courses)

### 4.3 Course Detail

- **Purpose**: Display comprehensive course information to inform the enrollment decision
- **Entry Points**: Course Catalog (click card), search results, direct URL, shared link
- **Key UI Elements**:
  - Hero section: course thumbnail, title, instructor name + avatar, price, enrollment CTA button
  - Course description (expandable)
  - Syllabus accordion: sections with lecture list (title, duration, type icon, free preview badge)
  - Instructor bio card (name, photo, credentials, expertise)
  - Student reviews section (star ratings, individual reviews)
  - Free preview video player (for lectures marked as preview)
  - Sticky "Enroll Now" button on mobile
- **Data Displayed**: Course title, description, thumbnail, instructor info, syllabus structure, reviews/ratings, price, preview video
- **User Actions**: Watch free preview lectures (no login required), read reviews, browse syllabus, enroll/purchase, navigate back
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton sections (hero, syllabus, reviews) | — |
  | Error (not found) | "Course not found" + back link | "This course may have been removed." |
  | Already enrolled | "Continue Learning" button replaces "Enroll" | — |

- **Mobile Considerations**: Stacked layout, expandable/collapsible sections, full-width video player, sticky bottom enroll bar
- **Exit Points**: Enroll → Checkout/Payment; Continue Learning → Video Player; Free Preview → Video Player; Back → Course Catalog

### 4.4 Video Player

- **Purpose**: Watch course lectures with progress tracking and playback controls
- **Entry Points**: Course Detail (click lecture), Dashboard (continue watching), direct lecture URL
- **Key UI Elements**:
  - Full-width video player area
  - Playback controls bar: play/pause, seek bar with resume position marker, volume, playback speed selector (0.5x–2x), quality selector, fullscreen toggle
  - Lecture sidebar (desktop): ordered list of all course lectures with completion checkmarks, current lecture highlighted
  - Next/Previous lecture navigation buttons
  - Auto-advance toggle
  - Mark as complete button
- **Data Displayed**: Video content (HLS streaming), current time / total duration, playback speed, quality options, lecture list with completion status
- **User Actions**: Play/pause, seek, adjust speed, change quality, fullscreen, navigate lectures, mark as complete, toggle auto-advance
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading / Buffering | Spinner overlay on video + progress bar | — |
  | Error (unavailable) | Error overlay with icon | "This video is currently processing or unavailable." + Retry button |
  | Error (access denied) | Lock icon overlay | "You need to enroll in this course to watch this lecture." |
  | Playing | Full controls visible, progress tracking active | — |

- **Mobile Considerations**: Full-width player, touch-friendly controls, landscape mode support, lecture list as bottom sheet (replaces sidebar), gesture controls (swipe to seek)
- **Exit Points**: Complete lecture → auto-advance to next; Lecture sidebar → another lecture; Back → Course Detail

### 4.5 Live Class

- **Purpose**: Join and participate in live interactive class sessions via video
- **Entry Points**: Dashboard (upcoming class "Join" button), notification reminder, direct class URL, course syllabus
- **Key UI Elements**:
  - Video grid (instructor + participants)
  - Controls bar: mic toggle, camera toggle, screen share, chat toggle, leave class
  - Chat panel (desktop: side panel; mobile: bottom sheet overlay)
  - Live indicator badge (red pulsing dot + "LIVE" text)
  - Connection quality indicator (good/fair/poor with color-coded dot)
  - Participant count display
  - Raise hand button
- **Data Displayed**: Live video feeds, chat messages with timestamps and sender names, participant count, connection quality, class duration
- **User Actions**: Enable/disable mic and camera, send chat messages, raise hand, share screen, leave class, view participants
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Connecting | Pulsing video icon + spinner | "Connecting to live class..." |
  | Live | Red "LIVE" badge, active video, chat flowing | — |
  | Poor connection | Yellow/red quality indicator | "Poor connection. Video quality may be reduced." |
  | Disconnected | Reconnect overlay | "Connection lost. Reconnecting..." |
  | Ended | Recording available overlay | "This class has ended. Recording will be available soon." |

- **Mobile Considerations**: Responsive video grid, chat as drawer overlay, pinned speaker view, data-usage warning, simplified controls bar
- **Exit Points**: Leave class → Course Detail; End of class → recording access screen; Disconnect → reconnect prompt

### 4.6 My Courses

- **Purpose**: View all enrolled courses with progress tracking
- **Entry Points**: Bottom nav "My Courses" tab, Dashboard
- **Key UI Elements**:
  - Tab bar: "In Progress" / "Completed"
  - Course card grid (thumbnail, title, instructor, progress bar with percentage, last accessed date, "Continue" button)
  - Sort options (recent, progress, name)
- **Data Displayed**: Enrolled course thumbnails, titles, progress percentages, completion status, last accessed dates
- **User Actions**: Switch tabs, sort courses, continue course, view completed courses
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton course cards | — |
  | Empty (no courses) | Illustration + CTA | "You haven't enrolled in any courses yet. Browse our catalog!" |
  | Empty (tab) | Tab-specific empty state | "No in-progress courses" or "No completed courses" |

- **Mobile Considerations**: Single-column card layout, swipeable cards, sticky tab bar
- **Exit Points**: Course card → Video Player (continue) or Course Detail; Browse CTA → Course Catalog

### 4.7 Assignment List

- **Purpose**: View all assignments for a specific course with submission status
- **Entry Points**: Course Detail (assignments tab), notification
- **Key UI Elements**:
  - Course header with back navigation
  - Assignment list: title, due date, status badge (Not Started / Submitted / Graded), grade (if graded)
  - Filter by status
  - Sort by due date
- **Data Displayed**: Assignment titles, due dates, submission status badges, grades and feedback snippets
- **User Actions**: Click assignment to view details/submit, filter by status, sort by date
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton list items | — |
  | Empty | Illustration | "No assignments for this course." |

- **Mobile Considerations**: Card-based layout (instead of table), status badges prominently displayed, swipe to filter
- **Exit Points**: Assignment card → Assignment Submission; Back → Course Detail

### 4.8 Assignment Submission

- **Purpose**: View assignment details and submit work for grading
- **Entry Points**: Assignment List (click assignment), notification, direct URL
- **Key UI Elements**:
  - Assignment header: title, due date, status badge
  - Instructions section (formatted text, attached files for download)
  - Submission area: file upload zone (drag-and-drop on desktop, file picker button on mobile) OR text/code editor
  - File attachment list (name, size, remove button)
  - "Submit Assignment" primary button
  - Submission history (previous submissions with timestamps and grades)
  - Grading feedback section (visible after graded)
- **Data Displayed**: Assignment title, instructions, due date, allowed file types, max file size, submission history, grade, instructor feedback
- **User Actions**: Read instructions, upload file(s), enter text/code response, remove attachments, submit, view feedback
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Page skeleton | — |
  | Uploading | Progress bar with percentage + ETA | "Uploading... 45% (2.1 MB of 5.0 MB)" |
  | Error (file too large) | Red banner on upload zone | "File exceeds maximum size limit." |
  | Error (wrong type) | Red banner on upload zone | "This file type is not supported." |
  | Submitting | Blue processing banner | "Submitting assignment... Please don't close this window." |
  | Success | Green confirmation toast | "Assignment submitted successfully!" |
  | Under review | Yellow "In review" badge | "Estimated grading time: 24–48 hours." |
  | Graded | Grade display + feedback section | Grade + instructor comments visible |

- **Mobile Considerations**: Camera upload option, file picker optimization, prevent accidental submit (confirmation dialog), full-width upload zone
- **Exit Points**: Submit → Assignment List (updated status); Back → Assignment List; Feedback link → feedback view

### 4.9 Quiz

- **Purpose**: Complete auto-graded quizzes with timed or untimed modes
- **Entry Points**: Course syllabus (click quiz lecture), Assignment List, direct URL
- **Key UI Elements**:
  - Quiz header: title, timer (if timed), progress indicator ("Question 3 of 10")
  - Question display area with question text and any attached media
  - Answer options: radio buttons for MCQ, text input for short answer
  - Question navigation palette (numbered buttons, marked-for-review indicator)
  - Previous / Next navigation buttons
  - "Submit Quiz" button (with confirmation dialog)
- **Data Displayed**: Questions, answer options, timer countdown, progress through quiz, question numbers
- **User Actions**: Select answer, navigate questions, mark for review, submit quiz
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton question area | "Loading quiz..." |
  | Timed warning | Timer turns yellow (under 2 min) | — |
  | Timer expired | Auto-submit dialog | "Time's up! Your quiz has been auto-submitted." |
  | Exit without submit | Warning dialog | "Are you sure? Unanswered questions will be marked incorrect." |
  | Submitted | Processing spinner | "Grading your quiz..." |
  | Graded | Results screen: score, correct/incorrect breakdown, review answers option | Score + percentage |

- **Mobile Considerations**: Sticky timer at top, large touch-friendly answer options, swipe between questions, prevent accidental submit
- **Exit Points**: Submit → Quiz Results; Timer expire → auto-submit → Results; Back (during quiz) → warning confirmation → Assignment List

### 4.10 Community / Forums

- **Purpose**: Course-level and general discussion channels for student interaction
- **Entry Points**: Bottom nav "Community" tab, course syllabus (community tab), notification
- **Key UI Elements**:
  - Channel list sidebar (desktop) or drawer (mobile): course-specific channels + general channels, unread count badges
  - Message list: avatar, sender name, timestamp, message content, reply count
  - Message composer: text input, attachment button, send button
  - Thread view (reply list under a message)
  - Typing indicator (animated dots)
  - Online presence dots on avatars
  - Search messages input
  - Flag/report message option (three-dot menu)
- **Data Displayed**: Channel names, messages with authors/timestamps, unread counts, online status indicators
- **User Actions**: Browse channels, read messages, post new message, reply to messages, search, flag/report content
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton channel list + message list | — |
  | Empty (no channels) | Illustration | "No discussion channels available yet." |
  | Empty (no messages) | Placeholder text in channel | "Be the first to start a conversation!" |
  | Error (send failed) | Toast notification | "Failed to send message. Tap to retry." |
  | Offline | Yellow banner at top | "You're offline. Messages will be sent when you reconnect." |

- **Mobile Considerations**: Channel list as slide-out drawer, bottom-fixed message composer, pull-to-refresh messages, swipe to reply, full-screen thread view
- **Exit Points**: Channel → message list; Back → channel list; Notification → specific message

### 4.11 Certificates

- **Purpose**: View, download, and share earned course completion certificates
- **Entry Points**: Course completion (auto-notification), Dashboard (certificate count), notification, direct URL
- **Key UI Elements**:
  - Certificate grid: preview card with course name, completion date, certificate ID
  - "Download PDF" button per certificate
  - "Share on LinkedIn" button per certificate
  - "Copy verification link" button
- **Data Displayed**: Certificate preview cards, course names, completion dates, certificate IDs
- **User Actions**: Download PDF, share on LinkedIn, copy verification link, view certificate details
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton certificate cards | — |
  | Empty | Illustration + CTA | "Complete a course to earn your first certificate!" |
  | Generating PDF | Progress indicator | "Generating certificate PDF..." |

- **Mobile Considerations**: Full-width certificate cards, native share sheet integration, optimized PDF download
- **Exit Points**: Download → file save; Share → LinkedIn; Verification link → Certificate Verification page

### 4.12 Certificate Verification

- **Purpose**: Public page to verify certificate authenticity (no login required)
- **Entry Points**: Verification link on certificate, manual URL with certificate ID, QR code scan
- **Key UI Elements**:
  - Certificate ID input field (pre-filled if accessed via link)
  - "Verify" button
  - Verification result: valid (green checkmark + certificate details) or invalid (red X + message)
  - Certificate preview image (if valid)
- **Data Displayed**: Certificate validity status, student name, course name, completion date, certificate ID, issuing organization
- **User Actions**: Enter certificate ID, verify, view details
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Default | Empty input | — |
  | Verifying | Spinner | "Verifying certificate..." |
  | Valid | Green confirmation + certificate details | "Certificate is valid and authentic." |
  | Invalid | Red warning | "This certificate could not be verified. It may have been tampered with." |
  | Not found | Error message | "No certificate found with this ID." |

- **Mobile Considerations**: Simplified form, full-width certificate preview, share button
- **Exit Points**: Valid → share options; Back → verification form

### 4.13 Placement Profile Builder

- **Purpose**: Create and manage a placement-ready profile for job applications
- **Entry Points**: Dashboard (placement CTA), navigation menu
- **Key UI Elements**:
  - Profile completeness progress bar (percentage)
  - Multi-section form:
    - Skills/technologies (tag input with suggestions)
    - Resume upload (drag-and-drop zone, PDF preview)
    - Projects portfolio (add project cards with title, description, link)
    - Education history
  - "Save Profile" button
  - Profile preview option
- **Data Displayed**: Current profile data, skills tags, resume preview, project list, completion percentage
- **User Actions**: Add/edit skills, upload resume, add/remove projects, edit education, save profile, preview profile
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Section skeletons | — |
  | Saving | Button spinner | "Saving profile..." |
  | Error (validation) | Red border on field + message | Per-field validation |
  | Error (save failed) | Toast | "Failed to save. Tap to retry." |
  | Success | Green toast | "Profile updated successfully!" |

- **Mobile Considerations**: Multi-step wizard layout, clear progress indicator, mobile resume upload (camera + file picker), touch-friendly tag input
- **Exit Points**: Save → placement dashboard; Complete profile → Job Board access

### 4.14 Job Board

- **Purpose**: Browse curated job listings matched to skills and profile
- **Entry Points**: Placement section, Dashboard (job alerts), navigation menu
- **Key UI Elements**:
  - Search bar
  - Filter controls: domain, location, job type (full-time/internship/contract)
  - Job listing cards: company logo, job title, company name, location, job type, required skills tags, "Apply" button, "Save" bookmark
  - Job detail view: full description, requirements, how to apply
- **Data Displayed**: Job titles, company names, locations, job types, skill requirements, posting dates, descriptions
- **User Actions**: Search jobs, filter, view details, apply (external link), save/bookmark jobs
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton job cards | — |
  | Empty | Illustration | "No jobs match your criteria right now." |
  | Saved | Bookmark icon filled | — |

- **Mobile Considerations**: Card-based layout, collapsible filter drawer, swipe to save, quick-apply button
- **Exit Points**: Apply → external job application; Save → saved jobs list; Back → placement dashboard

### 4.15 Notifications Center

- **Purpose**: View and manage all in-app notifications
- **Entry Points**: Notification bell icon (any page), notification toast (click), bottom nav
- **Key UI Elements**:
  - Notification list: icon (type-based), title, message preview, timestamp, unread indicator (blue dot)
  - "Mark all as read" button
  - Filter tabs: All, Live Classes, Assignments, Certificates, Payments, General
  - Empty state illustration
  - Click notification → navigate to related content
- **Data Displayed**: Notification messages, timestamps (relative: "2 hours ago"), type icons, unread indicators
- **User Actions**: View list, click notification (navigate to content), mark as read, mark all as read, filter by type, delete notification
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton notification items | — |
  | Empty | Illustration | "You're all caught up! No new notifications." |
  | Error | Toast + retry | "Failed to load notifications." |

- **Mobile Considerations**: Full-screen notification drawer, swipe to delete, pull-to-refresh
- **Exit Points**: Click notification → related content page (course, assignment, live class, etc.)

### 4.16 Checkout / Payment

- **Purpose**: Complete course purchase via Razorpay payment gateway
- **Entry Points**: Course Detail "Enroll Now" button
- **Key UI Elements**:
  - Order summary card: course thumbnail, title, instructor, price breakdown
  - Coupon code input field + "Apply" button
  - Discount display (if coupon applied)
  - "Pay ₹XXX" primary button (opens Razorpay payment overlay)
  - Payment processing overlay (do-not-close warning)
- **Data Displayed**: Course title, thumbnail, price (₹), discount amount, final amount, coupon status
- **User Actions**: Review order, apply coupon, initiate payment, cancel
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Order summary skeleton | — |
  | Payment processing | Full-screen overlay with spinner | "Processing payment... Please don't close this window." |
  | Error (payment failed) | Red banner + retry | "Payment failed. Please try again or use a different method." |
  | Error (coupon invalid) | Red text below coupon input | "Invalid coupon code." |
  | Success | Redirect to Payment Success page | — |

- **Mobile Considerations**: Full-width order summary, sticky pay button at bottom, Razorpay mobile-optimized overlay
- **Exit Points**: Payment success → Payment Success page; Cancel → Course Detail; Back → Course Detail

### 4.17 Payment Success

- **Purpose**: Confirm successful payment and enrollment with next-step CTAs
- **Entry Points**: Checkout/Payment success redirect
- **Key UI Elements**:
  - Success icon (large checkmark)
  - "Payment Successful!" heading
  - Confirmation message ("You've been enrolled in [Course Name]")
  - Order details: transaction ID, amount paid, date
  - "Start Learning" primary button
  - "View Receipt" secondary button
- **Data Displayed**: Course name, transaction ID, amount paid, payment date
- **User Actions**: Start learning (go to course), view receipt
- **Mobile Considerations**: Centered stacked layout, full-width buttons
- **Exit Points**: Start Learning → Video Player (first lecture); View Receipt → receipt detail; Back → Dashboard

### 4.18 Profile / Settings

- **Purpose**: Manage student account settings and preferences
- **Entry Points**: Bottom nav "Profile" tab, dashboard user avatar
- **Key UI Elements**:
  - Profile header: avatar (with change option), name, email
  - Settings sections:
    - Account: name, email (read-only), change password
    - Connected accounts: Google/GitHub OAuth status, disconnect option
    - Notifications: toggle preferences (email, push) by type
    - Danger zone: delete account (with confirmation)
  - "Save Changes" button
  - "Log Out" button
- **Data Displayed**: Avatar, name, email, connected OAuth providers, notification preferences
- **User Actions**: Change avatar, change password, manage connected accounts, toggle notification preferences, delete account, log out
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Profile skeleton | — |
  | Saving | Button spinner | "Saving changes..." |
  | Error | Toast | "Failed to save changes." |

- **Mobile Considerations**: Collapsible settings sections, large touch targets for toggles, bottom-aligned save button
- **Exit Points**: Save → confirmation toast; Log Out → Login page; Delete Account → confirmation dialog → Login page

---

## 5. Instructor App Pages

> All instructor pages live at `instructor.eduplatform.com`. Mobile-first design. Navigation uses a **sidebar** on desktop and a **hamburger menu** on mobile. Instructor onboarding is invite-only — instructors must apply and be approved by admin before accessing the dashboard.

### 5.1 Instructor Application Form

- **Purpose**: Submit an application to become a platform instructor (invite-only, requires admin approval)
- **Entry Points**: Direct invitation link, registration flow for invited users
- **Key UI Elements**:
  - Multi-section form with progress indicator:
    - Personal info: name, email, phone
    - Professional bio: bio text area with character count, expertise areas (tag input)
    - Social links: LinkedIn, Twitter/X, GitHub, personal website
    - Documents: ID proof upload, qualification certificates upload
  - "Submit Application" button
- **Data Displayed**: Form fields, character counts, upload requirements
- **User Actions**: Fill form sections, upload documents, submit application
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Default | Empty form | — |
  | Validation error | Red border + message per field | Per-field validation |
  | Submitting | Blue processing banner | "Submitting application... Please don't close this window." |
  | Error | Toast + retry | "Submission failed. Tap to retry." |
  | Success | Confirmation screen with reference number | "Application submitted! Reference: #XXXX. We'll review it within 3–5 business days." |

- **Mobile Considerations**: Vertical stacked sections, touch-friendly file upload, clear progress indicator
- **Exit Points**: Success → Application Status page; Cancel → landing page

### 5.2 Application Status

- **Purpose**: Track the status of an instructor application (pending/approved/rejected)
- **Entry Points**: After application submission, direct URL, login redirect for pending instructors
- **Key UI Elements**:
  - Status card: large status icon + label (Pending / Approved / Rejected)
  - Application timeline: submitted → under review → decision
  - For rejected: rejection reason display, "Re-apply" button
  - For approved: "Go to Dashboard" button
- **Data Displayed**: Application status, submission date, review timeline, rejection reason (if applicable)
- **User Actions**: View status, re-apply (if rejected), proceed to dashboard (if approved)
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton status card | — |
  | Pending | Yellow clock icon | "Your application is under review." |
  | Approved | Green checkmark | "Congratulations! Your application has been approved." |
  | Rejected | Red X icon + reason | "Your application was not approved." + reason text |

- **Mobile Considerations**: Centered status card, full-width timeline
- **Exit Points**: Approved → Dashboard; Rejected → re-apply flow; Pending → wait (no action)

### 5.3 Dashboard

- **Purpose**: Instructor's home base with key metrics and quick actions
- **Entry Points**: Login redirect, sidebar "Dashboard", logo click
- **Key UI Elements**:
  - Summary metric cards: total students, active courses, total revenue (₹), upcoming live classes
  - Recent student activity feed (enrollments, completions, reviews)
  - Quick actions: "Create Course", "Schedule Class", "View Analytics"
  - Upcoming live classes list with "Start" button
- **Data Displayed**: Student count, course count, revenue (₹), upcoming class schedule, recent activity
- **User Actions**: Create course, schedule class, view analytics, start live class, view recent activity
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton metric cards + activity feed | — |
  | Empty (new instructor) | Welcome illustration + CTA | "Welcome! Start by creating your first course." |
  | Error | Toast + retry | "Failed to load dashboard." |

- **Mobile Considerations**: Stacked metric cards, scrollable activity feed, prominent quick action buttons
- **Exit Points**: Create Course → Course Creation Wizard; Schedule Class → Live Class Scheduler; Analytics → Analytics Dashboard; Start Class → Live Class Room

### 5.4 Course List

- **Purpose**: View and manage all instructor courses (published and drafts)
- **Entry Points**: Sidebar "Courses", Dashboard
- **Key UI Elements**:
  - "Create New Course" primary button
  - Course cards/table: thumbnail, title, status badge (Draft / Published / Under Review), student count, revenue, last updated
  - Filter by status
  - Sort by date, students, revenue
- **Data Displayed**: Course thumbnails, titles, status, student counts, revenue (₹), last updated dates
- **User Actions**: Create new course, edit course, publish/unpublish, view course, filter, sort
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton course cards | — |
  | Empty | Illustration + CTA | "You haven't created any courses yet." |

- **Mobile Considerations**: Card-based layout (not table), status badges prominently displayed, swipe actions for quick edit
- **Exit Points**: Create → Course Creation Wizard; Course card → Course Editor; Published → preview

### 5.5 Course Creation Wizard

- **Purpose**: Multi-step guided flow to create a new course
- **Entry Points**: Course List "Create New Course", Dashboard quick action
- **Key UI Elements**:
  - Step progress bar: Step 1 of 4 (Basic Info → Sections → Content → Review)
  - **Step 1 — Basic Info**: title, description (character count), thumbnail upload, domain selection, pricing (free/paid + amount in ₹)
  - **Step 2 — Sections & Lectures**: add sections, add lectures within sections (video/text/assignment/quiz types), drag-and-drop reorder
  - **Step 3 — Content Upload**: upload video files, documents per lecture, upload progress + transcoding status
  - **Step 4 — Review & Publish**: preview all course details, publish or save as draft
  - "Save Draft" button (available at any step), "Next" / "Back" navigation
  - Auto-save indicator
- **Data Displayed**: Course form fields, section/lecture hierarchy, upload statuses, pricing preview
- **User Actions**: Fill details, upload thumbnail, add sections/lectures, upload content, reorder, preview, save draft, publish
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Default | Empty form at Step 1 | — |
  | Auto-saving | Subtle "Saving draft..." indicator | — |
  | Validation error | Red border + message per field | Per-field validation |
  | Publishing | Blue processing banner | "Publishing course..." |
  | Success | Confirmation toast | "Course published successfully!" |
  | Draft saved | Toast | "Draft saved." |

- **Mobile Considerations**: Single-column step layout, touch-friendly drag handles (long-press), collapsible sections, bottom-aligned navigation buttons
- **Exit Points**: Publish → Course List (published); Save Draft → Course List (draft); Cancel → confirmation → Course List

### 5.6 Course Editor

- **Purpose**: Edit an existing course's details, sections, lectures, and content
- **Entry Points**: Course List (click course), Dashboard
- **Key UI Elements**:
  - Course header: thumbnail, title, status badge, "Preview" button, "Unpublish" option
  - Editable sections (same fields as wizard Step 1): title, description, thumbnail, domain, pricing
  - Section/lecture management: expandable sections with lecture list, drag handles for reorder, add/remove buttons
  - Lecture type indicators: video, text, assignment, quiz
  - Free preview toggle per lecture
  - "Save Changes" button, auto-save indicator
- **Data Displayed**: Current course details, section/lecture hierarchy, lecture statuses, free preview flags
- **User Actions**: Edit course details, add/edit/delete sections, add/edit/delete lectures, reorder, toggle free preview, save, preview
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton course editor | — |
  | Auto-saving | "Saving..." indicator | — |
  | Reordering | Processing spinner on drag | — |
  | Error | Toast | "Failed to save changes." |

- **Mobile Considerations**: Collapsible sections, swipe-to-delete lectures, bottom sheet for adding lectures
- **Exit Points**: Save → Course List; Preview → student-facing course page; Back → Course List

### 5.7 Content Upload

- **Purpose**: Upload video and file content for individual lectures
- **Entry Points**: Course Editor (click lecture → upload), Course Creation Wizard (Step 3)
- **Key UI Elements**:
  - File upload drop zone (drag-and-drop on desktop, file picker on mobile)
  - Upload queue: file name, size, progress bar with percentage, ETA
  - Upload status: uploading, processing/transcoding, complete, failed
  - Retry button for failed uploads
  - Cancel button for in-progress uploads
  - Quality options display (after transcoding: 360p, 480p, 720p, 1080p)
- **Data Displayed**: File names, sizes, upload progress percentages, transcoding status, available quality levels
- **User Actions**: Select files, drag-and-drop, cancel upload, retry failed upload, monitor transcoding
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Default | Empty drop zone | "Drag and drop files here or click to browse" |
  | Uploading | Progress bar + percentage + ETA | "Uploading... 45% (2.1 MB of 5.0 MB) ~2 min remaining" |
  | Transcoding | Processing indicator | "Processing video... This may take a few minutes." |
  | Complete | Green checkmark + quality options | "Upload complete! Available in: 720p, 1080p" |
  | Error (validation) | Red banner | "Invalid file type or file too large." |
  | Error (transcoding failed) | Red banner + retry | "Video processing failed. Tap to retry." |

- **Mobile Considerations**: Large touch-friendly drop zone, camera integration for mobile capture, background upload support, data usage warning
- **Exit Points**: Complete → back to lecture editor; Cancel → remove upload

### 5.8 Live Class Scheduler

- **Purpose**: Schedule a new live class session for a course
- **Entry Points**: Dashboard "Schedule Class", Course Editor, sidebar
- **Key UI Elements**:
  - Date picker (calendar)
  - Time picker
  - Duration selector (presets: 30 min, 1 hr, 1.5 hr, 2 hr)
  - Course selector dropdown (attach to a course or standalone)
  - Class title input
  - "Notify Students" toggle
  - "Schedule Class" button
- **Data Displayed**: Selected date/time/duration, linked course name, enrolled student count (preview)
- **User Actions**: Set date/time/duration, select course, enter title, toggle notifications, schedule
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Default | Empty form | — |
  | Validation error | Red border per field | Per-field validation |
  | Scheduling | Button spinner | "Scheduling class..." |
  | Error (time conflict) | Red banner | "You already have a class scheduled at this time." |
  | Success | Confirmation toast | "Live class scheduled! Students will be notified." |

- **Mobile Considerations**: Native date/time pickers, simplified duration presets, stacked form layout
- **Exit Points**: Success → Dashboard (class appears in upcoming list); Cancel → back

### 5.9 Live Class Room

- **Purpose**: Host a live class session with video, chat, recording, and participant management
- **Entry Points**: Dashboard "Start" button on upcoming class, direct class URL
- **Key UI Elements**:
  - Video grid: instructor + students (gallery view)
  - Host controls bar: mic toggle, camera toggle, screen share, recording toggle, chat toggle, end class
  - Recording indicator (red dot + "REC" text) when recording
  - Chat panel (desktop: side panel; mobile: bottom sheet)
  - Participant list with mute/remove controls per student
  - Class timer
  - "End Class" button (with confirmation dialog)
- **Data Displayed**: Video feeds, chat messages, participant count, recording status, class duration
- **User Actions**: Enable/disable mic/camera, share screen, start/stop recording, send chat messages, mute/remove students, end class
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Starting | Spinner | "Starting live class..." |
  | Live | Red "LIVE" badge, active video, controls | — |
  | Recording | Red "REC" indicator | — |
  | Ending | Confirmation dialog | "Are you sure you want to end this class?" |
  | Ended | Summary screen | "Class ended. Duration: XX min. Recording will be available shortly." |

- **Mobile Considerations**: Responsive video grid, pinned speaker view, swipe to chat, simplified participant management
- **Exit Points**: End class → recording summary; Leave → Dashboard

### 5.10 Student Management

- **Purpose**: View and manage students enrolled in instructor's courses
- **Entry Points**: Sidebar "Students", Course Editor (student tab), Analytics → drill down
- **Key UI Elements**:
  - Course selector dropdown (filter by course)
  - Search bar (name/email)
  - Student table/cards: name, email, enrollment date, progress bar, last active
  - Bulk message button (max 100 recipients per batch)
  - Click student → detailed progress view
  - Pagination
- **Data Displayed**: Student names, emails, enrollment dates, progress percentages, last active dates
- **User Actions**: Search students, filter by course, click for details, send bulk message
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton table/cards | — |
  | Empty | Illustration | "No students enrolled yet." |
  | Error | Toast + retry | "Failed to load students." |

- **Mobile Considerations**: Card-based layout (not table), search at top, swipe for quick actions, infinite scroll instead of pagination
- **Exit Points**: Student card → Student Progress Detail; Bulk message → compose message dialog

### 5.11 Student Progress Detail

- **Purpose**: Detailed view of a single student's progress within a course
- **Entry Points**: Student Management (click student)
- **Key UI Elements**:
  - Student profile header: avatar, name, email, enrollment date
  - Course progress bar with percentage
  - Lecture-by-lecture completion list (checkmarks for completed, play icon for incomplete)
  - Assignment submissions: status, grade, feedback
  - Quiz scores summary
  - Live class attendance record
  - Time spent on course
- **Data Displayed**: Student profile, lecture completion status, assignment grades/feedback, quiz scores, attendance, time spent
- **User Actions**: View progress details, grade assignments (inline), add feedback, compare with class average
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton progress sections | — |
  | No activity | "No activity recorded" message | — |
  | Error | Toast + retry | "Failed to load student progress." |

- **Mobile Considerations**: Vertical timeline layout, collapsible sections, bottom-sheet for grade entry
- **Exit Points**: Grade action → inline grading; Back → Student Management list

### 5.12 Assignment Grading

- **Purpose**: View and grade student assignment submissions
- **Entry Points**: Student Progress Detail, notification (submission received), sidebar
- **Key UI Elements**:
  - Submission list: student name, assignment title, submitted date, status (Pending / Graded)
  - Submission detail view: student's uploaded file/text response, grading input (numeric score), feedback textarea
  - "Submit Grade" button
  - Grade history per submission
- **Data Displayed**: Student responses, submission dates, grades, feedback text, grade history
- **User Actions**: View submission, enter grade, write feedback, submit grade, view history
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton submission view | — |
  | Saving grade | Button spinner | "Saving grade..." |
  | Error | Toast | "Failed to save grade." |
  | Success | Toast | "Grade submitted. Student will be notified." |

- **Mobile Considerations**: Full-width submission view, bottom-fixed grade entry bar, swipe between submissions
- **Exit Points**: Submit grade → submission list (updated); Back → Student Management

### 5.13 Analytics Dashboard

- **Purpose**: View course performance metrics, engagement data, and revenue trends
- **Entry Points**: Sidebar "Analytics", Dashboard
- **Key UI Elements**:
  - Metric summary cards: total enrollments, completion rate, average watch time, total revenue (₹)
  - Interactive charts: enrollment trends (line), completion rates (bar), drop-off points per lecture
  - Time period selector: last 7 days, 30 days, 90 days, custom range
  - Course selector dropdown (filter by course)
  - "Export Report" button
- **Data Displayed**: Enrollment counts, completion percentages, watch time, revenue trends, drop-off data, engagement metrics
- **User Actions**: Change time period, filter by course, hover/click charts for details, export report
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton metric cards + chart placeholders | — |
  | Empty | Illustration | "No analytics data available for the selected period." |
  | Error | Toast + retry | "Failed to load analytics." |

- **Mobile Considerations**: Stacked metric cards, horizontally scrollable charts, simplified date picker, touch-optimized chart interactions
- **Exit Points**: Export → download report; Drill down → specific course analytics

### 5.14 Revenue Page

- **Purpose**: Track earnings, payout history, and payout schedule
- **Entry Points**: Sidebar "Revenue", Analytics Dashboard
- **Key UI Elements**:
  - Total earnings card (₹)
  - Per-course revenue breakdown table
  - Payout history: date, amount (₹), status (Processing / Paid), payout ID
  - Next payout date and estimated amount
  - Revenue share percentage display (platform vs. instructor split)
  - "Export" button
- **Data Displayed**: Total revenue, per-course revenue, payout history, payout schedule, revenue share percentage
- **User Actions**: View revenue breakdown, check payout history, export data
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton cards + table | — |
  | Empty | Illustration | "No revenue data yet. Publish a paid course to start earning." |
  | Error | Toast + retry | "Failed to load revenue data." |

- **Mobile Considerations**: Stacked revenue cards, collapsible payout history, swipe to navigate periods
- **Exit Points**: Export → download; Back → Dashboard

### 5.15 Banking / Payout Setup

- **Purpose**: Configure bank account details for receiving payouts via Razorpay Route
- **Entry Points**: Sidebar "Settings" → Payout section, first-time prompt when publishing paid course
- **Key UI Elements**:
  - Bank account form: account holder name, account number, IFSC code, bank name
  - Verification status indicator (Not Set / Pending / Verified)
  - Revenue share percentage display
  - Payout frequency/schedule info
  - "Save & Verify" button
- **Data Displayed**: Bank details form, verification status, revenue share %, payout schedule
- **User Actions**: Enter bank details, submit for verification, update details
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Not set | Prompt to configure | "Set up your bank account to receive payouts." |
  | Pending verification | Yellow processing indicator | "Verifying your bank details. This may take 1–2 business days." |
  | Verified | Green checkmark | "Bank account verified. Payouts will be credited here." |
  | Error | Red banner | "Verification failed. Please check your details." |

- **Mobile Considerations**: Simplified input fields, masked account number display, clear validation feedback
- **Exit Points**: Save → confirmation; Skip → can complete later (warning shown)

### 5.16 Profile / Settings

- **Purpose**: Manage instructor profile (visible to students) and account settings
- **Entry Points**: Sidebar "Settings", dashboard avatar
- **Key UI Elements**:
  - Profile header: avatar (changeable), name, email
  - Profile editing: bio text area (with character count), expertise tags, social links (LinkedIn, Twitter/X, GitHub, website)
  - Account settings: change password, connected OAuth accounts
  - Notification preferences: toggles by type (new enrollment, assignment submitted, review received, etc.)
  - "Save Changes" button
  - "Log Out" button
  - Student-facing preview option
- **Data Displayed**: Avatar, bio, expertise tags, social links, notification preferences
- **User Actions**: Edit profile, upload avatar, add/remove social links, change password, toggle notifications, preview student-facing profile, log out
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Profile skeleton | — |
  | Saving | Button spinner | "Saving profile..." |
  | Error | Toast | "Failed to save changes." |
  | Success | Toast | "Profile updated!" |

- **Mobile Considerations**: Collapsible sections, bottom-aligned save button, touch-friendly tag input
- **Exit Points**: Save → confirmation; Preview → student-facing profile; Log Out → Login page

### 5.17 Notifications Center

- **Purpose**: View and manage instructor-specific notifications
- **Entry Points**: Notification bell icon, sidebar
- **Key UI Elements**:
  - Notification list: icon, title, message, timestamp, unread indicator
  - "Mark all as read" button
  - Filter tabs: All, Enrollments, Assignments, Courses, Revenue
  - Empty state
- **Data Displayed**: Notification messages, timestamps, type icons, unread counts
- **User Actions**: View, click to navigate, mark as read, mark all as read, filter
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton items | — |
  | Empty | Illustration | "No notifications." |

- **Mobile Considerations**: Full-screen list, swipe to delete, pull-to-refresh
- **Exit Points**: Click notification → related content page

---

## 6. Admin App Pages

> All admin pages live at `admin.eduplatform.com`. **Desktop-first design** (admins primarily work on desktop/laptop). Navigation uses a persistent **sidebar** with collapsible sections.

### 6.1 Dashboard

- **Purpose**: Platform-wide overview with key metrics, system health, and pending actions
- **Entry Points**: Login redirect, sidebar "Overview", logo click
- **Key UI Elements**:
  - Metric cards: total users, total courses, total revenue (₹), active live classes
  - System health indicators (green/yellow/red status dots)
  - Pending moderation count badges (instructor applications, flagged courses)
  - Recent activity feed (new signups, course publishes, payments)
  - Quick action links to moderation queues
- **Data Displayed**: Platform stats, system health, pending counts, recent activity timeline
- **User Actions**: View metrics, navigate to moderation queues, view activity, access quick actions
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton metric cards + activity feed | — |
  | Error | Toast + retry | "Failed to load dashboard." |

- **Exit Points**: Metric card → detailed analytics; Moderation badge → approval/moderation queue; Activity item → related entity

### 6.2 User Management

- **Purpose**: Search, filter, and manage all platform users (students + instructors)
- **Entry Points**: Sidebar "Users"
- **Key UI Elements**:
  - Search bar (name/email)
  - Advanced filters: role (student/instructor), status (active/inactive/locked), join date range
  - Results table: name, email, role badge, status badge, join date, last active
  - Pagination with items-per-page selector
  - Row actions: view details, deactivate, reset password
  - Bulk action toolbar (select multiple + action)
  - Export button (CSV)
- **Data Displayed**: User names, emails, roles, statuses, join dates, last active dates
- **User Actions**: Search, filter, sort, view user details, deactivate user, reset password, export
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton table rows | — |
  | No results | "No users match your filters." | Adjust filters suggestion |
  | Error | Toast + retry | "Failed to load users." |

- **Exit Points**: User row → User Detail; Export → download CSV

### 6.3 User Detail

- **Purpose**: Comprehensive view of a single user's profile, activity, and admin actions
- **Entry Points**: User Management (click user row), audit log reference
- **Key UI Elements**:
  - Profile header: avatar, name, email, role badge, status badge, join date
  - Account info cards: OAuth connections, last login, login attempts
  - Activity timeline: key actions (enrollments, submissions, logins)
  - Admin action buttons: Deactivate / Activate, Change Role (with confirmation), Reset Password, Unlock Account
  - Audit trail section: admin actions taken on this user
- **Data Displayed**: Full profile info, activity history, audit trail, account metadata
- **User Actions**: Activate/deactivate user, change role, reset password, unlock account, view audit trail
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Profile skeleton | — |
  | Error | Toast + retry | "Failed to load user details." |
  | Action confirmation | Modal dialog | "Are you sure you want to [action]? This cannot be undone." |
  | Action success | Toast | "User [deactivated/activated/etc.] successfully." |

- **Exit Points**: Back → User Management; Action → confirmation + updated detail view

### 6.4 Instructor Approval Queue

- **Purpose**: Review and approve/reject instructor applications
- **Entry Points**: Dashboard moderation badge, sidebar "Moderation"
- **Key UI Elements**:
  - Queue header: pending count, filters (all/pending/approved/rejected)
  - Application cards: applicant name, email, expertise, submission date, "Review" button
  - Review detail panel (expands or modal): bio, expertise, social links, uploaded documents preview, background check status
  - Approve / Reject buttons with reason input (for rejection)
  - Bulk approve option
- **Data Displayed**: Applicant details, documents, background check status, application timeline
- **User Actions**: Review application, preview documents, approve, reject with reason, filter queue
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton queue items | — |
  | Empty queue | Illustration | "No pending applications. All caught up!" |
  | Processing approval | Spinner on action button | "Processing..." |
  | Success | Toast + queue update | "Application approved. Instructor notified." |

- **Exit Points**: Approve/Reject → queue updates; Back → Dashboard

### 6.5 Course Moderation Queue

- **Purpose**: Review flagged or newly published courses requiring moderation
- **Entry Points**: Dashboard moderation badge, sidebar "Moderation"
- **Key UI Elements**:
  - Queue header: pending count, filters (all/flagged/new/pending review)
  - Course cards: thumbnail, title, instructor, flag reason (if flagged), status, "Review" button
  - Review panel: course details, content preview, flag history timeline, moderation history
  - Actions: Approve, Reject (with reason), Suspend (with reason), Request Changes
- **Data Displayed**: Course details, flag reasons, flag history, moderation actions, instructor info
- **User Actions**: Review course, preview content, approve, reject, suspend, request changes, view flag history
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton queue items | — |
  | Empty queue | Illustration | "No courses pending review." |
  | Processing | Spinner on action button | — |
  | Success | Toast + queue update | "Course approved." / "Course rejected. Instructor notified." |

- **Exit Points**: Action → queue updates; Course title → Content Review page

### 6.6 Content Review

- **Purpose**: Detailed review of a specific course's content during moderation
- **Entry Points**: Course Moderation Queue (click course), direct link
- **Key UI Elements**:
  - Course header: title, instructor, status
  - Syllabus view: sections and lectures (same structure as student view)
  - Content preview: video player, text content, assignment/quiz details
  - Flag history timeline with reasons and dates
  - Moderation action panel: Approve, Reject, Suspend, Request Changes (all with reason inputs)
- **Data Displayed**: Full course content, flag history, previous moderation actions
- **User Actions**: Preview all content, take moderation action, view history
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Content skeleton | — |
  | Error | Toast | "Failed to load course content." |
  | Action taken | Toast + redirect | "Action recorded. Returning to queue." |

- **Exit Points**: Action → back to moderation queue; Back → queue

### 6.7 Platform Analytics

- **Purpose**: Platform-wide metrics and trends for business intelligence
- **Entry Points**: Sidebar "Analytics", Dashboard metrics
- **Key UI Elements**:
  - Metric cards: total revenue (₹), total users, total courses, active users
  - Charts: revenue over time (line), user growth (line), enrollment trends (bar), geographic distribution
  - Date range selector (preset ranges + custom)
  - Chart controls: toggle metrics, compare periods
  - "Export" button
- **Data Displayed**: Revenue, user counts, course counts, enrollment data, geographic data, time-series trends
- **User Actions**: Change date range, toggle chart metrics, compare periods, hover for details, export
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton metric cards + chart placeholders | — |
  | Empty | "No data for selected period." | Suggestion to adjust range |
  | Error | Toast + retry | "Failed to load analytics." |

- **Exit Points**: Export → download report; Metric click → drill-down view

### 6.8 Revenue Analytics

- **Purpose**: Track platform revenue, instructor payouts, and financial health
- **Entry Points**: Sidebar "Revenue", Platform Analytics
- **Key UI Elements**:
  - Summary cards: total platform revenue (₹), total instructor payouts (₹), platform share (₹)
  - Revenue charts: revenue over time, per-course revenue, per-instructor revenue
  - Transaction history table: date, type, amount (₹), status, entities involved
  - Payout schedule overview
  - Razorpay sync status indicator
  - "Export" button
- **Data Displayed**: Revenue breakdowns, payout data, transaction history, sync status
- **User Actions**: Filter by date/course/instructor, view transaction details, export
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton cards + table | — |
  | Sync error | Yellow warning banner | "Payment data sync is delayed. Last synced: [time]." |
  | Error | Toast + retry | "Failed to load revenue data." |

- **Exit Points**: Export → download; Transaction → detail view

### 6.9 Report Generation

- **Purpose**: Generate and download platform reports in CSV or PDF format
- **Entry Points**: Sidebar "Reports", Analytics "Export" button
- **Key UI Elements**:
  - Report type selector: Revenue, Enrollments, User Activity, Course Performance
  - Date range picker
  - Format selector: CSV, PDF
  - "Generate Report" button
  - Generation progress bar with percentage
  - Download history: report name, date generated, format, download button
- **Data Displayed**: Report type options, date ranges, format options, generation progress, download history
- **User Actions**: Select type, set date range, choose format, generate, download
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Default | Form with options | — |
  | Generating | Progress bar + percentage | "Generating report... 75% (ETA: 1 min)" |
  | Complete | Download link available | "Report ready! Click to download." |
  | Error | Toast | "Report generation failed. Please try again." |

- **Exit Points**: Download → file save; Complete → download link

### 6.10 Institution Management

> **Phase 2** — This page is planned for future development. The institution app (`web-institution`) will be a separate application.

- **Purpose**: Manage institutional accounts, seat licenses, and cohort reports
- **Entry Points**: Sidebar "Institutions"
- **Key UI Elements** (planned):
  - Institution list: name, status, seat count, subscription details
  - Institution detail: account info, seat management, usage analytics, associated users
  - Seat management: allocate seats, view utilization, add/remove seats
- **Mobile Considerations**: Card-based institution list on mobile
- **Exit Points**: Institution → detail view; Detail → seat management

### 6.11 Support Tickets

> **Phase 2** — This page is planned for future development.

- **Purpose**: Handle user support requests and track resolution
- **Entry Points**: Sidebar "Support", Dashboard notification
- **Key UI Elements** (planned):
  - Ticket queue: subject, user, priority badge, status (Open / In Progress / Resolved), created date
  - Ticket detail: conversation thread, user info, priority selector, status workflow, response editor
  - Filters: status, priority, assignee
- **Mobile Considerations**: Card-based ticket list, swipe for quick status change
- **Exit Points**: Ticket → detail view; Resolve → queue update

### 6.12 Audit Log

- **Purpose**: View chronological log of all admin and system actions for compliance and security
- **Entry Points**: Sidebar "Audit Log", User Detail (audit trail link)
- **Key UI Elements**:
  - Log table: timestamp, actor (admin name), action type, target entity, details, IP address
  - Advanced filters: date range, actor, action type, entity type
  - Search bar
  - "Export" button (CSV)
  - Pagination
- **Data Displayed**: Action timestamps, actors, action types, targets, IP addresses, details
- **User Actions**: Filter logs, search, export, paginate, click entry for details
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton table rows | — |
  | No results | "No log entries match your filters." | — |
  | Error | Toast + retry | "Failed to load audit log." |

- **Exit Points**: Export → download CSV; Entry → detail view

### 6.13 Security Monitoring

- **Purpose**: Monitor platform security events, threats, and access patterns
- **Entry Points**: Sidebar "Security", Dashboard alert
- **Key UI Elements**:
  - Security status overview: green/yellow/red overall status with description
  - Security events feed: timestamp, event type, severity, details, actor
  - Alert indicators for active threats
  - Action buttons: terminate session, block IP, investigate
  - Filters: severity, event type, date range
- **Data Displayed**: Security status, event feed, threat indicators, session data
- **User Actions**: View events, respond to alerts, terminate sessions, block IPs, investigate
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton event feed | — |
  | Critical alert | Red banner at top | "[X] active security threat(s) detected." |
  | No events | "No security events." | — |

- **Exit Points**: Event → investigation detail; Block IP → confirmation → updated list

### 6.14 System Settings

- **Purpose**: Configure platform-wide settings, feature toggles, and maintenance scheduling
- **Entry Points**: Sidebar "Settings"
- **Key UI Elements**:
  - Settings sections (collapsible):
    - Platform config: site name, support email, default currency
    - Feature toggles: enable/disable features (community, placement, etc.)
    - Maintenance: schedule maintenance window (date/time/duration), notification message
    - Notifications: configure platform notification templates
  - Toggle switches, input fields, text areas
  - "Save Changes" button per section
  - Change history log
- **Data Displayed**: Current configuration values, toggle states, maintenance schedule, change history
- **User Actions**: Modify settings, toggle features, schedule maintenance, save, view change history
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Settings skeleton | — |
  | Saving | Section-level spinner | "Saving..." |
  | Error | Red banner per section | "Failed to save. [specific error]" |
  | Success | Green toast per section | "Settings saved." |

- **Exit Points**: Save → updated settings; Schedule maintenance → confirmation

### 6.15 Notifications Center

- **Purpose**: View admin-specific notifications (approvals, flags, security alerts)
- **Entry Points**: Notification bell icon, sidebar
- **Key UI Elements**:
  - Notification list: icon, title, message, timestamp, unread indicator
  - "Mark all as read" button
  - Filter tabs: All, Approvals, Moderation, Security, System
- **Data Displayed**: Admin notification messages, timestamps, types, unread counts
- **User Actions**: View, click to navigate, mark as read, mark all as read, filter
- **States**:

  | State | Visual | User Message |
  |---|---|---|
  | Loading | Skeleton items | — |
  | Empty | "No notifications." | — |

- **Exit Points**: Click notification → related admin page

---

## 7. Phase 2 Pages (Future Scope)

> These features are **not in the current implementation scope**. They are listed here for design awareness. Detailed page maps will be created in a separate design brief when Phase 2 begins.

| Feature | Description | Dependencies |
|---|---|---|
| Institution Dashboard | Separate `web-institution` app for colleges/training centers — seat management, cohort reports, usage analytics | User roles, seat license system |
| Support Tickets | Ticket queue, priority system, response workflow, SLA tracking | User management, notification system |
| Mobile App (React Native) | Native mobile app for students — offline access, push notifications, camera integration | Core web platform stable |
| Mock Interviews | Scheduled mock interview sessions with instructors, video recording, feedback | Live class infrastructure, placement profile |
| Referrals | Student referral system with referral codes, tracking, rewards | User management, payment system |
| Advanced Chat | Reactions (emoji), voice rooms, threaded replies, file sharing in community | Community/Forums (Phase 1) |
| AI Tutors | AI-powered tutoring, doubt resolution, content recommendations | Course content, user progress data |
| Whiteboards | Collaborative whiteboard for live classes | Live class infrastructure |
| Gamification | Streaks, leaderboards, XP system, badges | User progress tracking |
| Multilingual Support | Interface localization, content translation | Design system with i18n support |
| Advanced Recommendations | ML-powered course recommendations | User behavior data, course catalog |
| DRM | Digital rights management for video content | Video pipeline, content delivery |
| Bulk Upload (Instructor) | Batch upload multiple videos at once | Content upload pipeline |
| Content Versioning | Version history for course content, rollback capability | Course editor, content storage |

---

## 8. Cross-Platform UX Patterns

> These patterns apply across all platform apps. Use this section as a reference when designing any page.

### 8.1 Navigation Patterns

**Student App:**
- **Mobile**: Bottom tab bar with 5 tabs — Home, My Courses, Community, Notifications, Profile. Active tab highlighted.
- **Desktop**: Left sidebar with same navigation items + user avatar at bottom. Collapsible on smaller screens.

**Instructor App:**
- **Mobile**: Hamburger menu (top-left) opening a full-screen drawer. Navigation sections: Dashboard, Courses, Live Classes, Students, Analytics, Revenue, Settings.
- **Desktop**: Persistent left sidebar with sections and sub-items. User avatar + name at bottom.

**Admin App:**
- **Desktop-first**: Persistent left sidebar with collapsible sections — Overview, Users, Content (Moderation), Analytics, Reports, Security, Settings. Icons + labels.
- **Mobile**: Hamburger menu (responsive but desktop is primary).

**Shared patterns:**
- Breadcrumbs on sub-pages (e.g., Courses > [Course Name] > [Lecture Title])
- Active page highlighted in navigation
- Logo click → app dashboard (from any page)

### 8.2 Toast Notifications

Four variants, each with distinct color treatment:

| Variant | Color | Use Case |
|---|---|---|
| **Success** | Green | Action completed (saved, published, submitted) |
| **Error** | Red | Action failed, validation error |
| **Warning** | Yellow | Caution needed (unsaved changes, data limit) |
| **Info** | Blue/Indigo | Informational (new version, maintenance scheduled) |

**Structure**: Icon + Title (bold) + optional description + optional action button + dismiss (X) button

**Behavior**:
- Position: top-right (desktop), top-center (mobile)
- Auto-dismiss after 5 seconds
- Pause auto-dismiss on hover (desktop)
- Stack vertically when multiple toasts are active
- Animation: slide in from top, 300ms ease-out

### 8.3 Loading Skeletons

Gray placeholder blocks that match the dimensions of the content they replace, with a subtle shimmer/pulse animation. No spinners alongside skeletons.

**Types:**

| Skeleton Type | Used For | Shape |
|---|---|---|
| Card skeleton | Course cards, metric cards | Image rectangle + 2–3 text line rectangles |
| Table skeleton | Data tables, lists | Row-shaped rectangles with cell divisions |
| Form skeleton | Settings, profile pages | Input-shaped rectangles stacked vertically |
| Chart skeleton | Analytics charts | Large rectangle placeholder |

**Transition**: Skeleton fades out (300ms) → real content fades in (300ms). No layout shift.

### 8.4 Progress Indicators

**Linear Progress Bar** — Used for uploads, transcoding, bulk operations:
- Full-width bar with fill animation
- Percentage label + descriptive phase text
- Phases: Initializing (0–25%), Processing (25–75%), Finalizing (75–95%), Almost complete (95–100%)
- Shows ETA when available (e.g., "~2 minutes remaining")

**Circular Progress** — Used for API calls, authentication, single operations:
- Circle (64px) with thin (4px) stroke
- Percentage displayed in center
- Animated fill from 0 to current value

**Button Spinner** — Used for form submissions, action buttons:
- Small spinner replaces button text
- Button disabled while spinning
- Text changes to "Processing..." or "Saving..."

### 8.5 Empty States

Consistent layout when no data exists:

- **Illustration/icon**: Centered, large, themed to context
- **Headline**: Short, human-readable (e.g., "No courses yet", "No notifications")
- **Description**: One sentence explaining why (e.g., "You haven't enrolled in any courses yet.")
- **Primary action button**: Relevant CTA (e.g., "Browse Courses", "Create your first course")

Layout: vertically and horizontally centered within the content area.

### 8.6 Error States

Three levels of error handling:

**Inline errors** (form fields):
- Red border on the field
- Error message text below the field
- Clear once user starts correcting

**Toast errors** (action failures):
- Red toast notification (see 8.2)
- Optional "Retry" action button
- Non-blocking — user can continue other actions

**Full-page errors** (critical failures):
- Centered error illustration
- Error heading + description
- "Retry" primary button
- "Go to Dashboard" secondary button (fallback action)

**Offline detection**:
- Persistent yellow banner at top of page
- Icon + "You're offline" + "Some features may not work."
- Auto-dismisses when connection restored

### 8.7 Confirmation Dialogs

**Destructive action confirmation** (delete, deactivate, end class):
- Modal overlay (dimmed background)
- Warning icon
- Action description ("Are you sure you want to delete your account?")
- Consequence text ("This action cannot be undone.")
- Cancel button (secondary style)
- Confirm button (red/destructive style)

**Non-destructive confirmation** (publish course, submit quiz):
- Similar modal structure
- Confirm button in primary style (not red)
- May include a checkbox ("Don't show this again")

### 8.8 Real-time Patterns

**Connection status indicator** (pill-shaped badge):
- **Connected**: Green dot + "Connected"
- **Connecting**: Yellow pulsing dot + "Connecting..."
- **Disconnected**: Red dot + "Disconnected"
- Positioned in page header or relevant panel

**Typing indicator**:
- Three bouncing dots animation (staggered: 0ms, 150ms, 300ms)
- Text label: "[Name] is typing..."

**Online presence**:
- Small dot on user avatar
- Green dot (bottom-right) = online, full opacity avatar
- Gray dot = offline, reduced opacity avatar (60%)

**Live indicator**:
- Red badge: pulsing white dot + "LIVE" text
- Positioned at top-left of video/content area
- Only visible during active live sessions

### 8.9 Pagination & Infinite Scroll

**Pagination** (tables, admin lists):
- Page number buttons with active state
- Previous / Next arrows
- Items-per-page selector (10, 25, 50, 100)
- Total count display ("Showing 1–10 of 256")

**Infinite scroll** (feeds, community, notifications):
- Content loads automatically as user scrolls near bottom
- Loading indicator at bottom during fetch
- "Load more" button as fallback if auto-load fails
- New items fade in with 50ms stagger between items

### 8.10 Animation Timing Reference

| Speed | Duration | Use Cases |
|---|---|---|
| **Fast** | 150ms | Micro-interactions: button hover, toggle, checkbox, focus states |
| **Medium** | 300ms | Content transitions: page transitions, content fade-in, toast slide, modal open |
| **Slow** | 500ms | Complex transitions: full-page transitions, multi-element animations |

**Easing**:
- **Entrance**: ease-out (elements appear smoothly)
- **Exit**: ease-in (elements disappear smoothly)
- **In-out**: ease-in-out (moving elements, modals)

**Stagger**: 50ms delay between sequential list items for a natural cascading effect.
