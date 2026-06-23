# Database Layer Documentation

## Overview

This directory contains the complete database layer for the EduTech platform using Drizzle ORM with PostgreSQL. The database design follows the specifications outlined in [`docs/02-architecture/04-database.md`](../../../../docs/02-architecture/04-database.md).

## Directory Structure

```
apps/api/src/db/
├── connection.ts              # Database connection service
├── seed.ts                    # Database seeding script
├── schema/                    # Drizzle schema definitions
│   ├── index.ts              # Schema exports
│   ├── enums.ts              # PostgreSQL enum definitions
│   ├── relations.ts          # Table relationships
│   ├── users.ts              # User table
│   ├── instructor-profiles.ts
│   ├── student-profiles.ts
│   ├── admin-profiles.ts
│   ├── courses.ts
│   ├── sections.ts
│   ├── lectures.ts
│   ├── lesson-attachments.ts
│   ├── live-classes.ts
│   ├── recurring-schedules.ts
│   ├── enrollments.ts
│   ├── progress.ts
│   ├── assignments.ts
│   ├── submissions.ts
│   ├── certificates.ts
│   ├── payments.ts
│   ├── channels.ts
│   ├── channel-members.ts
│   ├── messages.ts
│   ├── notifications.ts
│   ├── audit-logs.ts
│   ├── password-resets.ts
│   ├── refresh-tokens.ts
│   ├── email-verifications.ts
│   ├── user-auth-providers.ts
│   ├── user-notification-preferences.ts
│   ├── beta-invites.ts
│   ├── waitlist.ts
│   ├── reviews.ts
│   ├── jobs.ts
│   ├── quiz-questions.ts
│   ├── uploads.ts
│   ├── platform-settings.ts
│   ├── institution-accounts.ts
│   └── institution-enrollments.ts
└── repositories/              # Repository pattern implementation
    ├── base.repository.ts
    ├── users.repository.ts
    ├── courses.repository.ts
    ├── sections.repository.ts
    ├── lectures.repository.ts
    ├── assignments.repository.ts
    ├── reviews.repository.ts
    ├── enrollments.repository.ts
    └── ... (30+ repository files)
```

## Connection Configuration

### Database Service

The [`connection.ts`](connection.ts) provides a singleton database service with:

- **Connection Pool**: Configured with min=2, max=10 connections
- **Health Checks**: Method to verify database connectivity
- **Graceful Shutdown**: Automatic cleanup on application termination
- **Error Handling**: Structured logging for connection issues

**Usage:**

```typescript
import { DatabaseService } from './db/connection';

// In your module or service
constructor(private db: DatabaseService) {
  const connection = this.db.getConnection();
  // Use connection with Drizzle
}
```

### Environment Variables

Required environment variables (see [`apps/api/.env`](../../.env)):

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=edutech
DATABASE_PASSWORD=edutech_password
DATABASE_NAME=edutech
DATABASE_URL=postgresql://edutech:edutech_password@localhost:5432/edutech
```

## Schema Definitions

### Enums

All PostgreSQL enums are defined in [`enums.ts`](schema/enums.ts):

- `user_role`: student, instructor, admin, institution_admin
- `approval_status`: pending, approved, rejected
- `pricing_type`: free, paid
- `lecture_type`: video, live, text, assignment, quiz
- `live_class_status`: scheduled, live, ended, cancelled
- `recording_status`: none, recording, processing, ready, failed
- `assignment_type`: mcq, short, code
- `access_type`: purchased, free
- `payment_status`: pending, paid, failed, refunded
- `channel_type`: course, general, dm
- `notification_delivery`: in_app, email, both
- `moderation_status`: visible, flagged, hidden
- `waitlist_source`: landing_page, invite_flow
- `permissions_level`: super_admin, moderator, support
- `upload_status`: pending, uploading, complete, failed, cancelled
- `email_verification_purpose`: email_verify, student_activation, instructor_activation
- `course_status`: draft, in_review, revision_requested, published, archived
- `course_structure`: live, normal
- `session_type`: one_time, recurring
- `day_of_week`: mon, tue, wed, thu, fri, sat, sun

### Core Tables

#### Users & Authentication
- **`users`**: Core user table with role-based access
- **`instructor_profiles`**: Instructor-specific information and approval status
- **`student_profiles`**: Student skills and placement status
- **`admin_profiles`**: Admin permissions and departments
- **`password_resets`**: Password reset tokens (bcrypt hashed)
- **`email_verifications`**: Email verification tokens (bcrypt hashed)
- **`user_auth_providers`**: OAuth provider links

#### Course Content
- **`courses`**: Course metadata, pricing, and publishing status
- **`sections`**: Course sections/modules (soft-delete via `deleted_at`)
- **`lectures`**: Individual lectures with video/live/text types (soft-delete via `deleted_at`)
- **`lesson_attachments`**: File attachments for lectures
- **`live_classes`**: Live class scheduling and recordings
- **`recurring_schedules`**: Recurring live class schedule patterns

#### Enrollment & Progress
- **`enrollments`**: Student course enrollments
- **`progress`**: Lecture completion tracking
- **`certificates`**: Course completion certificates

#### Assignments
- **`assignments`**: Assignment definitions and scoring (soft-delete via `deleted_at`)
- **`submissions`**: Student assignment submissions
- **`quiz_questions`**: Quiz question definitions for MCQ assignments

#### Payments
- **`payments`**: Payment transactions with Razorpay integration

#### Communication
- **`channels`**: Chat channels (course, general, DM)
- **`messages`**: Chat messages with soft delete

#### Notifications & System
- **`notifications`**: User notifications with delivery tracking
- **`user_notification_preferences`**: Per-user notification delivery settings
- **`audit_logs`**: System activity logging
- **`platform_settings`**: Platform-wide configuration key-value store
- **`uploads`**: File upload tracking with S3/Mux ingestion status

#### Marketing
- **`beta_invites`**: Beta invite code management
- **`waitlist`**: Email waitlist for non-invited users
- **`reviews`**: Course reviews with moderation (soft-delete via `deleted_at`)
- **`jobs`**: Job board listings
- **`refresh_tokens`**: JWT refresh token storage with family-based theft detection

#### Phase 2 (Institution)
- **`institution_accounts`**: Institution seat management
- **`institution_enrollments`**: Institution bulk enrollments

### Relationships

All table relationships are defined in [`relations.ts`](schema/relations.ts) using Drizzle's `relations` function. Relationships include:

- One-to-many (e.g., User → Courses)
- Many-to-one (e.g., Course → Instructor)
- Many-to-many (e.g., User ↔ Courses through Enrollments)

### Constraints & Indexes

**Foreign Keys**: All foreign keys use `ON DELETE RESTRICT` at database level

**Unique Constraints**:
- `users.email`
- `user_auth_providers.(provider, provider_id)`
- `enrollments.(student_id, course_id)`
- `progress.(student_id, lecture_id)`
- `certificates.(student_id, course_id)`
- `payments.razorpay_order_id`
- `payments.razorpay_payment_id`
- `beta_invites.code`
- `waitlist.email`
- `waitlist.unsubscribe_token`
- `reviews.(user_id, course_id)`

**Indexes**: Applied to all foreign keys and frequently queried columns

## Repository Pattern

The repository pattern provides a clean abstraction over Drizzle ORM queries.

### Base Repository

[`base.repository.ts`](repositories/base.repository.ts) provides:

- Error handling with user-friendly messages
- Loading state management
- Common database operations

### Specific Repositories

#### Users Repository

[`users.repository.ts`](repositories/users.repository.ts) methods:

- `findById(id)`: Find user by ID
- `findByEmail(email)`: Find user by email
- `findMany(options)`: List users with pagination and filters
- `create(userData)`: Create new user
- `update(id, userData)`: Update user
- `softDelete(id)`: Soft delete user
- `count(filters)`: Count users with filters

**Example:**

```typescript
import { UsersRepository } from './db/repositories/users.repository';

const usersRepo = new UsersRepository(db);
const user = await usersRepo.findByEmail('user@example.com');
```

#### Courses Repository

[`courses.repository.ts`](repositories/courses.repository.ts) methods:

- `findById(id)`: Find course (excludes soft-deleted)
- `findMany(options)`: List courses with filtering (instructor, published status, domain, search)
- `create(courseData)`: Create new course
- `update(id, courseData)`: Update course
- `softDelete(id)`: Soft delete course
- `findByInstructor(instructorId, options)`: Get courses by instructor
- `count(filters)`: Count courses with filters

#### Enrollments Repository

[`enrollments.repository.ts`](repositories/enrollments.repository.ts) methods:

- `findById(id)`: Find enrollment
- `findByStudentAndCourse(studentId, courseId)`: Check enrollment
- `findMany(options)`: List enrollments with filters
- `create(enrollmentData)`: Create enrollment
- `findByStudent(studentId, options)`: Get student's enrollments
- `findByCourse(courseId, options)`: Get course's enrollments
- `checkEnrollmentExists(studentId, courseId)`: Check if enrolled

## Migrations

### Generating Migrations

```bash
cd apps/api
npm run db:generate
```

This creates SQL migration files in `drizzle/migrations/`.

### Applying Migrations

```bash
npm run db:push
```

Or for production:

```bash
npm run db:migrate
```

### Drizzle Studio

View and edit database data:

```bash
npm run db:studio
```

## Seeding

The [`seed.ts`](seed.ts) script creates initial test data:

### Seed Data Includes:
- 1 admin user
- 1 instructor with approved profile
- 2 students with profiles
- 1 course with 2 sections and 3 lectures
- 1 enrollment

### Running Seed

```bash
cd apps/api
npm run db:seed
```

### Test Credentials

```
Admin: admin@edutech.com / Admin@123
Instructor: instructor@edutech.com / Instructor@123
Student 1: student1@edutech.com / Student@123
Student 2: student2@edutech.com / Student@123
```

## Soft Delete Policy

**Soft-deleted entities** use a `deleted_at` nullable timestamp column.

- **Always soft-delete**: `users`, `courses`, `sections`, `lectures`, `assignments`, `messages`, `reviews`
- **Never delete**: `payments`, `certificates`, `submissions`, `audit_logs`, `enrollments`
- **Query default**: All queries exclude `deleted_at IS NOT NULL` unless explicitly requested
- **Hard delete only**: `password_resets`, `email_verifications`, `beta_invites` (expired tokens), `waitlist` (on request)

## Data Integrity

### Currency Storage
- Prices stored as **INTEGER in paise** (smallest currency unit)
- Example: ₹499.00 → `49900`
- Display by dividing by 100

### Password & Token Hashing
- **Passwords**: bcrypt with 12 rounds (128 char max)
- **Reset/Verification Tokens**: bcrypt with 10 rounds (60 char output, VARCHAR(60))

### Transaction Isolation
- **Default**: READ COMMITTED
- **Enrollment Creation**: `SELECT ... FOR UPDATE` on payment record
- **Certificate Generation**: `SELECT ... FOR UPDATE` on enrollment
- **Invite Code Redemption**: Atomic UPDATE with RETURNING
- **OAuth Account Linking**: `SELECT ... FOR UPDATE` on users table

## Query Optimization

### Connection Pool
- **Formula**: `max_connections = (core_count * 2) + effective_spindle_count`
- **Defaults**: min=2, max=10, idle_timeout=30s, connection_timeout=5s
- **Monitoring**: Track pool utilization via metrics
- **Scale-up**: Trigger at 80% utilization for 5+ minutes

### Query Rules
- Always use parameterized queries (Drizzle handles this)
- Index all foreign keys
- Index all WHERE clause columns
- Use EXPLAIN ANALYZE on queries >100ms
- Paginate all list endpoints (cursor-based for infinite scroll)

## Progress Completion Logic

- **`is_completed` boolean column** exists on the `progress` table and is set to `true` when the lecture is considered complete
- **Completion formula**: `watched_seconds >= lecture.duration_seconds` (computed server-side and written to `is_completed`)
- **Server-side abuse prevention**:
  - Max 30-second update intervals
  - Max 30-second jump from previous value (prevents seek-to-end)
- **Non-video lectures**: Mark complete immediately on access/submission
- **Edge case**: If `duration_seconds` is 0 or NULL, auto-complete on access
- **Course completion**: When all lectures in all sections meet completion criteria

## Error Handling

### Common Error Codes

- **23505**: Unique violation - "A record with this data already exists"
- **23503**: Foreign key violation - "Referenced record not found"
- **23502**: Not null violation - "Required field is missing"

### Repository Error Handling

The [`BaseRepository.handleError()`](repositories/base.repository.ts) method:

1. Logs detailed error information
2. Converts PostgreSQL error codes to user-friendly messages
3. Throws NestJS exceptions (NotFoundException, InternalServerErrorException)
4. Provides loading states for UX

## Testing

### Unit Tests

Test schema definitions, constraints, and repository methods.

### Integration Tests

Test CRUD operations against test database.

### E2E Tests

Test complete flows including migrations and seeding.

**Note**: Testing setup is documented in the project's testing strategy.

## Best Practices

1. **Always use repositories** - Don't query Drizzle directly in services
2. **Filter soft-deleted records** - Use repository methods that handle this automatically
3. **Use transactions** - For multi-step operations (enrollments, certificates)
4. **Handle errors gracefully** - Use repository error handling
5. **Index properly** - Add indexes for frequently queried columns
6. **Monitor pool health** - Track connection pool metrics
7. **Validate constraints** - Test unique, foreign key, and not null constraints
8. **Use typed queries** - Leverage TypeScript types from schemas
9. **Optimize queries** - Use EXPLAIN ANALYZE for slow queries
10. **Document custom logic** - Comment complex query logic

## Troubleshooting

### Connection Issues

```bash
# Check Docker containers
docker-compose ps

# Check database logs
docker-compose logs postgres

# Test connection
npm run db:studio
```

### Migration Issues

```bash
# View pending migrations
npm run db:generate

# Reset database (development only)
# WARNING: This deletes all data
npm run db:push -- --force
```

### Drizzle Kit Compatibility

If you encounter "Please install latest version of drizzle-orm" error:

```bash
npm update drizzle-orm drizzle-kit
```

## Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Architecture](../../../../docs/02-architecture/04-database.md)
- [Testing Strategy](../../../../docs/04-engineering/01-testing-strategy.md)
