# UI Component Architecture & Layout Specifications

**Version:** 1.0  
**Status:** Implementation Ready  
**Last Updated:** May 2026

---

## Overview

This document provides detailed wireframes, component structures, and page layouts for all four applications in the EduTech platform.

---

## Table of Contents

1. [Landing Page Architecture](#landing-page-architecture)
2. [Authentication Flows](#authentication-flows)
3. [Student App Architecture](#student-app-architecture)
4. [Instructor App Architecture](#instructor-app-architecture)
5. [Admin App Architecture](#admin-app-architecture)
6. [Navigation Patterns](#navigation-patterns)
7. [State Management UI](#state-management-ui)

---

## Landing Page Architecture

### Page Structure

```
┌─────────────────────────────────────┐
│         Top Navigation Bar          │
├─────────────────────────────────────┤
│                                     │
│         Hero Section                │ ← Full-height or 500px
│   - Headline (Poppins 48px)        │   Centered text with optional BG
│   - Subheading (Inter 18px)        │   image on right
│   - CTA Button (Primary)            │
│                                     │
├─────────────────────────────────────┤
│                                     │
│      Features Section               │ ← 3-4 feature cards
│   ┌──────────┐ ┌──────────┐        │   Grid layout
│   │ Icon     │ │ Icon     │        │   Card style
│   │ Title    │ │ Title    │        │
│   │ Desc     │ │ Desc     │        │
│   └──────────┘ └──────────┘        │
│                                     │
├─────────────────────────────────────┤
│                                     │
│    Social Proof Section             │ ← Testimonials + Stats
│   Testimonial Carousel (max 3)      │   Avatar, quote, name
│   Platform Stats (centered)         │
│                                     │
├─────────────────────────────────────┤
│                                     │
│     Bottom CTA Section              │ ← Colored block with CTA
│   Heading + Subheading              │
│   "Start Learning" Button           │
│                                     │
├─────────────────────────────────────┤
│         Footer                      │ ← Links, social, copyright
└─────────────────────────────────────┘
```

### Key Sections Breakdown

#### Hero Section (Desktop: 600px height, Mobile: 400px)

- **Layout:** Flexbox, centered content
- **Left/Center:** Text content (heading, subheading, CTA)
- **Right:** Background image or illustration (desktop only)
- **CTA Button:** Size large, primary color
- **Mobile:** Full-width text centered, image above

#### Features Grid

- **Desktop:** 4 columns (3–4 cards)
- **Tablet:** 2 columns
- **Mobile:** 1 column, full-width
- **Card Dimensions:** 280px width, 200px height
- **Content:** Icon (48px), title (16px, bold), description (14px)

#### Testimonials Carousel

- **Visible Items:** 1 (mobile), 1–2 (tablet), 3 (desktop)
- **Card Structure:** Avatar (40px), quote text, author name, rating (5 stars)
- **Carousel Controls:** Previous/Next buttons, dot indicators
- **Auto-rotate:** Every 5 seconds (pausable on hover)

#### Stats Section

- **Layout:** Flex row, centered
- **Stat Cards:** Number (24px bold), label (14px)
- **Example:** "50K+ Students" | "1000+ Courses" | "500+ Instructors"
- **Count:** 3 stats

---

## Authentication Flows

### Login Page

```
┌────────────────────────────────────────┐
│                                        │
│     Centered Card (500px max width)    │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  "Welcome Back"                  │  │ ← H2, Poppins 24px
│  │  "Sign in to your account"       │  │ ← Body, Inter 14px, gray
│  │                                  │  │
│  │  Email Input Field               │  │ ← Full-width
│  │  [your@email.com] ─────────────  │  │
│  │                                  │  │
│  │  Password Input Field            │  │ ← With show/hide toggle
│  │  [••••••••] ─────────────────    │  │ ← Right icon: eye
│  │                                  │  │
│  │  "Forgot password?" ← Link       │  │ ← Right-aligned text link
│  │                                  │  │
│  │  ┌──────────────────────────┐    │  │
│  │  │ Sign In                  │    │  │ ← Primary button, full-width
│  │  └──────────────────────────┘    │  │
│  │                                  │  │
│  │  ─────── OR ───────              │  │ ← Divider line with text
│  │                                  │  │
│  │  ┌──────────┐ ┌──────────┐       │  │
│  │  │ 🔵 Google│ │ 🐱 GitHub│       │  │ ← OAuth buttons
│  │  └──────────┘ └──────────┘       │  │
│  │                                  │  │
│  │  "Don't have account?             │  │ ← Helper text
│  │   Sign Up" ← Link                 │  │
│  └──────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

### Registration Page

```
┌────────────────────────────────────────┐
│  Centered Card (500px max width)       │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  "Create Account"                │  │ ← H2, centered
│  │  Role Selection (inline toggle)  │  │
│  │  ┌─────────────┬─────────────┐   │  │
│  │  │  Student    │ Instructor  │   │  │ ← Segmented control
│  │  └─────────────┴─────────────┘   │  │
│  │                                  │  │
│  │  Name Input Field (full-width)   │  │
│  │                                  │  │
│  │  Email Input Field (full-width)  │  │
│  │                                  │  │
│  │  6-Digit Code Input (optional)   │  │ ← For email verification
│  │  [0][0][0][0][0][0]              │  │
│  │                                  │  │
│  │  Password Field                  │  │
│  │  Password Strength Indicator:    │  │
│  │  ▓▓░░░ Weak                      │  │ ← Color coded
│  │                                  │  │
│  │  Confirm Password Field          │  │
│  │                                  │  │
│  │  ┌──────────────────────────┐    │  │
│  │  │ Create Account           │    │  │ ← Primary button
│  │  └──────────────────────────┘    │  │
│  │                                  │  │
│  │  "Already have account?          │  │
│  │   Sign In" ← Link                │  │
│  └──────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

### 6-Digit Code Entry

```
Inline verification code entry:
[0] [0] [0] [0] [0] [0]
     ↑ Each box 40px, auto-focus next
```

- **Box dimensions:** 40px × 40px
- **Font:** 24px, monospace, bold
- **Border:** 2px solid on focus, 1px gray otherwise
- **Auto-advance:** Tab to next on input
- **Copy-paste:** Support pasting full code

---

## Student App Architecture

### Bottom Tab Navigation (Mobile)

```
                    Screen Content
┌──────────────────────────────────────┐
│                                      │
│   [Course player, Dashboard, etc]    │
│                                      │
├──────────────────────────────────────┤
│ 🏠      📚      👥      💬      👤   │ ← 64px height
│ Home    Courses Community Messages Profile
│  (2)                  (1)             │ ← Badge count on icons
└──────────────────────────────────────┘
```

- **Height:** 64px
- **Icons:** 24px
- **Labels:** 12px bold
- **Active Color:** #2563EB
- **Inactive Color:** #9CA3AF
- **Badge:** 16–20px circle, red background, white text

### Sidebar Navigation (Desktop)

```
┌──────────────────┐
│   Logo [x]       │ 240px width
├──────────────────┤
│ 🏠 Home          │ ← Active (blue BG)
│                  │
│ 📚 My Courses    │
│                  │
│ 🎓 Explore       │
│                  │
│ 👥 Community     │
│                  │
│ 💬 Messages (2)  │ ← With badge
│                  │
├──────────────────┤
│ ⚙️ Settings      │
│ 🚪 Logout        │
└──────────────────┘
```

- **Width:** 240px
- **Item Height:** 44px
- **Item Padding:** 12px 16px
- **Active State:** Blue background + white text
- **Icons:** 20px

### Dashboard (Student App)

```
┌─────────────────────────────────────┐
│ Status Bar (safe area)              │
├─────────────────────────────────────┤
│                                     │
│  👋 "Welcome, Amit!"      🔔 (3)   │ ← Header with greeting + notification
│                                     │
├─────────────────────────────────────┤
│                                     │
│  "Continue Learning"        >       │ ← Section header with link
│                                     │
│  ┌─────────────────────┐            │
│  │ 📹 Advanced Python  │            │
│  │ Instructor Name     │            │
│  │ 45% ▓▓▓▓░░░░░░░░░  │            │ ← Swipeable on mobile
│  │ Watched 2h ago      │            │
│  └─────────────────────┘            │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  "Enrolled Courses"         >       │ ← Scrollable grid
│                                     │
│  ┌──────────────┐ ┌──────────────┐  │
│  │ 📹 Web Dev   │ │ 📹 Java      │  │ ← 2 columns mobile, 3-4 desktop
│  │ 60%          │ │ 30%          │  │
│  │              │ │              │  │
│  └──────────────┘ └──────────────┘  │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  "Upcoming Classes"         >       │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🔴 LIVE - Web Dev Q&A      │    │ ← Live badge
│  │ In 30 mins • 45 participants│    │
│  │ [Join] [Remind me]          │    │
│  └─────────────────────────────┘    │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  [Browse Courses]  [View Certs]    │ ← Quick action buttons
│                                     │
│  Tab Bar (bottom mobile)            │
└─────────────────────────────────────┘
```

### Course Catalog

```
┌──────────────────────────────────────┐
│  Search Bar (sticky, full-width)     │
│  [🔍 Search courses...]              │
├──────────────────────────────────────┤
│                                      │
│  Filter Chips (scrollable):          │
│  ✕ Coding  ✕ Free  ↕ Sort: Popular  │
│                                      │
│  Results: 1,234 courses              │
│                                      │
├──────────────────────────────────────┤
│                                      │
│  ┌──────────────┐ ┌──────────────┐   │
│  │ 📹 Python    │ │ 📹 React     │   │
│  │ Rajesh       │ │ Priya        │   │ ← 2-column grid on mobile
│  │ ₹999         │ │ ₹1,499       │   │
│  │ ⭐ 4.8 (520) │ │ ⭐ 4.6 (340) │   │
│  │              │ │              │   │
│  └──────────────┘ └──────────────┘   │
│                                      │
│  Pagination or scroll-to-load more   │
│                                      │
└──────────────────────────────────────┘
```

### Course Detail

```
┌──────────────────────────────────────┐
│ [<] Course                      [⋯]  │ ← Header with back & menu
├──────────────────────────────────────┤
│                                      │
│  ┌──────────────────────────────┐    │
│  │ 📹                           │    │ ← Thumbnail 16:9
│  │ Course Thumbnail             │    │
│  │ ▶ Play Preview Video         │    │
│  └──────────────────────────────┘    │
│                                      │
│  Python Mastery Course               │ ← Title
│                                      │
│  Instructor: Rajesh Singh            │
│  👤 Verified Instructor ★ 4.8 (520)  │
│                                      │
│  Price & CTA:                        │
│  ₹999 [Enroll Now]                   │ ← Sticky on mobile
│                                      │
│  Description:                        │
│  Learn Python from scratch...        │
│  [Read More]                         │
│                                      │
├──────────────────────────────────────┤
│  SYLLABUS                            │
│                                      │
│  ▼ Module 1: Basics                  │ ← Expandable
│    • Lecture 1: History (15 min)     │
│    • Lecture 2: Setup (10 min)       │
│    📹 Free Preview                   │ ← Free badge
│                                      │
│  ▶ Module 2: Advanced (collapsed)    │
│                                      │
├──────────────────────────────────────┤
│  INSTRUCTOR                          │
│                                      │
│  👤 Rajesh Singh                     │
│  Verified Instructor, 10+ years exp  │
│  450K+ Students                      │
│                                      │
│  [Follow]                            │
│                                      │
├──────────────────────────────────────┤
│  REVIEWS (4.8 out of 5)              │
│                                      │
│  ⭐⭐⭐⭐⭐ 520 reviews                 │
│                                      │
│  "Great course! Very helpful"        │
│  - Amit Kumar, 2 weeks ago           │
│                                      │
│  [Load More Reviews]                 │
│                                      │
│  [Enroll Now] ← Sticky bottom mobile │
│                                      │
└──────────────────────────────────────┘
```

### Video Player Layout

#### Desktop (1280px+)

```
┌────────────────────────────────────────────────┐
│           Video Player (16:9)                  │
├───────────────────────────────────┬────────────┤
│                                   │ Lecture    │
│   [Playing video content]         │ List       │
│                                   │ (240px)    │
│   Controls Bar:                   │            │
│   ▶ ─────────[●]─── ⊙ 🔊 1.5x ⛶  │ 1. Intro   │
│                                   │ 2. Setup   │
│                                   │ 3. Basics  │
│                                   │ 4. Adv.    │
│                                   │            │
│                                   │ [Mark Done]│
│                                   │ [Auto Next]│
└───────────────────────────────────┴────────────┘
```

#### Mobile

```
┌──────────────────────────────────────┐
│  Video Player (full-width, 16:9)     │
│                                      │
│  [Video Content]                     │
│                                      │
│  Controls (overlay on video):        │
│  ▶ ─────────[●]─── ⊙ 🔊 1.5x ⛶     │
│                                      │
├──────────────────────────────────────┤
│ < Python Basics (Lecture 2 of 15)    │
│                                      │
│ Duration: 45:30                      │
│ Watched: 2 weeks ago                 │
│                                      │
│ [Mark as Complete]                   │
│ [Next Lecture >]                     │
│                                      │
│ Description:                         │
│ "In this lecture we cover..."        │
│                                      │
│ [Show Lecture List] ← Opens drawer   │
│                                      │
│ [< Back]  [Continue >]               │
│                                      │
│ Lecture List (Drawer on mobile):     │
│ ↓ Tap to expand                      │
│ ├─ 1. Intro (15m) ✓                  │
│ ├─ 2. Setup (20m) ✓                  │
│ ├─ 3. Basics (45m) ●← Current        │
│ └─ 4. Advanced (30m)                 │
│                                      │
└──────────────────────────────────────┘
```

### Quiz Interface

```
┌──────────────────────────────────────┐
│  Quiz: Module 3 Test                 │
│  ⏱ 15:42  Progress: 3 of 10          │ ← Header with timer
├──────────────────────────────────────┤
│                                      │
│  Question 3 of 10                    │
│                                      │
│  "What is the output of...?"         │ ← Question text
│  [Image if attached]                 │
│                                      │
│  Answer Options:                     │
│  ○ Option A                          │ ← Radio buttons
│  ○ Option B                          │
│  ○ Option C (marked for review)      │ ← Yellow highlight
│  ○ Option D                          │
│                                      │
│  Question Navigation:                │
│  [1] [2] [3*] [4] [5*] [6] ...      │ ← Numbered buttons
│       * = marked for review          │
│                                      │
│  [< Previous]  [Next >]              │
│  [Submit Quiz]                       │ ← Primary button
│                                      │
└──────────────────────────────────────┘

Results Screen:
┌──────────────────────────────────────┐
│  Quiz Completed!                     │
│                                      │
│  Your Score: 8/10 (80%)              │ ← Large score display
│  ⭐⭐⭐⭐ Excellent!                   │
│                                      │
│  Correct: 8  |  Incorrect: 2         │
│                                      │
│  [Review Answers]  [Continue]        │
│                                      │
└──────────────────────────────────────┘
```

### Assignments

```
Assignment List:
┌──────────────────────────────────────┐
│  [<] Python Assignments              │
├──────────────────────────────────────┤
│ Filters: Status [All ▼]  Sort by     │
├──────────────────────────────────────┤
│                                      │
│ Assignment 1: Variables              │ ← Card
│ Due: Mar 15, 2026                    │
│ Status: [Not Started] (gray badge)   │
│                                      │
│ Assignment 2: Functions              │
│ Due: Mar 18, 2026                    │
│ Status: [Submitted] (green badge)    │
│ Grade: 92/100                        │
│                                      │
│ Assignment 3: OOP                    │
│ Due: Mar 20, 2026 (5 days left)      │
│ Status: [Graded] (blue badge)        │
│                                      │
└──────────────────────────────────────┘

Assignment Submission:
┌──────────────────────────────────────┐
│  Assignment: Variables               │
│  Due: Mar 15, 2026(5 days left)      │
├──────────────────────────────────────┤
│                                      │
│  Instructions:                       │
│  "Complete the following tasks..."   │
│  [Download_Assignment.pdf] (2MB)     │
│                                      │
├──────────────────────────────────────┤
│  Your Submission:                    │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ 📁 Drag files here or click    │  │ ← Drag-drop zone
│  │                                │  │
│  │ Supported: .pdf, .doc, .py, .zip│ │
│  │ Max size: 50MB                 │  │
│  └────────────────────────────────┘  │
│                                      │
│  Files:                              │
│  • solution.py (2.5MB) [✕]           │ ← Remove button
│  • notes.pdf (1.2MB) [✕]             │
│                                      │
│  [Submit Assignment]                 │ ← Primary button
│                                      │
│  Submission History:                 │
│  Mar 13 - 11:45 AM - 1st attempt     │ ← Earlier submissions
│  Status: Submitted | Grade: Pending  │
│                                      │
│  Feedback (after grading):           │
│  ⭐⭐⭐⭐☆ 92/100                     │
│  "Great solution! Nice comments."    │
│                                      │
└──────────────────────────────────────┘
```

---

## Instructor App Architecture

### Instructor Dashboard

```
┌──────────────────────────────────────┐
│  Hello, Rajesh!    🔔 (2)   👤 [⋯]   │
├──────────────────────────────────────┤
│                                      │
│  Quick Stats (3-4 cards):            │
│  ┌──────────┐ ┌──────────┐           │
│  │  450K    │ │  $50K    │           │
│  │ Students │ │ Revenue  │           │
│  │ ↑ 5% MoM │ │ ↑ 12%    │           │
│  └──────────┘ └──────────┘           │
│                                      │
│  [Create Course] [View Analytics]    │
│                                      │
├──────────────────────────────────────┤
│  My Courses                          │
│                                      │
│  ┌─────────────────────────────┐    │
│  │ Python Mastery (Active)     │    │ ← Course card
│  │ 1,240 students | $40K revenue│   │
│  │ Last updated: 2 days ago    │    │
│  │ [Edit] [Analytics] [Settings]   │ ← Actions
│  └─────────────────────────────┘    │
│                                      │
│  ┌─────────────────────────────┐    │
│  │ Web Dev 101 (Active)        │    │
│  │ 890 students | $28K revenue │    │
│  │ ...                         │    │
│  └─────────────────────────────┘    │
│                                      │
│  [View All Courses]                  │
│                                      │
├──────────────────────────────────────┤
│  Pending Tasks                       │
│                                      │
│  • 12 assignments to grade           │
│  • 5 student messages awaiting reply │
│  • Course review pending             │
│                                      │
└──────────────────────────────────────┘
```

### Course Creator

```
Step 1: Course Info
┌──────────────────────────────────┐
│ [<] Create New Course     [Skip] │
├──────────────────────────────────┤
│                                  │
│ Course Title                     │
│ [e.g., Python Basics............] │
│                                  │
│ Course Description               │
│ [Large text area]                │
│ (Supports markdown)              │
│                                  │
│ Domain Category                  │
│ [Coding ▼]                      │
│                                  │
│ Price (₹)                        │
│ [999]  or  [☑ Free]              │
│                                  │
│ Course Thumbnail                 │
│ [Upload Image] or [Choose from library] │
│ Recommended: 1920x1080           │
│                                  │
│ [Cancel]  [Next: Create Modules] │
│                                  │
└──────────────────────────────────┘

Step 2: Modules & Content
┌──────────────────────────────────┐
│ [<] Course Modules               │
├──────────────────────────────────┤
│                                  │
│ Modules:                         │
│                                  │
│ ▼ Module 1: Python Basics       │ ← Collapsible
│   • Lecture 1: History (15m)    │
│   • Lecture 2: Setup (20m)      │
│   • Quiz: Module 1 Check        │
│   [+ Add Lecture] [Delete Module]│
│                                  │
│ ▶ Module 2: Data Types          │ ← Collapsed
│   [+ Add Lecture] [Delete Module]│
│                                  │
│ [+ Add New Module]               │
│                                  │
│ [Cancel]  [Publish Course]       │
│                                  │
└──────────────────────────────────┘
```

---

## Admin App Architecture

### Admin Dashboard (Desktop-only layout)

```
┌────────────────────────────────────────────────────┐
│ Logo    🔍 Search    🔔 (5)    👤 [⋯]              │ ← Top bar
├────────────────────────────────────────────────────┤
│                                                    │
│ [Sidebar]     Main Content Area                    │
│ • Dashboard   ┌──────────────────────────────────┐ │
│ • Users       │  Platform Overview               │ │
│ • Courses     │  ┌────────┐ ┌────────┐            │ │
│ • Analytics   │  │ 450K   │ │ 1,240  │            │ │
│ • Moderation  │  │ Users  │ │ Courses│            │ │
│ • Settings    │  └────────┘ └────────┘            │ │
│               │                                   │ │
│               │  ┌────────┐ ┌────────┐            │ │
│               │  │ 8,950  │ │ $2.1M  │            │ │
│               │  │Revenue │ │ GMV    │            │ │
│               │  └────────┘ └────────┘            │ │
│               │                                   │ │
│               │  Recent Activity / Charts         │ │
│               │                                   │ │
│               └──────────────────────────────────┘ │
│                                                    │
└────────────────────────────────────────────────────┘
```

### User Management

```
┌────────────────────────────────────────────────────┐
│ Users                                   [+ New]    │
├────────────────────────────────────────────────────┤
│                                                    │
│ Filter: Role [All ▼] | Status [Active ▼]          │
│ Search: [🔍 email or name...]                      │
│                                                    │
│ ┌────────────────────────────────────────────────┐ │
│ │ Name    | Email          | Role      | Status │ │
│ ├────────────────────────────────────────────────┤ │
│ │ Amit    │ amit@email.com │ Student   │ Active │ │
│ │ Priya   │ priya@...      │ Instructor│ Active │ │
│ │ Rajesh  │ rajesh@...     │ Instructor│ Pending│ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ Pagination: < 1 2 3 4 5 >                         │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Navigation Patterns

### Mobile Bottom Tab Pattern

```
When on Dashboard:
🏠 (active, blue)   📚   👥   💬   👤

When on Courses:
🏠   📚 (active, blue)   👥   💬   👤

On mobile landscape:
[Sidebar collapsed - hamburger menu]
or
[Reduced tab labels, icons only]
```

### Desktop Sidebar Toggle

```
Sidebar Open:
240px sidebar + responsive main content

Sidebar Collapsed (click hamburger):
48px icon-only sidebar + expanded main content

On hover (collapsed state):
Tooltip shows full text
```

---

## State Management UI

### Loading States

```
Skeleton for Dashboard:
┌─────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░  │ ← Shimmer animation
│                         │
│ ░░░░░░░░░ (Shimmer)     │
│                         │
│ ░░░░░░░ ░░░░░░░ ░░░░░░░│
│                         │
│ [Skeleton course cards] │
│                         │
└─────────────────────────┘
```

### Empty States

```
No Courses:
┌──────────────────────────┐
│                          │
│    [Illustration]        │ ← SVG empty box icon
│                          │
│  No courses yet          │ ← Friendly message
│                          │
│  "Start by exploring     │
│   available courses      │
│   or create your own"    │
│                          │
│  [Browse Courses]        │ ← CTA button
│                          │
└──────────────────────────┘
```

### Error States

```
Failed to Load:
┌──────────────────────────┐
│  ⚠ Something went wrong   │ ← Error icon + message
│                          │
│  We couldn't load your   │
│  courses. Please try     │
│  again.                  │
│                          │
│  [Try Again]             │ ← Retry button
│                          │
│  [Contact Support]       │ ← Help link
│                          │
└──────────────────────────┘
```

---

## Responsive Grid System

### Breakpoints & Columns

| Breakpoint | Width | Columns | Gutter |
|-----------|-------|---------|--------|
| Mobile | 320px–480px | 1 | 12px |
| Small Mobile | 480px–768px | 2 | 12px |
| Tablet | 768px–1024px | 2–3 | 16px |
| Desktop | 1024px–1440px | 3–4 | 24px |
| Large | 1440px+ | 4–6 | 32px |

### Example: Course Card Grid

```
Mobile (320px):
┌─────────────────┐
│  Course Card    │
│  (full width)   │
└─────────────────┘
┌─────────────────┐
│  Course Card    │
└─────────────────┘

Tablet (768px):
┌──────────┐ ┌──────────┐
│ Course 1 │ │ Course 2 │
└──────────┘ └──────────┘

Desktop (1024px+):
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ C1     │ │ C2     │ │ C3     │ │ C4     │
└────────┘ └────────┘ └────────┘ └────────┘
```

---

## Implementation Priority

### Phase 1 (MVP)
- [ ] Landing page hero + CTA
- [ ] Auth pages (login, signup, forgot password)
- [ ] Student dashboard
- [ ] Course catalog with search
- [ ] Course detail page
- [ ] Video player basic

### Phase 2 (Student Features)
- [ ] My Courses
- [ ] Assignments submission
- [ ] Quiz system
- [ ] Community forums
- [ ] Live class UI

### Phase 3 (Instructor + Admin)
- [ ] Instructor dashboard
- [ ] Course creator wizard
- [ ] Admin user management
- [ ] Admin analytics
- [ ] Moderation queue

### Phase 4 (Polish)
- [ ] Dark mode
- [ ] Internationalization
- [ ] Advanced analytics
- [ ] Performance optimization

---

**End of Component Architecture Document**
