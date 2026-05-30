# Database Schema

> **Purpose:** All 25 tables, relations, constraints, indexing rules, and database best practices
> **Source:** PROJECT_DOCUMENTATION.md §8, cosmic-comet §2.4

---

## Core Tables

### `users`
```
id, email, password_hash (bcrypt 12 rounds), role, name, avatar_url,
is_verified, is_active, approval_status (pending|approved|rejected),
onboarding_completed (boolean), deleted_at, created_at, updated_at
```

> **Single role per user.** The `role` column is an enum (`student`|`instructor`|`admin`|`institution_admin`). Each user account has exactly one role. Users who need access to multiple portals must create separate accounts with different emails.
>
> **Password hashing:** bcrypt with 12 salt rounds. Passwords capped at 128 characters to prevent DoS via expensive bcrypt computation on extremely long inputs.
>
> **Approval status:** Students always have `approval_status = 'approved'`. Instructors have `approval_status = 'pending'` until admin approves. Admins are created via seed only.
>
> **Onboarding:** Students have `onboarding_completed = false` until they complete their profile via `PATCH /users/profile`. Once set to true, the name field becomes locked.

### `instructor_profiles`
```
id, user_id (FK), bio, expertise[], social_links,
approval_status (pending|approved|rejected),
razorpay_seller_account_id, created_at
```

### `student_profiles`
```
id, user_id (FK), resume_url, skills[],
mobile, address, city, state, pin_code, country,
affiliated_institute_id (FK to institution_accounts),
approval_status, onboarding_completed,
created_at, updated_at
```

> **Affiliated Institute:** Students can be affiliated with an institution during onboarding, linking to `institution_accounts.id`. Used for institutional billing and cohort management.

### `admin_profiles`
```
id, user_id (FK), department, permissions_level (super_admin|moderator|support),
created_at
```

### `courses`
```
id, instructor_id (FK), title, description, thumbnail_url,
domain (tech|business|...), pricing_type (free|paid),
price_inr (INTEGER — stored in paise, e.g. ₹499.00 → 49900),
is_published, deleted_at, created_at, updated_at
```

> **Search:** Full-text search powered by Meilisearch (external service). Course data synced to Meilisearch via API on create/update/publish. No `search_vector` column needed in PostgreSQL.

### `sections`
```
id, course_id (FK), title, order_index, created_at
```

### `lectures`
```
id, section_id (FK), title, description, order_index,
type (video|live|text|assignment|quiz),
mux_asset_id, mux_playback_id, duration_seconds,
is_free_preview, is_published, created_at
```

### `enrollments`
```
id, student_id (FK), course_id (FK), enrolled_at,
payment_id (FK), access_type (purchased|free)
```

### `progress`
```
id, student_id (FK), lecture_id (FK),
watched_seconds, last_watched_at
```

### `live_classes`
```
id, lecture_id (FK), instructor_id (FK),
scheduled_at, duration_minutes, livekit_room_name,
recording_url, status (scheduled|live|ended), created_at
```

### `assignments`
```
id, lecture_id (FK), title, description, type (mcq|short|code),
max_score, due_at, created_at
```

### `submissions`
```
id, assignment_id (FK), student_id (FK),
content, score, feedback, graded_at, submitted_at
```

### `certificates`
```
id, student_id (FK), course_id (FK),
certificate_uid (unique), issued_at, pdf_url
```

### `payments`
```
id, student_id (FK), course_id (FK),
razorpay_order_id (unique), razorpay_payment_id (unique),
amount (INTEGER — stored in paise), currency, status (pending|paid|failed|refunded), created_at
```

> **Pricing:** Month 1 supports INR only via Razorpay. `price_inr` is stored as an **INTEGER in paise** (smallest currency unit) to avoid floating-point rounding errors. Display as INR by dividing by 100 (e.g., `49900` → `₹499.00`). International pricing (USD/multi-currency) is deferred to Phase 2 with a gateway like Stripe as a secondary processor. The `currency` field on payments defaults to `INR` and supports future ISO 4217 codes. The `amount` field on payments is also stored as INTEGER in paise.

### `institution_accounts` *(Phase 2)*
```
id, institution_name, contact_email,
razorpay_customer_id, seat_count, active_until, created_at
```

### `institution_enrollments` *(Phase 2)*
```
id, institution_account_id (FK), student_id (FK),
course_id (FK), enrolled_at
```

### `messages`
```
id, channel_id (FK), sender_id (FK),
content, created_at, is_deleted
```

### `channels`
```
id, course_id (FK, nullable), type (course|general|dm),
name, created_at
```

### `notifications`
```
id, user_id (FK), type, title, body,
is_read, delivered_via (in_app|email|both),
email_sent_at, created_at
```

### `audit_logs`
```
id, actor_id (FK), action, entity_type,
entity_id, metadata, created_at
```

### `password_resets`
```
id, user_id (FK), token_hash (VARCHAR(60) — bcrypt 10 rounds), expires_at, used, created_at
```

> **Hashing:** Reset tokens are hashed with bcrypt (10 rounds, not plain SHA) to prevent rainbow table attacks if the database is leaked. The bcrypt output is always 60 characters, hence `VARCHAR(60)`. Token hashing uses 10 rounds (vs 12 for passwords) because tokens are short-lived and verified once — faster verification is acceptable for temporary tokens.

### `email_verifications`
```
id, user_id (FK), token_hash (VARCHAR(255) — bcrypt 10 rounds),
purpose (email_verification|student_activation), expires_at, verified, created_at
```

> **Purpose field:** Tracks why the verification was created:
> - `email_verification`: For initial email verification during registration
> - `student_activation`: For activation tokens when students are imported via CSV
> - **Hashing:** Verification tokens are hashed with bcrypt (10 rounds, not plain SHA) to prevent rainbow table attacks if the database is leaked. Token hashing uses 10 rounds (vs 12 for passwords) because tokens are short-lived and verified once.

### `user_auth_providers`
```
id, user_id (FK), provider (email|google|github),
provider_id (external sub ID), created_at
UNIQUE (provider, provider_id) — prevents duplicate provider links
```

### `beta_invites`
```
id, code, email, invited_by (FK), used_by (FK, nullable),
expires_at, max_uses (default 1), use_count (default 0),
created_at
```

> **Brute-force protection:** Invite codes are 12-character alphanumeric strings (cryptographically random, `crypto.randomBytes(9).toString('base64url)`). Rate limited to 5 validation attempts per IP per 15 minutes via Redis.

### `waitlist`
```
id, email, unsubscribed_at, unsubscribe_token (unique),
source (landing_page|invite_flow), created_at
```

> **Compliance:** Unsubscribe via one-click link in waitlist confirmation email containing `unsubscribe_token`. Unsubscribed emails are excluded from future communications.

### `reviews`
```
id, user_id (FK), course_id (FK), rating (1–5),
comment, moderation_status (visible|flagged|hidden),
flagged_at, moderated_by (FK, nullable), moderated_at,
created_at
```

> **Moderation:** Students and instructors can flag reviews. Admin reviews flagged content and can hide (`moderation_status = hidden`). Visible reviews only shown in course listings.

### `jobs`
```
id, title, company, description, domain (tech|business|...),
location, url, posted_by (FK), course_id (FK, nullable),
is_active, created_at
```

> **Relationship:** Jobs are curated listings optionally linked to courses (`course_id`). When linked, the job appears on the course's placement page. The `domain` field matches course domains for filtering. Jobs without a `course_id` appear in the general job board.

---

## Migration Strategy

- All migrations are forward-only (no down migrations in production)
- Each migration file includes:
  - Up migration
  - Down migration (for development rollback only)
  - Rollback script (manual, reviewed before execution)
- Migration versioning: `001_create_users_table.sql`, `002_create_courses_table.sql`

## Query Optimization Rules

- Always use parameterized queries (Drizzle ORM handles this)
- Index all foreign keys
- Index all columns used in WHERE clauses
- Use EXPLAIN ANALYZE on queries >100ms
- Paginate all list endpoints (cursor-based for infinite scroll)

## Progress Completion Logic

- **No `completed` boolean column** — completion is computed dynamically: `watched_seconds >= lecture.duration_seconds`
- **Server-side abuse prevention:** Progress updates accepted at maximum 30-second intervals; each update must not jump more than 30 seconds from the previous value (prevents seek-to-end)
- **Non-video lectures** (text, assignment, quiz): marked complete immediately on access/submission
- **Edge case:** If `duration_seconds` is 0 or NULL, the lecture is treated as non-video and auto-completes on access
- **Course completion:** A course is considered complete when all lectures in all sections have `watched_seconds >= duration_seconds` (for video) or are marked accessed/submitted (for non-video)

## Connection Pool Configuration

- **Formula:** `max_connections = (core_count * 2) + effective_spindle_count`
- **Month 1 defaults:** `min = 2`, `max = 10`, `idle_timeout = 30s`, `connection_timeout = 5s`
- **Monitoring:** Track pool utilization via metrics dashboard
- **Scale-up trigger:** When pool utilization exceeds 80% for 5+ consecutive minutes
- **ORM config:** Drizzle connection pool configured in `apps/api/src/db/connection.ts`

## Soft Delete Policy

- **Soft-deleted entities** use a `deleted_at` nullable timestamp column (NULL = active)
- **Always soft-delete** instead of hard-delete for: `users`, `courses`, `sections`, `lectures`, `assignments`, `messages`, `reviews`
- **Never delete** financial or compliance records: `payments`, `certificates`, `submissions`, `audit_logs`, `enrollments`
- **Query default scope:** All queries must exclude `deleted_at IS NOT NULL` unless explicitly requesting soft-deleted records
- **Hard delete** is only for: `password_resets`, `email_verifications`, `beta_invites` (expired tokens), `waitlist` (on request)
- **Retention:** Soft-deleted records purged after 90 days via background job (configurable)

## Deletion Cascade Behavior

| Parent | Child Table | Behavior |
|---|---|---|
| User soft-delete | `enrollments`, `progress`, `submissions` | Preserved (data retained, user marked inactive) |
| User soft-delete | `courses` (if instructor) | Soft-deleted (instructor's courses hidden) |
| Course soft-delete | `sections`, `lectures` | Soft-deleted |
| Section soft-delete | `lectures` | Soft-deleted |
| Lecture soft-delete | `assignments`, `progress` | Preserved (retained for grading/history) |
| Message soft-delete | — | `is_deleted = true` (already handled) |

## Data Integrity

- **All foreign keys use `ON DELETE RESTRICT`** at the database level — never `CASCADE` or `SET NULL`. Cascade behavior (soft-delete propagation) is handled at the application level, not by the database. This prevents accidental data loss if a hard delete ever bypasses the soft-delete logic.
- Foreign key constraints with appropriate cascade behavior (see Deletion Cascade Behavior table above — application-level)
- Unique constraints on all natural keys
- NOT NULL on all required fields
- Default values for timestamps and status fields
- Check constraints for enum-like fields
- Unique `(student_id, course_id)` constraint on enrollments to prevent duplicate enrollments
- Unique `razorpay_order_id` and `razorpay_payment_id` on payments to prevent duplicate webhook processing
- **Idempotency on enrollment creation:** `razorpay_order_id` serves as the idempotency key — the enrollment service checks for an existing enrollment with the same `payment_id` before creating a new one, preventing duplicate enrollments from duplicate webhook deliveries

## Transaction Isolation

- **Default:** READ COMMITTED (PostgreSQL default) — used for all standard CRUD operations
- **Enrollment creation:** Use `SELECT ... FOR UPDATE` on the payment record before checking for existing enrollment. This serializes concurrent webhook handlers for the same payment and prevents duplicate enrollments
- **Certificate generation:** Use `SELECT ... FOR UPDATE` on the enrollment record before checking completion status and generating certificate. This prevents two concurrent progress updates from both triggering certificate creation
- **Invite code redemption:** Use atomic `UPDATE beta_invites SET use_count = use_count + 1 WHERE code = $1 AND use_count < max_uses RETURNING *` — no separate read step, eliminating the TOCTOU race
- **OAuth account linking:** Use `SELECT ... FOR UPDATE` on the matching `users` row (by email) before creating or linking accounts. This prevents two simultaneous OAuth callbacks from creating duplicate users or incorrect links
