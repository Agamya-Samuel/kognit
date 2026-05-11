# EdTech Platform — Documentation Hub

> **Version:** 1.0
> **Last Updated:** 9th May, 2026
> **Author:** Agamya Samuel

## Navigation

### 01 — Product
| File | Description |
|---|---|
| [Overview](01-product/01-overview.md) | Executive summary, vision, mission, core product belief, platform zones, product loops |
| [Market](01-product/02-market.md) | Target audience segments, geography |
| [Business Model](01-product/03-business-model.md) | Revenue streams, pricing, future opportunities |
| [Success Metrics](01-product/04-success-metrics.md) | Phase KPIs, success criteria, post-launch considerations |

### 02 — Architecture
| File | Description |
|---|---|
| [Tech Stack](02-architecture/01-tech-stack.md) | Full stack table, backend module boundaries |
| [Monorepo](02-architecture/02-monorepo.md) | Directory structure, package rules, app isolation rules |
| [Infrastructure](02-architecture/03-infrastructure.md) | Deployment diagram, AWS services, Month 1 infra |
| [Database](02-architecture/04-database.md) | All 25 tables, relations, constraints, indexing rules, DB best practices |
| [Auth](02-architecture/05-auth.md) | Strategy, tokens, flows (web/mobile/OAuth), RBAC, account lockout, password policy |
| [Media Pipeline](02-architecture/06-media-pipeline.md) | Recorded flow, live→recording flow, playback security |
| [Realtime](02-architecture/07-realtime.md) | Socket.IO, Redis pub/sub, LiveKit, event architecture |
| [API Conventions](02-architecture/08-api-conventions.md) | REST principles, endpoints, response envelope, pagination, rate limiting |

### 03 — Features
| File | Description |
|---|---|
| [Student Platform](03-features/01-student-platform.md) | All student-facing features |
| [Instructor Platform](03-features/02-instructor-platform.md) | All instructor-facing features |
| [Admin Dashboard](03-features/03-admin-dashboard.md) | All admin-facing features |
| [Notifications](03-features/04-notifications.md) | Notification triggers, channels, system design |
| [Landing Page](03-features/05-landing-page.md) | Landing page web app features and specifications |

### 04 — Engineering
| File | Description |
|---|---|
| [Testing Strategy](04-engineering/01-testing-strategy.md) | Mandate, layers, coverage, conventions, best practices, scripts |
| [Security](04-engineering/02-security.md) | Vulnerabilities table, mitigations, best practices, audit checklist |
| [Code Standards](04-engineering/03-code-standards.md) | Git workflow, code quality, error handling hierarchy, DB practices, frontend practices |
| [CI/CD & Operations](04-engineering/04-cicd-and-operations.md) | CI/CD pipeline stages, deployment strategy, monitoring, observability, alerting |
| [Performance](04-engineering/05-performance.md) | Backend, frontend, infrastructure optimization checklists |

### 05 — Implementation
| File | Description |
|---|---|
| [30-Day Plan](05-implementation/01-30-day-plan.md) | Merged canonical day-by-day plan (Days 1–30) with post-30 checklist |
| [Scope](05-implementation/02-scope.md) | In scope, out of scope, deferred features, open questions |

### 06 — Project Management
| File | Description |
|---|---|
| [Risk Register](06-project-management/01-risk-register.md) | Combined risk register + mitigation strategies |
| [Glossary](06-project-management/02-glossary.md) | All terminology definitions |

## Design Principles

1. **Single Source of Truth** — Each topic exists in exactly one file
2. **Progressive Disclosure** — This README links to sections; sections link to detail files
3. **Topic Cohesion** — Each file covers one coherent topic
4. **No Duplication** — Cross-reference with links instead of repeating content
5. **Concise Headers** — Every file starts with purpose, scope, and source attribution
6. **Consistent Format** — Tables, code blocks, and lists follow uniform formatting
