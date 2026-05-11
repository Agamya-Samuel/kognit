# Monorepo Structure

> **Purpose:** Directory structure, package rules, and app isolation rules
> **Source:** PROJECT_DOCUMENTATION.md §10

---

## Directory Structure

```
/apps
  /web-student          → Next.js — Student learning experience
  /web-instructor       → Next.js — Instructor dashboard and tools
  /web-admin            → Next.js — Platform administration
  /web-institution      → Next.js — Institutional dashboard (Phase 2)
  /api                  → NestJS backend (modular monolith)
  /mobile               → React Native Expo (Phase 2)

/packages
  /ui                   → Shared ShadCN/TailwindCSS component library
  /types                → Shared TypeScript types and interfaces
  /auth                 → Auth utilities, token helpers, cookie config
  /validation           → Shared Zod schemas (used by all web apps and api)
  /api-client           → Auto-generated typed API client from OpenAPI
  /config               → Shared ESLint, TSConfig, env schemas
  /shared-components    → Cross-app UI components (layouts, nav, auth forms)

/infra
  /docker               → Dockerfiles per app
  /dokploy              → Deployment configs (one per app)
  /scripts              → DB migration scripts, seed scripts

turbo.json
package.json
.env.example
README.md
```

---

## Key Monorepo Rules

- All API request/response types live in `/packages/types` — never duplicated
- All Zod validation schemas live in `/packages/validation` — shared between frontend forms and backend guards
- API client is auto-generated from OpenAPI spec in `/packages/api-client` — all web apps use the same generated client
- Shared UI components live in `/packages/shared-components` — auth forms, nav bars, footer, error pages
- Each web app has its own `tsconfig.json`, `next.config.ts`, `Dockerfile`, and `.env` file
- Mobile app imports from same `/packages/api-client` as web — ensures API contract consistency

## App Isolation Rules

- No direct imports between apps (`apps/web-student` cannot import from `apps/web-admin`)
- Shared code must go through `/packages`
- Each app has independent dependencies (can have different package versions if needed)
- CI/CD builds and deploys each app independently
- Each app has its own Sentry project and PostHog instance
