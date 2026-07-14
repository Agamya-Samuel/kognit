# EdTech Platform — 30 Day Implementation Plan

> **Created:** 8th May, 2026  
> **Status:** Ready for Implementation  
> **Testing Mandate:** 100% Code Coverage Required

---

## Executive Summary

Complete 30-day implementation plan for the EdTech platform. Covers day-by-day tasks, test requirements, and exit criteria, supplemented with architectural decisions, best practices, and risk mitigation strategies. Assumes 8-10 focused hours/day, with Days 28-30 as buffer for slippage.

---

## Architecture Decisions (Confirmed)

**Auth Strategy: Custom JWT in NestJS**

- Auth.js acts as OAuth broker only
- NestJS handles JWT + refresh token logic
- HTTP-only cookies for web, token response for mobile
- Token rotation with revocation list in Redis
- Per-app scoped cookie domains for each frontend app

**Database Testing: testcontainers (Real PostgreSQL)**

- Real PostgreSQL in tests via `@testcontainers/postgresql`
- Transactional rollback per test for isolation
- Migration tests run against real database

**API Client: Auto-generated from OpenAPI**

- `openapi-typescript` for type generation
- Swagger (`@nestjs/swagger`) integration from Day 2
- Client types always in sync with backend
- Used by all frontend apps and future mobile

**Frontend Architecture: Separate Apps in Monorepo**

- `apps/web-student` → `student.example.com`
- `apps/web-instructor` → `instructor.example.com`
- `apps/web-admin` → `admin.example.com`
- `apps/web-institution` → `institution.example.com` (Phase 2)
- Shared packages: `/packages/ui`, `/packages/types`, `/packages/validation`, `/packages/api-client`, `/packages/config`, `/packages/shared-components`
- Each app has independent deployment, cookies, Sentry project, PostHog instance

**App Scaffolding Schedule:**

- Day 7: `apps/web-student` scaffolded and deployed to staging
- Day 9: `apps/web-instructor` scaffolded and deployed to staging
- Day 22: `apps/web-admin` scaffolded and deployed to staging

### Deferred Open Questions

| Question                        | Decision                                     | Deferred To |
| ------------------------------- | -------------------------------------------- | ----------- |
| Q7: Payment Gateway Fallback    | Abstract gateway interface; Razorpay primary | Day 14      |
| Q8: Email Infrastructure        | AWS SES; migrate if deliverability issues    | Day 6       |
| Q9: Content Moderation Workflow | User reports + admin review, 24hr SLA        | Day 23      |
| Q10: Data Privacy & Compliance  | Basic DPDP consent; full GDPR in Phase 2     | Day 6       |

---

## Version Control & Git Workflow

**Branch Strategy:**

- `main` — production-ready code only (protected, requires PR + CI pass)
- `develop` — integration branch for features
- `feature/*` — feature branches (e.g., `feature/day-1-monorepo-setup`)
- `hotfix/*` — urgent fixes for production

**Commit Conventions:**

- Use Conventional Commits: `type(scope): description`
  - `feat(auth): add JWT refresh token rotation`
  - `fix(upload): resolve signed URL expiry calculation`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Pull Request Standards:**

- PR template: description, testing evidence, screenshots (if UI)
- Minimum 1 approval required (self-review even for solo dev)
- All CI checks must pass before merge
- Squash merge to maintain clean main history

---

## Testing Mandate (Compulsory — No Exceptions)

**Every single piece of code — frontend logic or backend logic — MUST be accompanied by appropriate tests. No code is merged without tests.**

### Testing Layers

| Layer                 | Tooling                                             | Scope                                                              |
| --------------------- | --------------------------------------------------- | ------------------------------------------------------------------ |
| **Unit Tests**        | Jest (NestJS), Vitest (Next.js)                     | Individual functions, services, components, utilities, Zod schemas |
| **Integration Tests** | Jest + Supertest (backend), Vitest + RTL (frontend) | Module interactions, API endpoints, component compositions         |
| **E2E Tests**         | Supertest (backend), Playwright (frontend)          | Full user flows, critical paths, cross-module workflows            |

### Coverage Requirements

- **Minimum coverage:** 100% line coverage, 100% branch coverage
- **Enforcement:** CI/CD pipeline blocks merge if coverage drops below 100%
- **Per-file coverage reports** generated on every test run
- **No `istanbul ignore` comments allowed** without documented justification and team lead approval

### Test File Naming Conventions

| Test Type   | Backend                 | Frontend                     |
| ----------- | ----------------------- | ---------------------------- |
| Unit        | `*.spec.ts`             | `*.test.tsx` / `*.test.ts`   |
| Integration | `*.integration.spec.ts` | `*.integration.test.tsx`     |
| E2E         | `*.e2e-spec.ts`         | `*.e2e.test.ts` (Playwright) |

### Testing Best Practices

- **Test Pyramid:** 70% unit tests, 20% integration tests, 10% E2E tests
- **Each test tests ONE behavior** — if test description contains "and", split it
- **Fresh state per test** — `beforeEach` resets mocks and recreates modules
- **Test contracts, not implementations** — verify outputs/throws, not internal mechanics
- **Realistic test data** — use meaningful names, valid email formats, real-world structures
- **No over-mocking** — use real implementations for simple utilities and pure functions
- **Mock external services** — Mux, LiveKit, Razorpay, AWS SES all mocked in unit/integration tests
- **Database testing** — use transactional rollback per test (never persist test data)
- **Server Actions** — test business logic with Vitest, test form integration with Playwright
- **Async Server Components** — test via Playwright E2E (Vitest cannot render async components)
- **AAA Pattern:** Arrange → Act → Assert in every test
- **Factory functions** for all entities with override support: `createUser({ role: 'admin' })`
- **No hardcoded test data** — use factories everywhere

### Coverage Scripts

Each app and package has its own test script. Root scripts aggregate all results:

```json
{
  "test": "turbo run test",
  "test:watch": "turbo run test --watch",
  "test:api:cov": "turbo run test:cov --filter=api",
  "test:web-student:cov": "turbo run test:cov --filter=web-student",
  "test:web-instructor:cov": "turbo run test:cov --filter=web-instructor",
  "test:web-admin:cov": "turbo run test:cov --filter=web-admin",
  "test:e2e": "turbo run test:e2e",
  "test:e2e:web-student": "turbo run test:e2e --filter=web-student",
  "test:e2e:web-instructor": "turbo run test:e2e --filter=web-instructor",
  "test:e2e:web-admin": "turbo run test:e2e --filter=web-admin",
  "test:all": "npm run test:api:cov && npm run test:web-student:cov && npm run test:web-instructor:cov && npm run test:web-admin:cov && npm run test:e2e"
}
```

---

## Security Vulnerabilities & Mitigations

| Vulnerability                                | Risk                                  | Mitigation                                                                                   |
| -------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Race condition on enrollment**             | Duplicate enrollments, double charges | Day 8: Unique `(student_id, course_id)` DB constraint + transaction isolation tests (Day 24) |
| **Race condition on certificate generation** | Multiple certificates per course      | Day 21: Unique constraint + race condition tests                                             |
| **Stolen refresh tokens (30-day expiry)**    | Account takeover                      | Day 6: Token rotation tests, revocation list in Redis                                        |
| **Webhook spoofing (Mux/Razorpay)**          | Fake payments/recordings              | Day 11/14: Signature verification tests, timestamp validation                                |
| **CSRF on auth endpoints**                   | Session hijacking                     | Day 1/6: CSRF token tests on all state-changing endpoints                                    |
| **Progress tracking boundary (90%)**         | Inconsistent completion               | Day 13: `>= 90%` threshold tests, edge case 89.9% vs 90.1%                                   |
| **SQL injection via search**                 | Data breach                           | Day 8: Parameterized queries + SQL injection tests                                           |
| **File upload type spoofing**                | Malicious file upload                 | Day 10: MIME type + magic byte validation tests                                              |
| **No rate limiting**                         | DoS attacks                           | Day 25: Rate limit tests on all public endpoints                                             |

---

## Error Handling Standards

**Backend Error Hierarchy:**

```
DomainError (base)
  ├── ValidationError (400)
  ├── AuthenticationError (401)
  ├── AuthorizationError (403)
  ├── NotFoundError (404)
  ├── ConflictError (409)
  └── ExternalServiceError (502)
```

**Standardized Error Responses:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is already registered",
    "details": [{ "field": "email", "message": "Email already exists" }]
  }
}
```

**Frontend Error Boundaries:**

- Each route has its own error boundary
- Errors logged to Sentry automatically
- User-friendly error messages (no stack traces)
- Retry buttons for network failures

---

## API Design Standards

**Endpoint Structure:**

```
GET    /api/v1/courses              → List courses (paginated)
POST   /api/v1/courses              → Create course
GET    /api/v1/courses/:id          → Get course by ID
PATCH  /api/v1/courses/:id          → Update course
DELETE /api/v1/courses/:id          → Delete course
GET    /api/v1/courses/:id/sections → List course sections
POST   /api/v1/courses/:id/sections → Add section to course
```

**Pagination Standard:**

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Rate Limiting Tiers:**

- Public endpoints: 100 requests/15 minutes per IP
- Authenticated endpoints: 1000 requests/15 minutes per user
- Upload endpoints: 10 uploads/hour per user
- WebSocket: 50 messages/minute per connection

---

## Deferred Features (Backlog)

| Feature                                | Priority | Notes                         |
| -------------------------------------- | -------- | ----------------------------- |
| Password policy (complexity, rotation) | High     | Add to auth system            |
| Account lockout after failed attempts  | High     | Security requirement          |
| Audit logging                          | Medium   | For admin actions             |
| Backup/restore procedures              | High     | Document in runbooks          |
| Database indexes                       | High     | Add to schema design          |
| Unique constraints                     | Critical | Prevent data integrity issues |

---

## CI/CD Pipeline

**Pipeline Stages:**

1. **Lint** — ESLint, Prettier, TypeScript
2. **Test** — Unit tests + coverage (per-app, affected-only builds)
3. **Build** — Production build
4. **Integration Test** — Database tests, API tests
5. **E2E Test** — Playwright tests (against staging)
6. **Security Scan** — Dependency audit, SAST
7. **Deploy** — To staging/production

**Cache Strategy:**

- Cache node_modules (Turborepo handles this)
- Cache build outputs
- Cache test results (run only affected tests)
- Cache Docker layers

**Deployment Strategy:**

- Staging environment mirrors production
- Blue-green deployment for zero downtime
- Database migrations run before code deploy
- Rollback plan documented for each deploy
- Health checks after deploy (automated)

---

## 30-Day Day-Wise Plan

### Phase 1: Foundation & Infrastructure (Days 1–7)

---

#### **Day 1 — Monorepo Setup & Project Scaffolding**

**Goal:** Turborepo monorepo with shared packages, linting, formatting, CI/CD

| Task                     | Details                                                                                                                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Initialize Turborepo     | Root `package.json`, `turbo.json`, workspace configuration                                                                                                                                                                           |
| Scaffold apps            | `apps/web-student` (Next.js), `apps/web-instructor` (Next.js), `apps/web-admin` (Next.js), `apps/api` (NestJS)                                                                                                                       |
| Scaffold shared packages | `packages/ui` (ShadCN), `packages/types` (TypeScript types), `packages/validation` (Zod schemas), `packages/api-client` (typed client), `packages/config` (ESLint, TSConfig), `packages/shared-components` (cross-app UI components) |
| Code quality             | ESLint config, Prettier config, Husky pre-commit hooks, lint-staged                                                                                                                                                                  |
| CI/CD pipeline           | GitHub Actions workflow — lint, typecheck, test, build (per-app pipelines, affected-only builds)                                                                                                                                     |
| Git workflow             | Branch strategy (`main`, `develop`, `feature/*`, `hotfix/*`), PR template, Conventional Commits validation                                                                                                                           |
| **.env.example**         | Document all required environment variables (per-app and shared)                                                                                                                                                                     |

**Tests Required:**

- Unit tests for all shared Zod schemas in `/packages/validation`
- Unit tests for all TypeScript type utility functions in `/packages/types`
- Integration tests for ESLint/Prettier config validation
- CI pipeline test: verify all checks pass on empty scaffold
- CI pipeline test: verify affected-apps filtering works correctly

**Exit Criteria:** `turbo run build` succeeds, `turbo run test` passes (all scaffold tests), Husky blocks commits on lint failure, CI builds only affected apps

---

#### **Day 2 — NestJS Bootstrap & Module Structure**

**Goal:** NestJS backend running with all core module stubs, error hierarchy, standardized responses

| Task                 | Details                                                                                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NestJS app setup     | `apps/api` — main module, global pipes, interceptors, exception filters                                                                                         |
| Module scaffolding   | `auth`, `users`, `courses`, `enrollments`, `uploads`, `media`, `live`, `payments`, `notifications`, `chat`, `assignments`, `certificates`, `analytics`, `admin` |
| Global interceptors  | Response envelope interceptor (standardized `{success, data, meta, error}` format)                                                                              |
| Error hierarchy      | `DomainError` → `ValidationError`, `AuthenticationError`, `AuthorizationError`, `NotFoundError`, `ConflictError`, `ExternalServiceError`                        |
| Validation pipe      | Global Zod validation pipe with detailed error messages                                                                                                         |
| Configuration module | `@nestjs/config` with typed environment variables, Zod validation                                                                                               |
| Swagger setup        | `@nestjs/swagger` integration for OpenAPI generation                                                                                                            |
| Docker setup         | `Dockerfile` for API, `docker-compose.yml` for local dev (PostgreSQL + Redis)                                                                                   |

**Tests Required:**

- Unit tests for response envelope interceptor
- Unit tests for Zod validation pipe (valid input, invalid input, edge cases)
- Unit tests for error hierarchy (each error type, status codes, serialization)
- Unit tests for configuration module (valid env, missing vars, invalid types)
- Integration tests for each module stub (module loads, provider injects)
- E2E test: health check endpoint returns 200 with correct response shape

**Exit Criteria:** `npm run start:dev` works, all module tests pass, Docker compose starts successfully, error responses match standardized format, Swagger UI accessible

---

#### **Day 3 — Database Design & Drizzle ORM Setup**

**Goal:** All core schemas defined, migrated, and tested with migration safety practices

| Task                | Details                                                                                                                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Drizzle ORM setup   | Schema definitions for ALL tables listed in PROJECT_DOCUMENTATION.md §8                                                                                                                                            |
| Schema files        | `users`, `instructor_profiles`, `student_profiles`, `courses`, `sections`, `lectures`, `enrollments`, `progress`, `live_classes`, `assignments`, `submissions`, `certificates`, `payments`, `messages`, `channels` |
| Relations           | Foreign keys, cascading deletes (ON DELETE CASCADE), unique constraints, indexes                                                                                                                                   |
| Migration setup     | `drizzle-kit` configured, migration generation and apply scripts (forward-only in production, down migrations for dev)                                                                                             |
| Data integrity      | Check constraints for enum-like fields, NOT NULL on required fields, defaults for timestamps                                                                                                                       |
| Seed script         | Development seed data (1 admin, 1 instructor, 2 students, 1 course)                                                                                                                                                |
| Database connection | Connection pool, error handling, graceful shutdown                                                                                                                                                                 |

**Tests Required:**

- Unit tests for each schema definition (column types, constraints, defaults)
- Unit tests for relation definitions (foreign keys, cascades)
- Integration tests for each CRUD operation against real PostgreSQL via testcontainers
- Integration tests for constraint enforcement (unique violation, FK violation, NOT NULL violation)
- Integration tests for seed script (creates expected records, idempotent)
- E2E test: full migration run from scratch succeeds with no errors

**Exit Criteria:** All schemas match PROJECT_DOCUMENTATION.md §8, migrations apply cleanly, all tests pass, seed script works, transactional rollback per test operational

---

#### **Day 4 — Redis Integration & Background Jobs**

**Goal:** Redis connected, BullMQ queue operational, rate limiting tiers configured

| Task             | Details                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Redis connection | Upstash Redis integration (dev: local Redis via docker-compose)                                                           |
| Redis module     | NestJS Redis module with connection health checks                                                                         |
| BullMQ setup     | Queue definitions: `media-processing`, `email-notifications`, `certificate-generation`                                    |
| Queue processors | Worker stubs for each queue                                                                                               |
| Rate limiting    | Redis-backed rate limiter with tiers: 100 req/15min public, 1000 req/15min authenticated, 10 uploads/hour, 50 WS msgs/min |
| Cache utilities  | Generic cache service with TTL, invalidation, key namespacing                                                             |
| Circuit breaker  | Circuit breaker pattern setup for external service calls                                                                  |

**Tests Required:**

- Unit tests for Redis connection service (connect, disconnect, reconnect, error handling)
- Unit tests for cache service (get, set, delete, TTL expiration, key namespacing)
- Unit tests for rate limiter (each tier, boundary conditions, reset after window)
- Unit tests for circuit breaker (open, half-open, closed states)
- Integration tests for BullMQ queue creation and job enqueuing
- Integration tests for BullMQ worker processing (job completes, job fails, retry logic)
- E2E test: enqueue job → worker processes → result stored in DB

**Exit Criteria:** Redis connected, queues operational, rate limiting enforced per tier, all tests pass with 100% coverage

---

#### **Day 5 — Testing Infrastructure Finalization**

**Goal:** All testing frameworks configured, mock factories created, CI coverage gates

| Task                                 | Details                                                                                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Jest config (backend)                | `jest.config.ts` — coverage thresholds (100%), reporters, test match patterns                                                                    |
| Vitest config (per frontend app)     | `vitest.config.ts` in each `apps/web-*` — coverage, RTL setup, Next.js path aliases                                                              |
| Playwright config (per frontend app) | `playwright.config.ts` in each `apps/web-*` — webServer, browsers, baseURL, test proxy for MSW                                                   |
| Mock factories                       | Factory functions for: User, Course, Lecture, Enrollment, Payment, Certificate, Assignment, Submission, Message, Channel — with override support |
| Database test helpers                | Transactional test wrapper (rollback after each test), test DB seeding                                                                           |
| CI coverage gates                    | GitHub Actions fails if coverage < 100%, coverage report artifacts (per-app reports)                                                             |
| MSW setup                            | Mock Service Worker for frontend API mocking, handlers for all v1 endpoints                                                                      |
| Test isolation                       | Parallel test execution with no shared state, minimal data per test                                                                              |
| Test containers                      | Real PostgreSQL via `@testcontainers/postgresql` for integration tests                                                                           |

**Tests Required:**

- Unit tests for all mock factories (generate valid data, respect types, customizable overrides)
- Unit tests for database test helpers (transaction isolation, rollback verification)
- Integration tests: Jest config correctly reports 100% coverage on test fixtures
- Integration tests: Vitest config correctly runs frontend unit tests (all 3 apps)
- E2E test: Playwright config starts Next.js dev server and runs a dummy test (all 3 apps)
- E2E test: CI pipeline correctly fails on coverage drop
- Integration test: Turborepo affected-apps filtering correctly identifies changed apps

**Exit Criteria:** All test frameworks operational for all apps, mock factories cover all domain entities, CI enforces 100% coverage per app

---

#### **Day 6 — Auth System Implementation**

**Goal:** JWT + refresh token flow, role middleware, OAuth skeleton, security headers

| Task                   | Details                                                                          |
| ---------------------- | -------------------------------------------------------------------------------- |
| Auth module            | `apps/api/src/auth` — register, login, logout, refresh, OAuth callback           |
| JWT strategy           | Access token generation (15 min expiry), payload: userId, role, email            |
| Refresh token strategy | Refresh token generation (30 day expiry), rotation with revocation list in Redis |
| Password hashing       | bcrypt with configurable salt rounds                                             |
| Role guards            | `@Roles()` decorator, `RolesGuard` enforcement                                   |
| Auth middleware        | JWT extraction from HTTP-only cookies (web) / Authorization header (mobile)      |
| OAuth skeleton         | Google + GitHub provider configuration, Auth.js integration                      |
| Email verification     | Token generation, verification endpoint, resend logic (AWS SES)                  |
| Password reset         | Token generation, email with reset link, password update endpoint                |
| Security headers       | HSTS, CSP, X-Frame-Options, X-Content-Type-Options                               |
| CSRF protection        | CSRF tokens for state-changing operations                                        |
| DPDP compliance        | Basic consent checkboxes for data privacy                                        |

**Tests Required:**

- Unit tests for JWT service (generate, verify, decode, expired token, tampered token)
- Unit tests for refresh token service (generate, validate, revoke, expired, already-used)
- Unit tests for password hashing (hash matches, wrong password fails, salt uniqueness)
- Unit tests for role guard (allows correct role, denies wrong role, denies unauthenticated)
- Unit tests for security headers (all headers present, correct values)
- Integration tests for registration (valid input, duplicate email, weak password, missing fields)
- Integration tests for login (valid credentials, wrong password, unverified account, locked account)
- Integration tests for logout (token revoked, refresh after logout fails)
- Integration tests for refresh (valid refresh, expired refresh, revoked refresh)
- Integration tests for OAuth callback (new user creation, existing user login, provider mismatch)
- Integration tests for email verification (valid token, expired token, already verified)
- Integration tests for password reset (valid flow, expired token, token reuse)
- Integration tests for CSRF protection (valid token accepted, missing/invalid rejected)
- E2E test: full registration → email verify → login → access protected route → refresh → logout flow
- E2E test: OAuth login → JWT issued → protected route accessible

**Exit Criteria:** Auth works end-to-end, all test types pass, OAuth skeleton configured, security headers enforced, CSRF protected

---

#### **Day 7 — Next.js Frontend Scaffold & Auth Pages (`apps/web-student`)**

**Goal:** `apps/web-student` running, auth pages functional, Dokploy staging deploy

| Task                          | Details                                                                                                           |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Next.js setup (`web-student`) | App Router, TailwindCSS, ShadCN/UI init, path aliases, environment config                                         |
| Layout structure              | Root layout, auth layout, dashboard layout, error boundaries, loading states                                      |
| Auth pages                    | Login page, Register page, Forgot Password, Reset Password, Email Verification                                    |
| API client                    | Typed API client in `/packages/api-client` (auto-generated from OpenAPI) with auth interceptors (cookie handling) |
| Auth context                  | Jotai atoms for auth state, TanStack Query integration for user profile                                           |
| Protected routes              | Middleware for route protection (student redirects)                                                               |
| Shared components             | Button, Input, Card, Dialog, Toast, Form (from `/packages/ui`)                                                    |
| Accessibility                 | Semantic HTML, ARIA labels, keyboard navigation, color contrast ≥ 4.5:1, focus management on route changes        |
| Performance budget            | Bundle size < 200KB (gzip), Lighthouse score > 90                                                                 |
| Dokploy staging               | Deploy API + `web-student` to staging, configure subdomain (`student.example.com`), SSL, env vars                 |

**Tests Required:**

- Unit tests for auth pages (form validation, error display, success redirect)
- Unit tests for API client (request interceptor, response interceptor, error handling, retry logic)
- Unit tests for Jotai auth atoms (login state, logout state, user data updates)
- Unit tests for shared UI components (render, props, accessibility, disabled state)
- Unit tests for route protection middleware (authenticated redirect, unauthenticated redirect, role-based redirect)
- Unit tests for accessibility compliance (ARIA labels, keyboard nav, focus management)
- Integration tests: login form → API call → state update → redirect (mocked API)
- Integration tests: registration form → validation → API call → success message (mocked API)
- Integration tests: forgot password → email sent → reset form → success (mocked API)
- E2E test (Playwright): full registration → email verify → login → dashboard navigation
- E2E test: protected route redirects to login when unauthenticated
- E2E test: Dokploy staging deploy is accessible and responsive at `student.example.com`

**Exit Criteria:** Staging environment live (`student.example.com` + API), auth pages working end-to-end, all tests pass, 100% coverage on frontend auth code

> **Note:** `apps/web-instructor` scaffolding happens on Day 9 and `apps/web-admin` scaffolding happens on Day 22. Auth pages are shared via `/packages/shared-components` to avoid duplication.

---

### Phase 2: Course Platform & Upload Pipeline (Days 8–14)

---

#### **Day 8 — Course CRUD Backend**

**Goal:** Full course management API with sections and lectures

| Task                     | Details                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------- |
| Course module            | CRUD endpoints: create, read, update, delete, list (with pagination, filtering, search) |
| Section module           | CRUD for sections within courses (add, reorder, delete)                                 |
| Lecture module           | CRUD for lectures within sections (add, reorder, delete, type assignment)               |
| Free preview enforcement | Logic to determine which lectures are free preview (first 1-2 per course)               |
| RBAC enforcement         | Instructors can only manage own courses, admin can manage all                           |
| DTOs & validation        | Zod schemas for all request bodies, response types in `/packages/types`                 |
| Database queries         | Optimized queries with proper joins, indexes, N+1 prevention                            |
| SQL injection prevention | All queries parameterized via Drizzle ORM                                               |

**Tests Required:**

- Unit tests for course service (create, update, delete, find, pagination, search, filter)
- Unit tests for section service (create, reorder, delete, cascade behavior)
- Unit tests for lecture service (create, reorder, delete, type assignment, free preview logic)
- Unit tests for free preview enforcement (first 2 lectures free, third+ paid, edge cases)
- Unit tests for RBAC middleware (instructor owns course, instructor doesn't own, admin override)
- Unit tests for all Zod DTOs (valid input, missing fields, invalid types, boundary values)
- Integration tests for course CRUD (create → read → update → delete → verify not found)
- Integration tests for section CRUD within courses
- Integration tests for lecture CRUD within sections
- Integration tests for pagination (page 1, page 2, beyond last page, empty results)
- Integration tests for filtering (by domain, by instructor, by price, by published status)
- Integration tests for search (partial title match, no results, special characters, SQL injection payloads rejected)
- Integration tests for RBAC enforcement (instructor A cannot edit instructor B's course)
- E2E test: instructor creates course → adds sections → adds lectures → publishes → student browses
- E2E test: admin can view/edit all courses, student cannot create courses

**Exit Criteria:** Course CRUD fully operational, all tests pass with 100% coverage, RBAC enforced at every endpoint

---

#### **Day 9 — Instructor Dashboard Frontend (`apps/web-instructor`)**

**Goal:** `apps/web-instructor` scaffolded, instructor can create and manage courses via UI

| Task                       | Details                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Scaffold `web-instructor`  | Next.js App Router, TailwindCSS, ShadCN/UI, shared packages wiring, Dokploy deployment config                |
| Auth pages (instructor)    | Reuse `/packages/shared-components` auth forms, instructor-specific post-login redirect                      |
| Course creation form       | Multi-step form: course details, sections, lectures, pricing, publish                                        |
| Course list page           | Table of instructor's courses with status, enrollment count, revenue                                         |
| Course edit page           | Edit course details, reorder sections/lectures (drag-and-drop)                                               |
| Section management         | Add/edit/delete sections, reorder via drag-and-drop                                                          |
| Lecture management         | Add/edit/delete lectures, set type, mark free preview, reorder                                               |
| Pricing form               | Set pricing type (free/paid/institutional), set INR prices                                                   |
| Publish toggle             | Publish/draft toggle with confirmation dialog                                                                |
| TanStack Query integration | Mutations for all CRUD operations, optimistic updates, error handling, staleTime/gcTime configured per query |
| Component architecture     | Presentational + container components, custom hooks for reusable logic                                       |
| Dokploy staging            | Deploy `web-instructor` to staging, configure subdomain (`instructor.example.com`), SSL, env vars            |

**Tests Required:**

- Unit tests for course creation form (field validation, step navigation, form submission)
- Unit tests for course list page (render courses, empty state, loading state, error state)
- Unit tests for course edit page (pre-fill data, save changes, discard changes)
- Unit tests for drag-and-drop reordering (section reorder, lecture reorder, invalid drop)
- Unit tests for pricing form (free/paid/institutional toggle, price validation, currency validation)
- Unit tests for publish toggle (draft → published confirmation, published → draft warning)
- Integration tests: form submission → API call → optimistic update → success toast (mocked API)
- Integration tests: drag-and-drop → reorder API call → UI update → persistence verification (mocked API)
- Integration tests: pricing change → validation → API call → update confirmation (mocked API)
- E2E test: instructor creates course → adds 2 sections → adds 3 lectures → sets price → publishes
- E2E test: instructor edits course → reorders sections → saves → changes persist after reload
- E2E test: Dokploy staging deploy is accessible at `instructor.example.com`

**Exit Criteria:** `web-instructor` scaffolded and deployed, instructor dashboard fully functional, all CRUD operations work via UI, 100% frontend coverage

---

#### **Day 10 — Upload Pipeline (S3 Signed URLs)**

**Goal:** Direct-to-S3 upload via signed URLs with progress tracking, file upload security

| Task                      | Details                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| Upload module             | Endpoint to request signed S3 upload URL (per lecture)                                     |
| S3 integration            | AWS SDK v3 configuration, bucket setup, CloudFront origin                                  |
| Signed URL generation     | PUT signed URL with 15-min expiry, content-type validation, max size (500MB)               |
| Upload tracking           | Track upload status (pending, uploading, complete, failed) in DB                           |
| Upload completion webhook | S3 event → NestJS webhook → mark upload complete → trigger Mux ingestion                   |
| Upload progress API       | Endpoint for frontend to poll upload progress                                              |
| Frontend upload UI        | Drag-and-drop upload zone, progress bar, retry on failure, cancel upload                   |
| File upload security      | MIME type validation, magic byte validation, malware scanning prep, private S3 bucket only |

**Tests Required:**

- Unit tests for S3 service (signed URL generation, URL expiry, content-type validation, size limit)
- Unit tests for upload tracking service (status transitions, pending → uploading → complete, pending → failed)
- Unit tests for upload completion webhook handler (valid signature, invalid signature, duplicate webhook)
- Unit tests for upload progress API (no upload, in progress, complete, failed)
- Unit tests for frontend upload component (file selection, type validation, size validation, progress updates)
- Unit tests for MIME type + magic byte validation (valid file, wrong extension, malicious file)
- Integration tests: request signed URL → receive URL → mock S3 PUT → webhook received → status updated
- Integration tests: upload failure → retry logic → eventual success
- Integration tests: content-type mismatch → upload rejected
- Integration tests: file size over limit → upload rejected
- E2E test: instructor uploads video → progress bar shows → completes → status shows "ready"
- E2E test: upload fails → retry → succeeds → Mux ingestion triggered
- E2E test: malicious file upload → rejected → error shown

**Exit Criteria:** Upload pipeline end-to-end working, signed URLs secure, progress tracking accurate, file type spoofing prevented, all tests pass

---

#### **Day 11 — Mux Integration**

**Goal:** Mux asset creation, transcoding webhooks, signed playback URL generation, circuit breaker

| Task                    | Details                                                               |
| ----------------------- | --------------------------------------------------------------------- |
| Mux SDK setup           | Mux Node.js SDK configuration, direct upload API                      |
| Asset creation          | Create Mux asset from S3 URL, track `mux_asset_id` on lecture         |
| Transcoding webhook     | Mux webhook handler (`video.asset.ready`, `video.asset.errored`)      |
| Playback URL generation | Signed playback URL generation (time-limited, per-user)               |
| Playback URL validation | Backend endpoint to request playback URL (enforces enrollment check)  |
| Frontend video player   | HLS player integration (Mux Player or Video.js), playback URL loading |
| Playback error handling | Invalid URL, expired URL, asset not ready, transcoding failed         |
| Circuit breaker         | Circuit breaker for Mux service calls                                 |
| Idempotency             | Idempotent webhook processing                                         |

**Tests Required:**

- Unit tests for Mux service (asset creation, URL construction, webhook validation, signed URL generation)
- Unit tests for transcoding webhook handler (asset ready, asset errored, invalid signature, unknown asset, duplicate webhook)
- Unit tests for playback URL endpoint (enrolled student, non-enrolled student, expired token, free preview)
- Unit tests for frontend video player component (load URL, error state, loading state, retry)
- Unit tests for signed URL expiration logic (within expiry, past expiry, edge case: exactly at expiry)
- Unit tests for circuit breaker (open on failure, half-open recovery, closed normal)
- Integration tests: S3 upload complete → Mux asset created → `mux_asset_id` stored → webhook received → playback URL works
- Integration tests: transcoding failure → lecture marked as failed → error shown to instructor
- Integration tests: playback URL requested by non-enrolled student → 403 returned
- Integration tests: playback URL requested by enrolled student → signed URL returned → valid for configured duration
- E2E test: instructor uploads → Mux transcodes → playback URL generated → student watches video
- E2E test: playback URL expires → student requests new URL → new URL works
- E2E test: webhook signature verification (spoofing prevention)

**Exit Criteria:** Mux integration fully operational, signed playback secure, transcoding pipeline working, circuit breaker functional, all tests pass

---

#### **Day 12 — Student Course Pages Frontend (`apps/web-student`)**

**Goal:** `apps/web-student` — Course discovery, browsing, detail pages with free preview

| Task                     | Details                                                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Course listing page      | Grid/list view, domain filter, search, pagination                                                                                 |
| Course detail page       | Syllabus, instructor bio, preview lectures, pricing, reviews                                                                      |
| Free preview enforcement | First 1-2 lectures playable without enrollment, lock icon on paid lectures                                                        |
| Search & filter UI       | Domain chips, price range slider, instructor dropdown, sort options                                                               |
| Course card component    | Thumbnail, title, instructor, price, rating, enrollment count                                                                     |
| Loading & error states   | Skeleton loaders, empty state, error fallback, error boundaries per route                                                         |
| SEO optimization         | Meta tags, Open Graph, structured data for courses                                                                                |
| Performance              | Server components for data fetching, client components only for interactivity, debounce search (300ms), `next/image`, lazy routes |

**Tests Required:**

- Unit tests for course listing page (render courses, filter by domain, search, pagination, empty state)
- Unit tests for course detail page (render details, free preview lectures visible, paid lectures locked)
- Unit tests for course card component (render data, pricing display, enrollment count formatting)
- Unit tests for search & filter UI (domain chip selection, price range validation, sort order)
- Unit tests for free preview enforcement (lecture 1-2 playable, lecture 3+ locked, no login required for preview)
- Unit tests for loading states (skeleton loaders, spinner)
- Unit tests for error boundaries (fallback render, retry button)
- Unit tests for SEO (meta tags, OG tags, structured data)
- Integration tests: search query → filtered results → pagination navigation (mocked API, debounced)
- Integration tests: domain filter → courses filtered → URL params updated (mocked API)
- Integration tests: course detail load → instructor bio fetched → syllabus rendered (mocked API)
- E2E test: student browses courses → filters by domain → clicks course → watches free preview
- E2E test: student searches for course → no results → empty state shown → search cleared

**Exit Criteria:** Student can discover and browse courses via `web-student`, free previews work, SEO optimized, 100% frontend coverage on course pages

---

#### **Day 13 — Video Player & Progress Tracking**

**Goal:** HLS video player with progress tracking, resume playback, completion detection

| Task                   | Details                                                               |
| ---------------------- | --------------------------------------------------------------------- |
| Video player component | HLS player (Mux Player), quality selector, playback speed (0.5x–2x)   |
| Progress tracking      | Track `watched_seconds` per lecture, update on play/pause/seek        |
| Resume playback        | Resume from `last_watched_at` position on re-watch                    |
| Completion detection   | Mark lecture complete when 90%+ watched                               |
| Progress API           | POST endpoint to update progress, GET endpoint for student's progress |
| Watch history page     | Student dashboard page showing recently watched lectures              |
| Debounce               | Debounce progress updates to prevent API flooding                     |
| Performance            | Virtualize long lists with `@tanstack/react-virtual`                  |

**Tests Required:**

- Unit tests for video player component (play, pause, seek, quality change, speed change, error recovery)
- Unit tests for progress tracking logic (seconds calculation, 90% threshold, edge cases: seek forward, seek backward)
- Unit tests for resume playback (no progress → start at 0, partial progress → resume from position, complete → restart)
- Unit tests for progress API endpoint (valid update, invalid lecture, non-enrolled student, progress aggregation)
- Unit tests for watch history page (render history, empty state, loading state, sort by recent)
- Integration tests: watch video → progress saved → resume from correct position on re-watch
- Integration tests: complete lecture (90%+) → lecture marked complete → certificate progress updated
- Integration tests: progress API rate limiting (too many requests → throttled)
- E2E test: student watches lecture → pauses → resumes → progress saved → returns later → resumes from correct position
- E2E test: student completes lecture → course progress bar updates → completion badge shown
- E2E test: 90% boundary edge case (89.9% vs 90.1%)

**Exit Criteria:** Video player fully functional, progress tracking accurate, resume playback works, all tests pass

---

#### **Day 14 — Payment Integration (Razorpay)**

**Goal:** Razorpay order creation, payment intent, webhook handling, access grant, idempotency

| Task                 | Details                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------- |
| Razorpay SDK setup   | Razorpay Node SDK configuration, key management                                         |
| Order creation       | POST endpoint to create Razorpay order (course price, currency, student info)           |
| Payment intent       | Return order ID, key, amount to frontend for Razorpay checkout                          |
| Frontend checkout    | Razorpay checkout modal integration, order ID passing, success/failure handling         |
| Payment webhook      | Razorpay webhook handler (`payment.captured`, `payment.failed`, signature verification) |
| Enrollment grant     | On payment success → create enrollment record, send confirmation email                  |
| Refund handling      | Admin endpoint to issue refund, webhook handler for refund status                       |
| Payment history page | Student dashboard page showing all payment transactions                                 |
| Payment idempotency  | Prevent duplicate enrollments from duplicate webhooks                                   |
| Circuit breaker      | Circuit breaker for Razorpay service calls                                              |

**Tests Required:**

- Unit tests for Razorpay service (order creation, signature verification, refund processing)
- Unit tests for payment webhook handler (payment captured, payment failed, invalid signature, duplicate webhook, idempotency)
- Unit tests for enrollment grant logic (create enrollment, send email, update course enrollment count)
- Unit tests for refund handler (valid refund, already refunded, refund amount mismatch)
- Unit tests for payment history page (render transactions, filter by status, empty state)
- Unit tests for frontend checkout component (order creation, checkout modal, success callback, failure callback)
- Unit tests for circuit breaker (open on failure, half-open recovery)
- Integration tests: create order → Razorpay returns order ID → frontend receives order details
- Integration tests: payment captured → webhook received → enrollment created → confirmation email sent
- Integration tests: payment failed → webhook received → no enrollment created → error shown to student
- Integration tests: refund issued → webhook received → enrollment status updated → refund reflected in history
- Integration tests: duplicate webhook → idempotency check → only one enrollment created
- E2E test: student clicks purchase → checkout modal opens → payment succeeds → enrollment confirmed → course accessible
- E2E test: payment fails → error shown → student can retry → payment succeeds → enrollment confirmed
- E2E test: webhook signature verification (spoofing prevention)

**Exit Criteria:** Payment flow end-to-end working, Razorpay integration secure, idempotency enforced, all tests pass, 100% coverage

---

### Phase 3: Realtime, Engagement & Live Classes (Days 15–21)

---

#### **Day 15 — Socket.IO Gateway**

**Goal:** Socket.IO gateway with authentication, room architecture, Redis adapter

| Task                  | Details                                                              |
| --------------------- | -------------------------------------------------------------------- |
| Socket.IO gateway     | NestJS WebSocket gateway, connection authentication (JWT validation) |
| Room architecture     | Per-course channels, per-live-class rooms, general channels          |
| Redis adapter         | `@socket.io/redis-adapter` for horizontal scaling                    |
| Connection management | Connect, disconnect, reconnect handling, presence tracking           |
| Message validation    | Zod validation for all incoming socket messages                      |
| Rate limiting         | Per-socket message rate limiting (50 messages/minute)                |

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

**Exit Criteria:** Socket.IO gateway operational, authentication working, Redis adapter configured, all tests pass

---

#### **Day 16 — Chat System**

**Goal:** Real-time course chat with message persistence, moderation

| Task               | Details                                                             |
| ------------------ | ------------------------------------------------------------------- |
| Chat module        | Message persistence in PostgreSQL, channel management               |
| Message CRUD       | Send, edit, delete messages, message history API                    |
| Frontend chat UI   | Message list, input, send button, typing indicator, online presence |
| Message threading  | Reply to messages (nested replies, max 2 levels)                    |
| Message moderation | Flag/report messages, instructor can delete any message             |
| Typing indicators  | Real-time typing indicator per channel (debounced)                  |
| Online presence    | Show who is online in each course channel                           |

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

**Exit Criteria:** Chat fully functional, message persistence working, all realtime features tested, 100% coverage

---

#### **Day 17 — LiveKit Integration**

**Goal:** LiveKit room creation, instructor starts class, student joins, recording auto-start

| Task                   | Details                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------- |
| LiveKit SDK setup      | LiveKit server SDK configuration, room management                                       |
| Room creation          | Create room per live class, set max participants, recording enabled                     |
| Token generation       | Generate join tokens for instructors (publisher perms) and students (subscriber perms)  |
| Frontend live player   | LiveKit client SDK integration, video/audio display, screen sharing                     |
| Recording auto-start   | Room configured for recording, S3 storage for recordings                                |
| Live status management | Update live class status (scheduled → live → ended, with invalid transition prevention) |
| Connection quality     | Network quality indicators, connection fallback                                         |
| Circuit breaker        | Circuit breaker for LiveKit service calls                                               |

**Tests Required:**

- Unit tests for LiveKit service (room creation, token generation, room deletion, recording config)
- Unit tests for token generation (instructor token with publisher perms, student token with subscriber perms, token expiry)
- Unit tests for live status management (scheduled → live, live → ended, invalid transitions rejected)
- Unit tests for frontend live player component (connect, disconnect, video render, audio mute/unmute, screen share)
- Unit tests for connection quality monitor (good, poor, disconnected, reconnection)
- Unit tests for circuit breaker (open on failure, half-open recovery)
- Integration tests: create room → generate instructor token → instructor joins → room active
- Integration tests: generate student token → student joins → can view instructor video → cannot publish
- Integration tests: recording starts → room ends → recording file available in S3
- Integration tests: room cleanup after class ends → participants kicked → room deleted
- E2E test: instructor schedules class → starts class → students join → video/audio working → recording active
- E2E test: instructor screen shares → students see screen → instructor stops sharing → video resumes

**Exit Criteria:** LiveKit integration operational, room management working, recording auto-starts, permissions enforced, all tests pass

---

#### **Day 18 — Live Class Scheduling & Recording Pipeline**

**Goal:** Schedule classes, notify students, recording → S3 → Mux pipeline

| Task                      | Details                                                               |
| ------------------------- | --------------------------------------------------------------------- |
| Scheduling API            | CRUD for live class schedules (date, time, duration, attached course) |
| Calendar view             | Instructor calendar with upcoming classes, student calendar view      |
| Notification triggers     | Auto-notify enrolled students (1hr before, 15min before)              |
| Recording pipeline        | LiveKit recording → S3 → Mux ingestion → attached to course lecture   |
| Recording status tracking | Track recording processing status (processing, ready, failed)         |
| Post-session workflow     | After class ends → recording URL → trigger Mux → update lecture       |
| Timezone handling         | Store times in UTC, display in user's local timezone, DST handling    |

**Tests Required:**

- Unit tests for scheduling service (create schedule, update schedule, cancel class, timezone handling)
- Unit tests for calendar view API (instructor calendar, student calendar, date range filtering)
- Unit tests for notification triggers (1hr before, 15min before, timezone conversion, DST handling)
- Unit tests for recording pipeline (S3 → Mux ingestion, status tracking, failure handling)
- Unit tests for post-session workflow (class ended → recording available → Mux triggered → lecture updated)
- Unit tests for frontend calendar component (render events, navigate months, event details, timezone display)
- Integration tests: schedule class → notification queued → email sent at correct time
- Integration tests: recording available in S3 → Mux ingested → transcoding complete → lecture updated with playback URL
- Integration tests: recording failed → status marked failed → instructor notified → retry available
- E2E test: instructor schedules class → student receives notification → class runs → recording becomes available → student watches replay
- E2E test: recording fails → error shown → instructor retries → recording succeeds

**Exit Criteria:** Scheduling, notification, and recording pipeline fully working, timezone handling correct, all tests pass, 100% coverage

---

#### **Day 19 — Assignments & Quizzes Backend**

**Goal:** Assignment creation, submission, auto-grading (MCQ), manual grading, late policy

| Task                   | Details                                                               |
| ---------------------- | --------------------------------------------------------------------- |
| Assignment module      | CRUD for assignments (title, description, type, max score, due date)  |
| Quiz engine            | MCQ question bank, answer validation, auto-grading logic              |
| Submission module      | Student submission, file upload support, text submission              |
| Grading system         | Auto-grade MCQ (instant), manual grade open-ended (instructor review) |
| Feedback system        | Instructor feedback on submissions, score display                     |
| Late submission policy | Configurable late submission window, penalty calculation              |
| Bulk operations        | Bulk assignment creation, bulk grading                                |

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

**Exit Criteria:** Assignment and quiz system fully functional, auto and manual grading working, late policy enforced, all tests pass

---

#### **Day 20 — Assignments & Quizzes Frontend**

**Goal:** Student assignment submission UI, instructor grading UI

| Task                     | Details                                                                   |
| ------------------------ | ------------------------------------------------------------------------- |
| Student assignment page  | Assignment list, due dates, submission form (text/file upload), status    |
| Quiz taking UI           | MCQ question display, answer selection, timer (optional), submit          |
| Instructor grading page  | Submission list, auto-graded results, manual grading form, feedback input |
| Submission history       | Student view of all submissions with scores and feedback                  |
| Bulk grading UI          | Select multiple submissions, apply same grade/feedback                    |
| Assignment creation form | Instructor form to create assignments/quizzes (multi-step)                |

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

**Exit Criteria:** Assignment UI fully functional, quiz taking and grading working, 100% frontend coverage

---

#### **Day 21 — Certificates & PostHog Analytics**

**Goal:** Auto-generate certificates on completion, analytics event tracking

| Task                   | Details                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| Certificate generation | Auto-issue on 100% course completion, unique certificate ID (UUID)                         |
| PDF generation         | Certificate PDF with course name, student name, date, verification URL                     |
| Verification page      | Public page to verify certificate authenticity via unique ID                               |
| Certificate download   | Download PDF, shareable LinkedIn-ready format                                              |
| PostHog setup          | PostHog SDK integration (frontend + backend), event tracking                               |
| Event tracking         | Page views, video start/complete, enrollment, purchase, live attendance, assignment submit |
| Analytics dashboard    | Instructor analytics: enrollment count, completion rates, revenue, drop-off points         |
| Unique constraint      | Unique constraint on certificate generation to prevent duplicates                          |

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
- Integration tests: unique constraint prevents duplicate certificate generation
- E2E test: student completes course → certificate generated → PDF downloaded → verification URL works
- E2E test: instructor views analytics → enrollment count correct → completion rate accurate → revenue displayed
- E2E test: race condition tests (concurrent completion triggers → only one certificate generated)

**Exit Criteria:** Certificates auto-generated on completion, analytics tracking operational, unique constraint enforced, all tests pass

---

### Phase 4: Stabilization, Admin & Production Readiness (Days 22–30)

---

#### **Day 22 — Admin Dashboard: User Management (`apps/web-admin`)**

**Goal:** `apps/web-admin` scaffolded, admin can manage users, view platform stats

| Task                  | Details                                                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Scaffold `web-admin`  | Next.js App Router, TailwindCSS, ShadCN/UI, shared packages wiring, Dokploy deployment config                                          |
| Auth pages (admin)    | Reuse `/packages/shared-components` auth forms, admin-specific post-login redirect, re-auth required even if logged into other portals |
| Admin layout          | Admin-specific navigation, RBAC guard (admin role only), admin-only error boundaries                                                   |
| User management table | Paginated list of all users (students, instructors), search, filter by role                                                            |
| User detail page      | View user profile, enrollment history, payment history, activity log                                                                   |
| User actions          | Activate/deactivate, reset password, change role, delete user                                                                          |
| Platform stats        | Total users, active courses, revenue, enrollments (overview cards)                                                                     |
| Audit log             | Track admin actions (user created, role changed, course moderated)                                                                     |
| Dokploy staging       | Deploy `web-admin` to staging, configure subdomain (`admin.example.com`), SSL, env vars                                                |

**Tests Required:**

- Unit tests for admin user table (render users, search, filter, pagination, empty state)
- Unit tests for user detail page (profile display, enrollment history, payment history, activity log)
- Unit tests for user actions (activate, deactivate, role change, delete, confirmation dialogs)
- Unit tests for platform stats cards (data aggregation, formatting, loading states)
- Unit tests for audit log (render log entries, filter by action type, date range)
- Unit tests for admin RBAC guard (admin access granted, non-admin denied)
- Integration tests: user search → filtered results → user detail loaded (mocked API)
- Integration tests: user action → API call → state updated → audit log entry created (mocked API)
- Integration tests: platform stats → data aggregated from multiple sources → displayed correctly (mocked API)
- E2E test: admin searches for user → views details → deactivates user → audit log updated
- E2E test: non-admin attempts to access admin dashboard → redirected to home
- E2E test: Dokploy staging deploy is accessible at `admin.example.com`

**Exit Criteria:** `web-admin` scaffolded and deployed, admin user management fully functional, RBAC enforced, audit logging working, all tests pass

---

#### **Day 23 — Admin Dashboard: Instructor Approval & Course Moderation**

**Goal:** `apps/web-admin` — Admin can approve instructors, moderate courses

| Task                      | Details                                                           |
| ------------------------- | ----------------------------------------------------------------- |
| Instructor approval queue | List of pending instructor applications, review details           |
| Approval workflow         | Approve/reject with reason, email notification to applicant       |
| Course moderation         | Flagged courses list, review content, approve/reject/suspend      |
| Revenue overview          | Platform revenue, instructor payouts, transaction history         |
| Report generation         | Export reports (CSV, PDF) for revenue, enrollments, user activity |
| Content moderation        | User reports + admin review, 24-hour SLA tracking                 |

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

#### **Day 24 — Performance Optimization**

**Goal:** Optimize queries, caching, CDN, eliminate N+1 queries, transaction isolation

| Task                      | Details                                                                        |
| ------------------------- | ------------------------------------------------------------------------------ |
| Database indexing         | Add missing indexes on frequently queried columns                              |
| N+1 query elimination     | Audit all queries, add eager loading, use query builders                       |
| TanStack Query caching    | Configure staleTime, gcTime, refetch intervals per query                       |
| CloudFront CDN            | Validate CDN configuration, cache headers, invalidation                        |
| API response optimization | Selective field returns, pagination limits, response compression (gzip/brotli) |
| Query profiling           | Identify slow queries, add EXPLAIN ANALYZE logging                             |
| Load testing              | Basic load test on critical endpoints (auth, course list, video playback)      |
| Transaction isolation     | Transaction isolation tests for race condition prevention                      |

**Tests Required:**

- Unit tests for query optimization (eager loading verification, N+1 detection in test queries)
- Unit tests for cache configuration (staleTime honored, gcTime honored, refetch behavior)
- Unit tests for CDN cache headers (correct headers set, cache-control, ETag)
- Integration tests: course list query → single query with joins → no N+1 (query count assertion)
- Integration tests: enrollment query → paginated → cached → refetch on mutation
- Integration tests: API response compression → response size reduced → latency measured
- Integration tests: transaction isolation (concurrent enrollment → unique constraint prevents duplicates)
- E2E test: load test auth endpoint → 100 concurrent requests → response time < 200ms
- E2E test: load test course list → 100 concurrent requests → response time < 300ms
- E2E test: CDN delivers static assets → cache hit → no origin request

**Exit Criteria:** No N+1 queries, caching configured, CDN working, load test results acceptable, all tests pass

---

#### **Day 25 — Security Audit**

**Goal:** Harden platform, validate all security measures

| Task                     | Details                                                            |
| ------------------------ | ------------------------------------------------------------------ |
| Rate limiting validation | Test all endpoints for rate limiting (per-IP, per-user)            |
| Signed URL enforcement   | Verify all Mux playback URLs are signed, unsigned rejected         |
| RBAC validation          | Audit all endpoints for role enforcement, test bypass attempts     |
| Input sanitization       | XSS prevention, SQL injection prevention, file upload validation   |
| CSRF protection          | CSRF tokens for state-changing operations                          |
| Security headers         | HSTS, CSP, X-Frame-Options, X-Content-Type-Options                 |
| Secret management        | Verify no secrets in code, env var validation, rotation procedures |
| Penetration testing      | Basic pen test on auth, payments, file upload, API endpoints       |

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

#### **Day 26 — E2E Testing: Core Flows**

**Goal:** Comprehensive E2E tests for critical user journeys

| Task            | Details                                                                          |
| --------------- | -------------------------------------------------------------------------------- |
| Auth E2E        | Registration → email verify → login → refresh → logout → password reset          |
| Course E2E      | Browse → search → view detail → free preview → purchase → enroll → watch         |
| Upload E2E      | Create course → upload video → Mux processing → playback URL → student watches   |
| Payment E2E     | Purchase → Razorpay checkout → payment success → enrollment → confirmation email |
| Live class E2E  | Schedule → notify → start → join → record → end → replay available               |
| Assignment E2E  | Create → submit → auto-grade → score → manual grade → feedback                   |
| Certificate E2E | Complete course → certificate generated → PDF download → verification            |
| Chat E2E        | Join channel → send message → receive → edit → delete → flag                     |

**Tests Required:**

- All E2E tests listed above implemented in Playwright (frontend) and Supertest (backend)
- Each E2E test covers happy path + at least 2 error paths
- E2E tests run against staging environment with seeded test data
- E2E tests include cleanup (delete test data after run)
- E2E test coverage report generated and verified

**Exit Criteria:** All critical user journeys tested end-to-end, E2E test suite passes consistently, coverage report shows 100%

---

#### **Day 27 — E2E Testing: Edge Cases & Error Paths**

**Goal:** Test error handling, edge cases, failure scenarios

| Task                    | Details                                                             |
| ----------------------- | ------------------------------------------------------------------- |
| Network failure tests   | API timeout, network drop, retry behavior                           |
| Concurrent user tests   | Multiple users enrolling simultaneously, race conditions            |
| Data integrity tests    | Transaction rollback on failure, orphaned record prevention         |
| Edge case tests         | Empty states, max limits, special characters, unicode, long strings |
| Error recovery tests    | Service restart, database reconnect, Redis reconnect, queue retry   |
| Mobile responsive tests | All pages responsive on mobile, tablet, desktop breakpoints         |
| Accessibility tests     | WCAG 2.1 AA compliance, screen reader testing, keyboard navigation  |

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

#### **Day 28 — Error Monitoring & Logging**

**Goal:** Sentry integration, structured logging, alerting, observability

| Task                   | Details                                                               |
| ---------------------- | --------------------------------------------------------------------- |
| Sentry setup           | Sentry SDK for frontend (all 3 Next.js apps) and backend (NestJS)     |
| Error boundaries       | React error boundaries with Sentry reporting                          |
| Structured logging     | JSON structured logs (timestamp, level, context, userId, requestId)   |
| Request tracing        | Correlation ID across frontend → backend → database                   |
| Alerting rules         | Critical error alerts (payment failures, auth failures, service down) |
| Log aggregation        | Log shipping to centralized store, search/filter capability           |
| Performance monitoring | Sentry APM, transaction tracing, slow query alerts                    |

**Metrics to Track:**

- Request latency (p50, p95, p99)
- Error rate by endpoint
- Database query duration
- Cache hit/miss ratio
- Queue processing time
- Video upload success rate
- Payment success rate

**Alerting Rules:**

- Error rate > 1% over 5 minutes
- Response time p95 > 500ms over 5 minutes
- Database connection pool exhausted
- Queue backlog > 100 jobs
- Payment failure rate > 5%

**Tests Required:**

- Unit tests for Sentry integration (error capture, context enrichment, user identification)
- Unit tests for error boundaries (render fallback, report to Sentry, reset state)
- Unit tests for structured logging (JSON format, required fields, log levels, redaction of secrets)
- Unit tests for request tracing (correlation ID generation, propagation, cleanup)
- Integration tests: error thrown → Sentry receives event → context correct → alert triggered
- Integration tests: log entry → JSON format → all fields present → secrets redacted
- E2E test: trigger error in frontend → error boundary shows → Sentry receives → alert sent
- E2E test: trigger error in backend → structured log written → Sentry receives → correlation ID present

**Exit Criteria:** Sentry operational, structured logging working, alerting configured, metrics tracked, all tests pass

---

#### **Day 29 — Documentation & API Docs**

**Goal:** Swagger API docs, internal runbooks, deployment documentation

| Task                  | Details                                                              |
| --------------------- | -------------------------------------------------------------------- |
| Swagger setup         | `@nestjs/swagger` integration, all endpoints documented              |
| API documentation     | Request/response schemas, examples, error codes, authentication      |
| Internal runbooks     | Deployment procedures, database migration steps, rollback procedures |
| Environment setup     | Local dev setup guide, staging deploy guide, production deploy guide |
| Troubleshooting guide | Common issues, diagnostic steps, resolution procedures               |
| Architecture diagrams | Updated diagrams reflecting actual implementation                    |
| CHANGELOG             | Version history, breaking changes, migration notes                   |
| ADR                   | Architecture Decision Records for major decisions                    |

**Tests Required:**

- Unit tests for Swagger documentation (all endpoints documented, schemas match actual DTOs, examples valid)
- Integration tests: Swagger UI accessible → all endpoints listed → "Try it out" works
- Integration tests: runbook procedures tested (deploy fresh instance, run migrations, seed data)
- E2E test: new developer follows setup guide → project runs locally → tests pass
- E2E test: staging deploy follows runbook → deploy succeeds → smoke tests pass

**Exit Criteria:** API docs complete and accurate, runbooks tested, setup guide verified, all documentation tests pass

---

#### **Day 30 — Final Polish, Beta Launch Prep**

**Goal:** Beta invite system, landing page, final review, soft launch

| Task                   | Details                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| Beta invite system     | Invite code generation, email invite, registration with invite code                         |
| Landing page           | Public landing page with value proposition, course preview, CTA                             |
| Waitlist               | Email waitlist for non-invited users, notification on open beta                             |
| Final code review      | Comprehensive code review, TODO/FIXME cleanup, dead code removal                            |
| Final test pass        | Full test suite run, coverage verification, flaky test fix                                  |
| Performance final pass | Lighthouse audit (target > 90 on all metrics), bundle size optimization, image optimization |
| Soft launch            | Invite-only beta launch, monitoring dashboards active, incident response ready              |

**Tests Required:**

- Unit tests for beta invite system (code generation, code validation, single-use enforcement, expiry)
- Unit tests for landing page (render content, CTA buttons, course preview, responsive layout)
- Unit tests for waitlist (email validation, duplicate prevention, confirmation email)
- Integration tests: invite code generated → email sent → user registers with code → code marked used
- Integration tests: user without invite code → registration blocked → waitlist option shown
- E2E test: invite code flow → registration → login → dashboard access
- E2E test: landing page → Lighthouse score > 90 on all metrics
- E2E test: full test suite → 100% coverage verified → no flaky tests → CI green

**Exit Criteria:** Beta invite system working, landing page live, 100% test coverage confirmed, soft launch successful

---

## Testing Coverage Checklist (Per Day)

Each day's work MUST include:

- [ ] Unit tests for all new functions and methods
- [ ] Unit tests for all new components
- [ ] Unit tests for all new schemas and DTOs
- [ ] Integration tests for all new API endpoints
- [ ] Integration tests for all new module interactions
- [ ] E2E tests for all new user flows
- [ ] Coverage report verified at 100% for new code
- [ ] No `istanbul ignore` comments without approval
- [ ] All tests passing before end of day
- [ ] CI pipeline green

---

## Risk Mitigation

### Scope Creep Prevention

- **Feature Freeze Rule:** No new features after Day 14 (midpoint)
- All new requests go to backlog for Phase 2
- Emergency changes require written justification
- **Definition of Done:** Code written + tested + reviewed + 100% coverage + docs updated + staging deployed + no known bugs

### Time Management

- **Daily Checkpoints:** Morning review, midday progress check, evening commit
- **Weekly Reviews:** Sunday review of week's accomplishments, update risk register, adjust plan
- **Buffer Days:** Days 28-30 are buffer/stabilization — never skip testing to save time

### Data Loss Prevention

- Automated daily database backups
- Weekly full backup to S3
- Test restore procedure monthly
- Test migrations on staging before production
- Verify data integrity after migration

### External Dependency Risks

- Circuit breaker pattern for all external services
- Graceful degradation when services unavailable
- Retry with exponential backoff
- Lock dependency versions (no `^` or `~`)
- Monitor service status pages

### Testing Risks

- **Testing slows development:** Write tests alongside code, not after. TDD approach recommended.
- **Flaky tests:** Deterministic test data, transactional DB tests, mock external services
- **Coverage gaps:** CI enforces 100%, daily coverage review, pair testing on complex modules
- **External costs:** Use mocks for unit/integration tests. E2E tests against staging only.

---

## Success Criteria

### Technical Excellence

- [ ] Zero critical security vulnerabilities
- [ ] 100% test coverage (as mandated)
- [ ] Lighthouse scores > 90 on all pages
- [ ] API response times < 200ms (p95)
- [ ] Zero N+1 queries in production
- [ ] All external services have circuit breakers

### User Experience

- [ ] WCAG 2.1 AA compliance
- [ ] Mobile responsive (320px - 1440px)
- [ ] Page load < 3 seconds on 3G
- [ ] No broken links or 404s
- [ ] Clear error messages for all failure paths
- [ ] Accessible keyboard navigation

### Operational Readiness

- [ ] Runbooks for all critical operations
- [ ] Monitoring and alerting configured
- [ ] Backup and restore tested
- [ ] Deployment process documented and tested
- [ ] Incident response plan ready
- [ ] Team trained on support procedures

---

## Post-Launch Considerations

### Week 1-2 After Launch

- Monitor error rates closely
- Track user feedback and bug reports
- Performance optimization based on real usage
- User behavior analysis via PostHog

### Month 1 After Launch

- Review and update documentation
- Plan Phase 2 features based on user feedback
- Optimize conversion funnels
- Scale infrastructure if needed

### Ongoing

- Monthly security reviews
- Quarterly dependency updates
- Continuous performance optimization
- User research and feature validation

---

## Post-30-Day Checklist

- [ ] 100% code coverage verified across all packages
- [ ] All E2E tests passing on staging
- [ ] Sentry alerts operational
- [ ] PostHog analytics capturing events
- [ ] Dokploy staging environment stable
- [ ] Beta invites sent to 2-3 vetted instructors
- [ ] Landing page live with waitlist
- [ ] Incident response runbook complete
- [ ] Month 2-3 feature backlog prioritized
- [ ] Architecture document updated with implementation decisions
- [ ] Security audit complete with no critical vulnerabilities
- [ ] Performance benchmarks met (API < 200ms, video playback < 1s init)
