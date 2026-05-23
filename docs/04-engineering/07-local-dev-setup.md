# Local Development Setup

> **Purpose:** Step-by-step guide for setting up the EduTech platform locally
> **Audience:** New developers joining the project

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | >= 20.x | [nodejs.org](https://nodejs.org) |
| npm | >= 10.x | Comes with Node.js |
| Docker & Docker Compose | Latest | [docker.com](https://docker.com) |
| Git | Latest | [git-scm.com](https://git-scm.com) |

---

## 1. Clone & Install

```bash
git clone <repo-url> EduTech
cd EduTech
npm install
```

This is an npm monorepo. The root `npm install` installs all workspace packages.

---

## 2. Start Infrastructure

PostgreSQL and Redis run via Docker:

```bash
docker compose up -d
```

Verify they are running:

```bash
docker compose ps
```

Both `postgres` and `redis` should show status `healthy`.

---

## 3. Configure Environment

Create `apps/api/.env` (defaults work for local development):

```env
# Application
NODE_ENV=development
PORT=3000

# Frontend
FRONTEND_URL=http://localhost:3000

# Database (matches docker-compose.yml)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=edutech
DATABASE_PASSWORD=edutech_password
DATABASE_NAME=edutech
DATABASE_SSL=false

# Redis (matches docker-compose.yml)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT (defaults are fine for local dev)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Logging
LOG_LEVEL=debug
```

Optional integrations (leave empty to skip):
- `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` — Video processing
- `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` / `LIVEKIT_URL` — Live classes
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_S3_BUCKET` — File uploads
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — Payments
- `POSTHOG_API_KEY` — Analytics
- `SENTRY_DSN` — Error monitoring

---

## 4. Database Setup

Generate migrations and apply them:

```bash
cd apps/api
npm run db:generate
npm run db:migrate
```

Optionally seed the database:

```bash
npm run db:seed
```

---

## 5. Start Development Server

```bash
# From project root — starts all apps via Turborepo
npm run dev

# Or just the API
cd apps/api
npm run dev
```

The API server starts at `http://localhost:3000`.

---

## 6. Verify Everything Works

| Check | URL |
|---|---|
| Health check | `http://localhost:3000/api/health` |
| Swagger docs | `http://localhost:3000/api/docs` |
| API v1 base | `http://localhost:3000/api/v1/...` |

---

## Running Tests

```bash
# Unit tests (from apps/api)
npm test

# Integration tests (HTTP tests with mocked providers)
npm run test:integration

# E2E tests (full-stack with real database)
npm run test:e2e

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# Type checking
npm run typecheck

# Linting
npm run lint
```

---

## Monorepo Structure

```
EduTech/
  apps/
    api/          — NestJS backend API
    web-admin/    — Admin dashboard (Next.js)
    web-instructor/ — Instructor dashboard (Next.js)
    web-landing/  — Public landing page (Next.js)
    web-student/  — Student platform (Next.js)
  packages/       — Shared packages
  docs/           — Project documentation
```

---

## Useful Commands

```bash
# Turborepo: run dev for all apps
npm run dev

# Turborepo: build all apps
npm run build

# Turborepo: lint all apps
npm run lint

# Database studio (GUI)
cd apps/api && npm run db:studio
```
