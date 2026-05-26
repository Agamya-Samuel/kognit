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

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

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
  // Get all instructor courses
  http.get(`${API_BASE}/courses`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const isInstructor = url.searchParams.get('instructorId') === '2';
    
    const filteredCourses = isInstructor 
      ? mockCourses.filter(c => c.instructorId === 2)
      : mockCourses;
    
    return HttpResponse.json({
      success: true,
      data: filteredCourses,
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
    const newCourse = {
      id: mockCourses.length + 1,
      instructorId: 2,
      title: 'New Course',
      description: 'Course description',
      domain: 'Programming',
      pricingType: 'paid',
      priceInr: 999,
      isPublished: false,
      thumbnailUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockCourses.push(newCourse);
    return HttpResponse.json(
      {
        success: true,
        data: newCourse,
      },
      { status: 201 },
    );
  }),

  http.put(`${API_BASE}/courses/:id`, async ({ params }) => {
    await delay(300);
    const index = mockCourses.findIndex((c) => c.id === Number(params.id));
    if (index === -1) {
      return HttpResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 },
      );
    }
    mockCourses[index] = {
      ...mockCourses[index],
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: mockCourses[index] });
  }),

  http.patch(`${API_BASE}/courses/:id/publish`, async ({ request, params }) => {
    await delay(200);
    const body = await request.json() as { isPublished: boolean };
    const index = mockCourses.findIndex((c) => c.id === Number(params.id));
    if (index === -1) {
      return HttpResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 },
      );
    }
    mockCourses[index].isPublished = body.isPublished;
    mockCourses[index].updatedAt = new Date().toISOString();
    return HttpResponse.json({ success: true, data: mockCourses[index] });
  }),

  http.delete(`${API_BASE}/courses/:id`, async ({ params }) => {
    await delay(300);
    const index = mockCourses.findIndex((c) => c.id === Number(params.id));
    if (index === -1) {
      return HttpResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 },
      );
    }
    mockCourses.splice(index, 1);
    return HttpResponse.json({ success: true, data: { message: 'Course deleted' } });
  }),

  // Dashboard endpoints
  http.get(`${API_BASE}/dashboard/metrics`, async () => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: {
        totalStudents: 1234,
        activeCourses: 8,
        totalRevenue: 245000,
        upcomingClasses: 3,
      },
    });
  }),

  http.get(`${API_BASE}/dashboard/recent-activity`, async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: [
        { id: 1, type: 'enrollment', message: 'John Doe enrolled in TypeScript Basics', time: '2 min ago' },
        { id: 2, type: 'completion', message: 'Jane Smith completed React Patterns', time: '15 min ago' },
        { id: 3, type: 'review', message: 'New review: "Excellent course!" on Node.js Fundamentals', time: '1 hour ago' },
        { id: 4, type: 'enrollment', message: 'Mike Johnson enrolled in Advanced React', time: '2 hours ago' },
      ],
    });
  }),

  http.get(`${API_BASE}/dashboard/upcoming-classes`, async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: [
        { id: 1, title: 'TypeScript Live Session', time: 'Today, 3:00 PM', enrolled: 45 },
        { id: 2, title: 'React Patterns Q&A', time: 'Tomorrow, 10:00 AM', enrolled: 32 },
        { id: 3, title: 'Node.js Best Practices', time: 'Friday, 2:00 PM', enrolled: 28 },
      ],
    });
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

// ─── Section Handlers ──────────────────────────────────────────────────────

export const sectionHandlers = [
  http.get(`${API_BASE}/courses/:courseId/sections`, async ({ params: _params }) => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: [],
    });
  }),

  http.post(`${API_BASE}/courses/:courseId/sections`, async () => {
    await delay(300);
    return HttpResponse.json(
      {
        success: true,
        data: {
          id: 1,
          courseId: 1,
          title: 'Introduction',
          order: 1,
        },
      },
      { status: 201 },
    );
  }),

  http.put(`${API_BASE}/courses/:courseId/sections/:id`, async ({ params }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { id: Number(params.id), courseId: 1, title: 'Updated Section', order: 1 } });
  }),

  http.delete(`${API_BASE}/courses/:courseId/sections/:id`, async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { message: 'Section deleted' } });
  }),

  http.patch(`${API_BASE}/courses/:courseId/sections/reorder`, async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { message: 'Sections reordered' } });
  }),
];

// ─── Lecture Handlers ─────────────────────────────────────────────────────

export const lectureHandlers = [
  http.get(`${API_BASE}/sections/:sectionId/lectures`, async ({ params: _params }) => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: [],
    });
  }),

  http.post(`${API_BASE}/sections/:sectionId/lectures`, async () => {
    await delay(300);
    return HttpResponse.json(
      {
        success: true,
        data: {
          id: 1,
          sectionId: 1,
          title: 'Lesson 1',
          type: 'video',
          order: 1,
          isFreePreview: false,
        },
      },
      { status: 201 },
    );
  }),

  http.put(`${API_BASE}/lectures/:id`, async ({ params }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { id: Number(params.id), sectionId: 1, title: 'Updated Lecture', order: 1 } });
  }),

  http.delete(`${API_BASE}/lectures/:id`, async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { message: 'Lecture deleted' } });
  }),

  http.patch(`${API_BASE}/sections/:sectionId/lectures/reorder`, async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { message: 'Lectures reordered' } });
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

// ─── Analytics Handlers ───────────────────────────────────────────────────────────

export const analyticsHandlers = [
  http.get(`${API_BASE}/analytics/instructor/creation-stats`, async () => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: {
        totalCourses: 12,
        publishedCourses: 8,
        totalStudents: 245,
        averageCompletionRate: 78,
        monthlyChange: {
          totalCourses: 2,
          averageCompletionRate: 5,
        },
        weeklyChange: {
          publishedCourses: 1,
          totalStudents: 18,
        },
      },
    });
  }),
];

// ─── All Handlers Combined ────────────────────────────────────────────────────

export const handlers = [
  ...authHandlers,
  ...courseHandlers,
  ...analyticsHandlers,
  ...sectionHandlers,
  ...lectureHandlers,
  ...enrollmentHandlers,
  ...notificationHandlers,
  ...healthHandler,
];
