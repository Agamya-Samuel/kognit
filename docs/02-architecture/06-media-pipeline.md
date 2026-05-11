# Media Pipeline

> **Purpose:** Video upload, transcoding, live class recording, and playback security
> **Source:** PROJECT_DOCUMENTATION.md §12

---

## Recorded Content Flow

```
Instructor uploads video (browser)
  → Frontend requests signed S3 upload URL from NestJS
  → Browser uploads directly to S3 (bypasses NestJS server)
  → S3 event triggers NestJS webhook
  → NestJS validates file magic bytes (downloads first 8KB from S3)
  → If valid: NestJS creates Mux upload asset
  → Mux downloads from S3, transcodes to HLS
  → Mux webhook fires on completion
  → NestJS updates lecture record with mux_asset_id + mux_playback_id
  → Lecture becomes available to students
  → If invalid: delete file from S3, mark upload as rejected, notify instructor
```

## Live Class → Recording Flow

```
Instructor starts live class
  → LiveKit room created
  → LiveKit auto-records to S3
  → Class ends → LiveKit sends egress_ended webhook to NestJS
  → NestJS receives S3 recording URL from webhook
  → NestJS ingests recording into Mux
  → Transcoded recording attached to course lecture
  → Students can replay immediately after class
```

## Playback Security

- All Mux playback URLs are **signed** (time-limited, per-user tokens)
- Unsigned URLs are rejected by Mux
- Prevents hotlinking and unauthorized sharing
- **Free preview exception:** Lectures marked `is_free_preview = true` allow unauthenticated playback URL requests. The playback URL endpoint checks `is_free_preview` before requiring enrollment.

## Video Upload Constraints

| Constraint | Limit |
|---|---|
| **Maximum resolution** | 1920×1080 (1080p) |
| **Maximum duration** | 4 hours (14400 seconds) |
| **Maximum file size** | 1GB |
| **Accepted video codecs** | H.264, H.265 (HEVC) |
| **Accepted audio codecs** | AAC |
| **Accepted containers** | MP4, MOV, MKV, WebM |
| **Accepted MIME types** | `video/mp4`, `video/quicktime`, `video/x-matroska`, `video/webm` |

- Mux re-encodes all uploads to HLS adaptive bitrate regardless of input format
- Videos exceeding 1080p are downscaled by Mux transcoding settings (configured in Mux encoding tier)
- Pre-signed S3 upload URL validates `Content-Type` header against accepted MIME types
- File size enforced client-side (before upload) and server-side (S3 upload limit on pre-signed URL)
- Signed URL expiry: 30 minutes. For slow connections uploading large files, the frontend uses S3 multipart upload — the initial signed URL creates the multipart session, and each part gets a fresh signed URL. If the upload stalls for > 30 min, the frontend requests new part URLs without restarting the entire upload.

## Server-Side File Validation (Post-Upload)

- S3 event notification triggers NestJS webhook
- Webhook handler downloads first 8KB of the file from S3
- Validates magic bytes against allowed formats:
  - MP4: `ftyp` at offset 4
  - WebM: `1A 45 DF A3` at offset 0
  - MOV: `qt` or `moov` signature
  - MKV: `1A 45 DF A3` at offset 0 (shares with WebM — further parsing distinguishes)
- If validation fails: delete file from S3, mark upload status as `rejected`, notify instructor with error
- If validation passes: proceed with Mux asset creation

## Upload Pipeline Reliability

### Dead-Letter Queue (S3 → Mux)

- S3 event notifications are configured with a retry policy: 3 retries with exponential backoff
- If the NestJS webhook fails after all retries, S3 delivers the event to a dead-letter SQS queue
- **Reconciliation cron job** runs every 15 minutes:
  - Scans `lectures` where `mux_asset_id IS NULL` AND upload status is `complete` AND `updated_at > 30 minutes ago`
  - Re-triggers Mux asset creation for any orphaned uploads
- Alert fires if dead-letter queue receives > 0 messages (pushed to Sentry + admin dashboard)

### LiveKit Recording Trigger

- LiveKit is configured with `webhook_urls` pointing to `POST /api/v1/internal/livekit/webhook`
- On `egress_ended` webhook event, NestJS receives the S3 recording URL
- NestJS triggers Mux ingestion from the S3 URL
- **Reconciliation fallback:** The scheduling service runs a cron job every 15 minutes:
  - Scans `live_classes` where `status = 'ended'` AND `recording_url IS NULL` AND `ended_at > 30 minutes ago`
  - Queries LiveKit API (`ListEgress`) for completed recordings
  - Re-triggers the recording pipeline for any orphaned classes
