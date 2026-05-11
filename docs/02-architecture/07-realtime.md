# Realtime Architecture

> **Purpose:** Socket.IO, Redis pub/sub, LiveKit, and event architecture
> **Source:** PROJECT_DOCUMENTATION.md §13

---

## Socket.IO (App WebSockets)

Used for:
- Chat messages (course channels, general channels)
- In-app notifications delivery
- Presence indicators (who is online)
- Typing indicators
- Live class countdown / status updates

**Important:** Socket.IO infra is kept **entirely separate** from LiveKit. They serve different purposes and must never be entangled.

## Redis Pub/Sub (Socket.IO Scaling)

```
Socket.IO server (NestJS) → Redis Adapter
  → All connected Socket.IO nodes share state via Redis
  → Enables horizontal scaling later without re-architecture
```

## LiveKit (Live Video)

Used exclusively for:
- Live class video/audio streaming
- Teacher/student video rooms
- Screen sharing

LiveKit is **not** used for app chat or notifications.

## Realtime Event Architecture

```
NestJS emits internal event (e.g., "enrollment.confirmed")
  → NotificationService picks up
  → Creates notification record in DB
  → Emits via Socket.IO to connected client
  → If client offline → notification surfaced on next login
```

## Socket.IO Event Specification

### Event Naming Convention

All events are namespaced by domain: `domain:event`

### Client → Server Events

| Event | Payload | Description |
|---|---|---|
| `chat:message` | `{ channelId, content, replyToId? }` | Send a message to a channel |
| `chat:typing` | `{ channelId }` | Indicate typing in a channel |
| `chat:stopTyping` | `{ channelId }` | Stop typing indicator |
| `presence:heartbeat` | `{}` | Keep-alive heartbeat (every 30s) |

### Server → Client Events

| Event | Payload | Description |
|---|---|---|
| `chat:message` | `{ id, channelId, senderId, senderName, content, replyToId?, createdAt }` | New message broadcast |
| `chat:messageUpdated` | `{ id, channelId, content, editedAt }` | Message edited |
| `chat:messageDeleted` | `{ id, channelId, deletedAt }` | Message soft-deleted |
| `chat:typing` | `{ channelId, userId, userName }` | Someone is typing |
| `chat:stopTyping` | `{ channelId, userId }` | Typing stopped |
| `notification:new` | `{ id, type, title, body, createdAt }` | New notification |
| `presence:online` | `{ userId, userName }` | User came online |
| `presence:offline` | `{ userId }` | User went offline |
| `class:status` | `{ lectureId, status, scheduledAt? }` | Live class status update |
| `session:evicted` | `{ reason, deviceName }` | Playback session evicted (concurrent limit) |

### Error Event Format

```json
{
  "code": "RATE_LIMITED",
  "message": "Too many messages. Slow down."
}
```

**Error codes:** `RATE_LIMITED`, `PAYLOAD_TOO_LARGE`, `UNAUTHORIZED`, `ROOM_FULL`, `VALIDATION_ERROR`

### Reconnection Behavior

- Client auto-reconnects with exponential backoff: 1s → 2s → 4s → 8s → max 30s
- On reconnect, client re-authenticates via JWT handshake
- JWT revocation status is checked during Socket.IO handshake — if the user has been deactivated or the token has been revoked, the connection is rejected
- Missed events are recovered by fetching recent messages from REST API (not replayed from Socket.IO)
- Presence status reset to offline after 60s of no heartbeat

### Message Constraints

- **Max payload size:** 10KB per message (messages exceeding limit are rejected with `PAYLOAD_TOO_LARGE` error)
- **Max message length:** 2000 characters for `chat:message` content

### Per-User Rate Limiting

- **50 messages/minute per user** (across all Socket.IO connections)
- Tracked via Redis key: `ws_rate:{user_id}` — counts messages across all connections for that user
- Implemented via Redis Lua script for atomicity:
  ```lua
  -- KEYS[1] = ws_rate:{user_id}
  -- ARGV[1] = limit (50), ARGV[2] = window (60)
  local count = redis.call('INCR', KEYS[1])
  if count == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[2])
  end
  if tonumber(count) > tonumber(ARGV[1]) then
    return 0  -- rate limited
  end
  return 1  -- allowed
  ```
- Prevents spam via multiple concurrent connections
- Rate limit reset: sliding window (60 seconds)
- When rate limit is exceeded, all connections for that user receive `RATE_LIMITED` error until the window resets
