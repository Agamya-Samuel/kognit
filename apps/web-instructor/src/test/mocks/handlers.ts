import { http, HttpResponse, delay } from 'msw';

/**
 * MSW (Mock Service Worker) handlers for the EduTech API v1 endpoints.
 *
 * These handlers mock all API endpoints for frontend unit/integration tests.
 * Each handler returns realistic mock data that matches the API response schema.
 *
 * Usage in test setup:
 *   import { setupServer } from 'msw/node';
 *   import { handlers } from '@/test/mocks/handlers';
 *   const server = setupServer(...handlers);
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockInstructor = {
  id: 2,
  email: 'instructor@edutech.test',
  role: 'instructor',
  avatarUrl: null,
  isVerified: true,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockCourses = [
  {
    id: 1,
    title: 'Introduction to TypeScript',
    description: 'Learn TypeScript from scratch',
    thumbnailUrl: null,
    domain: 'Programming',
    pricingType: 'free',
    priceInr: 0,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    instructorId: 2,
    title: 'Advanced React Patterns',
    description: 'Master advanced React patterns',
    thumbnailUrl: null,
    domain: 'Programming',
    pricingType: 'paid',
    priceInr: 4999,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockEnrollments = [
  {
    id: 1,
    studentId: 2,
    courseId: 1,
    enrolledAt: new Date().toISOString(),
    paymentId: null,
    accessType: 'free' as const,
  },
];

const mockNotifications = [
  {
    id: 1,
    userId: 1,
    type: 'info',
    title: 'Welcome to EduTech!',
    body: 'Start exploring courses today.',
    isRead: false,
    deliveredVia: 'in_app' as const,
    createdAt: new Date().toISOString(),
  },
];

// ─── Auth Handlers ─────────────────────────────────────────────────────────────

export const authHandlers = [
  http.post(`${API_BASE}/auth/register`, async () => {
    await delay(300);
    return HttpResponse.json(
      {
        success: true,
        data: { message: 'Registration successful' },
      },
      { status: 201 },
    );
  }),

  http.post(`${API_BASE}/auth/login`, async () => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: mockInstructor,
      },
    });
  }),

  http.post(`${API_BASE}/auth/logout`, async () => {
    await delay(100);
    return HttpResponse.json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  }),

  http.post(`${API_BASE}/auth/refresh`, async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: {
        accessToken: 'mock-new-access-token',
        refreshToken: 'mock-new-refresh-token',
      },
    });
  }),

  http.get(`${API_BASE}/auth/me`, async () => {
    await delay(100);
    return HttpResponse.json({
      success: true,
      data: mockInstructor,
    });
  }),
];

// ─── Course Handlers ──────────────────────────────────────────────────────────

export const courseHandlers = [
  http.get(`${API_BASE}/courses`, async () => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: mockCourses,
    });
  }),

  http.get(`${API_BASE}/courses/:id`, async ({ params }) => {
    await delay(200);
    const course = mockCourses.find((c) => c.id === Number(params.id));
    if (!course) {
      return HttpResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 },
      );
    }
    return HttpResponse.json({ success: true, data: course });
  }),

  http.post(`${API_BASE}/courses`, async () => {
    await delay(300);
    return HttpResponse.json(
      {
        success: true,
        data: { ...mockCourses[0], id: 3, title: 'New Course' },
      },
      { status: 201 },
    );
  }),
];

// ─── Enrollment Handlers ──────────────────────────────────────────────────────

export const enrollmentHandlers = [
  http.get(`${API_BASE}/enrollments`, async () => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: mockEnrollments,
    });
  }),

  http.post(`${API_BASE}/enrollments`, async () => {
    await delay(300);
    return HttpResponse.json(
      {
        success: true,
        data: mockEnrollments[0],
      },
      { status: 201 },
    );
  }),
];

// ─── Notification Handlers ────────────────────────────────────────────────────

export const notificationHandlers = [
  http.get(`${API_BASE}/notifications`, async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: mockNotifications,
    });
  }),

  http.patch(`${API_BASE}/notifications/:id/read`, async () => {
    await delay(100);
    return HttpResponse.json({
      success: true,
      data: { isRead: true },
    });
  }),
];

// ─── Health Handler ───────────────────────────────────────────────────────────

export const healthHandler = [
  http.get(`${API_BASE.replace('/api/v1', '')}/health`, async () => {
    return HttpResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  }),
];

// ─── All Handlers Combined ────────────────────────────────────────────────────

export const handlers = [
  ...authHandlers,
  ...courseHandlers,
  ...enrollmentHandlers,
  ...notificationHandlers,
  ...healthHandler,
];
