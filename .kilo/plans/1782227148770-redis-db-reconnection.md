# Redis & Database Auto-Reconnection After Outage

## Problem

When DB or Redis goes offline after API startup and then recovers, the API remains non-functional (503) because:

1. **Redis**: `retryStrategy: () => null` disables ioredis auto-reconnect. After `onModuleInit()` succeeds, no reconnection logic runs.
2. **Redis sub-client** (socket adapter): Same `retryStrategy: () => null`, plus only one `connect()` attempt — no loop at all.
3. **Database**: `healthCheck()` detects failure but never calls `reconnect()`.

## Fix

### 1. Redis Service — `apps/api/src/redis/redis.service.ts`

- Change `retryStrategy: () => null` to exponential backoff: `(times) => Math.min(2 ** times * 500, 30000)`
- This re-enables ioredis built-in auto-retry — on connection loss, ioredis will reconnect automatically
- On `end` event (safety net — fires if retry somehow exhausts), trigger `startReconnection()`
- Add private `startReconnection()` method: `client.disconnect()`, then manual `while(true)` loop with quadratic backoff (same as `onModuleInit`)
- Track retry attempt counter in a closure variable passed to `retryStrategy`

### 2. Redis Adapter Sub-client — `apps/api/src/modules/socket/services/redis-adapter.service.ts`

- Change `retryStrategy: () => null` to the same backoff function: `(times) => Math.min(2 ** times * 500, 30000)`
- Wrap initial `subClient.connect()` in a `while(true)` retry loop (mirroring the pattern in `RedisService.onModuleInit`)
- On `end` event, trigger `reconnectSubClient()` which enters another `while(true)` loop

### 3. Database Service — `apps/api/src/db/connection.ts`

- In `healthCheck()`: after detecting failure, fire-and-forget `this.reconnect()` (only if not already reconnecting)
- Add `private isReconnecting = false` guard flag to prevent multiple concurrent reconnect loops
- The existing `reconnect()` already creates a fresh pool via `connectWithRetry()` → `initializeConnection()`

### 4. Health Controller — `apps/api/src/health/health.controller.ts`

- No changes needed — the existing health check already detects failures correctly
- Reconnection is triggered from the service layer (`RedisService`, `DatabaseService`), not from the controller

## File Changes Summary

| File                                                            | Change                                                                                                            |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `apps/api/src/redis/redis.service.ts`                           | Enable ioredis retry with backoff; add `startReconnection()` safety-net method called from `end` event            |
| `apps/api/src/modules/socket/services/redis-adapter.service.ts` | Enable ioredis retry with backoff; add retry loop for initial connect; add `reconnectSubClient()` for `end` event |
| `apps/api/src/db/connection.ts`                                 | Call `this.reconnect()` from `healthCheck()` on failure; add `isReconnecting` guard                               |

## Validation

1. Start API with DB + Redis running → health check returns 200
2. Stop Redis → health check returns 503 with `redis: 'down'`
3. Start Redis → within seconds, health check returns 200 (ioredis auto-reconnect handles it)
4. Stop DB → health check returns 503 with `database: 'down'`
5. Start DB → within seconds, health check returns 200 (health check triggers reconnect)
6. Stop both → stop both again → restart both → verify API fully recovers within ~30 seconds
7. Run the existing test suite to confirm no regressions
