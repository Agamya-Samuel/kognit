# Deployment Runbook

> **Purpose:** Procedures for deploying EduTech to staging and production
> **Audience:** DevOps, lead developers

---

## Architecture Overview

- **Monorepo** managed with Turborepo
- **Backend**: NestJS API (`apps/api`)
- **Frontend**: 4 Next.js apps (`apps/web-*`)
- **Database**: PostgreSQL 16 (Docker / managed)
- **Cache/Jobs**: Redis 7 (Docker / managed)
- **ORM**: Drizzle ORM with migration-based workflow

---

## Pre-Deployment Checklist

- [ ] All tests pass: `npm test` from `apps/api`
- [ ] Type check passes: `npm run typecheck`
- [ ] Lint passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Migrations reviewed and tested locally
- [ ] Environment variables configured on target
- [ ] Database backup taken (production only)

---

## Staging Deployment

### 1. Build

```bash
npm run build
```

### 2. Run Migrations

```bash
cd apps/api
npm run db:migrate
```

Always run migrations **before** deploying the new code. Drizzle migrations are forward-only.

### 3. Deploy API

```bash
cd apps/api
NODE_ENV=production node dist/main.js
```

### 4. Verify

- Health check: `GET /api/health`
- Swagger docs accessible: `GET /api/docs` (non-production only)
- Smoke test key endpoints: login, list courses, etc.

---

## Production Deployment

### 1. Pre-Flight

- Create a database backup
- Review all changes since last deploy
- Verify staging deploy is stable

### 2. Deploy

Follow the same steps as staging, but:

- Set `NODE_ENV=production`
- Swagger docs are **disabled** in production
- Use secrets manager for sensitive env vars (JWT_SECRET, DB passwords, API keys)
- Ensure `SENTRY_DSN` is configured for error monitoring

### 3. Post-Deploy Verification

- Health check responds 200
- Sentry is receiving events (check project dashboard)
- Login flow works end-to-end
- Key API endpoints return expected data

---

## Database Migrations

### Create a Migration

When schema changes are made:

```bash
cd apps/api
npm run db:generate
```

This creates a new SQL migration file in `src/db/migrations/`.

### Apply Migrations

```bash
cd apps/api
npm run db:migrate
```

### Rollback

Drizzle ORM does not support automatic rollbacks. To revert:

1. Write a manual `down.sql` migration
2. Apply it directly against the database:

```bash
psql -h <host> -U <user> -d <database> -f down.sql
```

**Important:** Always test migrations on staging before production.

---

## Environment Variables

See [configuration.ts](../../apps/api/src/config/configuration.ts) for the full schema.

**Required in production:**

| Variable | Description |
|---|---|
| `DATABASE_HOST` | PostgreSQL host |
| `DATABASE_PASSWORD` | PostgreSQL password |
| `JWT_SECRET` | >= 32 chars, cryptographically random |
| `JWT_REFRESH_SECRET` | >= 32 chars, cryptographically random |
| `REDIS_HOST` | Redis host |
| `SENTRY_DSN` | Sentry project DSN |

**Conditionally required** (based on features enabled):

| Variable | Feature |
|---|---|
| `MUX_TOKEN_ID` + `MUX_TOKEN_SECRET` | Video processing |
| `LIVEKIT_API_KEY` + `LIVEKIT_API_SECRET` + `LIVEKIT_URL` | Live classes |
| `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` + `AWS_S3_BUCKET` | File uploads |
| `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` | Payments |
| `POSTHOG_API_KEY` | Analytics |
| `SMTP_HOST` + `SMTP_USER` + `SMTP_PASSWORD` | Email sending |

---

## Rollback Procedure

1. **Application rollback**: Deploy the previous known-good version
2. **Database rollback**: Apply manual `down.sql` if a migration caused issues
3. **Verify**: Run health check and smoke tests after rollback
