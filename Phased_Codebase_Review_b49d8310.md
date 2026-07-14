# Phased Codebase Review Plan

## Overview

Seven-phase review: six component-focused phases followed by one holistic cross-cutting phase. Each phase produces a findings report with severity ratings (Critical / High / Medium / Low) and actionable recommendations.

---

## Phase 1 — Authentication System (`apps/api/src/modules/auth`)

**Scope:** Auth module, JWT strategy, guards, decorators, OAuth flow, session/token management

### Review Checklist

- [ ] JWT access + refresh token rotation implementation
- [ ] Refresh token family revocation on reuse detection
- [ ] Account lockout after 5 failed attempts (15-min Redis lockout)
- [ ] Password complexity enforcement (Zod: min 8, upper, lower, digit)
- [ ] bcrypt rounds: 12 for passwords, 10 for reset/verification tokens
- [ ] CSRF double-submit cookie pattern on all state-changing endpoints
- [ ] OAuth account linking — only to verified accounts, no auto-linking
- [ ] CORS strict allow-list (no wildcards)
- [ ] Rate limiting on `/auth/login`, `/auth/register`, `/auth/forgot-password`
- [ ] 401 response consistency — no information leakage in error messages
- [ ] Token storage: httpOnly + secure + sameSite cookie attributes
- [ ] Password reset flow: token expiry, single-use, bcrypt-hashed
- [ ] Email verification flow: token expiry, single-use

### Exit Criteria

- All auth endpoints tested for bypass scenarios
- Token rotation verified under concurrent requests
- No hardcoded secrets found in auth module

---

## Phase 2 — Database Layer (`apps/api/src/db`)

**Scope:** Drizzle schema, migrations, repositories, connection pool, seed data

### Review Checklist

**Schema & Migrations**

- [ ] All enums match `enums.ts` specification
- [ ] Foreign keys use `ON DELETE RESTRICT`
- [ ] Unique constraints present on all specified columns (users.email, enrollments pair, etc.)
- [ ] Indexes on all foreign keys and WHERE-clause columns
- [ ] `deleted_at` nullable timestamp on all soft-delete tables
- [ ] Prices stored as INTEGER in paise (not float)

**Repository Pattern**

- [ ] No raw `db.select()` outside repository files
- [ ] All queries filter `deleted_at IS NULL` by default
- [ ] Parameterized queries only (no string interpolation)
- [ ] Transaction isolation for enrollments (`SELECT ... FOR UPDATE` on payment)
- [ ] Transaction isolation for certificates (`SELECT ... FOR UPDATE` on enrollment)
- [ ] Invite code redemption uses atomic `UPDATE ... RETURNING`
- [ ] N+1 query detection — check for loops calling single-record fetches

**Connection & Performance**

- [ ] Pool config: min=2, max=10, idle_timeout=30s, connection_timeout=5s
- [ ] Health check endpoint present
- [ ] Graceful shutdown with connection cleanup
- [ ] Error handling maps PG codes (23505, 23503, 23502) to user-friendly messages

### Exit Criteria

- Zero N+1 queries detected in repository layer
- All foreign keys indexed
- Soft-delete filtering verified across all repositories

---

## Phase 3 — API Endpoints & NestJS Modules (`apps/api/src/modules`)

**Scope:** All NestJS modules, controllers, services, DTOs, guards, interceptors, pipes

### Review Checklist

**Input Validation**

- [ ] All request bodies validated with Zod schemas
- [ ] Query params and path params validated
- [ ] ValidationPipe with `whitelist: true, forbidNonWhitelisted: true`
- [ ] File upload MIME type validation + magic byte check

**RBAC & Authorization**

- [ ] Role guards on all protected endpoints (student, instructor, admin, institution_admin)
- [ ] Resource ownership checks (instructor can only edit own courses)
- [ ] No privilege escalation paths (student cannot access admin endpoints)

**API Design**

- [ ] Consistent response format: `{ success, data, error }`
- [ ] Pagination on all list endpoints (cursor-based for infinite scroll)
- [ ] HTTP status codes correct (201 for create, 204 for delete, etc.)
- [ ] Rate limiting on all public endpoints with exponential backoff

**Error Handling**

- [ ] Domain error hierarchy: ValidationError, AuthenticationError, AuthorizationError, NotFoundError, ConflictError, ExternalServiceError
- [ ] No stack traces in production error responses
- [ ] Structured logging (not console.log)
- [ ] Global exception filter present

**Specific Modules to Audit**

- [ ] Courses module — CRUD, publishing flow, instructor ownership
- [ ] Enrollments module — race condition prevention, payment verification
- [ ] Payments module — Razorpay webhook signature verification, idempotency
- [ ] Upload module — pre-signed URL expiry, file size limits, magic byte validation
- [ ] Messaging module — soft delete, channel permissions
- [ ] Notifications module — delivery tracking, preference handling

### Exit Criteria

- All endpoints have Zod validation
- RBAC verified with role-mismatch test cases
- Error responses contain no internal details

---

## Phase 4 — Frontend Applications

**Scope:** `apps/web-landing`, `apps/web-student`, `apps/web-instructor`, `apps/web-admin`

### Review Checklist (per app)

**Architecture & Routing**

- [ ] Route-level code splitting implemented
- [ ] Protected routes use auth guards correctly
- [ ] Role-based routing (student app vs instructor app vs admin app)
- [ ] `next/image` used instead of raw `<img>` tags
- [ ] `useSearchParams` wrapped in `<Suspense>` (Next.js requirement)

**Data Fetching**

- [ ] TanStack Query used for all data fetching (no `useState` + `useEffect`)
- [ ] No raw `fetch()` — all calls through `@edutech/api-client` services
- [ ] Query keys follow established patterns
- [ ] Queries invalidated after mutations
- [ ] `createServerApiClient()` used in Server Components

**UX States (per page/component)**

- [ ] Loading states: skeleton screens for data-heavy views
- [ ] Error states: error boundaries with retry options
- [ ] Empty states: guidance for next steps
- [ ] Success feedback: toast notifications after mutations

**Accessibility**

- [ ] WCAG 2.1 AA color contrast (>= 4.5:1)
- [ ] Focus indicators on all interactive elements
- [ ] Keyboard navigation for all features
- [ ] ARIA labels on dynamic content
- [ ] `alt` text on all images

**Landing-specific**

- [ ] LCP image preloaded
- [ ] Hero image not lazy-loaded
- [ ] SEO meta tags and structured data
- [ ] Lighthouse score > 90 (Performance, Accessibility, SEO)

### Exit Criteria

- All four apps build without errors
- No raw `fetch()` calls found in any frontend app
- Each app has error boundaries on all routes

---

## Phase 5 — Shared Packages (`packages/`)

**Scope:** `@edutech/ui`, `@edutech/api-client`, `@edutech/types`, `@edutech/shared-components`, and other shared packages

### Review Checklist

**@edutech/types**

- [ ] Types match Drizzle schema definitions
- [ ] No duplicated types across packages
- [ ] PaginationQuery with index signature `[key: string]: unknown`
- [ ] Enum types exported and consistent with DB enums

**@edutech/api-client**

- [ ] Service modules for each domain (courses, auth, payments, etc.)
- [ ] `isApiError` type guard implemented
- [ ] Token injection via ApiProvider
- [ ] 401 auto-handling: clear tokens + redirect
- [ ] `createServerApiClient()` exported for Server Components

**@edutech/ui (shared components)**

- [ ] Loading components: Spinner, Skeleton, ProgressBar
- [ ] Error components: ErrorBoundary, ErrorFallback
- [ ] Feedback: Toast system with auto-dismiss
- [ ] Form components: FormWrapper, FormField, FormValidation
- [ ] Components accept `className` for composition

**Build & Exports**

- [ ] tsup-based DTS build configured
- [ ] `@edutech/ui` token import strategy correct
- [ ] Tailwind v4 CSS export condition (`css`) set
- [ ] No circular dependencies between packages
- [ ] `@types/react` version consistent across all packages

### Exit Criteria

- All packages build independently
- No type duplication found
- Cross-package imports resolve correctly

---

## Phase 6 — Performance & Security Deep Dive

**Scope:** Cross-cutting performance and security concerns across the entire stack

### Performance Checklist

**Backend**

- [ ] Response compression (gzip/brotli) enabled
- [ ] Database query caching strategy implemented
- [ ] Background jobs for heavy operations (email, video processing)
- [ ] API response time < 200ms for 95% of requests
- [ ] WebSocket connection < 100ms
- [ ] Query timeout < 30s for all operations
- [ ] EXPLAIN ANALYZE run on queries > 100ms

**Frontend**

- [ ] Bundle size < 200KB gzipped (initial load)
- [ ] Image optimization: AVIF/WebP with JPEG fallback, srcset + sizes
- [ ] Font optimization: `display: swap`, preloaded critical fonts
- [ ] Core Web Vitals within thresholds (FCP < 1.5s, LCP < 2.5s, CLS < 0.1)
- [ ] TanStack Query stale time: 5min, GC time: 10min
- [ ] Static assets: `Cache-Control: public, max-age=31536000, immutable`

### Security Checklist

- [ ] SQL injection: all queries parameterized (Drizzle handles this, verify no raw SQL)
- [ ] XSS prevention: output encoding, CSP headers configured
- [ ] CSRF: double-submit cookie on all state-changing endpoints
- [ ] Rate limiting: per-IP and per-user on all public endpoints
- [ ] Security headers: HSTS, CSP, X-Frame-Options (DENY), X-Content-Type-Options (nosniff)
- [ ] File upload: MIME + magic byte validation, max size, private S3 bucket
- [ ] Razorpay webhook: signature verification + timestamp validation
- [ ] Mux webhook: signature verification
- [ ] Mux playback URLs: signed (time-limited, per-user)
- [ ] Secret management: no `.env` committed, `.env.example` with placeholders
- [ ] No secrets or API keys in source code (grep for patterns)

### Exit Criteria

- Security headers verified with automated scan
- Bundle analysis completed for all frontend apps
- No unparameterized queries found

---

## Phase 7 — Holistic Cross-Cutting Review

**Scope:** Architecture consistency, cross-package integration, documentation accuracy, CI/CD

### Review Areas

**Architecture Consistency**

- [ ] Monorepo structure follows documented conventions
- [ ] Cross-app communication patterns consistent
- [ ] Shared types used everywhere (no local duplicates)
- [ ] Environment variable strategy consistent across apps

**CI/CD & Build**

- [ ] `.github/workflows/ci.yml` covers lint, typecheck, test, build
- [ ] Pre-commit hooks (Husky + lint-staged) configured correctly
- [ ] Coverage thresholds enforced (>= 80% general, >= 95% critical paths)
- [ ] Turborepo caching configured correctly
- [ ] Docker Compose matches documented setup

**Documentation Accuracy**

- [ ] `apps/api/src/db/README.md` matches actual schema (table list, columns, enums)
- [ ] Engineering docs (security, performance, code-standards) reflect actual implementation
- [ ] Seed data credentials match actual seed script
- [ ] Directory structures documented match reality

**Dependency Health**

- [ ] No unused dependencies
- [ ] No known vulnerable dependencies (npm audit)
- [ ] Peer dependency conflicts resolved
- [ ] Lock file consistent with package.json files

### Final Deliverable

- Consolidated findings report with all phases
- Prioritized remediation roadmap (Critical -> High -> Medium -> Low)
- Estimated effort for each remediation item
- Architecture Decision Records for any recommended changes

---

## Suggested Timeline

| Phase     | Component               | Estimated Duration |
| --------- | ----------------------- | ------------------ |
| 1         | Authentication System   | 1-2 days           |
| 2         | Database Layer          | 1-2 days           |
| 3         | API Endpoints & Modules | 2-3 days           |
| 4         | Frontend Applications   | 2-3 days           |
| 5         | Shared Packages         | 1 day              |
| 6         | Performance & Security  | 2 days             |
| 7         | Holistic Review         | 1-2 days           |
| **Total** |                         | **10-15 days**     |

---

## How to Use This Plan

Each phase is designed to be reviewed independently. Use the CodeReview agent or manual review against the checklists. After completing each phase, update the checklist status and move to the next. Phase 7 should only begin after all prior phases are complete, as it validates cross-cutting consistency.
