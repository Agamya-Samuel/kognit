# Notifications System

> **Purpose:** Notification triggers, channels, and system design
> **Source:** PROJECT_DOCUMENTATION.md §6.4, PROJECT_DOCUMENTATION.md §13

---

## Notification Triggers

| Trigger | Channel |
|---|---|
| Live class starting (1hr, 15min before) | In-app + Email |
| Live class cancelled | In-app + Email |
| New lecture published | In-app |
| Assignment graded | In-app + Email |
| Certificate earned | In-app + Email |
| New community reply | In-app |
| Payment confirmed | Email |
| Refund processed | Email |
| Password reset requested | Email |
| Email verification | Email |
| Instructor approval/rejection | Email |
| Course moderation (approve/reject/suspend) | In-app + Email |
| Role changed (admin action) | In-app + Email |
| Instructor: new enrollment | In-app |
| Instructor: assignment submitted | In-app |

## System Design

```
NestJS emits internal event (e.g., "enrollment.confirmed")
  → NotificationService picks up
  → Creates notification record in DB
  → Emits via Socket.IO to connected client
  → If client offline → notification surfaced on next login
```

### Email Infrastructure
- AWS SES for cost efficiency in Month 1
- Monitor deliverability closely
- Can migrate to SendGrid/Postmark if deliverability issues arise

### Email Template System

- **Template engine:** React Email — component-based, reusable, renders to HTML + plain text
- **Template location:** `apps/api/src/email/templates/`
- **Design system:** Platform brand guidelines, responsive layout, dark mode support, consistent typography and colors
- **Preview:** Local dev route at `/dev/email-preview` renders all templates with sample data
- **Templates per trigger:**

| Template | Trigger |
|---|---|
| `LiveClassReminder` | 1hr and 15min before live class |
| `LiveClassCancelled` | Class cancelled by instructor |
| `AssignmentGraded` | Assignment graded by instructor |
| `CertificateEarned` | Course completed, certificate issued |
| `PaymentConfirmed` | Payment captured successfully |
| `RefundProcessed` | Refund completed |
| `PasswordReset` | Password reset requested |
| `EmailVerification` | Email verification on registration |
| `InstructorApproval` | Instructor application approved |
| `InstructorRejection` | Instructor application rejected |
| `CourseModeration` | Course approved/rejected/suspended |
| `RoleChanged` | Admin changed user's role |
