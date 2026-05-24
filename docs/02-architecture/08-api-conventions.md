# API Conventions

> **Purpose:** REST principles, endpoint structure, response envelope, pagination, and rate limiting
> **Source:** PROJECT_DOCUMENTATION.md §7, cosmic-comet §2.5

---

## Design Principles

- REST-first (no GraphQL in Month 1)
- Versioned routes: `/api/v1/...`
- JWT bearer tokens for all authenticated endpoints (Authorization header)
- Role-based access control (RBAC) enforced at route level: `student`, `instructor`, `admin`, `institution_admin`
- Zod validation on all request bodies
- Standardized error handling with `ApiClientError` across all frontend applications

---

## Endpoint Structure

```
GET    /api/v1/courses              → List courses (paginated)
POST   /api/v1/courses              → Create course
GET    /api/v1/courses/:id          → Get course by ID
PATCH  /api/v1/courses/:id          → Update course
DELETE /api/v1/courses/:id          → Delete course
GET    /api/v1/courses/:id/sections → List course sections
POST   /api/v1/courses/:id/sections → Add section to course
```

---

## Standardized Response Envelope

```json
{
  "success": true,
  "data": { },
  "meta": { "page": 1, "total": 100 },
  "error": null
}
```

## Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is already registered",
    "details": [{ "field": "email", "message": "Email already exists" }]
  }
}
```

---

## Pagination Standard

- Cursor-based for infinite scroll (recommended)
- Offset-based for traditional pagination

**Response format:**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Rate Limiting Tiers

| Endpoint Type | Rate Limit |
|---|---|
| Public endpoints | 100 requests / 15 minutes per IP |
| Authenticated endpoints | 1000 requests / 15 minutes per user |
| Upload endpoints | 10 uploads / hour per user |
| WebSocket | 50 messages / minute per user (across all connections) |

Rate limiting is Redis-backed via Upstash. Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`) are included in all responses. When a client exceeds the limit, the response returns HTTP `429 Too Many Requests` with a `Retry-After` header indicating seconds until the window resets.

---

## CORS Policy

- **Allowed origins (strict allow-list):**
  - `https://student.eduplatform.com`
  - `https://instructor.eduplatform.com`
  - `https://admin.eduplatform.com`
  - `http://localhost:3000` (development only)
  - `http://localhost:3001` (development only)
  - `http://localhost:3002` (development only)
- **Methods:** `GET, POST, PATCH, DELETE, OPTIONS`
- **Allowed headers:** `Content-Type, Authorization`
- **Max age:** `86400` (preflight cache — 24 hours)
- **No wildcard origins** — `Access-Control-Allow-Origin` is never set to `*`
- **Origin validation:** The API server validates the `Origin` header against the allow-list on every request. Unknown origins receive a `403 Forbidden`
- **Authentication:** All authenticated endpoints require `Authorization: Bearer <token>` header

---

## WebSocket Constraints

| Constraint | Limit |
|---|---|
| Max payload per message | 10KB |
| Max message length (chat) | 2000 characters |
| Messages exceeding limits | Rejected with `PAYLOAD_TOO_LARGE` error event |
| Rate limit scope | Per-user (across all WebSocket connections) |

---

## Bulk Operation Limits

| Operation | Max Batch Size |
|---|---|
| Bulk message students | 100 recipients per request |
| Bulk grading | 50 submissions per request |
| Bulk assignment creation | 25 assignments per request |

- Bulk operations are queued via BullMQ and processed asynchronously
- Client receives a `jobId` for progress tracking
- Partial failures return per-item error details in the response

---

## API Versioning & Deprecation Policy

- **Current version:** `v1` (`/api/v1/...`)
- **Non-breaking changes** (new fields, new endpoints, new query parameters) are added to the current version without notice
- **Breaking changes** (removed fields, changed types, removed endpoints) require a new major version
- **v2 introduction:** New routes under `/api/v2/...`; `v1` maintained for 6 months after `v2` launch
- **Deprecation headers:** Deprecated endpoints return `Deprecation: true` and `Sunset: <date>` HTTP headers
- **Sunset notice:** At least 90 days before an endpoint is removed
- **Changelog:** All API changes documented in `CHANGELOG.md` with version, date, and migration notes
