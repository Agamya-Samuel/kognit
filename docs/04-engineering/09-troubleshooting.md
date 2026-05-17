# Troubleshooting Guide

> **Purpose:** Common issues, diagnostic steps, and resolution procedures
> **Audience:** All developers

---

## Database Issues

### Connection refused

**Symptom:** `ECONNREFUSED` or `connect ECONNREFUSED 127.0.0.1:5432`

**Diagnosis:**
```bash
docker compose ps
```

**Resolution:**
- Ensure PostgreSQL container is running: `docker compose up -d postgres`
- Check container health: `docker compose logs postgres`
- Verify credentials match between `.env` and `docker-compose.yml`
  - Default user: `edutech`, password: `edutech_password`, db: `edutech`

### Migration failures

**Symptom:** `drizzle-kit migrate` fails with SQL errors

**Resolution:**
1. Check the migration SQL in `apps/api/src/db/migrations/`
2. If a previous migration partially applied, check the `__drizzle_migrations` table
3. For local dev, you can reset: `docker compose down -v && docker compose up -d` (destroys data)
4. Re-run: `npm run db:generate && npm run db:migrate`

---

## Redis Issues

### Connection refused

**Symptom:** `ECONNREFUSED 127.0.0.1:6379`

**Resolution:**
```bash
docker compose up -d redis
docker compose logs redis
```

### Queue jobs stuck

**Symptom:** BullMQ jobs not processing

**Resolution:**
1. Check Redis is healthy: `docker exec edutech-redis redis-cli ping` → should return `PONG`
2. Restart the API server — BullMQ reconnects automatically
3. Check for stuck jobs in BullMQ dashboard (if configured)

---

## Build Issues

### TypeScript compilation errors

**Symptom:** `npm run build` fails

**Resolution:**
1. Run `npm run typecheck` to see detailed errors
2. Common causes:
   - Unused imports — remove them
   - Type mismatches after dependency updates
   - Missing type definitions — `npm install -D @types/<package>`

### Monorepo dependency issues

**Symptom:** Module not found or version mismatch

**Resolution:**
```bash
# Clean and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
rm package-lock.json
npm install
```

---

## API Issues

### 401 Unauthorized on authenticated endpoints

**Symptom:** All authenticated endpoints return 401

**Diagnosis:**
1. Is a valid JWT token being sent in `Authorization: Bearer <token>`?
2. Has the token expired? (default: 15 minutes)
3. Is `JWT_SECRET` the same as when the token was issued?

**Resolution:**
- Obtain a fresh token via `POST /api/v1/auth/login`
- If `JWT_SECRET` was changed, all existing tokens are invalidated

### 429 Too Many Requests

**Symptom:** Rate limit exceeded

**Resolution:**
- Wait for the rate limit window to reset (15 minutes default)
- Check `X-RateLimit-Reset` header for exact reset time
- For testing, adjust `RATE_LIMIT_TTL` and `RATE_LIMIT_LIMIT` in `.env`

### Swagger docs not accessible

**Symptom:** `GET /api/docs` returns 404

**Resolution:**
- Swagger is disabled when `NODE_ENV=production`
- Set `NODE_ENV=development` to enable Swagger UI

---

## Docker Issues

### Port already in use

**Symptom:** `bind: address already in use` for port 3000, 5432, or 6379

**Resolution:**
```bash
# Find process using the port (Windows)
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# Or change the port in docker-compose.yml / .env
```

### Container keeps restarting

**Resolution:**
```bash
docker compose logs <service-name>
```
Check for OOM kills, misconfigured volumes, or credential errors.

---

## General Debugging

### Enable debug logging

In `.env`:
```env
LOG_LEVEL=debug
```

Restart the API server. All requests and internal operations will be logged.

### Check application health

```bash
curl http://localhost:3000/api/health
```

Returns the status of database, Redis, and other connected services.
