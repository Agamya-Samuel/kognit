# Risk Register

> **Purpose:** Combined risk register with mitigation strategies  
> **Source:** PROJECT_DOCUMENTATION.md §17, 30_DAY_IMPLEMENTATION_PLAN.md (Risk Mitigation), cosmic-comet §3  

---

## Platform Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Solo founder bandwidth** | High | High | Strict scope discipline. Month 1 plan is the ceiling, not the floor. |
| **Instructor content quality** | Medium | High | Vetted invite-only model. Trial course before full onboarding. |
| **Mux / LiveKit cost at scale** | Medium | Medium | Monitor usage closely. Mux pricing is usage-based. Switch to self-hosted at scale. |
| **Low student retention** | Medium | High | Track drop-off from day 1 via PostHog. Iterate on completion flow. |
| **Institution sales cycle too long** | High | Medium | Run B2C first. Institution licensing is secondary revenue in Month 1. |
| **Payment failures (India)** | Medium | Medium | Razorpay as primary gateway with native UPI, net banking, wallets support. |
| **Scope creep** | High | High | This document defines Month 1 scope. All additions go to backlog. |
| **Database design mistakes** | Low | High | Schema reviewed before any data is written. Migrations versioned from day 1. |
| **Multi-app complexity** | Medium | Medium | Shared packages (`/packages/ui`, `/packages/api-client`, `/packages/shared-components`) reduce duplication. Turborepo caching speeds builds. Per-app CI pipelines run only on affected apps. |
| **Cross-app session inconsistency** | Low | High | Scoped cookie domains per app. Single refresh token per user — logout revokes globally. Each app has independent auth (separate accounts per role). No cross-app auth flow. |

---

## Implementation Risks

| Risk | Mitigation |
|---|---|
| Testing slows development | Write tests alongside code, not after. TDD approach recommended. |
| Flaky tests | Deterministic test data, transactional DB tests, mock external services |
| Coverage gaps | CI enforces ≥80% general / ≥95% critical paths, daily coverage review, pair testing on complex modules |
| Time overrun | Strict scope discipline. Day N features must complete on Day N. Defer non-critical to backlog. |
| External service costs | Use mocks for unit/integration tests. E2E tests against staging only. Monitor Mux/LiveKit usage. |

---

## Risk Mitigation Strategies

### Scope Creep Prevention

**Feature Freeze Rule:**
- No new features after Day 14 for student and instructor platforms
- Admin dashboard features (Days 22-23) are scoped during Week 1 and built as planned — these are not new feature additions
- All new requests go to backlog for Phase 2
- Emergency changes require written justification

**Definition of Done:**
- Code written + tested + reviewed
- All tests pass (≥80% general, ≥95% critical paths: auth, payments, enrollments, certificates)
- Documentation updated
- Deployed to staging
- No known bugs or blockers

### Time Management

**Daily Checkpoints:**
- Morning: Review previous day's exit criteria
- Midday: Progress check against plan
- Evening: Commit working code, update plan if needed

**Weekly Reviews:**
- Sunday: Review week's accomplishments
- Update risk register
- Adjust next week's plan if needed
- Document lessons learned

**Buffer Days:**
- Days 28-30 are buffer/stabilization
- If behind schedule, cut features not core loop
- Never skip testing to save time

### Data Loss Prevention

**Backup Strategy:**
- Automated daily database backups
- Weekly full backup to S3
- Test restore procedure monthly
- Document rollback procedures

**Disaster Recovery (DR/BCP):**

| Metric | Target |
|---|---|
| **RTO** (Recovery Time Objective) | 4 hours |
| **RPO** (Recovery Point Objective) | 24 hours (daily backup) |

- Daily backup verification: automated restore test to a staging database weekly
- S3 cross-region replication for backup durability (same region as primary in Month 1, cross-region in Phase 2)
- Runbook for full database restoration from S3 backup stored in `/infra/scripts/restore.sh`
- Incident response runbook covers: DB failure, S3 outage, Redis failure, Mux outage, app container crash

**Migration Safety:**
- Test migrations on staging before production
- Backup before each migration
- Verify data integrity after migration
- Keep migration scripts versioned

### External Dependency Risks

**Service Outage Mitigation:**
- Circuit breaker pattern for external services
- Graceful degradation when services unavailable
- Retry with exponential backoff
- Fallback mechanisms where possible

**API Version Pinning:**
- Lock dependency versions (no ^ or ~)
- Test with new versions before upgrading
- Monitor service status pages
- Have contact info for support teams
