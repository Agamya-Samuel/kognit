# Security

> **Purpose:** Vulnerability tracking, security best practices, and audit checklist
> **Source:** clever-circuit (Security Vulnerabilities Table), cosmic-comet §2.6, 30_DAY_IMPLEMENTATION_PLAN.md Day 25

---

## Security Vulnerabilities Identified & Mitigations

### Critical Security Tests Required

| Vulnerability | Risk | Mitigation in Implementation Plan |
|---|---|---|
| **Race condition on enrollment** | Duplicate enrollments, double charges | Day 8: Unique `(student_id, course_id)` DB constraint + `SELECT FOR UPDATE` on payment record + transaction isolation tests (Day 24) |
| **Race condition on certificate generation** | Multiple certificates per course | Day 21: Unique constraint + `SELECT FOR UPDATE` on enrollment record + race condition tests |
| **Stolen refresh tokens (30-day expiry)** | Account takeover | Day 6: Token rotation + token family revocation on reuse + Redis-backed revocation list |
| **Webhook spoofing (Mux/Razorpay)** | Fake payments/recordings | Day 11/14: Signature verification tests, timestamp validation |
| **CSRF on auth endpoints** | Session hijacking | Day 1/6: Double-submit cookie pattern — CSRF token in cookie + verified in `X-CSRF-Token` header |
| **Progress tracking boundary (100%)** | Inconsistent completion | Day 13: Completion computed dynamically (`watched_seconds >= duration_seconds`), no boolean flag. Server enforces max 30s jump per progress update to prevent seek-to-end abuse. |
| **SQL injection via search** | Data breach | Day 8: Parameterized queries + SQL injection tests |
| **File upload type spoofing** | Malicious file upload | Day 10: Post-upload magic byte validation (download first 8KB from S3, validate signature) + MIME type check on pre-signed URL |
| **No rate limiting** | DoS attacks | Day 25: Rate limit tests on all public endpoints |
| **No account lockout** | Brute-force attacks | Day 6: 5 failed attempts → 15-min Redis lockout + email alert |
| **No password complexity** | Weak passwords | Day 6: Zod schema enforces min 8 chars, 1 upper, 1 lower, 1 digit |
| **CORS not configured** | Cross-origin credential theft | Day 1: Strict allow-list for platform subdomains only (no wildcards) |
| **Refresh token reuse undetected** | Token theft not detected | Day 6: Revoke entire token family on reuse of revoked token + email alert |
| **Token hash not salted (reset/verify)** | Rainbow table if DB leaks | Day 6: bcrypt (10 rounds) for password reset and email verification token hashes. Passwords use bcrypt (12 rounds). |
| **OAuth auto-linking without verification** | Account takeover | Day 6: Only link OAuth to verified accounts; email-first registration flow |

---

## Security Best Practices

### Input Validation Layers

1. **Zod schemas** — all request bodies, query params, path params
2. **Database constraints** — unique, not null, foreign keys
3. **Business logic validation** — complex rules (e.g., price > 0)

### File Upload Security

- Validate MIME type on pre-signed URL (Content-Type header check)
- **Post-upload magic byte validation:** Webhook handler downloads first 8KB from S3 and validates file signature (MP4: `ftyp`, WebM: `1A 45 DF A3`, MOV: `qt`) before triggering Mux ingestion
- Maximum file size enforcement (client-side + S3 upload limit)
- Scan for malware (ClamAV integration recommended for Phase 2)
- Store uploads in private S3 bucket (no public access)
- Reject and delete files that fail magic byte validation; notify instructor

### Secret Management

- Never commit `.env` files
- Use `.env.example` with placeholder values
- Rotate API keys every 90 days
- Use AWS Secrets Manager or Doppler for production
- Audit secret access logs

### Security Headers

- HSTS (`Strict-Transport-Security: max-age=31536000; includeSubDomains`)
- Content-Security-Policy (CSP) — whitelist Mux Player, LiveKit, Razorpay checkout origins
- X-Frame-Options (`DENY`)
- X-Content-Type-Options (`nosniff`)

### CORS Configuration

- Strict origin allow-list (see [API Conventions → CORS Policy](../02-architecture/08-api-conventions.md))
- `Access-Control-Allow-Credentials: true` for cookie-based auth
- No wildcard (`*`) origins — ever

### CSRF Protection

- **Double-submit cookie pattern:** CSRF token is generated server-side, set as an HTTP-only cookie (`csrf_token`), and must be included in the `X-CSRF-Token` header on all state-changing requests
- Token is per-session, rotated on login
- Validated server-side before processing any POST/PATCH/DELETE request
- Exempt endpoints: webhooks (verified via signature), OAuth callbacks

### Playback Security

- All Mux playback URLs are **signed** (time-limited, per-user tokens)
- Unsigned URLs are rejected by Mux
- Prevents hotlinking and unauthorized sharing

---

## Security Audit Checklist (Day 25)

- [ ] Rate limiting validation — test all endpoints (per-IP, per-user)
- [ ] Signed URL enforcement — verify all Mux playback URLs are signed
- [ ] RBAC validation — audit all endpoints for role enforcement, test bypass attempts
- [ ] Input sanitization — XSS prevention, SQL injection prevention, file upload validation
- [ ] CSRF protection — CSRF tokens for state-changing operations
- [ ] Security headers — HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- [ ] Secret management — verify no secrets in code, env var validation, rotation procedures
- [ ] Penetration testing — basic pen test on auth, payments, file upload, API endpoints
