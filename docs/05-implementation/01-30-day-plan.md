# 30-Day Implementation Plan

> **Purpose:** Canonical day-by-day implementation plan with testing requirements and post-30 checklist
> **Source:** 30_DAY_IMPLEMENTATION_PLAN.md (canonical), clever-circuit (2 extra post-30-day items)
> **See also:** [Testing Strategy](../04-engineering/01-testing-strategy.md) | [Security](../04-engineering/02-security.md) | [Scope](./02-scope.md)

---

## Table of Contents

- [Phase 1: Foundation & Infrastructure (Days 1–7)](#phase-1-foundation--infrastructure-days-17)
  - [Day 1 — Monorepo Setup & Project Scaffolding](#day-1--monorepo-setup--project-scaffolding)
  - [Day 2 — NestJS Bootstrap & Module Structure](#day-2--nestjs-bootstrap--module-structure)
  - [Day 3 — Database Design & Drizzle ORM Setup](#day-3--database-design--drizzle-orm-setup)
  - [Day 4 — Redis Integration & Background Jobs](#day-4--redis-integration--background-jobs)
  - [Day 5 — Testing Infrastructure Finalization](#day-5--testing-infrastructure-finalization)
  - [Day 6 — Auth System Implementation](#day-6--auth-system-implementation)
  - [Day 7 — Next.js Frontend Scaffold & Auth Pages](#day-7--nextjs-frontend-scaffold--auth-pages)
- [Phase 2: Course Platform & Upload Pipeline (Days 8–14)](#phase-2-course-platform--upload-pipeline-days-814)
  - [Day 8 — Course CRUD Backend](#day-8--course-crud-backend)
  - [Day 9 — Instructor Dashboard Frontend](#day-9--instructor-dashboard-frontend)
  - [Day 10 — Upload Pipeline (S3 Signed URLs)](#day-10--upload-pipeline-s3-signed-urls)
  - [Day 11 — Mux Integration](#day-11--mux-integration)
  - [Day 12 — Student Course Pages Frontend](#day-12--student-course-pages-frontend)
  - [Day 13 — Video Player & Progress Tracking](#day-13--video-player--progress-tracking)
  - [Day 14 — Payment Integration (Razorpay)](#day-14--payment-integration-razorpay)
- [Phase 3: Realtime, Engagement & Live Classes (Days 15–21)](#phase-3-realtime-engagement--live-classes-days-1521)
  - [Day 15 — Socket.IO Gateway](#day-15--socketio-gateway)
  - [Day 16 — Chat System](#day-16--chat-system)
  - [Day 17 — LiveKit Integration](#day-17--livekit-integration)
  - [Day 18 — Live Class Scheduling & Recording Pipeline](#day-18--live-class-scheduling--recording-pipeline)
  - [Day 19 — Assignments & Quizzes Backend](#day-19--assignments--quizzes-backend)
  - [Day 20 — Assignments & Quizzes Frontend](#day-20--assignments--quizzes-frontend)
  - [Day 21 — Certificates & PostHog Analytics](#day-21--certificates--posthog-analytics)
- [Phase 4: Stabilization, Admin & Production Readiness (Days 22–30)](#phase-4-stabilization-admin--production-readiness-days-2230)
  - [Day 22 — Admin Dashboard: User Management](#day-22--admin-dashboard-user-management)
  - [Day 23 — Admin Dashboard: Instructor Approval & Course Moderation](#day-23--admin-dashboard-instructor-approval--course-moderation)
  - [Day 24 — Performance Optimization](#day-24--performance-optimization)
  - [Day 25 — Security Audit](#day-25--security-audit)
  - [Day 26 — E2E Testing: Core Flows](#day-26--e2e-testing-core-flows)
  - [Day 27 — E2E Testing: Edge Cases & Error Paths](#day-27--e2e-testing-edge-cases--error-paths)
  - [Day 28 — Error Monitoring & Logging](#day-28--error-monitoring--logging)
  - [Day 29 — Documentation & API Docs](#day-29--documentation--api-docs)
  - [Day 30 — Final Polish, Launch Prep](#day-30--final-polish-launch-prep)
- [Post-30-Day Checklist](#post-30-day-checklist)

---

> **Contingency Note:** This plan is aggressive for a solo developer. If behind schedule by more than 1 day, defer the lowest-priority items per day to the Phase 2 backlog. Days 28–30 are buffer days for catching up. Non-critical items can be deferred without blocking launch. Never skip testing to save time.

## UX States Requirements

All implementation days must include comprehensive UX states for loading, error, and success scenarios. Refer to the [UX States Specification](../04-engineering/06-ux-states-specification.md) for detailed requirements.

### Core UX Components Required:
- **Loading States**: Skeleton screens, progress indicators, spinners
- **Error States**: Error boundaries, retry mechanisms, fallback content
- **Success States**: Success notifications, completion indicators
- **Real-time States**: Connection indicators, typing indicators, presence updates

### Performance Requirements:
- **First Contentful Paint** < 1.5s for all pages
- **Time to Interactive** < 3.0s for complex pages
- **Loading Progress** must always show ETA for operations > 2s
- **Error Recovery** must provide clear retry options

### Accessibility Requirements:
- All loading states must be screen reader accessible
- Error messages must be descriptive and actionable
- Keyboard navigation must work in all states
- Color contrast must meet WCAG 2.1 AA standards

### Implementation Guidelines:
- Use shared UI components from `/packages/shared-components`
- Implement TanStack Query for loading/error states
- Use React Error Boundaries for error handling
- Follow the animation system (150ms-500ms durations)
- Ensure all states are responsive and mobile-friendly

## Phase 1: Foundation & Infrastructure (Days 1–7)

---

### Day 1 — Monorepo Setup & Project Scaffolding

**Goal:** Turborepo monorepo with shared packages, linting, formatting, CI/CD

| Task | Details |
|---|---|
| Initialize Turborepo | Root `package.json`, `turbo.json`, workspace configuration |
| Scaffold apps | `apps/web-student` (Next.js), `apps/web-instructor` (Next.js), `apps/web-admin` (Next.js), `apps/web-landing` (Next.js, marketing/landing page), `apps/api` (NestJS) |
| Scaffold shared packages | `packages/ui` (ShadCN), `packages/types` (TypeScript types), `packages/validation` (Zod schemas), `packages/api-client` (typed client), `packages/config` (ESLint, TSConfig), `packages/shared-components` (cross-app UI components) |
| Code quality | ESLint config, Prettier config, Husky pre-commit hooks, lint-staged |
| CI/CD pipeline | GitHub Actions workflow — lint, typecheck, test, build (per-app pipelines, affected-only builds) |
| **.env.example** | Document all required environment variables (per-app and shared) |
| **Landing page scaffold** | `apps/web-landing` — Next.js App Router, TailwindCSS, standalone output, port 3003, minimal deps (no API client/state management) |

**UX State Requirements:**
- **Loading States**: Create shared loading components (Spinner, Skeleton, Progress)
- **Error States**: Implement basic error boundary for development environment
- **Component Library**: Set up base UI components with loading/error states
- **Theme System**: Configure TailwindCSS with color system for UX states
- **Accessibility**: Ensure all components meet WCAG 2.1 AA standards

**Tests Required:**
- Unit tests for all shared Zod schemas in `/packages/validation`
- Unit tests for all TypeScript type utility functions in `/packages/types`
- Integration tests for ESLint/Prettier config validation
- CI pipeline test: verify all checks pass on empty scaffold
- CI pipeline test: verify affected-apps filtering works correctly
- **UX Tests**: Test shared loading components accessibility and responsiveness

**Exit Criteria:** `turbo run build` succeeds, `turbo run test` passes (all scaffold tests), Husky blocks commits on lint failure, CI builds only affected apps, shared UI components implemented with loading/error states, `apps/web-landing` scaffolded and builds successfully

---

### Day 2 — NestJS Bootstrap & Module Structure

**Goal:** NestJS backend running with all core module stubs

| Task | Details |
|---|---|
| NestJS app setup | `apps/api` — main module, global pipes, interceptors, exception filters |
| Module scaffolding | `auth`, `users`, `courses`, `enrollments`, `uploads`, `media`, `live`, `payments`, `notifications`, `chat`, `assignments`, `certificates`, `analytics`, `admin` |
| Global interceptors | Response envelope interceptor (standardized `{success, data, meta, error}` format) |
| Validation pipe | Global Zod validation pipe with detailed error messages |
| Configuration module | `@nestjs/config` with typed environment variables, Zod validation |
| Docker setup | `Dockerfile` for API, `docker-compose.yml` for local dev (PostgreSQL + Redis) |

**UX State Requirements:**
- **Error Handling**: Implement global error interceptor with standardized error responses
- **Validation**: Create detailed error messages for all validation failures
- **Response Format**: Ensure all API responses include loading/error state metadata
- **Logging**: Add structured logging for UX state tracking
- **API Documentation**: Document error codes and messages for frontend consumption

**Tests Required:**
- Unit tests for response envelope interceptor
- Unit tests for Zod validation pipe (valid input, invalid input, edge cases)
- Unit tests for configuration module (valid env, missing vars, invalid types)
- Integration tests for each module stub (module loads, provider injects)
- E2E test: health check endpoint returns 200 with correct response shape
- **UX Tests**: Test error interceptor handles all error types correctly
- **UX Tests**: Validate API response format includes error state information

**Exit Criteria:** `npm run start:dev` works, all module tests pass, Docker compose starts successfully, global error handling implemented, API responses include standardized error states

---

### Day 3 — Database Design & Drizzle ORM Setup

**Goal:** All core schemas defined, migrated, and tested

| Task | Details |
|---|---|
| Drizzle ORM setup | Schema definitions for ALL tables listed in [Database Schema](../02-architecture/04-database.md) |
| Schema files | `users`, `instructor_profiles`, `student_profiles`, `courses`, `sections`, `lectures`, `enrollments`, `progress`, `live_classes`, `assignments`, `submissions`, `certificates`, `payments`, `messages`, `channels` |
| Relations | Foreign keys, cascading deletes, unique constraints, indexes |
| Migration setup | `drizzle-kit` configured, migration generation and apply scripts |
| Seed script | Development seed data (1 admin, 1 instructor, 2 students, 1 course) |
| Database connection | Connection pool, error handling, graceful shutdown |

**UX State Requirements:**
- **Data Loading**: Create repository pattern with loading state management
- **Error Handling**: Implement database error handling with user-friendly messages
- **Soft Deletes**: Ensure all queries automatically filter soft-deleted records
- **Data Validation**: Add database-level constraints for UX data integrity
- **Caching Strategy**: Implement caching for frequently accessed data
- **Connection Management**: Handle connection failures gracefully with retry logic

**Tests Required:**
- Unit tests for each schema definition (column types, constraints, defaults)
- Unit tests for relation definitions (foreign keys, cascades)
- Integration tests for each CRUD operation against test database (create, read, update, delete)
- Integration tests for constraint enforcement (unique violation, FK violation, NOT NULL violation)
- Integration tests for seed script (creates expected records, idempotent)
- E2E test: full migration run from scratch succeeds with no errors
- **UX Tests**: Test repository pattern handles loading states correctly
- **UX Tests**: Validate database error handling provides user-friendly messages
- **UX Tests**: Test soft delete filtering works for all user-facing queries

**Exit Criteria:** All schemas match [Database Schema](../02-architecture/04-database.md), migrations apply cleanly, all tests pass, seed script works, repository pattern implemented with loading/error states

---

### Day 4 — Redis Integration & Background Jobs

**Goal:** Redis connected, BullMQ queue operational

| Task | Details |
|---|---|
| Redis connection | Upstash Redis integration (dev: local Redis via docker-compose) |
| Redis module | NestJS Redis module with connection health checks |
| BullMQ setup | Queue definitions: `media-processing`, `email-notifications`, `certificate-generation` |
| Queue processors | Worker stubs for each queue |
| Rate limiting | Redis-backed rate limiter middleware (per-IP, per-user) |
| Cache utilities | Generic cache service with TTL, invalidation, key namespacing |

**UX State Requirements:**
- **Connection Management**: Implement Redis connection status indicators
- **Queue Progress**: Create job progress tracking for long-running operations
- **Rate Limiting**: Implement user-friendly rate limit exceeded messages
- **Cache Management**: Add cache invalidation triggers for data updates
- **Background Jobs**: Implement job status tracking with user feedback
- **Error Recovery**: Add retry logic for failed background jobs with user notifications

**Tests Required:**
- Unit tests for Redis connection service (connect, disconnect, reconnect, error handling)
- Unit tests for cache service (get, set, delete, TTL expiration, key namespacing)
- Unit tests for rate limiter (allows within limit, blocks over limit, resets after window)
- Integration tests for BullMQ queue creation and job enqueuing
- Integration tests for BullMQ worker processing (job completes, job fails, retry logic)
- E2E test: enqueue job → worker processes → result stored in DB
- **UX Tests**: Test Redis connection status indicators work correctly
- **UX Tests**: Validate job progress tracking provides accurate feedback
- **UX Tests**: Test rate limiting user messages are clear and actionable
- **UX Tests**: Test background job error recovery provides user notifications

**Exit Criteria:** Redis connected, queues operational, all tests pass with ≥80% coverage, job progress tracking implemented, rate limiting with user-friendly messages

---

### Day 5 — Testing Infrastructure Finalization

**Goal:** All testing frameworks configured, mock factories created, CI coverage gates

| Task | Details |
|---|---|
| Jest config (backend) | `jest.config.ts` — coverage thresholds (80% general, 95% critical paths: auth, payments, enrollments, certificates), reporters, test match patterns |
| Vitest config (per frontend app) | `vitest.config.ts` in each `apps/web-*` — coverage (80% general), RTL setup, Next.js path aliases |
| Playwright config (per frontend app) | `playwright.config.ts` in each `apps/web-*` — webServer, browsers, baseURL, test proxy for MSW |
| Mock factories | Factory functions for: User, Course, Lecture, Enrollment, Payment, Certificate, Assignment, Submission, Message, Channel |
| Database test helpers | Transactional test wrapper (rollback after each test), test DB seeding |
| CI coverage gates | GitHub Actions fails if coverage drops below 80% (general) / 95% (critical paths), coverage report artifacts (per-app reports) |
| MSW setup | Mock Service Worker for frontend API mocking, handlers for all v1 endpoints |

**UX State Requirements:**
- **Loading State Tests**: Create tests for all loading states (skeletons, spinners, progress bars)
- **Error State Tests**: Implement tests for error boundaries and error recovery
- **Accessibility Tests**: Add tests for UX state accessibility (screen readers, keyboard navigation)
- **Performance Tests**: Include loading performance tests for critical user flows
- **Mock Data**: Create comprehensive mock data for UX state testing
- **Visual Testing**: Add visual regression tests for loading/error states

**Tests Required:**
- Unit tests for all mock factories (generate valid data, respect types, customizable overrides)
- Unit tests for database test helpers (transaction isolation, rollback verification)
- Integration tests: Jest config correctly reports coverage thresholds (80% general, 95% critical) on test fixtures
- Integration tests: Vitest config correctly runs frontend unit tests (all 3 apps)
- E2E test: Playwright config starts Next.js dev server and runs a dummy test (all 3 apps)
- E2E test: CI pipeline correctly fails on coverage drop below thresholds
- Integration test: Turborepo affected-apps filtering correctly identifies changed apps
- **UX Tests**: Test all loading states render correctly and are accessible
- **UX Tests**: Validate error boundaries catch and display errors properly
- **UX Tests**: Test error recovery mechanisms work correctly
- **UX Tests**: Test accessibility of all UX states
- **UX Tests**: Include performance benchmarks for loading states

**Exit Criteria:** All test frameworks operational for all apps, mock factories cover all domain entities, CI enforces 80%+ general / 95%+ critical path coverage per app, comprehensive UX state testing implemented

---

### Day 6 — Auth System Implementation

**Goal:** JWT + refresh token flow, role middleware, OAuth skeleton

| Task | Details |
|---|---|
| Auth module | `apps/api/src/auth` — register, login, logout, refresh, OAuth callback |
| JWT strategy | Access token generation (15 min expiry), payload: userId, role, email |
| Refresh token strategy | Refresh token generation (30 day expiry), secure storage in DB. Token rotation: old token revoked on each use, new token issued |
| Password hashing | bcrypt with 12 salt rounds |
| Password policy | Zod schema: min 8 chars, 1 uppercase, 1 lowercase, 1 digit. Shared in `/packages/validation` |
| Account lockout | Redis-based: 5 failed attempts → 15-min lockout (`lockout:{email}`), email alert on lockout, admin unlock |
| Email-first registration | New flow: email → send 6-digit verification code → verify → set password + name → account created |
| Refresh token theft detection | On reuse of revoked token: revoke entire token family, force re-auth on all devices, email alert |
| Token invalidation on deactivation | Redis set `deactivated_users` checked by JWT middleware; deactivated users rejected immediately |
| OAuth skeleton | Google + GitHub provider configuration, Auth.js integration |
| Email verification | 6-digit code generation (bcrypt 10 rounds), verification endpoint, resend logic |
| Password reset | Token generation (bcrypt 10 rounds), email with reset link, password update endpoint |

**UX State Requirements:**
- **Loading States**: Implement loading spinners for all auth operations
- **Error Messages**: Create user-friendly error messages for all auth failures
- **Form Validation**: Add real-time validation with helpful error messages
- **Session Management**: Implement session expiration warnings and auto-refresh
- **Account Lockout**: Clear messaging for account lockout with unlock options
- **OAuth Flow**: Loading states for OAuth authentication and account linking
- **Email Verification**: Progress indicators for verification code flow
- **Password Reset**: Clear feedback for reset request and completion

**Tests Required:**
- Unit tests for refresh token service (generate, validate, revoke, expired, already-used, revoked token reuse triggers family revocation)
- Unit tests for password hashing (hash matches, wrong password fails, salt uniqueness)
- Unit tests for password policy Zod schema (valid, too short, no uppercase, no lowercase, no digit, edge cases)
- Unit tests for account lockout (5th attempt locks, 6th attempt returns locked, lock expires after 15 min, successful login resets counter)
- Unit tests for email-first registration flow (send code, verify code, expired code rejected, wrong code rejected, then register)
- Unit tests for token invalidation on deactivation (user deactivated → next request rejected even with valid JWT)
- Unit tests for role guard (allows correct role, denies wrong role, denies unauthenticated)
- Integration tests for registration (valid input, duplicate email, weak password, missing fields, email not verified)
- Integration tests for login (valid credentials, wrong password, unverified account, locked account, deactivated account)
- Integration tests for logout (token revoked, refresh after logout fails, all app sessions terminated)
- Integration tests for refresh (valid refresh, expired refresh, revoked refresh, reuse of revoked token triggers family revocation)
- Integration tests for OAuth callback (new user creation, existing user login, provider mismatch, unverified existing account → separate account)
- Integration tests for email verification (valid code, expired code, already verified)
- Integration tests for password reset (valid flow, expired token, token reuse)
- Integration tests for account lockout (5 failed → locked, 15 min → unlocked, admin unlock)
- E2E test: full email → verify → register → login → access protected route → refresh → logout flow
- E2E test: OAuth login → JWT issued → protected route accessible (bypasses email verification)
- **UX Tests**: Test all auth loading states work correctly
- **UX Tests**: Validate error messages are user-friendly and actionable
- **UX Tests**: Test form validation provides real-time feedback
- **UX Tests**: Test session management handles expiration gracefully
- **UX Tests**: Test OAuth flow loading states and error handling
- **UX Tests**: Test accessibility of all auth forms and error states

**Exit Criteria:** Auth works end-to-end, all test types pass, OAuth skeleton configured (keys needed for live testing), comprehensive auth UX states implemented with loading indicators, error handling, and user feedback

---

### Day 7 — Next.js Frontend Scaffold & Auth Pages

**Goal:** `apps/web-student` running, auth pages functional, Dokploy staging deploy

| Task | Details |
|---|---|
| Next.js setup (`web-student`) | App Router, TailwindCSS, ShadCN/UI init, path aliases, environment config |
| Layout structure | Root layout, auth layout, dashboard layout, error boundaries, loading states |
| Auth pages | Login page, Register page, Forgot Password, Reset Password, Email Verification |
| API client | Typed API client in `/packages/api-client` (auto-generated from OpenAPI) with auth interceptors (cookie handling) |
| Auth context | Jotai atoms for auth state, TanStack Query integration for user profile |
| Protected routes | Middleware for route protection (student redirects) |
| Shared components | Button, Input, Card, Dialog, Toast, Form (from `/packages/ui`) |
| Dokploy staging | Deploy API + `web-student` to staging, configure subdomain (`student.eduplatform.com`), SSL, env vars |

**UX State Requirements:**
- **Loading States**: Implement skeleton screens for auth pages and dashboard
- **Error Boundaries**: Create error boundaries for auth-related components
- **Form Validation**: Real-time validation with helpful error messages
- **Loading Indicators**: Button-level spinners for form submissions
- **Success Messages**: Toast notifications for successful auth operations
- **Error Messages**: User-friendly error messages for auth failures
- **Accessibility**: Ensure all auth forms meet WCAG 2.1 AA standards
- **Responsive Design**: Mobile-first approach for all auth pages

**Tests Required:**
- Unit tests for auth pages (form validation, error display, success redirect)
- Unit tests for API client (request interceptor, response interceptor, error handling, retry logic)
- Unit tests for Jotai auth atoms (login state, logout state, user data updates)
- Unit tests for shared UI components (render, props, accessibility, disabled state)
- Unit tests for route protection middleware (authenticated redirect, unauthenticated redirect, role-based redirect)
- Integration tests: login form → API call → state update → redirect (mocked API)
- Integration tests: registration form → validation → API call → success message (mocked API)
- Integration tests: forgot password → email sent → reset form → success (mocked API)
- E2E test (Playwright): full registration → email verify → login → dashboard navigation
- E2E test: protected route redirects to login when unauthenticated
- E2E test: Dokploy staging deploy is accessible and responsive at `student.eduplatform.com`
- **UX Tests**: Test all auth page loading states render correctly
- **UX Tests**: Validate error boundaries catch and display auth errors properly
- **UX Tests**: Test form validation provides real-time feedback
- **UX Tests**: Test accessibility of all auth forms and error states
- **UX Tests**: Test responsive design across all device sizes

**Exit Criteria:** Staging environment live (`student.eduplatform.com` + API), auth pages working end-to-end, all tests pass, ≥95% coverage on frontend auth code (critical path), comprehensive auth UX states implemented with loading skeletons, error boundaries, and user feedback

> **Note:** `apps/web-instructor` and `apps/web-admin` scaffolding happens on Day 9 and Day 22 respectively. Auth pages are shared via `/packages/shared-components` to avoid duplication.

---

## Phase 2: Course Platform & Upload Pipeline (Days 8–14)

---

### Day 8 — Course CRUD Backend

**Goal:** Full course management API with sections and lectures

| Task | Details |
|---|---|
| Course module | CRUD endpoints: create, read, update, delete, list (with pagination, filtering, search) |
| Section module | CRUD for sections within courses (add, reorder, delete) |
| Lecture module | CRUD for lectures within sections (add, reorder, delete, type assignment) |
| Free preview enforcement | Logic to determine which lectures are free preview (instructor-marked preview lectures) |
| RBAC enforcement | Instructors can only manage own courses, admin can manage all |
| DTOs & validation | Zod schemas for all request bodies, response types in `/packages/types` |
| Database queries | Optimized queries with proper joins, indexes, N+1 prevention |

**UX State Requirements:**
- **Loading States**: Implement loading indicators for all course operations
- **Error Handling**: Create user-friendly error messages for course operations
- **Validation**: Detailed validation feedback for course/section/lecture creation
- **Search Performance**: Optimized search with debouncing and loading states
- **Pagination**: Efficient pagination with loading states for large datasets
- **RBAC Feedback**: Clear error messages for permission violations
- **Free Preview Logic**: Proper error handling for preview access violations
- **Response Formatting**: Consistent API response format with loading/error metadata

**Tests Required:**
- Unit tests for course service (create, update, delete, find, pagination, search, filter)
- Unit tests for section service (create, reorder, delete, cascade behavior)
- Unit tests for lecture service (create, reorder, delete, type assignment, free preview logic)
- Unit tests for free preview enforcement (instructor-marked preview lectures free, non-preview paid, edge cases)
- Unit tests for RBAC middleware (instructor owns course, instructor doesn't own, admin override)
- Unit tests for all Zod DTOs (valid input, missing fields, invalid types, boundary values)
- Integration tests for course CRUD (create → read → update → delete → verify not found)
- Integration tests for section CRUD within courses
- Integration tests for lecture CRUD within sections
- Integration tests for pagination (page 1, page 2, beyond last page, empty results)
- Integration tests for filtering (by domain, by instructor, by price, by published status)
- Integration tests for search (partial title match, no results, special characters)
- Integration tests for RBAC enforcement (instructor A cannot edit instructor B's course)
- E2E test: instructor creates course → adds sections → adds lectures → publishes → student browses
- E2E test: admin can view/edit all courses, student cannot create courses
- **UX Tests**: Test all course operation loading indicators work correctly
- **UX Tests**: Validate error messages are user-friendly for course operations
- **UX Tests**: Test search functionality with loading states and debouncing
- **UX Tests**: Test pagination performance with large datasets
- **UX Tests**: Test RBAC error messages are clear and actionable

**Exit Criteria:** Course CRUD fully operational, all tests pass with ≥80% coverage, RBAC enforced at every endpoint, comprehensive course API UX states implemented with loading indicators, error handling, and user feedback

---

### Day 9 — Instructor Dashboard Frontend

**Goal:** `apps/web-instructor` scaffolded, instructor can create and manage courses via UI

| Task | Details |
|---|---|
| Scaffold `web-instructor` | Next.js App Router, TailwindCSS, ShadCN/UI, shared packages wiring, Dokploy deployment config |
| Auth pages (instructor) | Reuse `/packages/shared-components` auth forms, instructor-specific post-login redirect |
| Course creation form | Multi-step form: course details, sections, lectures, pricing, publish |
| Course list page | Table of instructor's courses with status, enrollment count, revenue |
| Course edit page | Edit course details, reorder sections/lectures (drag-and-drop) |
| Section management | Add/edit/delete sections, reorder via drag-and-drop |
| Lecture management | Add/edit/delete lectures, set type, mark free preview, reorder |
| Pricing form | Set pricing type (free/paid), set INR price |
| Publish toggle | Publish/draft toggle with confirmation dialog |
| TanStack Query integration | Mutations for all CRUD operations, optimistic updates, error handling |
| Dokploy staging | Deploy `web-instructor` to staging, configure subdomain (`instructor.eduplatform.com`), SSL, env vars |

**UX State Requirements:**
- **Loading States**: Skeleton screens for course list and tables
- **Progress Indicators**: Multi-step form progress indicators
- **Drag-and-Drop**: Visual feedback during reorder operations
- **Form Validation**: Real-time validation with helpful error messages
- **Optimistic Updates**: Immediate UI feedback for form submissions
- **Error Boundaries**: Error boundaries for course management components
- **Empty States**: Empty states with clear CTAs for course creation
- **Confirmation Dialogs**: Confirmation dialogs for destructive actions
- **Loading States**: Button-level spinners for all form submissions
- **Success Messages**: Toast notifications for successful operations
- **Error Messages**: User-friendly error messages for failures
- **Skeleton Screens**: Loading placeholders for course data
- **Responsive Design**: Mobile-first approach for all dashboard components

**Tests Required:**
- Unit tests for course creation form (field validation, step navigation, form submission)
- Unit tests for course list page (render courses, empty state, loading state, error state)
- Unit tests for course edit page (pre-fill data, save changes, discard changes)
- Unit tests for drag-and-drop reordering (section reorder, lecture reorder, invalid drop)
- Unit tests for pricing form (free/paid toggle, price validation, INR amount validation)
- Unit tests for publish toggle (draft → published confirmation, published → draft warning)
- Integration tests: form submission → API call → optimistic update → success toast (mocked API)
- Integration tests: drag-and-drop → reorder API call → UI update → persistence verification (mocked API)
- Integration tests: pricing change → validation → API call → update confirmation (mocked API)
- E2E test: instructor creates course → adds 2 sections → adds 3 lectures → sets price → publishes
- E2E test: instructor edits course → reorders sections → saves → changes persist after reload
- E2E test: Dokploy staging deploy is accessible at `instructor.eduplatform.com`
- **UX Tests**: Test all loading states render correctly with skeleton screens
- **UX Tests**: Validate drag-and-drop provides visual feedback
- **UX Tests**: Test form validation provides real-time feedback
- **UX Tests**: Test optimistic updates work correctly
- **UX Tests**: Test error boundaries handle errors gracefully
- **UX Tests**: Test responsive design across all device sizes
- **UX Tests**: Test accessibility of all dashboard components

**Exit Criteria:** `web-instructor` scaffolded and deployed, instructor dashboard fully functional, all CRUD operations work via UI, ≥80% frontend coverage, comprehensive instructor dashboard UX states implemented with loading skeletons, drag-and-drop feedback, and user-friendly error handling

---

### Day 10 — Upload Pipeline (S3 Signed URLs)

**Goal:** Direct-to-S3 upload via signed URLs with progress tracking

| Task | Details |
|---|---|
| Upload module | Endpoint to request signed S3 upload URL (per lecture) |
| S3 integration | AWS SDK v3 configuration, bucket setup, CloudFront origin |
| Signed URL generation | PUT signed URL with 30-min expiry, content-type validation, max size (500MB) |
| Upload tracking | Track upload status (pending, uploading, complete, failed) in DB |
| Upload completion webhook | S3 event → NestJS webhook → magic byte validation → mark upload complete → trigger Mux ingestion |
| Upload progress API | Endpoint for frontend to poll upload progress |
| Frontend upload UI | Drag-and-drop upload zone, progress bar, retry on failure, cancel upload |

**UX State Requirements:**
- **Upload Progress**: Real-time progress bar with percentage and ETA
- **Drag-and-Drop**: Visual feedback for file selection and drag operations
- **File Validation**: Real-time validation with helpful error messages
- **Loading States**: Upload processing indicators with status messages
- **Error Handling**: Clear error messages for upload failures with retry options
- **Cancel Upload**: Option to cancel ongoing uploads
- **Upload Queue**: Queue management for multiple file uploads
- **Status Indicators**: Visual indicators for upload status (pending, uploading, complete, failed)
- **Retry Mechanism**: Easy retry option for failed uploads
- **File Preview**: Thumbnail preview for image/video files
- **Accessibility**: Full keyboard navigation and screen reader support

**Tests Required:**
- Unit tests for S3 service (signed URL generation, URL expiry, content-type validation, size limit)
- Unit tests for upload tracking service (status transitions, pending → uploading → complete, pending → failed)
- Unit tests for upload completion webhook handler (valid signature, invalid signature, duplicate webhook)
- Unit tests for magic byte validation (valid MP4, valid WebM, invalid file signature, malicious file disguised as video)
- Unit tests for upload progress API (no upload, in progress, complete, failed)
- Unit tests for frontend upload component (file selection, type validation, size validation, progress updates)
- Integration tests: request signed URL → receive URL → mock S3 PUT → webhook received → status updated
- Integration tests: upload failure → retry logic → eventual success
- Integration tests: content-type mismatch → upload rejected
- Integration tests: file size over limit → upload rejected
- E2E test: instructor uploads video → progress bar shows → completes → status shows "ready"
- E2E test: upload fails → retry → succeeds → Mux ingestion triggered
- **UX Tests**: Test upload progress bar shows accurate percentage and ETA
- **UX Tests**: Validate drag-and-drop provides clear visual feedback
- **UX Tests**: Test file validation provides specific error messages
- **UX Tests**: Test upload cancellation works correctly
- **UX Tests**: Test retry mechanism handles failed uploads gracefully
- **UX Tests**: Test accessibility of upload interface
- **UX Tests**: Test upload queue management for multiple files

**Exit Criteria:** Upload pipeline end-to-end working, signed URLs secure, progress tracking accurate, all tests pass, comprehensive upload UX states implemented with real-time progress, drag-and-drop feedback, and user-friendly error handling

---

### Day 11 — Mux Integration

**Goal:** Mux asset creation, transcoding webhooks, signed playback URL generation

| Task | Details |
|---|---|
| Mux SDK setup | Mux Node.js SDK configuration, direct upload API |
| Asset creation | Create Mux asset from S3 URL, track `mux_asset_id` on lecture |
| Transcoding webhook | Mux webhook handler (`video.asset.ready`, `video.asset.errored`) |
| Playback URL generation | Signed playback URL generation (time-limited, per-user) |
| Playback URL validation | Backend endpoint to request playback URL (enforces enrollment check, exception for `is_free_preview` lectures — no auth required) |
| Frontend video player | HLS player integration (Mux Player or Video.js), playback URL loading |
| Playback error handling | Invalid URL, expired URL, asset not ready, transcoding failed |
| Dead-letter queue | SQS queue for failed S3→NestJS webhooks, reconciliation cron (every 15 min) for orphaned uploads |

**UX State Requirements:**
- **Video Loading**: Loading spinner and progress indicator for video initialization
- **Transcoding Status**: Real-time status updates for video processing
- **Playback Errors**: Clear error messages for video playback issues
- **URL Expiration**: Automatic URL refresh with user notification
- **Quality Selection**: Quality selector with loading state
- **Progress Tracking**: Visual progress bar with seek functionality
- **Error Recovery**: Retry options for failed video loads
- **Loading States**: Skeleton screens for video content
- **Error Boundaries**: Video error boundaries with fallback content
- **Accessibility**: Full keyboard navigation and screen reader support for video controls
- **Mobile Responsive**: Touch-friendly video controls and responsive design
- **Buffering Indicators**: Visual buffering indicators during playback

**Tests Required:**
- Unit tests for Mux service (asset creation, URL construction, webhook validation, signed URL generation)
- Unit tests for transcoding webhook handler (asset ready, asset errored, invalid signature, unknown asset)
- Unit tests for playback URL endpoint (enrolled student, non-enrolled student, expired token, free preview — unauthenticated access)
- Unit tests for frontend video player component (load URL, error state, loading state, retry)
- Unit tests for signed URL expiration logic (within expiry, past expiry, edge case: exactly at expiry)
- Integration tests: S3 upload complete → Mux asset created → `mux_asset_id` stored → webhook received → playback URL works
- Integration tests: transcoding failure → lecture marked as failed → error shown to instructor
- Integration tests: playback URL requested by non-enrolled student → 403 returned
- Integration tests: playback URL requested by enrolled student → signed URL returned → valid for configured duration
- E2E test: instructor uploads → Mux transcodes → playback URL generated → student watches video
- E2E test: playback URL expires → student requests new URL → new URL works
- **UX Tests**: Test video loading states work correctly
- **UX Tests**: Validate transcoding status provides real-time feedback
- **UX Tests**: Test error handling for video playback failures
- **UX Tests**: Test URL expiration and refresh mechanism
- **UX Tests**: Test accessibility of video controls
- **UX Tests**: Test responsive design for mobile devices
- **UX Tests**: Test buffering indicators and error recovery

**Exit Criteria:** Mux integration fully operational, signed playback secure, transcoding pipeline working, all tests pass, comprehensive video UX states implemented with loading indicators, error handling, and accessibility features

---

### Day 12 — Student Course Pages Frontend

**Goal:** `apps/web-student` — Course discovery, browsing, detail pages with free preview

| Task | Details |
|---|---|
| Course listing page | Grid/list view, domain filter, search, pagination |
| Course detail page | Syllabus, instructor bio, preview lectures, pricing, reviews |
| Free preview enforcement | Preview-marked lectures playable without enrollment, lock icon on paid lectures |
| Search & filter UI | Domain chips, price range slider, instructor dropdown, sort options |
| Course card component | Thumbnail, title, instructor, price, rating, enrollment count |
| Loading & error states | Skeleton loaders, empty state, error fallback |
| SEO optimization | Meta tags, Open Graph, structured data for courses |

**UX State Requirements:**
- **Loading States**: Skeleton screens for course listings and detail pages
- **Search Performance**: Debounced search with loading indicators
- **Filter Interface**: Real-time filter updates with loading states
- **Free Preview**: Clear visual indicators for preview-locked content
- **Course Cards**: Responsive grid with hover effects and loading states
- **Empty States**: Helpful empty states with clear CTAs
- **Error Handling**: Error boundaries with retry options
- **Pagination**: Infinite scroll or traditional pagination with loading states
- **Image Loading**: Progressive image loading with blur placeholders
- **Course Progress**: Visual indicators for enrolled vs. non-enrolled courses
- **Mobile Responsive**: Touch-friendly interface for mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support

**Tests Required:**
- Unit tests for course listing page (render courses, filter by domain, search, pagination, empty state)
- Unit tests for course detail page (render details, free preview lectures visible, paid lectures locked)
- Unit tests for course card component (render data, pricing display, enrollment count formatting)
- Unit tests for search & filter UI (domain chip selection, price range validation, sort order)
- Unit tests for free preview enforcement (preview-marked lectures playable, non-preview locked, no login required for preview)
- Integration tests: search query → filtered results → pagination navigation (mocked API)
- Integration tests: domain filter → courses filtered → URL params updated (mocked API)
- Integration tests: course detail load → instructor bio fetched → syllabus rendered (mocked API)
- E2E test: student browses courses → filters by domain → clicks course → watches free preview
- E2E test: student searches for course → no results → empty state shown → search cleared
- **UX Tests**: Test all loading states use skeleton screens correctly
- **UX Tests**: Validate search functionality with debouncing and loading states
- **UX Tests**: Test filter interface provides real-time feedback
- **UX Tests**: Test free preview indicators are clear and intuitive
- **UX Tests**: Test responsive design across all device sizes
- **UX Tests**: Test accessibility of all course interface components
- **UX Tests**: Test error handling provides clear recovery options

**Exit Criteria:** Student can discover and browse courses via `web-student`, free previews work, ≥80% frontend coverage on course pages, comprehensive student course browsing UX states implemented with skeleton screens, real-time search, and intuitive free preview indicators

---

### Day 13 — Video Player & Progress Tracking

**Goal:** HLS video player with progress tracking, resume playback, playback controls

| Task | Details |
|---|---|
| Video player component | HLS player (Mux Player), quality selector, playback speed (0.5x–2x) |
| Progress tracking | Track `watched_seconds` per lecture, update on play/pause/seek |
| Resume playback | Resume from `last_watched_at` position on re-watch |
| Completion detection | Mark lecture complete when 100% watched |
| Progress API | POST endpoint to update progress, GET endpoint for student's progress |
| Watch history page | Student dashboard page showing recently watched lectures |

**UX State Requirements:**
- **Video Loading**: Loading spinner with progress indicator during video initialization
- **Buffering**: Visual buffering indicators during playback
- **Progress Tracking**: Visual progress bar with seek functionality and resume position indicator
- **Quality Selection**: Quality selector with loading state and current quality display
- **Playback Speed**: Speed control with visual feedback
- **Resume Playback**: Clear visual indicator showing resume position
- **Completion Detection**: Visual completion badge with celebration animation
- **Error Handling**: Error boundaries with retry options for video failures
- **Keyboard Navigation**: Full keyboard support for video controls
- **Mobile Controls**: Touch-friendly controls for mobile devices
- **Accessibility**: Screen reader support for video controls and progress information
- **Offline Support**: Graceful handling of offline scenarios
- **Network Resilience**: Automatic retry for network interruptions
- **Performance Optimization**: Lazy loading for video components

**Tests Required:**
- Unit tests for video player component (play, pause, seek, quality change, speed change, error recovery)
- Unit tests for progress tracking logic (seconds calculation, 100% threshold, edge cases: seek forward, seek backward)
- Unit tests for resume playback (no progress → start at 0, partial progress → resume from position, complete → restart)
- Unit tests for progress API endpoint (valid update, invalid lecture, non-enrolled student, progress aggregation)
- Unit tests for watch history page (render history, empty state, loading state, sort by recent)
- Integration tests: watch video → progress saved → resume from correct position on re-watch
- Integration tests: complete lecture (100%) → lecture marked complete → certificate progress updated
- Integration tests: progress API rate limiting (too many requests → throttled)
- E2E test: student watches lecture → pauses → resumes → progress saved → returns later → resumes from correct position
- E2E test: student completes lecture → course progress bar updates → completion badge shown
- **UX Tests**: Test video loading states work correctly
- **UX Tests**: Validate progress tracking provides accurate visual feedback
- **UX Tests**: Test resume playback shows clear position indicators
- **UX Tests**: Test error handling for video failures
- **UX Tests**: Test keyboard navigation and accessibility features
- **UX Tests**: Test mobile responsiveness and touch controls
- **UX Tests**: Test network resilience and error recovery

**Exit Criteria:** Video player fully functional, progress tracking accurate, resume playback works, all tests pass, comprehensive video player UX states implemented with loading indicators, progress tracking, and accessibility features

---

### Day 14 — Payment Integration (Razorpay)

**Goal:** Razorpay order creation, payment intent, webhook handling, access grant

| Task | Details |
|---|---|
| Razorpay SDK setup | Razorpay Node SDK configuration, key management |
| Order creation | POST endpoint to create Razorpay order (course price, currency, student info) |
| Payment intent | Return order ID, key, amount to frontend for Razorpay checkout |
| Frontend checkout | Razorpay checkout modal integration, order ID passing, success/failure handling |
| Payment webhook | Razorpay webhook handler (`payment.captured`, `payment.failed`, signature verification) |
| Enrollment grant | On payment success → create enrollment record, send confirmation email |
| Refund handling | Admin endpoint to issue refund, webhook handler for refund status |
| Payment history page | Student dashboard page showing all payment transactions |

**UX State Requirements:**
- **Checkout Loading**: Loading spinner during order creation and payment processing
- **Payment Modal**: Secure checkout modal with loading states
- **Progress Indicators**: Clear progress indicators for payment processing
- **Error Handling**: User-friendly error messages for payment failures
- **Retry Options**: Easy retry mechanism for failed payments
- **Success Feedback**: Success confirmation with enrollment details
- **Payment Status**: Real-time status updates during payment processing
- **Order Validation**: Real-time order validation with helpful error messages
- **Security Indicators**: Visual indicators for secure payment processing
- **Form Validation**: Real-time form validation for payment details
- **Mobile Responsive**: Touch-friendly payment interface for mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support
- **Offline Handling**: Graceful handling for offline payment scenarios
- **Network Resilience**: Automatic retry for network interruptions

**Tests Required:**
- Unit tests for Razorpay service (order creation, signature verification, refund processing)
- Unit tests for payment webhook handler (payment captured, payment failed, invalid signature, duplicate webhook)
- Unit tests for enrollment grant logic (create enrollment, send email, update course enrollment count)
- Unit tests for refund handler (valid refund, already refunded, refund amount mismatch)
- Unit tests for payment history page (render transactions, filter by status, empty state)
- Unit tests for frontend checkout component (order creation, checkout modal, success callback, failure callback)
- Integration tests: create order → Razorpay returns order ID → frontend receives order details
- Integration tests: payment captured → webhook received → enrollment created → confirmation email sent
- Integration tests: payment failed → webhook received → no enrollment created → error shown to student
- Integration tests: refund issued → webhook received → enrollment status updated → refund reflected in history
- E2E test: student clicks purchase → checkout modal opens → payment succeeds → enrollment confirmed → course accessible
- E2E test: payment fails → error shown → student can retry → payment succeeds → enrollment confirmed
- **UX Tests**: Test checkout loading states work correctly
- **UX Tests**: Validate payment modal provides secure visual feedback
- **UX Tests**: Test error handling for payment failures
- **UX Tests**: Test retry mechanism handles failed payments gracefully
- **UX Tests**: Test success confirmation provides clear feedback
- **UX Tests**: Test accessibility of payment interface
- **UX Tests**: Test mobile responsiveness for payment flow
- **UX Tests**: Test network resilience for payment processing

**Exit Criteria:** Payment flow end-to-end working, Razorpay integration secure, all tests pass, ≥95% coverage (critical path), comprehensive payment UX states implemented with secure checkout, real-time feedback, and user-friendly error handling

---

## Phase 3: Realtime, Engagement & Live Classes (Days 15–21)

---

### Day 15 — Socket.IO Gateway

**Goal:** Socket.IO gateway with authentication, room architecture, Redis adapter

| Task | Details |
|---|---|
| Socket.IO gateway | NestJS WebSocket gateway, connection authentication (JWT validation) |
| Room architecture | Per-course channels, per-live-class rooms, general channels |
| Redis adapter | `@socket.io/redis-adapter` for horizontal scaling |
| Connection management | Connect, disconnect, reconnect handling, presence tracking |
| Message validation | Zod validation for all incoming socket messages |
| Rate limiting | Per-socket message rate limiting (prevent spam) |

**UX State Requirements:**
- **Connection Status**: Real-time connection status indicators (connected, connecting, disconnected)
- **Presence Tracking**: Online/offline status indicators for users
- **Message Delivery**: Visual feedback for message send status (sent, delivered, read)
- **Typing Indicators**: Animated typing indicators with user names
- **Reconnection Logic**: Automatic reconnection with progress indicators
- **Error Handling**: Clear error messages for connection failures
- **Rate Limiting**: User-friendly notifications when rate limited
- **Room Management**: Visual indicators for active room participation
- **Message Validation**: Real-time validation feedback for incoming messages
- **Network Resilience**: Graceful handling of network interruptions
- **Mobile Support**: Touch-friendly interface for mobile chat
- **Accessibility**: Screen reader support for real-time features

**Tests Required:**
- Unit tests for Socket.IO gateway (connection authentication, room joining, room leaving, disconnect handling)
- Unit tests for JWT validation in socket handshake (valid token, expired token, invalid token, missing token)
- Unit tests for room architecture (join course room, join live class room, leave room, invalid room)
- Unit tests for message validation (valid message, missing fields, invalid types, message too long)
- Unit tests for rate limiter (messages within limit, messages over limit, reset after window)
- Unit tests for Redis adapter setup (adapter initialization, pub/sub configuration)
- Integration tests: connect → authenticate → join course room → receive message → disconnect → presence updated
- Integration tests: message rate limiting → rapid messages → throttled → resume after window
- Integration tests: Redis adapter → message sent on node A → received on node B
- E2E test: student joins course channel → sends message → other students receive → disconnect → presence updated
- E2E test: invalid JWT → connection rejected → error message returned
- **UX Tests**: Test connection status indicators work correctly
- **UX Tests**: Validate typing indicators provide smooth animations
- **UX Tests**: Test reconnection logic handles network interruptions gracefully
- **UX Tests**: Test error handling for connection failures
- **UX Tests**: Test rate limiting provides clear user notifications
- **UX Tests**: Test accessibility of real-time features

**Exit Criteria:** Socket.IO gateway operational, authentication working, Redis adapter configured, all tests pass, comprehensive real-time UX states implemented with connection indicators, typing feedback, and error handling

---

### Day 16 — Chat System

**Goal:** Real-time course chat with message persistence

| Task | Details |
|---|---|
| Chat module | Message persistence in PostgreSQL, channel management |
| Message CRUD | Send, edit, delete messages, message history API |
| Frontend chat UI | Message list, input, send button, typing indicator, online presence |
| Message threading | Reply to messages (nested replies, max 2 levels) |
| Message moderation | Flag/report messages, instructor can delete any message |
| Typing indicators | Real-time typing indicator per channel |
| Online presence | Show who is online in each course channel |

**Tests Required:**
- Unit tests for chat service (send message, edit message, delete message, message history, pagination)
- Unit tests for channel service (create channel, join channel, leave channel, list members)
- Unit tests for message moderation (flag message, unflag, instructor delete, student delete own)
- Unit tests for typing indicator service (start typing, stop typing, debounce, multiple users)
- Unit tests for presence service (user online, user offline, multiple tabs)
- Unit tests for frontend chat UI (render messages, send message, edit message, delete message, typing indicator)
- Integration tests: send message → persisted in DB → broadcast to channel → recipients receive
- Integration tests: edit message → updated in DB → broadcast update → recipients see edited message
- Integration tests: delete message → soft delete in DB → broadcast removal → message hidden
- Integration tests: message history pagination → load more → correct ordering → no duplicates
- E2E test: student sends message → appears in chat → other student replies → threading works
- E2E test: instructor deletes flagged message → message removed for all participants

**Exit Criteria:** Chat fully functional, message persistence working, all realtime features tested, ≥80% coverage

---

### Day 17 — LiveKit Integration

**Goal:** LiveKit room creation, instructor starts class, student joins, recording auto-start

| Task | Details |
|---|---|
| LiveKit SDK setup | LiveKit server SDK configuration, room management |
| Room creation | Create room per live class, set max participants, recording enabled |
| Token generation | Generate join tokens for instructors (publisher) and students (subscriber) |
| Frontend live player | LiveKit client SDK integration, video/audio display, screen sharing |
| Recording auto-start | Room configured for recording, S3 storage for recordings |
| Live status management | Update live class status (scheduled → live → ended) |
| Connection quality | Network quality indicators, connection fallback |

**Tests Required:**
- Unit tests for LiveKit service (room creation, token generation, room deletion, recording config)
- Unit tests for token generation (instructor token with publisher perms, student token with subscriber perms, token expiry)
- Unit tests for live status management (scheduled → live, live → ended, invalid transitions)
- Unit tests for frontend live player component (connect, disconnect, video render, audio mute/unmute, screen share)
- Unit tests for connection quality monitor (good, poor, disconnected, reconnection)
- Integration tests: create room → generate instructor token → instructor joins → room active
- Integration tests: generate student token → student joins → can view instructor video → cannot publish
- Integration tests: recording starts → room ends → recording file available in S3
- Integration tests: room cleanup after class ends → participants kicked → room deleted
- E2E test: instructor schedules class → starts class → students join → video/audio working → recording active
- E2E test: instructor screen shares → students see screen → instructor stops sharing → video resumes

**Exit Criteria:** LiveKit integration operational, room management working, recording auto-starts, all tests pass

---

### Day 18 — Live Class Scheduling & Recording Pipeline

**Goal:** Schedule classes, notify students, recording → S3 → Mux pipeline

| Task | Details |
|---|---|
| Scheduling API | CRUD for live class schedules (date, time, duration, attached course) |
| Calendar view | Instructor calendar with upcoming classes, student calendar view |
| Notification triggers | Auto-notify enrolled students (1hr before, 15min before) |
| Recording pipeline | LiveKit recording → S3 → Mux ingestion → attached to course lecture |
| Recording status tracking | Track recording processing status (processing, ready, failed) |
| Post-session workflow | After class ends → recording URL → trigger Mux → update lecture |

**Tests Required:**
- Unit tests for scheduling service (create schedule, update schedule, cancel class, timezone handling)
- Unit tests for calendar view API (instructor calendar, student calendar, date range filtering)
- Unit tests for notification triggers (1hr before, 15min before, timezone conversion)
- Unit tests for timezone handling (all timestamps stored as UTC, displayed in IST (Asia/Kolkata), IST does not observe DST, global timezone support deferred to Phase 2)
- Unit tests for recording pipeline (S3 → Mux ingestion, status tracking, failure handling)
- Unit tests for post-session workflow (class ended → recording available → Mux triggered → lecture updated)
- Unit tests for frontend calendar component (render events, navigate months, event details, timezone display)
- Integration tests: schedule class → notification queued → email sent at correct time
- Integration tests: recording available in S3 → Mux ingested → transcoding complete → lecture updated with playback URL
- Integration tests: recording failed → status marked failed → instructor notified → retry available
- E2E test: instructor schedules class → student receives notification → class runs → recording becomes available → student watches replay
- E2E test: recording fails → error shown → instructor retries → recording succeeds

**Exit Criteria:** Scheduling, notification, and recording pipeline fully working, all tests pass, ≥80% coverage

---

### Day 19 — Assignments & Quizzes Backend

**Goal:** Assignment creation, submission, auto-grading (MCQ), manual grading

| Task | Details |
|---|---|
| Assignment module | CRUD for assignments (title, description, type, max score, due date) |
| Quiz engine | MCQ question bank, answer validation, auto-grading logic |
| Submission module | Student submission, file upload support, text submission |
| Grading system | Auto-grade MCQ (instant), manual grade open-ended (instructor review) |
| Feedback system | Instructor feedback on submissions, score display |
| Late submission policy | Configurable late submission window, penalty calculation |
| Bulk operations | Bulk assignment creation, bulk grading |

**Tests Required:**
- Unit tests for assignment service (create, update, delete, list, due date validation)
- Unit tests for quiz engine (MCQ creation, answer validation, auto-grading, score calculation)
- Unit tests for submission service (submit assignment, file upload, text submission, late submission)
- Unit tests for grading system (auto-grade MCQ: correct/incorrect, manual grade: score range, feedback)
- Unit tests for late submission policy (on-time, late within window, late past window, penalty calculation)
- Unit tests for bulk operations (bulk create, bulk grade, partial failure handling)
- Integration tests: create assignment → student submits → auto-grade MCQ → score recorded
- Integration tests: create assignment → student submits → instructor grades manually → feedback sent
- Integration tests: late submission → penalty applied → final score calculated
- Integration tests: bulk grade → all submissions graded → scores recorded → notifications sent
- E2E test: instructor creates MCQ quiz → student takes quiz → auto-graded → score shown immediately
- E2E test: instructor creates open-ended assignment → student submits → instructor grades → feedback shown

**Exit Criteria:** Assignment and quiz system fully functional, auto and manual grading working, all tests pass

---

### Day 20 — Assignments & Quizzes Frontend

**Goal:** Student assignment submission UI, instructor grading UI

| Task | Details |
|---|---|
| Student assignment page | Assignment list, due dates, submission form (text/file upload), status |
| Quiz taking UI | MCQ question display, answer selection, timer (optional), submit |
| Instructor grading page | Submission list, auto-graded results, manual grading form, feedback input |
| Submission history | Student view of all submissions with scores and feedback |
| Bulk grading UI | Select multiple submissions, apply same grade/feedback |
| Assignment creation form | Instructor form to create assignments/quizzes (multi-step) |

**Tests Required:**
- Unit tests for student assignment page (render assignments, due date display, submission form, status badges)
- Unit tests for quiz taking UI (render questions, answer selection, navigation, submit, timer)
- Unit tests for instructor grading page (submission list, auto-grade display, manual grade form, feedback)
- Unit tests for submission history (render history, score display, feedback display, filter by course)
- Unit tests for bulk grading UI (select submissions, apply grade, apply feedback, confirmation)
- Unit tests for assignment creation form (step validation, MCQ builder, due date picker, save)
- Integration tests: quiz submission → auto-grade → score displayed → history updated (mocked API)
- Integration tests: manual grade submission → API call → success → feedback shown to student (mocked API)
- Integration tests: bulk grade → API call → all submissions updated → notifications sent (mocked API)
- E2E test: student takes MCQ quiz → submits → score shown → history updated
- E2E test: instructor grades submission → enters feedback → student sees grade and feedback

**Exit Criteria:** Assignment UI fully functional, quiz taking and grading working, ≥80% frontend coverage

---

### Day 21 — Certificates & PostHog Analytics

**Goal:** Auto-generate certificates on completion, analytics event tracking

| Task | Details |
|---|---|
| Certificate generation | Auto-issue on 100% course completion, unique certificate ID (UUID) |
| PDF generation | Certificate PDF with course name, student name, date, verification URL |
| Verification page | Public page to verify certificate authenticity via unique ID |
| Certificate download | Download PDF, shareable LinkedIn-ready format |
| PostHog setup | PostHog SDK integration (frontend + backend), event tracking |
| Event tracking | Page views, video start/complete, enrollment, purchase, live attendance, assignment submit |
| Analytics dashboard | Instructor analytics: enrollment count, completion rates, revenue, drop-off points |

**Tests Required:**
- Unit tests for certificate service (generate certificate, UUID generation, PDF generation, verification)
- Unit tests for certificate verification (valid ID, invalid ID, revoked certificate)
- Unit tests for PDF generation (template rendering, data injection, file size, download URL)
- Unit tests for PostHog event tracking (event emission, property validation, user identification)
- Unit tests for analytics dashboard (enrollment count, completion rate calculation, revenue aggregation, drop-off detection)
- Unit tests for frontend analytics integration (page view tracking, video event tracking, user action tracking)
- Unit tests for frontend certificate page (render certificate, download button, verification link, share button)
- Integration tests: course 100% complete → certificate auto-generated → email sent → certificate available
- Integration tests: certificate verification URL → public page → certificate details displayed
- Integration tests: PostHog events emitted correctly → visible in PostHog dashboard (mocked)
- E2E test: student completes course → certificate generated → PDF downloaded → verification URL works
- E2E test: instructor views analytics → enrollment count correct → completion rate accurate → revenue displayed

**Exit Criteria:** Certificates auto-generated on completion, analytics tracking operational, all tests pass

---

## Phase 4: Stabilization, Admin & Production Readiness (Days 22–30)

---

### Day 22 — Admin Dashboard: User Management

**Goal:** `apps/web-admin` scaffolded, admin can manage users, view platform stats

| Task | Details |
|---|---|
| Scaffold `web-admin` | Next.js App Router, TailwindCSS, ShadCN/UI, shared packages wiring, Dokploy deployment config |
| Auth pages (admin) | Reuse `/packages/shared-components` auth forms, admin-specific post-login redirect. Admin dashboard has independent login — no session sharing with other portals (separate accounts required) |
| Admin layout | Admin-specific navigation, RBAC guard (admin role only), admin-only error boundaries |
| User management table | Paginated list of all users (students, instructors), search, filter by role |
| User detail page | View user profile, enrollment history, payment history, activity log |
| User actions | Activate/deactivate, reset password, change role, delete user, unlock locked accounts |
| Platform stats | Total users, active courses, revenue, enrollments (overview cards) |
| Certificate management | View all certificates, revoke certificate (manual), re-issue certificate (admin discretion on content changes) |
| Audit log | Track admin actions (user created, role changed, course moderated, certificate revoked) |
| Dokploy staging | Deploy `web-admin` to staging, configure subdomain (`admin.eduplatform.com`), SSL, env vars |

**Tests Required:**
- Unit tests for admin user table (render users, search, filter, pagination, empty state)
- Unit tests for user detail page (profile display, enrollment history, payment history, activity log)
- Unit tests for user actions (activate, deactivate, role change, delete, unlock locked account, confirmation dialogs)
- Unit tests for certificate management (list certificates, revoke certificate, re-issue certificate)
- Unit tests for platform stats cards (data aggregation, formatting, loading states)
- Unit tests for audit log (render log entries, filter by action type, date range)
- Unit tests for admin RBAC guard (admin access granted, non-admin denied)
- Integration tests: user search → filtered results → user detail loaded (mocked API)
- Integration tests: user action → API call → state updated → audit log entry created (mocked API)
- Integration tests: platform stats → data aggregated from multiple sources → displayed correctly (mocked API)
- E2E test: admin searches for user → views details → deactivates user → audit log updated
- E2E test: non-admin attempts to access admin dashboard → redirected to home
- E2E test: Dokploy staging deploy is accessible at `admin.eduplatform.com`

**Exit Criteria:** `web-admin` scaffolded and deployed, admin user management fully functional, RBAC enforced, audit logging working, all tests pass

---

### Day 23 — Admin Dashboard: Instructor Approval & Course Moderation

**Goal:** `apps/web-admin` — Admin can approve instructors, moderate courses

| Task | Details |
|---|---|
| Instructor approval queue | List of pending instructor applications, review details |
| Approval workflow | Approve/reject with reason, email notification to applicant |
| Course moderation | Flagged courses list, review content, approve/reject/suspend |
| Revenue overview | Platform revenue, instructor payouts, transaction history |
| Report generation | Export reports (CSV, PDF) for revenue, enrollments, user activity |

**Tests Required:**
- Unit tests for instructor approval queue (render pending applications, filter by date, sort)
- Unit tests for approval workflow (approve → email sent, reject → reason required, email sent)
- Unit tests for course moderation (flag review, approve, reject, suspend, reason validation)
- Unit tests for revenue overview (total revenue, payout calculation, transaction filtering)
- Unit tests for report generation (CSV export, PDF export, date range filtering, data accuracy)
- Integration tests: instructor application → admin reviews → approved → instructor role granted → email sent
- Integration tests: course flagged → admin reviews → suspended → students notified → instructor notified
- Integration tests: revenue report → data aggregated → CSV exported → data matches database
- E2E test: admin reviews instructor application → approves → instructor receives email → can create courses
- E2E test: admin reviews flagged course → suspends → course hidden from students → instructor notified

**Exit Criteria:** Instructor approval and course moderation working via `web-admin`, revenue reporting accurate, all tests pass

---

### Day 24 — Performance Optimization

**Goal:** Optimize queries, caching, CDN, eliminate N+1 queries

| Task | Details |
|---|---|
| Database indexing | Add missing indexes on frequently queried columns |
| N+1 query elimination | Audit all queries, add eager loading, use query builders |
| TanStack Query caching | Configure staleTime, gcTime, refetch intervals per query |
| CloudFront CDN | Validate CDN configuration, cache headers, invalidation |
| API response optimization | Selective field returns, pagination limits, response compression |
| Query profiling | Identify slow queries, add EXPLAIN ANALYZE logging |
| Load testing | Basic load test on critical endpoints (auth, course list, video playback) |

**Tests Required:**
- Unit tests for query optimization (eager loading verification, N+1 detection in test queries)
- Unit tests for cache configuration (staleTime honored, gcTime honored, refetch behavior)
- Unit tests for CDN cache headers (correct headers set, cache-control, ETag)
- Integration tests: course list query → single query with joins → no N+1 (query count assertion)
- Integration tests: enrollment query → paginated → cached → refetch on mutation
- Integration tests: API response compression → response size reduced → latency measured
- E2E test: load test auth endpoint → 100 concurrent requests → response time < 200ms
- E2E test: load test course list → 100 concurrent requests → response time < 300ms
- E2E test: CDN delivers static assets → cache hit → no origin request

**Exit Criteria:** No N+1 queries, caching configured, CDN working, load test results acceptable, all tests pass

---

### Day 25 — Security Audit

**Goal:** Harden platform, validate all security measures

| Task | Details |
|---|---|
| Rate limiting validation | Test all endpoints for rate limiting (per-IP, per-user) |
| Signed URL enforcement | Verify all Mux playback URLs are signed, unsigned rejected |
| RBAC validation | Audit all endpoints for role enforcement, test bypass attempts |
| Input sanitization | XSS prevention, SQL injection prevention, file upload validation |
| CSRF protection | CSRF tokens for state-changing operations |
| Security headers | HSTS, CSP, X-Frame-Options, X-Content-Type-Options |
| Secret management | Verify no secrets in code, env var validation, rotation procedures |
| Penetration testing | Basic pen test on auth, payments, file upload, API endpoints |

**Tests Required:**
- Unit tests for rate limiter (all endpoints tested, limits enforced, whitelist bypass)
- Unit tests for signed URL validation (signed URL accepted, unsigned rejected, expired rejected)
- Unit tests for RBAC bypass attempts (student tries admin endpoint, instructor tries other instructor's data)
- Unit tests for input sanitization (XSS payloads rejected, SQL injection rejected, malicious files rejected)
- Unit tests for CSRF protection (valid CSRF token accepted, missing token rejected, invalid token rejected)
- Unit tests for security headers (all headers present, correct values, no leaking)
- Integration tests: rate limit bypass attempt → blocked → IP logged
- Integration tests: RBAC bypass attempt → 403 returned → audit log entry created
- Integration tests: file upload with malicious content → rejected → error returned
- E2E test: security scan on all endpoints → no vulnerabilities found (using automated tools)
- E2E test: pen test on auth flow → brute force prevented → account lockout works

**Exit Criteria:** All security measures validated, no vulnerabilities found, all security tests pass

---

### Day 26 — E2E Testing: Core Flows

**Goal:** Comprehensive E2E tests for critical user journeys

| Task | Details |
|---|---|
| Auth E2E | Registration → email verify → login → refresh → logout → password reset |
| Course E2E | Browse → search → view detail → free preview → purchase → enroll → watch |
| Upload E2E | Create course → upload video → Mux processing → playback URL → student watches |
| Payment E2E | Purchase → Razorpay checkout → payment success → enrollment → confirmation email |
| Live class E2E | Schedule → notify → start → join → record → end → replay available |
| Assignment E2E | Create → submit → auto-grade → score → manual grade → feedback |
| Certificate E2E | Complete course → certificate generated → PDF download → verification |
| Chat E2E | Join channel → send message → receive → edit → delete → flag |

**Tests Required:**
- All E2E tests listed above implemented in Playwright (frontend) and Supertest (backend)
- Each E2E test covers happy path + at least 2 error paths
- E2E tests run against staging environment with seeded test data
- E2E tests include cleanup (delete test data after run)
- E2E test coverage report generated and verified

**Exit Criteria:** All critical user journeys tested end-to-end, E2E test suite passes consistently, coverage report meets thresholds (≥80% general, ≥95% critical)

---

### Day 27 — E2E Testing: Edge Cases & Error Paths

**Goal:** Test error handling, edge cases, failure scenarios

| Task | Details |
|---|---|
| Network failure tests | API timeout, network drop, retry behavior |
| Concurrent user tests | Multiple users enrolling simultaneously, race conditions |
| Data integrity tests | Transaction rollback on failure, orphaned record prevention |
| Edge case tests | Empty states, max limits, special characters, unicode, long strings |
| Error recovery tests | Service restart, database reconnect, Redis reconnect, queue retry |
| Mobile responsive tests | All pages responsive on mobile, tablet, desktop breakpoints |
| Accessibility tests | WCAG 2.1 AA compliance, screen reader testing, keyboard navigation |

**Tests Required:**
- E2E tests for network failures (API down → error shown → retry → success)
- E2E tests for concurrent enrollment (10 users enroll same course → all succeed → no duplicates)
- E2E tests for data integrity (payment fails → no enrollment created → rollback verified)
- E2E tests for edge cases (empty course list, 100-section course, special char in title, unicode names)
- E2E tests for error recovery (API restart → reconnect → state restored)
- Playwright responsive tests (mobile viewport, tablet viewport, desktop viewport)
- Playwright accessibility tests (axe-core integration, ARIA labels, keyboard nav, color contrast)

**Exit Criteria:** Error handling robust, edge cases covered, accessibility compliant, all tests pass

---

### Day 28 — Error Monitoring & Logging

**Goal:** Sentry integration, structured logging, alerting

| Task | Details |
|---|---|
| Sentry setup | Sentry SDK for frontend (Next.js) and backend (NestJS) |
| Error boundaries | React error boundaries with Sentry reporting |
| Structured logging | JSON structured logs (timestamp, level, context, userId, requestId) |
| Request tracing | Correlation ID across frontend → backend → database |
| Alerting rules | Critical error alerts (payment failures, auth failures, service down) |
| Log aggregation | Log shipping to centralized store, search/filter capability |
| Performance monitoring | Sentry APM, transaction tracing, slow query alerts |

**Tests Required:**
- Unit tests for Sentry integration (error capture, context enrichment, user identification)
- Unit tests for error boundaries (render fallback, report to Sentry, reset state)
- Unit tests for structured logging (JSON format, required fields, log levels, redaction of secrets)
- Unit tests for request tracing (correlation ID generation, propagation, cleanup)
- Integration tests: error thrown → Sentry receives event → context correct → alert triggered
- Integration tests: log entry → JSON format → all fields present → secrets redacted
- E2E test: trigger error in frontend → error boundary shows → Sentry receives → alert sent
- E2E test: trigger error in backend → structured log written → Sentry receives → correlation ID present

**Exit Criteria:** Sentry operational, structured logging working, alerting configured, all tests pass

---

### Day 29 — Documentation & API Docs

**Goal:** Swagger API docs, internal runbooks, deployment documentation

| Task | Details |
|---|---|
| Swagger setup | `@nestjs/swagger` integration, all endpoints documented |
| API documentation | Request/response schemas, examples, error codes, authentication |
| Internal runbooks | Deployment procedures, database migration steps, rollback procedures |
| Environment setup | Local dev setup guide, staging deploy guide, production deploy guide |
| Troubleshooting guide | Common issues, diagnostic steps, resolution procedures |
| Architecture diagrams | Updated diagrams reflecting actual implementation |
| CHANGELOG | Version history, breaking changes, migration notes |

**Tests Required:**
- Unit tests for Swagger documentation (all endpoints documented, schemas match actual DTOs, examples valid)
- Integration tests: Swagger UI accessible → all endpoints listed → "Try it out" works
- Integration tests: runbook procedures tested (deploy fresh instance, run migrations, seed data)
- E2E test: new developer follows setup guide → project runs locally → tests pass
- E2E test: staging deploy follows runbook → deploy succeeds → smoke tests pass

**Exit Criteria:** API docs complete and accurate, runbooks tested, setup guide verified, all documentation tests pass

---

### Day 30 — Final Polish, Launch Prep

**Goal:** Landing page, final review, soft launch

| Task | Details |
|---|---|
| Landing page | Public landing page (`apps/web-landing`) with value proposition, course preview, CTA. Independent deploy, minimal deps, SEO-optimized |
| Landing page deploy | Deploy `web-landing` to staging, configure subdomain (`landing.eduplatform.com`), SSL, env vars |
| Final code review | Comprehensive code review, TODO/FIXME cleanup, dead code removal |
| Final test pass | Full test suite run, coverage verification, flaky test fix |
| Performance final pass | Lighthouse audit, bundle size optimization, image optimization |
| Launch | Launch, monitoring dashboards active, incident response ready |

**UX State Requirements:**
- **Landing Page**: Optimized loading with skeleton screens and progressive enhancement
- **Performance**: Loading performance optimization with Core Web Vitals monitoring
- **Error Recovery**: Comprehensive error boundaries with retry mechanisms
- **Accessibility**: Final accessibility audit with WCAG 2.1 AA compliance
- **Responsive Design**: Final responsive testing across all device sizes
- **User Feedback**: Comprehensive feedback collection and integration
- **Monitoring**: Real-time user experience monitoring
- **Error Tracking**: Complete error tracking with user context
- **Performance Metrics**: Loading performance metrics collection and analysis
- **User Testing**: Final user testing session feedback integration

**Tests Required:**
- Unit tests for landing page (render content, CTA buttons, course preview, responsive layout)
- E2E test: landing page → Lighthouse score > 90 on all metrics
- E2E test: full test suite → coverage thresholds met (≥80% general, ≥95% critical) → no flaky tests → CI green
- **UX Tests**: Complete accessibility audit for all user flows
- **UX Tests**: Performance testing for all user journeys
- **UX Tests**: Error recovery testing for all failure scenarios
- **UX Tests**: Responsive testing across all device sizes
- **UX Tests**: User experience testing with real users

**Exit Criteria:** Landing page live at `landing.eduplatform.com` (`apps/web-landing`), coverage thresholds met (≥80% general, ≥95% critical), soft launch successful, comprehensive production-ready UX states implemented with performance optimization, accessibility compliance, and user experience monitoring

---

## Post-30-Day Checklist

- [ ] ≥80% code coverage verified across all packages (≥95% on critical paths: auth, payments, enrollments, certificates)
- [ ] All E2E tests passing on staging
- [ ] Sentry alerts operational
- [ ] PostHog analytics capturing events
- [ ] Dokploy staging environment stable
- [ ] Landing page live with waitlist
- [ ] Incident response runbook complete
- [ ] Month 2-3 feature backlog prioritized
- [ ] Architecture document updated with implementation decisions
- [ ] Security audit complete with no critical vulnerabilities
- [ ] Performance benchmarks met (API < 200ms, video playback < 1s init)
