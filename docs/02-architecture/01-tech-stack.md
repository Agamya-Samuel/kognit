# Tech Stack

> **Purpose:** Full technology stack and backend module boundaries
> **Source:** PROJECT_DOCUMENTATION.md §7

---

## Stack Summary

| Layer | Technology |
|---|---|
| **Student Web** | Next.js (App Router), TypeScript, TailwindCSS — `apps/web-student` |
| **Instructor Web** | Next.js (App Router), TypeScript, TailwindCSS — `apps/web-instructor` |
| **Admin Web** | Next.js (App Router), TypeScript, TailwindCSS — `apps/web-admin` |
| **Institution Web** | Next.js (App Router), TypeScript, TailwindCSS — `apps/web-institution` (Phase 2) |
| **UI Components** | ShadCN/UI (shared via `/packages/ui`) |
| **State Management** | Jotai (per-app, isolated state) |
| **API Client** | Axios-based client with service modules (`/packages/api-client`) |
| **Data Fetching** | TanStack Query (React Query for all HTTP operations) |
| **Forms** | React Hook Form + Zod |
| **Mobile (Future)** | React Native + Expo |
| **Backend API** | NestJS (modular monolith), REST-first |
| **WebSockets** | Socket.IO (NestJS Gateway) |
| **Database** | PostgreSQL (Dokploy managed) |
| **ORM** | Drizzle ORM |
| **Cache / Queue / Presence** | Redis (Upstash) |
| **Auth** | Custom JWT + Refresh Tokens (NestJS) + Auth.js as OAuth broker |
| **Video Infra** | Mux (transcoding, HLS, playback) |
| **Live Classes** | LiveKit |
| **Storage** | AWS S3 |
| **CDN** | AWS CloudFront |
| **Payments** | Razorpay (payments + Razorpay Route for instructor payouts) |
| **Search** | Meilisearch (full-text search, filtering, instant search — self-hosted via Dokploy) |
| **Analytics** | PostHog |
| **Error Monitoring** | Sentry |
| **Monorepo** | Turborepo |
| **Containerization** | Docker |
| **Deployment** | Dokploy |
| **Hosting** | AWS |
| **Validation** | Zod (shared across frontend + backend) |
| **Type Definitions** | Shared TypeScript types (`/packages/types`) |

---

## Backend Module Boundaries (NestJS)

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
