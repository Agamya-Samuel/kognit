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
   /api-client           → Centralized HTTP client with service modules, React Query integration, Bearer token authentication
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
- All HTTP communication flows through the centralized `/packages/api-client` service modules
- Service modules provide domain-specific API methods (courses, assignments, payments, chat, etc.)
- All web apps use `@edutech/api-client` service modules with React Query for data fetching
- No raw `fetch()` calls allowed in components — enforced by code standards
- Authentication handled via `ApiProvider` component with localStorage Bearer token storage
- All React Query hooks live in app-specific `src/hooks/` directories
- Shared UI components live in `/packages/shared-components` — auth forms, nav bars, footer, error pages
- Each web app has its own `tsconfig.json`, `next.config.ts`, `Dockerfile`, and `.env` file
- Mobile app will use same service modules for API consistency (Phase 2)
- Each app has independent dependencies (can have different package versions if needed)
- CI/CD builds and deploys each app independently
- Each app has its own Sentry project and PostHog instance

## App Isolation Rules

- No direct imports between apps (`apps/web-student` cannot import from `apps/web-admin`)
- Shared code must go through `/packages`
- Each app has independent dependencies (can have different package versions if needed)
- CI/CD builds and deploys each app independently
- Each app has its own Sentry project and PostHog instance
