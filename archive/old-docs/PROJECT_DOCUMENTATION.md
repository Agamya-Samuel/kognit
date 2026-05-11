# EdTech Platform — Project Documentation

> **Version:** 1.0  
> **Stage:** Idea / Planning  
> **Last Updated:** 7th May, 2026  
> **Author:** Agamya Samuel

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Vision & Mission](#2-vision--mission)
3. [Target Audience & Market](#3-target-audience--market)
4. [Business Model](#4-business-model)
5. [Product Overview](#5-product-overview)
6. [Feature Specifications](#6-feature-specifications)
7. [Technical Architecture](#7-technical-architecture)
8. [Database Schema Overview](#8-database-schema-overview)
9. [Infrastructure Architecture](#9-infrastructure-architecture)
10. [Monorepo Structure](#10-monorepo-structure)
11. [Auth Architecture](#11-auth-architecture)
12. [Media Pipeline](#12-media-pipeline)
13. [Realtime Architecture](#13-realtime-architecture)
14. [Month 1 — Week-by-Week Execution Plan](#14-month-1--week-by-week-execution-plan)
15. [Out of Scope — Month 1](#15-out-of-scope--month-1)
16. [Success Metrics & KPIs](#16-success-metrics--kpis)
17. [Risk Register](#17-risk-register)
18. [Glossary](#18-glossary)

---

## 1. Executive Summary

This document describes the architecture, product specification, and execution plan for a live-first EdTech platform targeting **college and university students** across India and English-speaking global markets.

The platform enables **vetted instructors** to deliver live classes and pre-recorded courses in **Coding / Tech** and **Professional Skills / Business** domains, with planned expansion into additional verticals. Students access content through a freemium model — free previews of lectures — and unlock full courses via **per-course purchases** or through **institutional licensing** (colleges and universities).

The platform is built for long-term scale from day one, with a clean monorepo architecture, a modular NestJS backend, and a media pipeline (LiveKit + Mux) that transforms every live class automatically into a replayable recorded course.

The Month 1 goal is **not** to build everything. It is to build the right foundation: auth, course delivery, upload pipeline, payments, and creator workflows — with enough engagement features to validate the product loop.

---

## 2. Vision & Mission

### Vision
To become the most trusted skills platform for Indian college students and professionals, offering world-class instruction in technology and business — live and on-demand.

### Mission
Empower students to build career-ready skills through live instruction, structured courses, and a strong learning community — accessible from any device, anywhere.

### Core Product Belief
> A content engagement system — not a realtime technology demo.

Platform success depends on:
- **Instructor workflow quality** — how easily instructors upload, organize, schedule, and manage students
- **Student engagement** — completion rates, community, and tangible outcomes (certificates, placements)
- **Content flywheel** — live classes automatically becoming recorded courses, compounding content library over time

---

## 3. Target Audience & Market

### Primary Audience — Students

| Attribute | Detail |
|---|---|
| **Segment** | College and University students |
| **Age Range** | 18–26 |
| **Geography** | India (primary), Global English-speaking (secondary) |
| **Goals** | Career readiness, skill-building, placement support |
| **Pain Points** | Expensive courses, poor instruction quality, lack of community, no placement support |
| **Devices** | Mobile-first (India), Desktop (Global) |

### Secondary Audience — Instructors

| Attribute | Detail |
|---|---|
| **Type** | Vetted, invite-only |
| **Profile** | Industry practitioners, senior engineers, business professionals |
| **Goals** | Monetize expertise, build audience, teach at scale |
| **Pain Points** | Complex creator tools, poor analytics, low revenue share |

### Institutional Audience

| Attribute | Detail |
|---|---|
| **Segment** | Colleges, Universities, Bootcamps |
| **Goals** | Supplement curriculum, offer job-ready skills to students |
| **Model** | Bulk licensing, white-labelled access, cohort management |

### Market Geography

- **Phase 1:** India — Tier 1 and Tier 2 cities
- **Phase 2:** South Asia + Global English (US, UK, Southeast Asia)

---

## 4. Business Model

### Revenue Streams

#### 1. Per-Course Purchases (B2C)
- Students purchase individual courses or bundles
- One-time payment, lifetime access
- Instructor revenue share model (TBD — recommend 60/40 or 70/30 instructor/platform)

#### 2. Institution Licensing
- Colleges and universities purchase platform access for their students
- Cohort-based access or seat-based pricing
- Custom onboarding, progress dashboards for institutions
- Highest revenue potential — prioritize early enterprise conversations

#### 3. Freemium Access
- First 1–2 lectures of every course are free
- Acts as a marketing funnel and trust builder
- No login required to preview (reduces friction for discovery)

### Pricing Strategy (Initial)
| Tier | Price | Access |
|---|---|---|
| Free | ₹0 | Preview lectures only |
| Course Purchase | ₹499–₹4,999 | Full course, lifetime access |
| Institution Licensing | Custom | Cohort/seat-based, all courses |

### Future Revenue Opportunities
- Certificate programs (premium, verifiable)
- Placement service fees
- Live cohort bootcamps (cohort-based pricing)
- Corporate upskilling packages

---

## 5. Product Overview

### Platform Zones

The platform is divided into **four separate Next.js applications**, each independently deployable, backed by a **single shared backend**:

```
apps/web-student       → Student learning experience
apps/web-instructor    → Instructor dashboard and tools
apps/web-admin         → Platform administration
apps/web-institution   → Institutional dashboard (Phase 2)
```

**Security Rationale:** Each zone is isolated to prevent cross-zone vulnerabilities (XSS, CSRF, privilege escalation). Shared components and API clients live in `/packages` to maintain consistency while enforcing boundary separation.

**Domain Mapping:**
```
student.eduplatform.com        → apps/web-student
instructor.eduplatform.com     → apps/web-instructor
admin.eduplatform.com          → apps/web-admin
institution.eduplatform.com    → apps/web-institution (Phase 2)
```

### Core Product Loops

**Student Loop**
```
Discover free preview → Purchase course / Institution access
  → Watch live class or recorded lecture
  → Complete assignments & quizzes
  → Earn certificate
  → Join community → Placement support
```

**Instructor Loop**
```
Apply & get vetted → Create course / Schedule live class
  → Upload content → Students enroll
  → Engage via live class → Review analytics
  → Earn revenue
```

**Content Flywheel**
```
Live class (LiveKit)
  → Auto-recorded
  → Uploaded to S3
  → Ingested by Mux
  → Transcoded to HLS
  → Becomes recorded lecture in course library
```

---

## 6. Feature Specifications

### 6.1 Student Platform

#### Course Discovery & Enrollment
- Browse courses by domain (Coding/Tech, Business)
- Free preview of first 1–2 lectures (no login required)
- Search and filter (domain, instructor, price, rating)
- Course detail page: syllabus, instructor bio, reviews, preview
- One-click enrollment after purchase

#### Video Player
- HLS adaptive bitrate streaming via Mux
- Signed playback URLs (no unauthorized sharing)
- Progress tracking (resume from last position)
- Playback speed control (0.5x – 2x)
- Quality selector

#### Live Classes
- Join live class via embedded LiveKit player
- Chat during class (Socket.IO)
- Raise hand / reaction system (Phase 2)
- Attendance tracking
- Class recording available post-session

#### Assignments & Quizzes
- Per-lecture and per-course assignments
- Multiple choice, short answer, code submission
- Auto-graded quizzes (MCQ)
- Manual-graded assignments (instructor reviews)
- Submission history and feedback

#### Certificates
- Auto-generated on course completion
- Unique certificate ID (verifiable link)
- Downloadable as PDF
- Shareable (LinkedIn-ready)

#### Community / Forums
- Course-level discussion channels
- General domain channels (Coding, Business)
- Instructor can post announcements
- Reply threads
- Basic moderation (flag/report)

#### Placement Support
- Profile builder (student can fill skills, resume, projects)
- Job board (curated listings relevant to course)
- Resume review requests to instructors
- Phase 2: Mock interviews, referrals

#### Progress & Dashboard
- Course progress bars
- Watch history
- Assignment submission status
- Upcoming live classes calendar
- Earned certificates

---

### 6.2 Instructor Platform

#### Profile & Onboarding
- Application form (invite-only, admin-approved)
- Bio, expertise, social links
- Banking/payout setup (Razorpay Route for instructor payouts)
- Profile page visible to students

#### Course Creation
- Create course with title, description, thumbnail, domain tags
- Add sections and lectures (video, text, assignment, quiz)
- Set pricing (free, paid, institutional-only)
- Publish / draft toggle
- Reorder sections and lectures via drag-and-drop

#### Content Upload Pipeline
- Direct-to-S3 upload via signed URLs
- Upload progress indicator
- Auto-ingestion to Mux on upload complete
- Transcoding status feedback
- Bulk upload support (Phase 2)

#### Live Class Scheduling
- Schedule live class with date/time/duration
- Attach to course or standalone session
- Auto-notify enrolled students
- Start class → launches LiveKit room
- Post-session: recording auto-attached to course

#### Analytics Dashboard
- Student enrollment count
- Video watch completion rates
- Drop-off points per lecture
- Live class attendance
- Revenue earned (total, per course, per month)
- Assignment submission rates

#### Student Management
- View enrolled students
- Bulk message enrolled students
- View individual student progress
- Grade manual assignments

---

### 6.3 Admin Dashboard

- User management (students, instructors)
- Instructor approval workflow
- Course moderation (approve, reject, flag)
- Revenue overview
- Platform-wide analytics
- Institution account management
- Support ticket management (Phase 2)

---

### 6.4 Notifications System

| Trigger | Channel |
|---|---|
| Live class starting (1hr, 15min before) | In-app + Email |
| New lecture published | In-app |
| Assignment graded | In-app + Email |
| Certificate earned | In-app + Email |
| New community reply | In-app |
| Payment confirmed | Email |
| Instructor: new enrollment | In-app |
| Instructor: assignment submitted | In-app |

---

## 7. Technical Architecture

### Stack Summary

| Layer | Technology |
|---|---|
| **Student Web** | Next.js (App Router), TypeScript, TailwindCSS — `apps/web-student` |
| **Instructor Web** | Next.js (App Router), TypeScript, TailwindCSS — `apps/web-instructor` |
| **Admin Web** | Next.js (App Router), TypeScript, TailwindCSS — `apps/web-admin` |
| **Institution Web** | Next.js (App Router), TypeScript, TailwindCSS — `apps/web-institution` (Phase 2) |
| **UI Components** | ShadCN/UI (shared via `/packages/ui`) |
| **State Management** | Jotai (per-app, isolated state) |
| **Data Fetching** | TanStack Query (shared `/packages/api-client`) |
| **Forms** | React Hook Form + Zod |
| **Mobile (Future)** | React Native + Expo |
| **Backend API** | NestJS (modular monolith), REST-first |
| **WebSockets** | Socket.IO (NestJS Gateway) |
| **Database** | PostgreSQL (Dokploy managed) |
| **ORM** | Drizzle ORM |
| **Cache / Queue / Presence** | Redis (Upstash initially → ElastiCache) |
| **Auth** | Custom JWT + Refresh Tokens (NestJS) + Auth.js as OAuth broker |
| **Video Infra** | Mux (transcoding, HLS, playback) |
| **Live Classes** | LiveKit |
| **Storage** | AWS S3 |
| **CDN** | AWS CloudFront |
| **Payments** | Razorpay (payments + Razorpay Route for instructor payouts) |
| **Analytics** | PostHog |
| **Error Monitoring** | Sentry |
| **Monorepo** | Turborepo |
| **Containerization** | Docker |
| **Deployment** | Dokploy |
| **Hosting** | AWS |
| **Validation** | Zod (shared across frontend + backend) |

---

### Backend Module Boundaries (NestJS)

```
/src
  /auth             → JWT, refresh tokens, OAuth, session
  /users            → Students, instructors, roles, profiles
  /courses          → Course CRUD, sections, lectures
  /enrollments      → Enrollment management, progress tracking
  /uploads          → S3 signed URLs, upload tracking
  /media            → Mux integration, transcoding webhooks
  /live             → LiveKit room management, scheduling
  /payments         → Razorpay integration, webhooks
  /notifications    → In-app + email notification service
  /chat             → Socket.IO channels, message persistence
  /assignments      → Submission, grading, feedback
  /certificates     → Generation, verification
  /analytics        → PostHog event tracking, internal metrics
  /admin            → Admin-specific routes and tooling
  /institution      → Institutional account management (Phase 2)
```

---

### API Design Principles

- REST-first (no GraphQL in Month 1)
- Versioned routes: `/api/v1/...`
- JWT bearer tokens for all authenticated endpoints
- Role-based access control (RBAC) enforced at route level: `student`, `instructor`, `admin`, `institution_admin`
- Zod validation on all request bodies
- Standardized response envelope:

```json
{
  "success": true,
  "data": { },
  "meta": { "page": 1, "total": 100 },
  "error": null
}
```

---

## 8. Database Schema Overview

### Core Tables

#### `users`
```
id, email, password_hash, role, name, avatar_url,
is_verified, is_active, created_at, updated_at
```

#### `instructor_profiles`
```
id, user_id (FK), bio, expertise[], social_links,
approval_status (pending|approved|rejected),
razorpay_seller_account_id, created_at
```

#### `student_profiles`
```
id, user_id (FK), resume_url, skills[],
placement_status, created_at
```

#### `courses`
```
id, instructor_id (FK), title, description, thumbnail_url,
domain (tech|business|...), pricing_type (free|paid|institutional),
price_inr, is_published, created_at, updated_at
```

#### `sections`
```
id, course_id (FK), title, order_index, created_at
```

#### `lectures`
```
id, section_id (FK), title, description, order_index,
type (video|live|text|assignment|quiz),
mux_asset_id, mux_playback_id, duration_seconds,
is_free_preview, is_published, created_at
```

#### `enrollments`
```
id, student_id (FK), course_id (FK), enrolled_at,
payment_id (FK), access_type (purchased|institutional|free)
```

#### `progress`
```
id, student_id (FK), lecture_id (FK),
watched_seconds, completed, last_watched_at
```

#### `live_classes`
```
id, lecture_id (FK), instructor_id (FK),
scheduled_at, duration_minutes, livekit_room_name,
recording_url, status (scheduled|live|ended), created_at
```

#### `assignments`
```
id, lecture_id (FK), title, description, type (mcq|short|code),
max_score, due_at, created_at
```

#### `submissions`
```
id, assignment_id (FK), student_id (FK),
content, score, feedback, graded_at, submitted_at
```

#### `certificates`
```
id, student_id (FK), course_id (FK),
certificate_uid (unique), issued_at, pdf_url
```

#### `payments`
```
id, student_id (FK), course_id (FK),
razorpay_order_id, razorpay_payment_id, amount, currency,
status (pending|paid|failed|refunded), created_at
```

#### `institution_accounts` *(Phase 2)*
```
id, institution_name, contact_email,
razorpay_customer_id, seat_count, active_until, created_at
```

#### `institution_enrollments` *(Phase 2)*
```
id, institution_account_id (FK), student_id (FK),
course_id (FK), enrolled_at
```

#### `messages`
```
id, channel_id (FK), sender_id (FK),
content, created_at, is_deleted
```

#### `channels`
```
id, course_id (FK, nullable), type (course|general|dm),
name, created_at
```

---

## 9. Infrastructure Architecture

### Deployment Overview

```
                         ┌─────────────────────┐
                         │   CloudFront CDN     │
                         │   (Static + Media)   │
                         └────────┬────────────┘
                                  │
          ┌───────────┬───────────┼───────────┬───────────┐
          │           │           │           │           │
   ┌──────▼──────┐ ┌──▼──────┐ ┌─▼─────────┐ ┌▼──────────┐ ┌──────▼──────┐
   │  web-       │ │ web-    │ │ web-      │ │ web-      │ │  NestJS API │
   │  student    │ │instructr│ │ admin     │ │institution│ │  (Docker)   │
   │  (Dokploy)  │ │(Dokploy)│ │(Dokploy)  │ │ (Phase 2) │ └──────┬──────┘
   └─────────────┘ └─────────┘ └───────────┘ └───────────┘        │
                                                    ┌─────────────┼─────────────┐
                                                    │             │             │
                                             ┌──────▼──────┐ ┌───▼──────┐ ┌───▼───────┐
                                             │  PostgreSQL  │ │ElastiCache│ │  S3       │
                                             │  (Dokploy)   │ │  Redis    │ │  Buckets  │
                                             └──────────────┘ └───────────┘ └───┬───────┘
                                                                                 │
                                                                         ┌───────▼───────┐
                                                                         │  Mux           │
                                                                         │  (ingest,      │
                                                                         │   transcode,   │
                                                                         │   HLS deliver) │
                                                                         └───────────────┘
```

### App Isolation

Each web app is deployed as a separate Docker container with its own:
- Environment variables
- SSL certificate
- Cookie domain scope
- Rate limiting configuration
- Sentry project configuration
- PostHog API key (for analytics isolation)

### AWS Services Used

| Service | Purpose |
|---|---|
| **EC2 / ECS** | App hosting (Docker containers via Dokploy) |
| **PostgreSQL (Dokploy)** | Primary database |
| **ElastiCache (Redis)** | Cache, queues, pub/sub, presence |
| **S3** | Video uploads, recording storage, assets |
| **CloudFront** | CDN for static assets and media |
| **SES** | Transactional email (notifications) |
| **Route 53** | DNS management |

### Month 1 Infra (Simplified)

| Service | Month 1 Choice | Scale-Up Path |
|---|---|---|
| App hosting | Dokploy + Docker | ECS Fargate |
| Database | PostgreSQL via Dokploy | Read replicas, connection pooling |
| Redis | Upstash | ElastiCache |
| Monitoring | Dokploy logs + PostHog | Sentry + Datadog / Grafana |

---

## 10. Monorepo Structure

```
/apps
  /web-student          → Next.js — Student learning experience
  /web-instructor       → Next.js — Instructor dashboard and tools
  /web-admin            → Next.js — Platform administration
  /web-institution      → Next.js — Institutional dashboard (Phase 2)
  /api                  → NestJS backend (modular monolith)
  /mobile               → React Native Expo (Phase 2)

/packages
  /ui                   → Shared ShadCN/TailwindCSS component library
  /types                → Shared TypeScript types and interfaces
  /auth                 → Auth utilities, token helpers, cookie config
  /validation           → Shared Zod schemas (used by all web apps and api)
  /api-client           → Auto-generated typed API client from OpenAPI
  /config               → Shared ESLint, TSConfig, env schemas
  /shared-components    → Cross-app UI components (layouts, nav, auth forms)

/infra
  /docker               → Dockerfiles per app
  /dokploy              → Deployment configs (one per app)
  /scripts              → DB migration scripts, seed scripts

turbo.json
package.json
.env.example
README.md
```

### Key Monorepo Rules
- All API request/response types live in `/packages/types` — never duplicated
- All Zod validation schemas live in `/packages/validation` — shared between frontend forms and backend guards
- API client is auto-generated from OpenAPI spec in `/packages/api-client` — all web apps use the same generated client
- Shared UI components live in `/packages/shared-components` — auth forms, nav bars, footer, error pages
- Each web app has its own `tsconfig.json`, `next.config.ts`, `Dockerfile`, and `.env` file
- Mobile app imports from same `/packages/api-client` as web — ensures API contract consistency

### App Isolation Rules
- No direct imports between apps (`apps/web-student` cannot import from `apps/web-admin`)
- Shared code must go through `/packages`
- Each app has independent dependencies (can have different package versions if needed)
- CI/CD builds and deploys each app independently
- Each app has its own Sentry project and PostHog instance

---

## 11. Auth Architecture

### Strategy

The backend **owns all auth logic**. Auth.js acts as an OAuth/provider orchestration layer only — not the core business auth system. This is critical for future mobile app compatibility.

Each web app (`web-student`, `web-instructor`, `web-admin`, `web-institution`) communicates independently with the shared NestJS auth module. Cookie domains are scoped per app subdomain to prevent cross-app session leakage.

### Token Architecture

| Token | Storage (Web) | Storage (Mobile) | Expiry |
|---|---|---|---|
| Access Token (JWT) | HTTP-only cookie (scoped to app subdomain) | SecureStore | 15 minutes |
| Refresh Token | HTTP-only cookie (scoped to app subdomain) | SecureStore | 30 days |

### Auth Flows

**Web (all apps)**
```
Next.js app → POST api.eduplatform.com/api/v1/auth/login → NestJS Auth Module
  → Validate credentials
  → Issue JWT + Refresh Token
  → Set HTTP-only cookies (scoped to app subdomain)
  → Return user profile
```

**Mobile (Phase 2)**
```
React Native → POST /api/v1/auth/login → NestJS Auth Module
  → Validate credentials
  → Issue JWT + Refresh Token
  → Return tokens (stored in SecureStore)
```

**OAuth (Google, GitHub)**
```
Frontend → Auth.js OAuth flow
  → Auth.js callback → NestJS /auth/oauth-callback
  → NestJS creates/finds user
  → Issues JWT + Refresh Token
  → Redirects to appropriate app subdomain based on user role
```

### Cross-App Auth Flow

After login on `student.eduplatform.com`, if the user also has instructor or admin roles:
- A role detection endpoint returns available roles
- The student app displays navigation links to other portals
- Each portal requires a fresh auth handshake (no shared session tokens)
- Logout in one app does NOT log out other apps (explicit logout per app)

### RBAC Roles

| Role | Permissions |
|---|---|
| `student` | Browse, enroll, watch, submit assignments, community |
| `instructor` | All student permissions + create courses, manage students, analytics |
| `admin` | Full platform access, user management, moderation |
| `institution_admin` | Institution dashboard, manage seats, cohort reports |

---

## 12. Media Pipeline

### Recorded Content Flow

```
Instructor uploads video (browser)
  → Frontend requests signed S3 upload URL from NestJS
  → Browser uploads directly to S3 (bypasses NestJS server)
  → S3 event triggers NestJS webhook
  → NestJS creates Mux upload asset
  → Mux downloads from S3, transcodes to HLS
  → Mux webhook fires on completion
  → NestJS updates lecture record with mux_asset_id + mux_playback_id
  → Lecture becomes available to students
```

### Live Class → Recording Flow

```
Instructor starts live class
  → LiveKit room created
  → LiveKit auto-records to S3
  → Class ends → recording available in S3
  → NestJS ingests recording into Mux
  → Transcoded recording attached to course lecture
  → Students can replay immediately after class
```

### Playback Security

- All Mux playback URLs are **signed** (time-limited, per-user tokens)
- Unsigned URLs are rejected by Mux
- Prevents hotlinking and unauthorized sharing
- Signed URLs generated server-side by NestJS on each playback request

---

## 13. Realtime Architecture

### Socket.IO (App Websockets)

Used for:
- Chat messages (course channels, general channels)
- In-app notifications delivery
- Presence indicators (who is online)
- Typing indicators
- Live class countdown / status updates

**Important:** Socket.IO infra is kept **entirely separate** from LiveKit. They serve different purposes and must never be entangled.

### Redis Pub/Sub (Socket.IO Scaling)

```
Socket.IO server (NestJS) → Redis Adapter
  → All connected Socket.IO nodes share state via Redis
  → Enables horizontal scaling later without re-architecture
```

### LiveKit (Live Video)

Used exclusively for:
- Live class video/audio streaming
- Teacher/student video rooms
- Screen sharing

LiveKit is **not** used for app chat or notifications.

### Realtime Event Architecture

```
NestJS emits internal event (e.g., "enrollment.confirmed")
  → NotificationService picks up
  → Creates notification record in DB
  → Emits via Socket.IO to connected client
  → If client offline → notification surfaced on next login
```

---

## 14. Month 1 — Week-by-Week Execution Plan

### WEEK 1 — Foundation & Architecture

**Goal:** Establish scalable, clean foundation. Eliminate future migration pain.

| Task | Details |
|---|---|
| **Monorepo setup** | Turborepo init, shared packages scaffolded, ESLint, Prettier, Husky, CI/CD pipeline (GitHub Actions) |
| **NestJS bootstrap** | Module structure created, core modules stubbed (auth, users, courses, uploads), global pipes/interceptors |
| **Database design** | All core schemas defined and migrated via Drizzle ORM |
| **Redis integration** | Upstash Redis connected, BullMQ queue setup for background jobs |
| **Docker setup** | Dockerfiles for each web app and api, docker-compose for local dev |
| **Dokploy deploy** | Staging environment live on AWS via Dokploy (all 4 web apps + api) |
| **S3 + CloudFront** | Buckets created, CloudFront distribution configured |
| **Auth system** | JWT + refresh token flow, HTTP-only cookies, role middleware, OAuth skeleton |
| **Next.js scaffold** | `apps/web-student` App Router setup, TailwindCSS + ShadCN, auth pages (login/register) |

**Exit Criteria:** Staging environment live (api + web-student), auth working end-to-end, DB migrated.

---

### WEEK 2 — Course Platform & Upload Pipeline

**Goal:** Core educational workflow. Instructors can create and upload. Students can browse and watch.

| Task | Details |
|---|---|
| **Instructor dashboard** | `apps/web-instructor` — Create course, add sections/lectures, set pricing, publish toggle |
| **Upload pipeline** | Signed S3 URLs, direct browser upload, upload progress UI, Mux ingest on completion |
| **Mux integration** | Asset creation, transcoding webhooks, signed playback URL generation |
| **Student course pages** | `apps/web-student` — Course listing, course detail, free preview enforcement |
| **Video player** | HLS player (Mux player or Video.js), progress tracking, resume playback |
| **Enrollment flow** | Enroll in free course, enrollment record creation |
| **Payment integration** | Razorpay — order creation, payment intent, webhook handling, UPI/cards/wallets/net banking support, access grant on success |
| **Basic notifications** | Email on enrollment confirmation (AWS SES) |

**Exit Criteria:** Instructor can create and upload a course via `web-instructor`. Student can browse, purchase, and watch via `web-student`.

---

### WEEK 3 — Realtime, Engagement & Live Classes

**Goal:** Engagement layer. Community. Live classes. Assignments.

| Task | Details |
|---|---|
| **Socket.IO gateway** | Authenticated connections, room architecture (per-course channels), Redis adapter |
| **Chat system** | Course channels, real-time messaging, message persistence in PostgreSQL (`web-student` + `web-instructor`) |
| **LiveKit integration** | Room creation, instructor starts class (`web-instructor`), student joins (`web-student`), recording auto-start |
| **Live class scheduling** | Instructor schedules class, students notified, calendar view |
| **Recording pipeline** | LiveKit recording → S3 → Mux → attached to lecture |
| **Assignments & Quizzes** | Create, submit, auto-grade MCQ, manual review for open-ended |
| **Certificates** | Auto-issue on 100% course completion, PDF generation, unique verification URL |
| **PostHog analytics** | Event tracking: page views, video start/complete, enrollment, purchase, live attendance (separate projects per app) |
| **In-app notifications** | Socket.IO delivery of notification events |

**Exit Criteria:** Live class runs end-to-end. Assignments submittable. Certificates issued. Chat working.

---

### WEEK 4 — Stabilization, Security & Production Readiness

**Goal:** Harden the platform. Prepare for real users. Admin tooling operational.

| Task | Details |
|---|---|
| **Performance** | TanStack Query caching, CloudFront CDN validation, N+1 query elimination, database indexing |
| **Security audit** | Rate limiting (Redis), signed URL enforcement, RBAC validation, upload type/size validation, input sanitization |
| **Admin dashboard** | `apps/web-admin` — User management, instructor approval flow, course moderation, basic revenue overview |
| **Mobile API readiness** | API contract cleanup, response format consistency, auth compatibility verification |
| **Shared schema extraction** | Zod schemas finalized in `/packages/validation`, type exports cleaned, OpenAPI client generation verified |
| **E2E testing** | Auth flows, upload → playback, payment → enrollment, live class start/end, certificate issue (per-app Playwright configs) |
| **Error monitoring** | Sentry integration (per-app projects + api), structured logging, error alerting |
| **Documentation** | API docs (Swagger), internal runbooks for deployment and DB migrations |
| **Soft launch prep** | Beta invite system, landing page, waitlist |

**Exit Criteria:** Platform stable under test load. Admin tools working via `web-admin`. Ready for invite-only beta.

---

## 15. Out of Scope — Month 1

The following features are explicitly excluded from Month 1. They represent future phases after initial traction is validated.

| Feature | Reason Deferred |
|---|---|
| Whiteboards / Collaborative editing | High complexity, needs user validation |
| AI tutors / AI-generated content | Requires product-market fit first |
| Advanced chat moderation (threading, reactions, voice rooms) | Edge cases will consume sprint |
| DRM (digital rights management) | Premature without scale |
| Offline mobile support | Architecture-ready, implement in Phase 2 |
| Complex recommendation engine | No user data to train on yet |
| Advanced gamification (streaks, leaderboards, XP) | Nice-to-have, not core |
| Institution dashboard | Validate B2C first |
| Multilingual support | English-first Phase 1 |
| Mobile app (React Native) | API will be mobile-ready; app itself is Phase 2 |
| Microservices | Premature — modular monolith is correct architecture now |

---

## 16. Success Metrics & KPIs

### Month 1 (Foundation)
| Metric | Target |
|---|---|
| Staging environment live | Week 1 |
| Instructors onboarded (vetted) | 2–3 |
| Courses published | 3–5 |
| End-to-end purchase flow working | Week 2 |
| Live class runs without crash | Week 3 |
| Certificates auto-issued | Week 3 |
| Beta invites sent | Week 4 |

### Month 2–3 (Beta)
| Metric | Target |
|---|---|
| Beta student signups | 200–500 |
| Course enrollments | 100+ |
| Video completion rate | >40% |
| Live class attendance rate | >60% of enrolled |
| Revenue (first paying users) | ₹50,000–₹1,00,000 |
| Certificate issued | 20+ |
| Institution conversations initiated | 2–3 institutions |

### Long-Term (6–12 months)
| Metric | Target |
|---|---|
| Monthly Active Students | 5,000+ |
| Paying students | 1,000+ |
| Courses available | 50+ |
| Institution accounts | 5+ institutions |
| Instructor net promoter score | >8/10 |
| Student course completion rate | >35% |

---

## 17. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Solo founder bandwidth** | High | High | Strict scope discipline. Month 1 plan is the ceiling, not the floor. |
| **Instructor content quality** | Medium | High | Vetted invite-only model. Trial course before full onboarding. |
| **Mux / LiveKit cost at scale** | Medium | Medium | Monitor usage closely. Mux pricing is usage-based. Switch to self-hosted at scale. |
| **Low student retention** | Medium | High | Track drop-off from day 1 via PostHog. Iterate on completion flow. |
| **Institution sales cycle too long** | High | Medium | Run B2C first. Institution licensing is secondary revenue in Month 1. |
| **Payment failures (India)** | Medium | Medium | Razorpay as primary gateway with native UPI, net banking, wallets support. |
| **Scope creep** | High | High | This document defines Month 1 scope. All additions go to backlog. |
| **Database design mistakes** | Low | High | Schema reviewed before any data is written. Migrations versioned from day 1. |
| **Multi-app complexity** | Medium | Medium | Shared packages (`/packages/ui`, `/packages/api-client`, `/packages/shared-components`) reduce duplication. Turborepo caching speeds builds. Per-app CI pipelines run only on affected apps. |
| **Cross-app session inconsistency** | Low | High | Scoped cookie domains per app. Explicit role detection endpoint after login. Each app validates auth independently. |

---

## 18. Glossary

| Term | Definition |
|---|---|
| **HLS** | HTTP Live Streaming — adaptive bitrate video format used by Mux |
| **LiveKit** | Open-source, developer-first video/audio infrastructure for live classes |
| **Mux** | Video infrastructure platform for transcoding, storage, and delivery |
| **Drizzle ORM** | TypeScript ORM with SQL-first, type-safe query building for PostgreSQL |
| **Turborepo** | High-performance build system for JavaScript/TypeScript monorepos |
| **Dokploy** | Open-source deployment platform — simpler alternative to Heroku on your own AWS |
| **Socket.IO** | Realtime bidirectional event-based communication library |
| **JWT** | JSON Web Token — stateless authentication token |
| **RBAC** | Role-Based Access Control — permission system based on user roles |
| **Zod** | TypeScript-first schema validation library |
| **PostHog** | Open-source product analytics and event tracking platform |
| **Razorpay** | Indian payment gateway — UPI, net banking, wallets, cards for domestic payments |
| **Razorpay Route** | Razorpay's split-payment system for marketplace payouts to instructors |
| **Sentry** | Error tracking and performance monitoring platform |
| **Signed URL** | A time-limited, authenticated URL for secure media access |
| **Modular Monolith** | Single deployable backend with clearly separated internal module boundaries |
| **Content Flywheel** | Live classes auto-converting to recorded courses, compounding the content library |
| **Institution** | Institutional licensing to colleges and universities — seat-based or cohort-based pricing |

---

*This document is a living specification. It should be updated at the end of each weekly sprint to reflect decisions made, features completed, and scope changes.*

---

**End of Document**
