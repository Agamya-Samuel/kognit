# Plan: Make EduTech Repository Public-Safe

## Context

The EduTech monorepo is about to be made public on GitHub. While no `.env` files with real secrets were ever committed to git history, several files contain hardcoded development defaults, infrastructure-revealing names, and the repo lacks the security scanning workflows that the reference project (English-Learners-VC) has. This plan covers all changes needed before going public.

## Summary of Changes

| #   | Task                                | Files                                                                                                                                                              | Risk |
| --- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| 1   | Harden `.gitignore`                 | `.gitignore`                                                                                                                                                       | Low  |
| 2   | Sanitize hardcoded DB credentials   | `docker-compose.yml`, `apps/api/src/config/configuration.ts`, `apps/api/drizzle.config.ts`, `apps/api/.env.example`                                                | Low  |
| 3   | Remove S3 bucket name from code     | `apps/api/src/modules/uploads/dto/upload.dto.ts`, `apps/api/.env.example`                                                                                          | Low  |
| 4   | Replace placeholder domains in docs | `docs/02-architecture/08-api-conventions.md`, `docs/02-architecture/09-api-client.md`, `apps/web-landing/src/app/robots.ts`, `apps/web-landing/src/app/sitemap.ts` | Low  |
| 5   | Add `SECURITY.md`                   | `SECURITY.md` (new)                                                                                                                                                | None |
| 6   | Add security scanning workflow      | `.github/workflows/security.yml` (new)                                                                                                                             | None |

---

## Task 1: Harden `.gitignore`

**File:** `.gitignore`

Add explicit recursive patterns for `.env` files to make the intent unambiguous for contributors:

```
# Local env files (all directories)
**/.env
**/.env.local
**/.env.*.local
```

Replace the existing `.env` / `.env*.local` / `.env.development.local` / `.env.test.local` / `.env.production.local` block with the above. Keep `.env.example` files tracked (they are intentional).

---

## Task 2: Sanitize Hardcoded DB Credentials

### 2a. `docker-compose.yml`

Replace hardcoded credentials with environment variable references:

```yaml
environment:
  POSTGRES_USER: ${POSTGRES_USER:-edutech}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD in .env}
  POSTGRES_DB: ${POSTGRES_DB:-edutech}
```

This requires a `.env` file (or shell export) to run docker-compose, which is standard practice. The `:?` syntax forces an explicit error if the password is not set.

### 2b. `apps/api/src/config/configuration.ts`

Remove the `.default('edutech_password')` from the `DATABASE_PASSWORD` Zod field (line 17). Change to:

```typescript
DATABASE_PASSWORD: z.string().min(1, 'DATABASE_PASSWORD is required'),
```

Same for `DATABASE_USER` (line 16) — remove `.default('edutech')`:

```typescript
DATABASE_USER: z.string().min(1, 'DATABASE_USER is required'),
```

### 2c. `apps/api/drizzle.config.ts`

Remove the fallback credentials (lines 11-12). Change from:

```typescript
user: process.env.DATABASE_USER || 'postgres',
password: process.env.DATABASE_PASSWORD || 'postgres',
```

To:

```typescript
user: process.env.DATABASE_USER!,
password: process.env.DATABASE_PASSWORD!,
```

The `!` non-null assertion is safe here because the Zod schema in `configuration.ts` validates these at runtime, and `drizzle.config.ts` is only used via CLI which reads `.env`.

### 2d. `apps/api/.env.example`

Change the example password from `edutech_password` to a placeholder:

```
DATABASE_URL=postgresql://edutech:CHANGE_ME@localhost:5432/edutech
DATABASE_USER=edutech
DATABASE_PASSWORD=CHANGE_ME
```

---

## Task 3: Remove S3 Bucket Name from Code

### 3a. `apps/api/src/modules/uploads/dto/upload.dto.ts`

Replace `edutech-uploads.s3.amazonaws.com` in Swagger examples (lines 60, 98) with a generic placeholder:

```typescript
@ApiPropertyOptional({ example: 'https://your-bucket.s3.amazonaws.com/...', description: 'S3 signed upload URL' })
```

```typescript
@ApiProperty({ example: 'https://your-bucket.s3.amazonaws.com/...', description: 'Presigned S3 upload URL' })
```

### 3b. `apps/api/.env.example`

Change the S3 bucket default:

```
AWS_S3_BUCKET=your-s3-bucket-name
```

---

## Task 4: Replace Placeholder Domains in Docs

Replace `eduplatform.com` references with `example.com` (RFC 2606 reserved domain) in:

- `docs/02-architecture/08-api-conventions.md` (lines 96-98: `student.eduplatform.com` → `student.example.com`, etc.)
- `docs/02-architecture/09-api-client.md` (line 29: `api.eduplatform.com` → `api.example.com`)
- `docs/05-implementation/01-30-day-plan.md` (multiple references to `*.eduplatform.com`)
- `apps/web-landing/src/app/robots.ts` (line 4 comment)
- `apps/web-landing/src/app/sitemap.ts` (line 4 comment)

Use `example.com` subdomains consistently: `student.example.com`, `instructor.example.com`, `admin.example.com`, `api.example.com`.

---

## Task 5: Add `SECURITY.md`

Create a `SECURITY.md` at the repo root with a responsible disclosure policy. Template:

```markdown
# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email **[INSERT EMAIL]** with:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You should receive a response within **48 hours**. We will work with you to understand and address the issue before any public disclosure.

## Supported Versions

| Version        | Supported |
| -------------- | --------- |
| Latest main    | ✅        |
| Older versions | ❌        |

## Scope

This policy covers the EduTech platform codebase. Third-party dependencies are out of scope — please report their vulnerabilities to the respective maintainers.

## Disclosure Policy

- We will acknowledge receipt within 48 hours
- We will provide a fix timeline within 7 days
- We will credit reporters (unless they prefer anonymity)
- We request a 90-day disclosure window
```

**Note:** The user needs to fill in their actual email address before merging.

---

## Task 6: Add Security Scanning Workflow

Create `.github/workflows/security.yml` based on the English-Learners-VC reference. Adapt for the EduTech monorepo:

```yaml
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 0 * * 0" # Weekly on Sundays

jobs:
  dependency-scan:
    name: Dependency Vulnerability Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"
      - run: npm ci
      - run: npm audit --audit-level=moderate
        continue-on-error: true

  codeql:
    name: CodeQL Analysis
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript
      - uses: github/codeql-action/autobuild@v3
      - uses: github/codeql-action/analyze@v3

  secret-scan:
    name: Secret Detection
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: zricethezav/gitleaks-action@master
        continue-on-error: true
```

Key differences from the reference:

- Node version matches the CI workflow (`18` vs `20`)
- Removed Snyk (requires `SNYK_TOKEN` secret — can be added later)
- Removed `.gitleaks.toml` config reference (can be added later)
- Simplified for initial adoption

---

## Verification

After all changes:

1. `git status` — confirm only intended files changed
2. `npx turbo run typecheck` — no regressions
3. `npx turbo run lint` — no regressions
4. `docker-compose config` — verify docker-compose.yml still parses
5. Manual review: search entire tracked tree for `edutech_password`, `edutech-uploads`, `eduplatform.com`, `kognitapp` — should return zero hits in tracked files

---

## Out of Scope

- Purging git history (not needed — secrets were never committed)
- Rotating the actual secrets in `.env` (they remain untracked)
- Adding `.gitleaks.toml` custom config (can be done later)
- Adding Snyk integration (requires API key setup)
- Adding load testing workflow (not requested)
- Modifying `tasks/todo.md` or `CLAUDE.md` (user chose to keep)
