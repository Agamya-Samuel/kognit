# Testing Strategy

> **Purpose:** Testing mandate, layers, coverage requirements, conventions, best practices, and coverage scripts
> **Source:** 30_DAY_IMPLEMENTATION_PLAN.md (Testing Mandate), cosmic-comet §2.8

---

## Testing Mandate (Compulsory — No Exceptions)

**Every single piece of code — frontend logic or backend logic — MUST be accompanied by appropriate tests. No code is merged without tests.**

---

## Testing Layers

| Layer | Tooling | Scope |
|---|---|---|
| **Unit Tests** | Jest (NestJS), Vitest (Next.js) | Individual functions, services, components, utilities, Zod schemas |
| **Integration Tests** | Jest + Supertest (backend), Vitest + RTL (frontend) | Module interactions, API endpoints, component compositions |
| **E2E Tests** | Supertest (backend), Playwright (frontend) | Full user flows, critical paths, cross-module workflows |

## Coverage Requirements

- **Minimum coverage (general code):** 80% line coverage, 80% branch coverage
- **Critical paths (auth, payments, enrollments, certificates):** 95% line coverage, 95% branch coverage
- **Critical path modules:** `auth`, `payments`, `enrollments`, `certificates`
- **Enforcement:** CI/CD pipeline blocks merge if coverage drops below thresholds
- **Per-file coverage reports** generated on every test run
- **No `istanbul ignore` comments allowed** without documented justification and team lead approval

## Test File Naming Conventions

| Test Type | Backend | Frontend |
|---|---|---|
| Unit | `*.spec.ts` | `*.test.tsx` / `*.test.ts` |
| Integration | `*.integration.spec.ts` | `*.integration.test.tsx` |
| E2E | `*.e2e-spec.ts` | `*.e2e.test.ts` (Playwright) |

---

## Testing Best Practices

- **Test Pyramid:** 70% unit tests, 20% integration tests, 10% E2E tests
- **Each test tests ONE behavior** — if test description contains "and", split it
- **Fresh state per test** — `beforeEach` resets mocks and recreates modules
- **Test contracts, not implementations** — verify outputs/throws, not internal mechanics
- **Realistic test data** — use meaningful names, valid email formats, real-world structures
- **No over-mocking** — use real implementations for simple utilities and pure functions
- **Mock external services** — Mux, LiveKit, Razorpay, AWS SES all mocked in unit/integration tests
- **Database testing** — use transactional rollback per test (never persist test data)
- **Server Actions** — test business logic with Vitest, test form integration with Playwright
- **Async Server Components** — test via Playwright E2E (Vitest cannot render async components)

### Test Structure (AAA Pattern)

```typescript
it('should create enrollment on successful payment', async () => {
  // Arrange
  const student = createStudentMock();
  const course = createCourseMock();
  const payment = createPaymentMock();

  // Act
  const result = await enrollmentService.createFromPayment(student, course, payment);

  // Assert
  expect(result.studentId).toBe(student.id);
  expect(result.courseId).toBe(course.id);
  expect(enrollmentRepository.create).toHaveBeenCalledWith(...);
});
```

### Test Data Management

- Factory functions for all entities
- No hardcoded test data
- Factories support overrides: `createUser({ role: 'admin' })`
- Database tests use transactional rollback
- Clean up test data after each suite

### Integration Test Isolation

- Each test runs in its own transaction
- Tests run in parallel (no shared state)
- Mock external services (Mux, Razorpay, LiveKit)
- Use test containers for real database
- Seed minimal data per test (not full database)

---

## Coverage Scripts

Each app and package has its own test script. Root scripts aggregate all results:

```json
{
  "test": "turbo run test",
  "test:watch": "turbo run test --watch",
  "test:api:cov": "turbo run test:cov --filter=api",
  "test:web-student:cov": "turbo run test:cov --filter=web-student",
  "test:web-instructor:cov": "turbo run test:cov --filter=web-instructor",
  "test:web-admin:cov": "turbo run test:cov --filter=web-admin",
  "test:e2e": "turbo run test:e2e",
  "test:e2e:web-student": "turbo run test:e2e --filter=web-student",
  "test:e2e:web-instructor": "turbo run test:e2e --filter=web-instructor",
  "test:e2e:web-admin": "turbo run test:e2e --filter=web-admin",
  "test:all": "npm run test:api:cov && npm run test:web-student:cov && npm run test:web-instructor:cov && npm run test:web-admin:cov && npm run test:e2e"
}
```

---

## Daily Testing Coverage Checklist

Each day's work MUST include:

- [ ] Unit tests for all new functions and methods
- [ ] Unit tests for all new components
- [ ] Unit tests for all new schemas and DTOs
- [ ] Integration tests for all new API endpoints
- [ ] Integration tests for all new module interactions
- [ ] E2E tests for all new user flows
- [ ] Coverage report verified: ≥80% for new code, ≥95% for critical paths (auth, payments, enrollments, certificates)
- [ ] No `istanbul ignore` comments without approval
- [ ] All tests passing before end of day
- [ ] CI pipeline green
