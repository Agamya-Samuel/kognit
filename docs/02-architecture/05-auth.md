# Auth Architecture

> **Purpose:** Authentication strategy, token management, auth flows, and RBAC
> **Source:** PROJECT_DOCUMENTATION.md §11

---

## Strategy

The backend **owns all auth logic**. Auth.js acts as an OAuth/provider orchestration layer only — not the core business auth system. This is critical for future mobile app compatibility.

Each web app (`web-student`, `web-instructor`, `web-admin`, `web-institution`) communicates independently with the shared NestJS auth module. Cookie domains are scoped per app subdomain to prevent cross-app session leakage.

**Single role per user.** Each user has exactly one role. Users requiring access to multiple portals must create separate accounts. Instructors automatically inherit all student permissions within their portal.

## Token Architecture

| Token | Storage (Web) | Storage (Mobile) | Expiry |
|---|---|---|---|
| Access Token (JWT) | HTTP-only cookie (scoped to app subdomain) | SecureStore | 15 minutes |
| Refresh Token | HTTP-only cookie (scoped to app subdomain) | SecureStore | 30 days |

> **Note:** A single refresh token is issued per user. Cookies are scoped per app subdomain, but logout revokes the token globally — all app sessions are terminated. There is no per-app session isolation.

## Auth Flows

### Web (all apps)
```
Next.js app → POST api.eduplatform.com/api/v1/auth/login → NestJS Auth Module
  → Validate credentials
  → Check account lockout status
  → Issue JWT + Refresh Token
  → Set HTTP-only cookies (scoped to app subdomain)
  → Return user profile
```

### Email-First Registration
```
User enters email → POST /api/v1/auth/send-verification-code
  → Generate 6-digit code (bcrypt hashed, stored in email_verifications)
  → Send code via email (AWS SES)
  → User enters code → POST /api/v1/auth/verify-email
  → Verify code (bcrypt.compare)
  → Mark email as verified (stored in Redis: `verified_email:{email}` with 1-hour TTL)
  → User sets password + name → POST /api/v1/auth/register
  → Validate email was recently verified
  → Create account
  → Issue JWT + Refresh Token
```

### Mobile (Phase 2)
```
React Native → POST /api/v1/auth/login → NestJS Auth Module
  → Validate credentials
  → Issue JWT + Refresh Token
  → Return tokens (stored in SecureStore)
```

### OAuth (Google, GitHub)
```
Frontend → Auth.js OAuth flow
  → Auth.js callback → NestJS /auth/oauth-callback
  → NestJS creates/finds user
  → Issues JWT + Refresh Token
  → Redirects to appropriate app subdomain based on user role
```

> **Email verification bypass:** OAuth providers (Google, GitHub) already verify the user's email. Users registering via OAuth skip the email verification step — their account is created immediately with `is_verified = true`.

### OAuth Account Linking

If a user registers with email/password and then uses Google/GitHub OAuth with the same verified email:

1. OAuth callback detects existing account with matching email
2. OAuth provider is **only linked** if the existing account's email is **already verified**
3. If the existing account's email is **unverified**, do NOT link — create a new account. The unverified account will eventually be cleaned up by a background job.
4. A user can have multiple auth providers (email+password, google, github) linked to their account
5. OAuth callbacks must use `SELECT ... FOR UPDATE` on the matching `users` row to prevent linking race conditions

**`user_auth_providers` table:**
```
id, user_id (FK), provider (email|google|github),
provider_id (external sub ID), created_at
UNIQUE (provider, provider_id) — prevents duplicate provider links
```

**Linking rules:**
- Email/password → OAuth with same verified email: auto-link
- OAuth → different OAuth with same email: auto-link (if existing account email is verified)
- OAuth with unverified email: do not link, create separate account
- Unverified account + OAuth with same email: do NOT link, create new account
- Login always checks `user_auth_providers` for matching `provider_id` first, then falls back to email matching

## Account Lockout Policy

- **Threshold:** 5 consecutive failed login attempts
- **Lockout duration:** 15 minutes (auto-expires via Redis TTL)
- **Storage:** Redis key `lockout:{email}` — stores attempt count with 15-min TTL
- **Attempt tracking:** Redis key `login_attempts:{email}` — increments on each failed attempt, resets on successful login
- **Reset:** Successful login clears the counter
- **Admin bypass:** Admins can unlock accounts via admin dashboard
- **Notification:** User receives email on account lockout (security alert)

## Password Policy

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 digit
- Enforced via shared Zod schema in `/packages/validation`
- Password hashing: bcrypt with 12 salt rounds
- No maximum length limit (prevent DoS via bcrypt on extremely long passwords → cap at 128 characters)

## Refresh Token Theft Detection

- On each refresh token use, the old token is revoked and a new one is issued (rotation)
- Revoked tokens are stored in Redis set `revoked_refresh_tokens:{user_id}` with TTL matching original token expiry
- If a previously-revoked refresh token is used, this indicates theft:
  1. Revoke the entire token family (all refresh tokens for this user)
  2. Force re-authentication on all devices
  3. Log security event to audit_logs
  4. Send email alert to user: "Your account was accessed from a new device. Please change your password if this wasn't you."

## User Deactivation — Token Invalidation

- When a user is deactivated (`is_active = false`), their refresh token is immediately revoked in Redis
- JWT verification middleware checks a Redis set `deactivated_users` — if `user_id` is present, reject even valid JWTs
- This ensures deactivated users lose access within seconds, not 15 minutes
- When a user is reactivated, their `user_id` is removed from the `deactivated_users` Redis set

## Concurrent Session Policy

- **Max 2 concurrent active playback sessions** per student across all devices
- Enforced via Redis Lua script for atomic check + insert:
  ```lua
  -- KEYS[1] = active_playback:{student_id}
  -- ARGV[1] = session_id, ARGV[2] = max_sessions (2), ARGV[3] = ttl
  local count = redis.call('SCARD', KEYS[1])
  if count >= tonumber(ARGV[2]) then
    local oldest = redis.call('SRANDMEMBER', KEYS[1])
    redis.call('SREM', KEYS[1], oldest)
    redis.call('SADD', KEYS[1], ARGV[1])
    redis.call('EXPIRE', KEYS[1], ARGV[3])
    return oldest
  else
    redis.call('SADD', KEYS[1], ARGV[1])
    redis.call('EXPIRE', KEYS[1], ARGV[3])
    return nil
  end
  ```
- When a 3rd device starts playback, the oldest session receives a `session:evicted` Socket.IO event and playback is paused
- **Progress reconciliation:** Server uses max merge — always keeps the highest `watched_seconds` value. Implemented as `UPDATE progress SET watched_seconds = GREATEST(watched_seconds, $1) WHERE student_id = $2 AND lecture_id = $3`. Progress never goes backward.
- **Non-playback sessions** (browsing, chat) are unlimited — the 2-device limit applies only to video playback

## RBAC Roles

| Role | Permissions |
|---|---|
| `student` | Browse, enroll, watch, submit assignments, community |
| `instructor` | All student permissions + create courses, manage students, analytics |
| `admin` | Full platform access, user management, moderation |
| `institution_admin` | Institution dashboard, manage seats, cohort reports |

> **Single role per user.** Each user account has exactly one role. Users who need access to multiple portals (e.g., someone who is both a student and an instructor) must create separate accounts with different email addresses. There is no cross-app auth flow or role switching.
