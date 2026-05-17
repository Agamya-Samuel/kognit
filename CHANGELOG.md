# Changelog

All notable changes to the EduTech platform are documented here.

The format follows [Conventional Commits](https://www.conventionalcommits.org/) and [Keep a Changelog](https://keepachangelog.com/).

---

## [0.1.0] — 2026-05-17

Initial beta release. All core features implemented over the 30-day sprint.

### Phase 1: Foundation & Infrastructure (Days 1–7)

- Monorepo setup with Turborepo and npm workspaces
- NestJS API bootstrap with modular architecture
- PostgreSQL 16 database with Drizzle ORM and 25-table schema
- Redis integration with BullMQ for background job processing
- Testing infrastructure: Jest (unit), Vitest (frontend), Playwright (E2E)
- JWT authentication with email-first registration flow
- RBAC with four roles: student, instructor, admin, institution_admin
- Next.js frontend scaffold for student, instructor, admin, and landing apps

### Phase 2: Course Platform & Upload Pipeline (Days 8–14)

- Course CRUD with sections, lectures, and curriculum management
- Instructor dashboard frontend with course creation
- S3 signed URL upload pipeline with progress tracking
- Mux video integration: transcoding, playback, webhooks
- Student course browsing, enrollment, and video player
- Video progress tracking with watch history
- Razorpay payment integration: orders, verification, webhooks, refunds

### Phase 3: Realtime, Engagement & Live Classes (Days 15–21)

- Socket.IO gateway with Redis pub/sub adapter
- Chat system: channels, messaging, threading, moderation, flagging
- LiveKit integration for live video classes
- Live class scheduling with instructor/student calendars
- Recording pipeline: start, complete webhook, post-session processing
- Assignments and quizzes backend with MCQ auto-grading
- Assignment submissions with late penalty calculation
- Bulk grading and bulk assignment creation
- Student and instructor assignment frontends
- Certificate generation and public verification
- PostHog analytics integration with instructor dashboard

### Phase 4: Stabilization, Admin & Production Readiness (Days 22–29)

- Admin dashboard: user management, instructor approval, course moderation
- Performance optimization: 65 database indexes, gzip compression, cache headers, slow query logging
- Security audit: CORS hardening, rate limiting, throttler configuration
- E2E tests: auth flows, courses CRUD, error paths, edge cases, responsive design
- Error monitoring with Sentry integration
- Structured logging with Pino (request ID middleware)
- Swagger API documentation for all 107 endpoints across 18 controllers
- @ApiProperty decorators on all 63 DTO classes
- @ApiResponse and @ApiParam decorators on all controller endpoints
- Local development setup guide
- Deployment runbook with rollback procedures
- Troubleshooting guide

---

## Breaking Changes

None yet — this is the initial release (`v0.1.0`).

---

## Migration Notes

### Database

The initial schema uses Drizzle ORM migrations. Apply with:

```bash
cd apps/api
npm run db:migrate
```

### Environment Variables

See `apps/api/.env` for the full list. Key defaults for local development:
- Database: `edutech` / `edutech_password` on `localhost:5432`
- Redis: `localhost:6379`
- JWT secrets: defaults provided (change for production)
