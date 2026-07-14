# Product Overview

> **Purpose:** Executive summary, vision, mission, and product architecture overview
> **Source:** PROJECT_DOCUMENTATION.md §1, §2, §5

---

## Executive Summary

A live-first EdTech platform targeting **college and university students** across India and English-speaking global markets.

The platform enables **vetted instructors** to deliver live classes and pre-recorded courses in **Coding / Tech** and **Professional Skills / Business** domains, with planned expansion into additional verticals. Students access content through a freemium model — free previews of lectures — and unlock full courses via **per-course purchases** or through **institutional licensing** (colleges and universities).

The platform is built for long-term scale from day one, with a clean monorepo architecture, a modular NestJS backend, and a media pipeline (LiveKit + Mux) that transforms every live class automatically into a replayable recorded course.

The Month 1 goal is **not** to build everything. It is to build the right foundation: auth, course delivery, upload pipeline, payments, and creator workflows — with enough engagement features to validate the product loop.

---

## Vision & Mission

### Vision

To become the most trusted skills platform for Indian college students and professionals, offering world-class instruction in technology and business — live and on-demand.

### Mission

Empower students to build career-ready skills through live instruction, structured courses, and a strong learning community — accessible from any device, anywhere.

### Core Product Belief

> A content engagement system — not a realtime technology demo.

Platform success depends on:

- **Instructor workflow quality** — how easily instructors upload, organize, schedule, and manage students
- **Student engagement** — completion rates, community, and tangible outcomes (certificates, placements)
- **Content flywheel** — live classes automatically becoming recorded courses, compounding content library over time

---

## Platform Zones

The platform is divided into **four separate Next.js applications**, each independently deployable, backed by a **single shared backend**:

```
apps/web-student       → Student learning experience
apps/web-instructor    → Instructor dashboard and tools
apps/web-admin         → Platform administration
apps/web-institution   → Institutional dashboard (Phase 2)
```

**Security Rationale:** Each zone is isolated to prevent cross-zone vulnerabilities (XSS, CSRF, privilege escalation). Shared components and API clients live in `/packages` to maintain consistency while enforcing boundary separation.

**Domain Mapping:**

```
api.example.com            → apps/api
student.example.com        → apps/web-student
instructor.example.com     → apps/web-instructor
admin.example.com          → apps/web-admin
institution.example.com    → apps/web-institution (Phase 2)
```

---

## Core Product Loops

### Student Loop

```
Discover free preview → Purchase course / Institution access
  → Watch live class or recorded lecture
  → Complete assignments & quizzes
  → Earn certificate
  → Join community → Placement support
```

### Instructor Loop

```
Apply & get vetted → Create course / Schedule live class
  → Upload content → Students enroll
  → Engage via live class → Review analytics
  → Earn revenue
```

### Content Flywheel

```
Live class (LiveKit)
  → Auto-recorded
  → Uploaded to S3
  → Ingested by Mux
  → Transcoded to HLS
  → Becomes recorded lecture in course library
```
