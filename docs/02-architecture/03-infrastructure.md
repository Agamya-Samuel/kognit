# Infrastructure Architecture

> **Purpose:** Deployment diagram, AWS services, and Month 1 infrastructure choices
> **Source:** PROJECT_DOCUMENTATION.md §9

---

## Deployment Overview

```
                         ┌─────────────────────┐
                         │   CloudFront CDN     │
                         │   (Static + Media)   │
                         └────────┬────────────┘
                                  │
          ┌───────────┬───────────┼───────────┬───────────┐
          │           │           │           │           │
   ┌──────▼──────┐ ┌──▼──────┐ ┌─▼─────────┐ ┌▼──────────┐ ┌──────▼──────┐
   │  web-       │ │ web-    │ │ web-      │ │ web-      │ │  NestJS API │
   │  student    │ │instructr│ │ admin     │ │institution│ │  (Docker)   │
   │  (Dokploy)  │ │(Dokploy)│ │(Dokploy)  │ │ (Phase 2) │ └──────┬──────┘
   └─────────────┘ └─────────┘ └───────────┘ └───────────┘        │
                                              ┌─────────────┼─────────────┐
                                                     │             │             │
                                              ┌──────▼──────┐ ┌───▼──────┐ ┌───▼───────┐
                                               │  PostgreSQL  │ │  Redis    │ │  S3       │
                                               │  (Dokploy)   │ │ (Upstash) │ │  Buckets  │
                                              └──────────────┘ └───────────┘ └───┬───────┘
                                                                                   │
                                                     ┌─────────────┐      ┌───────▼───────┐
                                                     │ Meilisearch  │      │  Mux           │
                                                     │ (Dokploy)    │      │  (ingest,      │
                                                     └─────────────┘      │   transcode,   │
                                                                          │   HLS deliver) │
                                                                          └───────────────┘
```

---

## App Isolation

Each web app is deployed as a separate Docker container with its own:
- Environment variables
- SSL certificate
- Cookie domain scope
- Rate limiting configuration
- Sentry project configuration
- PostHog API key (for analytics isolation)

---

## AWS Services Used

| Service | Purpose |
|---|---|
| **EC2 / ECS** | App hosting (Docker containers via Dokploy) |
| **PostgreSQL (Dokploy)** | Primary database |
| **Redis (Upstash)** | Cache, queues, pub/sub, presence (Month 1) |
| **S3** | Video uploads, recording storage, assets |
| **CloudFront** | CDN for static assets and media |
| **Meilisearch** | Full-text search for courses, filtering, instant search (Dokploy container) |
| **SES** | Transactional email (notifications) |
| **Route 53** | DNS management |

---

## Month 1 Infra (Simplified)

| Service | Month 1 Choice | Scale-Up Path |
|---|---|---|
| App hosting | Dokploy + Docker | ECS Fargate |
| Database | PostgreSQL via Dokploy | Read replicas, connection pooling |
| Redis | Upstash | — |
| Monitoring | Dokploy logs + PostHog | Sentry + Datadog / Grafana |
| Search | Meilisearch (Dokploy container) | Managed Meilisearch Cloud / Elasticsearch |
