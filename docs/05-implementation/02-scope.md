# Scope

> **Purpose:** In scope, out of scope, deferred features, and open questions
> **Source:** PROJECT_DOCUMENTATION.md §14, §15, clever-circuit (Missing Features Table), cosmic-comet §1b

---

## In Scope — Month 1

### Phase 1: Foundation & Infrastructure (Week 1)
- Monorepo setup (Turborepo, shared packages, CI/CD)
- NestJS bootstrap (all module stubs, global pipes/interceptors)
- Database design (all core schemas via Drizzle ORM)
- Redis integration (Upstash, BullMQ queues)
- Docker setup (per-app Dockerfiles, docker-compose)
- Dokploy staging deploy (api + web-student)
- S3 + CloudFront setup
- Auth system (JWT + refresh tokens, role middleware, OAuth skeleton, account lockout, password policy, email-first registration, refresh token theft detection)
- CORS configuration (strict subdomain allow-list)
- Next.js scaffold (web-student, auth pages)

### Phase 2: Course Platform & Upload Pipeline (Week 2)
- Instructor dashboard (web-instructor scaffold, course CRUD)
- Upload pipeline (signed S3 URLs, direct upload, progress tracking, post-upload magic byte validation)
- Mux integration (asset creation, transcoding, signed playback, dead-letter queue, reconciliation cron)
- Student course pages (listing, detail, free preview)
- Video player (HLS, progress tracking, resume playback)
- Payment integration (Razorpay checkout, webhooks, enrollment grant)
- Basic notifications (email on enrollment)

### Phase 3: Realtime, Engagement & Live Classes (Week 3)
- Socket.IO gateway (authentication, room architecture, Redis adapter)
- Chat system (real-time messaging, persistence, threading, moderation)
- LiveKit integration (room creation, instructor/student tokens, recording)
- Live class scheduling (calendar, notifications, recording pipeline)
- Assignments & quizzes (creation, submission, auto-grading, manual grading)
- Certificates (auto-generation on completion, PDF, verification)
- PostHog analytics (event tracking, instructor analytics dashboard)
- In-app notifications (Socket.IO delivery)

### Phase 4: Stabilization, Admin & Production Readiness (Week 4)
- Admin dashboard (web-admin scaffold, user management, instructor approval, course moderation)
- Performance optimization (indexing, N+1 elimination, caching, CDN)
- Security audit (rate limiting, signed URLs, RBAC, input sanitization, CSRF)
- E2E testing (core flows, edge cases, error paths)
- Error monitoring (Sentry, structured logging, alerting)
- Documentation (Swagger API docs, runbooks, setup guides)
- Beta launch prep (invite system, landing page, waitlist)

---

## Out of Scope — Month 1

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

## Deferred Features (Identified Gaps)

| Feature | Priority | Notes |
|---|---|---|
| Audit logging | Medium | For admin actions (audit_logs table exists, needs enforcement in service layer) |
| Backup/restore procedures | High | Document in runbooks (risk register has strategy, runbooks need writing on Day 29) |
| Database indexes | High | Concrete index list per table — to be defined during Day 3 schema implementation |
| Instructor revenue share % | Medium | Negotiated per-instructor, processed manually via Razorpay Route payouts |
| Malware scanning (ClamAV) | Low | Recommended for Phase 2 — no Month 1 implementation |
| Global timezone support | Medium | Month 1: IST (Asia/Kolkata) only. Phase 2: per-user timezone preference |
| Full GDPR compliance | Medium | Basic DPDP Act consent in Month 1. Full GDPR deferred to Phase 2 if global users arrive |

---

## Open Questions (Deferred to Implementation)

These decisions can be made during implementation as they don't block initial setup:

**Q1: Payment Gateway Fallback**
- Razorpay is primary, fallback strategy to be implemented as abstract gateway interface
- Deferred to Day 14 implementation

**Q2: Email Infrastructure**
- AWS SES for cost efficiency in Month 1
- Monitoring deliverability closely
- Can migrate to SendGrid/Postmark if deliverability issues arise

**Q3: Content Moderation Workflow**
- User reports + admin review triggers
- 24-hour SLA for moderation review
- Detailed workflow defined during Day 23 implementation

**Q4: Data Privacy & Compliance**
- Basic consent checkboxes for DPDP Act compliance
- Data export/deletion endpoints added to user profile
- Full GDPR compliance deferred to Phase 2 if global users arrive

**Q5: Content Versioning**
- When an instructor updates a course (adds/removes lectures), existing students see the new version immediately
- Removed lectures: progress records preserved but excluded from completion calculation
- Added lectures: counted toward completion, student sees "new" badge
- Certificate: NOT automatically re-issued on content updates. Admin can manually revoke and re-issue certificates via the admin dashboard if content changes are significant. No automated percentage-based rule — admin discretion applies.
- Full content versioning (history tracking, rollback, A/B testing) deferred to Phase 2

**Q6: Concurrent Video Playback**
- Max 2 concurrent active playback sessions per student
- Enforced via Redis Lua script for atomic check + insert (see [Auth Architecture](../02-architecture/05-auth.md))
- 3rd device evicts the oldest active session
- Progress reconciliation: server uses max merge (`GREATEST(current, new)`) — progress never goes backward
