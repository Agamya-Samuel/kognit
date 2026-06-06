# Notifications System

> **Purpose:** Notification triggers, channels, configuration, and system design
> **Source:** PROJECT_DOCUMENTATION.md §6.4, PROJECT_DOCUMENTATION.md §13

---

## Architecture Overview

```
Event occurs (enrollment, live class, assignment, etc.)
  → NotificationDispatcherService.dispatch()
    → Checks user preferences (UserNotificationPreferences)
    → Creates in-app notification record in DB
    → Dispatches to BullMQ queues based on channel preferences:
      - email-notifications queue → EmailNotificationProcessor → EmailProvider (SES/Resend)
      - sms-notifications queue → SmsNotificationProcessor → SmsProvider (SNS/Twilio)
      - scheduled-notifications queue → ScheduledNotificationProcessor (delayed jobs)
    → Socket.IO emits real-time notification to connected clients
```

## Notification Triggers

| Trigger | Type | Channels | Template |
|---|---|---|---|
| Live class starting (1hr, 15min before) | Reminder | In-app + Email | `LiveClassReminder` |
| Live class cancelled | Alert | In-app + Email | `LiveClassCancelled` |
| Assignment graded | Update | In-app + Email | `AssignmentGraded` |
| Certificate earned | Achievement | In-app + Email | `CertificateEarned` |
| Payment confirmed | Transaction | Email | `PaymentConfirmed` |
| Refund processed | Transaction | Email | `RefundProcessed` |
| Password reset requested | Security | Email | `PasswordReset` |
| Email verification | Security | Email | `EmailVerification` |
| Instructor approval | Admin | Email | `InstructorApproval` |
| Instructor rejection | Admin | Email | `InstructorRejection` |
| Course moderation | Admin | In-app + Email | `CourseModeration` |
| Role changed | Admin | In-app + Email | — |

## Queue System (BullMQ)

### Queues

| Queue | Purpose | Retry Config |
|---|---|---|
| `email-notifications` | Email delivery | 3 attempts, exponential backoff (2s base) |
| `sms-notifications` | SMS delivery | 3 attempts, exponential backoff (2s base) |
| `scheduled-notifications` | Delayed reminders (live classes) | 2 attempts, exponential backoff (5s base) |
| `media-processing` | Video/image processing | 3 attempts, exponential backoff (2s base) |
| `certificate-generation` | Certificate PDF generation | 3 attempts, exponential backoff (2s base) |

### Redis Connection

BullMQ connects to Redis via `BullModule.forRootAsync()` using environment variables:
- `REDIS_HOST` (default: `localhost`)
- `REDIS_PORT` (default: `6379`)
- `REDIS_PASSWORD`
- `REDIS_DB` (default: `0`)

### Job Options (Default)
```typescript
{
  removeOnComplete: 10,
  removeOnFail: 20,
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
}
```

## Notification Channels

### Email

**Providers (pluggable via `EMAIL_PROVIDER` env var):**

| Provider | Value | Dependencies |
|---|---|---|
| AWS SESv2 (primary) | `ses` | `@aws-sdk/client-sesv2`, `AWS_REGION`, `SES_SOURCE_EMAIL` |
| Resend (alternative) | `resend` | `resend`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL` |

### SMS

**Providers (pluggable via `SMS_PROVIDER` env var):**

| Provider | Value | Dependencies |
|---|---|---|
| AWS SNS (primary) | `sns` | `@aws-sdk/client-sns`, `AWS_REGION`, `SNS_SMS_SENDER_ID` |
| Twilio (alternative) | `twilio` | `twilio`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` |

## Notification Preferences

### Database Schema: `user_notification_preferences`

| Column | Type | Default | Description |
|---|---|---|---|
| `email_enrollments` | boolean | `true` | Email on enrollment events |
| `email_submissions` | boolean | `true` | Email on assignment submission/grades |
| `email_reminders` | boolean | `true` | Email on live class reminders |
| `email_marketing` | boolean | `false` | Marketing/promotional emails |
| `push_enrollments` | boolean | `true` | Push notification on enrollment events |
| `push_submissions` | boolean | `true` | Push notification on submission/grades |
| `push_reminders` | boolean | `true` | Push notification on reminders |
| `sms_enrollments` | boolean | `false` | SMS on enrollment events |
| `sms_submissions` | boolean | `false` | SMS on submission/grades |
| `sms_reminders` | boolean | `false` | SMS on reminders |
| `email_frequency` | varchar | `immediate` | `immediate`, `daily`, `weekly` |
| `sms_frequency` | varchar | `immediate` | `immediate`, `daily`, `weekly` |

### Preference Resolution

When dispatching a notification, the `NotificationDispatcherService`:

1. Queries user preferences from `user_notification_preferences`
2. Maps notification type to preference category:
   - `enrollment` / `enrolled` / `course_enrolled` → `*Enrollments` fields
   - `assignment` / `graded` / `submission` → `*Submissions` fields
   - `reminder` / `live_class` / `class_*` → `*Reminders` fields
   - `marketing` → `*Marketing` fields
3. System notifications (payment, refund, password, verification, role_changed, course_moderation, instructor) are **always delivered** regardless of preferences
4. If no preference record exists, defaults are applied
5. Applies frequency delay for batched notifications:
   - `immediate` → no delay
   - `daily` → 1 hour delay (batched)
   - `weekly` → 7 days delay (batched)

## Email Templates

### Template Engine: React Email

- **Location:** `apps/api/src/email/templates/`
- **Base template:** `BaseTemplate.tsx` — responsive layout with Indigo (#4F46E5) branding
- **Renderer:** `apps/api/src/email/email-renderer.ts`

### Templates

| Template | File | Use Case |
|---|---|---|
| `LiveClassReminder` | `LiveClassReminder.tsx` | 1hr/15min before live class |
| `LiveClassCancelled` | `LiveClassCancelled.tsx` | Class cancelled by instructor |
| `AssignmentGraded` | `AssignmentGraded.tsx` | Assignment graded with feedback |
| `CertificateEarned` | `CertificateEarned.tsx` | Course completion certificate |
| `PaymentConfirmed` | `PaymentConfirmed.tsx` | Payment receipt confirmation |
| `RefundProcessed` | `RefundProcessed.tsx` | Refund completion |
| `PasswordReset` | `PasswordReset.tsx` | Password reset link (30min expiry) |
| `EmailVerification` | `EmailVerification.tsx` | Email verification (24hr expiry) |
| `InstructorApproval` | `InstructorApproval.tsx` | Instructor application approved |
| `InstructorRejection` | `InstructorRejection.tsx` | Instructor application rejected |
| `CourseModeration` | `CourseModeration.tsx` | Course approved/rejected/suspended |

### Dev Preview

- **Endpoint:** `GET /dev/email-preview` (development only)
- **Endpoint:** `GET /dev/email-preview/:templateName` (development only)
- Renders all templates with realistic Indian mock data

## API Endpoints

### User Endpoints (`/notifications`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | JWT | Get user notifications (paginated) |
| GET | `/notifications/unread-count` | JWT | Get unread notification count |
| PATCH | `/notifications/:id/read` | JWT | Mark notification as read |
| PATCH | `/notifications/read-all` | JWT | Mark all as read |
| GET | `/notifications/preferences` | JWT | Get notification preferences |
| PATCH | `/notifications/preferences` | JWT | Update notification preferences |

### Admin Endpoints (`/admin/notifications`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/notifications/config` | Admin | Get notification config defaults |
| GET | `/admin/notifications/users/:userId/preferences` | Admin | Get user notification preferences |
| PATCH | `/admin/notifications/users/:userId/preferences` | Admin | Update user notification preferences |

### Dev Endpoints (`/dev/email-preview`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/dev/email-preview` | Public (dev) | List all email templates |
| GET | `/dev/email-preview/:name` | Public (dev) | Render template with mock data |

## Admin Dashboard

### Notification Configuration Page (`/dashboard/notifications`)

- **Notification Matrix:** Toggle table with categories (Enrollments, Submissions, Reminders, Marketing) × channels (Email, Push, SMS)
- **Frequency Settings:** Radio buttons for email and SMS frequency (Immediate, Daily Digest, Weekly Digest)
- **Channel Summary:** Cards showing enabled/disabled count per channel
- **Bulk Actions:** Enable/Disable all toggles per channel
- **Hook:** `useNotificationConfig()` in `apps/web-admin/src/hooks/useNotificationConfig.ts`

## Environment Variables

```env
# Redis (required for BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Email Provider
EMAIL_PROVIDER=ses          # 'ses' or 'resend'
AWS_REGION=us-east-1
SES_SOURCE_EMAIL=noreply@edutech.in
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# SMS Provider
SMS_PROVIDER=sns             # 'sns' or 'twilio'
SNS_SMS_SENDER_ID=Edutech
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

## Frontend Data Contract

| API Field | Frontend Field | Notes |
|---|---|---|
| `isRead` | `read` | Mapped in controller response |
| `body` | `message` | Mapped in controller response |
| `createdAt` | `createdAt` | ISO timestamp string |
| `deliveredVia` | `deliveredVia` | `in_app`, `email`, `both` |

## Live Class Notification Scheduling

The `LiveNotificationService` schedules delayed BullMQ jobs:

- **1hr before class:** `scheduled-notifications` queue, job ID format: `{liveClassId}-class_reminder_1hr`
- **15min before class:** `scheduled-notifications` queue, job ID format: `{liveClassId}-class_reminder_15min`
- **Cancellation:** Jobs removed via `scheduledQueue.remove(jobId)`
- **Migration from in-memory:** Replaced `Map` + `setInterval` polling with BullMQ delayed jobs

## File Structure

```
apps/api/src/
├── email/
│   ├── dev-email-preview.controller.ts
│   ├── email-renderer.ts
│   └── templates/
│       ├── BaseTemplate.tsx
│       ├── LiveClassReminder.tsx
│       ├── LiveClassCancelled.tsx
│       ├── AssignmentGraded.tsx
│       ├── CertificateEarned.tsx
│       ├── PaymentConfirmed.tsx
│       ├── RefundProcessed.tsx
│       ├── PasswordReset.tsx
│       ├── EmailVerification.tsx
│       ├── InstructorApproval.tsx
│       ├── InstructorRejection.tsx
│       └── CourseModeration.tsx
├── modules/notifications/
│   ├── controllers/
│   │   └── notifications.controller.ts
│   ├── dto/
│   │   └── notification-preferences.dto.ts
│   ├── providers/
│   │   ├── email.provider.ts
│   │   ├── ses-email.provider.ts
│   │   ├── resend-email.provider.ts
│   │   ├── sms.provider.ts
│   │   ├── sns-sms.provider.ts
│   │   ├── twilio-sms.provider.ts
│   │   ├── providers.tokens.ts
│   │   └── providers.module.ts
│   ├── repositories/
│   │   └── notifications-preferences.repository.ts
│   ├── services/
│   │   ├── notifications.service.ts
│   │   └── notification-dispatcher.service.ts
│   └── notifications.module.ts
├── queue/
│   ├── queue.module.ts
│   └── processors/
│       ├── email-notification.processor.ts
│       ├── sms-notification.processor.ts
│       ├── scheduled-notification.processor.ts
│       ├── media-processing.processor.ts
│       └── certificate-generation.processor.ts
└── db/schema/
    ├── notifications.ts
    └── user-notification-preferences.ts
```
