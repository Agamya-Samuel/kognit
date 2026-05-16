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

const mockUser = {
  id: 1,
  email: 'student@edutech.test',
  role: 'student',
  name: 'Test Student',
  avatarUrl: null,
  isVerified: true,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockInstructorData = {
  id: 2,
  email: 'instructor@edutech.test',
  role: 'instructor',
  name: 'Test Instructor',
  avatarUrl: null,
  isVerified: true,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock users for admin endpoints
const mockAdminUsers = [
  { ...mockUser },
  { ...mockInstructorData },
  {
    id: 3,
    email: 'admin@edutech.test',
    role: 'admin',
    name: 'Test Admin',
    avatarUrl: null,
    isVerified: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    email: 'jane@example.com',
    role: 'student',
    name: 'Jane Smith',
    avatarUrl: null,
    isVerified: true,
    isActive: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 5,
    email: 'inst_admin@example.com',
    role: 'institution_admin',
    name: 'Inst Admin User',
    avatarUrl: null,
    isVerified: false,
    isActive: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const mockCourses = [
  {
    id: 1,
    instructorId: 2,
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
    studentId: 1,
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
        data: { user: mockUser, message: 'Registration successful' },
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
        user: mockUser,
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
      data: mockUser,
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

// ─── Admin Handlers ───────────────────────────────────────────────────────────

export const adminHandlers = [
  http.get(`${API_BASE}/admin/users`, async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const role = url.searchParams.get('role');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    let filtered = mockAdminUsers;
    if (role && role !== 'all') {
      filtered = filtered.filter((u) => u.role === role);
    }

    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    return HttpResponse.json({
      success: true,
      data: {
        users: paged,
        total: filtered.length,
        page,
        limit,
      },
    });
  }),

  http.get(`${API_BASE}/admin/users/:id`, async ({ params }) => {
    await delay(150);
    const user = mockAdminUsers.find((u) => u.id === Number(params.id));
    if (!user) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 },
      );
    }
    return HttpResponse.json({ success: true, data: user });
  }),

  http.patch(`${API_BASE}/admin/users/:id/role`, async ({ params, request }) => {
    await delay(150);
    const user = mockAdminUsers.find((u) => u.id === Number(params.id));
    if (!user) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 },
      );
    }
    const body = await request.json() as { role: string };
    user.role = body.role;
    return HttpResponse.json({ success: true, data: user });
  }),

  http.patch(`${API_BASE}/admin/users/:id/toggle-active`, async ({ params }) => {
    await delay(150);
    const user = mockAdminUsers.find((u) => u.id === Number(params.id));
    if (!user) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 },
      );
    }
    user.isActive = !user.isActive;
    return HttpResponse.json({ success: true, data: user });
  }),

  http.delete(`${API_BASE}/admin/users/:id`, async ({ params }) => {
    await delay(150);
    const idx = mockAdminUsers.findIndex((u) => u.id === Number(params.id));
    if (idx === -1) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 },
      );
    }
    mockAdminUsers.splice(idx, 1);
    return HttpResponse.json({ success: true, data: { message: 'User deleted' } });
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
  ...adminHandlers,
  ...healthHandler,
];
