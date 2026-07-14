# Reconnection Plan — Continuation & Remaining Work

## Status of Original Plan (1782227148770)

All 4 items from the original plan are **implemented on disk**:

| #   | File                       | Status               | Evidence                                                                                                                                                                                                               |
| --- | -------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `redis.service.ts`         | ✅ Done              | `retryStrategy` returns `(times) => Math.min(2 ** times * 500, 30000)`. `end` event calls `startReconnection()`. Method has `while (!this.shuttingDown)` loop with `isReconnecting` guard.                             |
| 2   | `redis-adapter.service.ts` | ✅ Done              | Sub-client uses same `retryStrategy`. `connectSubClientWithRetry()` has `while (!this.shuttingDown)` loop. `end` event calls `reconnectSubClient()`.                                                                   |
| 3   | `connection.ts`            | ✅ Done              | `healthCheck()` fires `this.reconnect()` on failure (both paths: `!isConnected()` and query failure). `isReconnecting` guard prevents concurrent loops. `connectWithRetry()` is `while(true)` with `retryBackoffMs()`. |
| 4   | `health.controller.ts`     | ✅ No changes needed | Reconnection is triggered from service layer.                                                                                                                                                                          |

**No remaining work from the original plan.**

---

## Gap Found: Proxy Does Not Trigger Reconnect

The `createLazyDB` proxy in `connection.ts:15-71` throws `dbDisconnectedError` when `getConnection()` returns null, but does **not** fire a reconnect. This means:

1. DB goes down → `cleanupConnection()` sets `this.db = null`
2. Request hits any repository → proxy throws immediately
3. **Nobody triggers `reconnect()`** until the next `/health` call
4. If no health-check caller exists, the API stays broken forever

### Fix

In `createLazyDB`, when `db` is null, fire-and-forget `service.reconnect()` before returning the throwing function. `reconnect()` is already guarded by `isReconnecting`, so concurrent calls are safe.

**File:** `apps/api/src/db/connection.ts`, lines 33-37

```typescript
// BEFORE
if (!db) {
  return (...args: unknown[]) => {
    throw dbDisconnectedError(prop);
  };
}

// AFTER
if (!db) {
  service.reconnect().catch(() => {});
  return (...args: unknown[]) => {
    throw dbDisconnectedError(prop);
  };
}
```

This is a one-line addition. No other changes needed.

---

## Task List

1. **Add fire-and-forget reconnect in `createLazyDB`** — `connection.ts:34` — add `service.reconnect().catch(() => {});` before the throwing return
2. **Run typecheck** — `npx tsc --noEmit` in `apps/api`
3. **Run existing test suite** — `npx jest` to confirm no regressions
4. **Manual validation** (optional, requires running DB + Redis):
   - Start API with DB down → API boots, health returns 503
   - Start DB → next request triggers reconnect → health returns 200
   - Kill DB mid-request → proxy throws, reconnect fires → restart DB → recovery

---

## Out of Scope (from the previous session's failed attempt)

The conversation history attempted a complex `getRetryingDb()` proxy with chain-replay (recorded method calls, replayed on retry). That approach had a fundamental bug: Drizzle query builders are thenable (have `.then`), so `runAndAwait` executed the query mid-chain, turning the builder into a raw result array. Subsequent chain steps tried `resultArray.where()` → `undefined.apply()` → crash.

That code is **not on disk** (reverted/lost). The current `createLazyDB` approach is simpler and correct. Per-query retry on transient errors is a separate concern that should be handled at the repository/service layer, not in the DRIZZLE_DB proxy.
