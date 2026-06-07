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

const mockInstructorProfiles: { id: number; userId: number; userName: string; userEmail: string; bio: string; expertise: string[]; approvalStatus: 'pending' | 'approved' | 'rejected'; createdAt: string }[] = [
  {
    id: 1,
    userId: 2,
    userName: 'Test Instructor',
    userEmail: 'instructor@edutech.test',
    bio: 'Experienced developer',
    expertise: ['React', 'TypeScript', 'Node.js'],
    approvalStatus: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    userId: 4,
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    bio: 'Data science educator',
    expertise: ['Python', 'Machine Learning'],
    approvalStatus: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const mockAdminCourses = [
  {
    id: 1,
    instructorId: 2,
    instructorName: 'Test Instructor',
    title: 'Introduction to TypeScript',
    description: 'Learn TypeScript from scratch',
    domain: 'Programming',
    pricingType: 'free' as const,
    priceInr: 0,
    isPublished: true,
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    instructorId: 2,
    instructorName: 'Test Instructor',
    title: 'Advanced React Patterns',
    description: 'Master advanced React patterns',
    domain: 'Programming',
    pricingType: 'paid' as const,
    priceInr: 4999,
    isPublished: true,
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    instructorId: 4,
    instructorName: 'Jane Smith',
    title: 'Python for Data Science',
    description: 'Learn data science with Python',
    domain: 'Data Science',
    pricingType: 'paid' as const,
    priceInr: 2999,
    isPublished: false,
    deletedAt: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
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

const mockInstitutions = [
  {
    id: 1,
    institutionName: 'Test University',
    contactEmail: 'admin@testuniversity.edu',
    seatCount: 500,
    activeUntil: new Date(Date.now() + 365 * 86400000).toISOString(),
    razorpayCustomerId: null as string | null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    institutionName: 'Sample College',
    contactEmail: 'info@samplecollege.edu',
    seatCount: 200,
    activeUntil: new Date(Date.now() + 180 * 86400000).toISOString(),
    razorpayCustomerId: null as string | null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
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

  http.post(`${API_BASE}/auth/instructor-activation/validate`, async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: {
        userId: 10,
        email: 'invited@edutech.test',
        name: 'Invited Instructor',
      },
    });
  }),

  http.post(`${API_BASE}/auth/instructor-activation/complete`, async () => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: {
        user: { id: 10, email: 'invited@edutech.test', name: 'Invited Instructor', role: 'instructor', isVerified: true },
        tokens: { accessToken: 'mock-instructor-access-token', refreshToken: 'mock-instructor-refresh-token' },
      },
    });
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

  // ─── Admin Instructor Endpoints ──────────────────────────────────────────

  http.get(`${API_BASE}/admin/instructors`, async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'pending';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    const filtered = mockInstructorProfiles.filter((i) => i.approvalStatus === status);
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    return HttpResponse.json({
      success: true,
      data: {
        instructors: paged,
        total: filtered.length,
        page,
        limit,
      },
    });
  }),

  http.patch(`${API_BASE}/admin/instructors/:id/approve`, async ({ params }) => {
    await delay(150);
    const profile = mockInstructorProfiles.find((i) => i.id === Number(params.id));
    if (!profile) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Profile not found' } },
        { status: 404 },
      );
    }
    profile.approvalStatus = 'approved';
    return HttpResponse.json({ success: true, data: { message: 'Instructor approved' } });
  }),

  http.patch(`${API_BASE}/admin/instructors/:id/reject`, async ({ params }) => {
    await delay(150);
    const profile = mockInstructorProfiles.find((i) => i.id === Number(params.id));
    if (!profile) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Profile not found' } },
        { status: 404 },
      );
    }
    profile.approvalStatus = 'rejected';
    return HttpResponse.json({ success: true, data: { message: 'Instructor rejected' } });
  }),

  http.post(`${API_BASE}/admin/instructors/invite`, async ({ request }) => {
    await delay(300);
    const body = await request.json() as { email: string; name: string };
    if (!body.email || !body.name) {
      return HttpResponse.json(
        { success: false, error: { message: 'Email and name are required' } },
        { status: 400 },
      );
    }
    // Check if email already exists
    const existing = mockInstructorProfiles.find((i) => i.userEmail === body.email);
    if (existing) {
      return HttpResponse.json(
        { success: false, error: { message: 'An instructor with this email already exists' } },
        { status: 409 },
      );
    }
    const newId = mockInstructorProfiles.length + 1;
    mockInstructorProfiles.push({
      id: newId,
      userId: 100 + newId,
      userName: body.name,
      userEmail: body.email,
      bio: '',
      expertise: [],
      approvalStatus: 'pending',
      createdAt: new Date().toISOString(),
    });
    return HttpResponse.json(
      {
        success: true,
        data: {
          message: `Invitation sent to ${body.email}`,
          activationLink: `http://localhost:3002/auth/activate?token=mock-instructor-token-${newId}`,
        },
      },
      { status: 201 },
    );
  }),

  // ─── Admin Institution Endpoints ──────────────────────────────────────

  http.get(`${API_BASE}/admin/institutions`, async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    const start = (page - 1) * limit;
    const paged = mockInstitutions.slice(start, start + limit);

    return HttpResponse.json({
      success: true,
      data: {
        institutions: paged,
        total: mockInstitutions.length,
        page,
        limit,
      },
    });
  }),

  http.get(`${API_BASE}/admin/institutions/:id`, async ({ params }) => {
    await delay(150);
    const inst = mockInstitutions.find((i) => i.id === Number(params.id));
    if (!inst) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Institution not found' } },
        { status: 404 },
      );
    }
    return HttpResponse.json({ success: true, data: inst });
  }),

  http.post(`${API_BASE}/admin/institutions`, async ({ request }) => {
    await delay(300);
    const body = await request.json() as { institutionName: string; contactEmail: string; seatCount: number; activeUntil: string };
    if (!body.institutionName || !body.contactEmail) {
      return HttpResponse.json(
        { success: false, error: { message: 'Institution name and contact email are required' } },
        { status: 400 },
      );
    }
    const existing = mockInstitutions.find((i) => i.contactEmail === body.contactEmail);
    if (existing) {
      return HttpResponse.json(
        { success: false, error: { message: 'An institution with this contact email already exists.' } },
        { status: 409 },
      );
    }
    const newId = mockInstitutions.length + 1;
    const newInst = {
      id: newId,
      institutionName: body.institutionName,
      contactEmail: body.contactEmail,
      seatCount: body.seatCount || 100,
      activeUntil: body.activeUntil,
      razorpayCustomerId: null as string | null,
      createdAt: new Date().toISOString(),
    };
    mockInstitutions.push(newInst);
    return HttpResponse.json({ success: true, data: newInst }, { status: 201 });
  }),

  http.post(`${API_BASE}/admin/institutions/:id/students/import`, async ({ params, request }) => {
    await delay(500);
    const body = await request.json() as { students: { name: string; email: string }[] };
    const instId = Number(params.id);
    const inst = mockInstitutions.find((i) => i.id === instId);
    if (!inst) {
      return HttpResponse.json(
        { success: false, error: { message: 'Institution not found' } },
        { status: 404 },
      );
    }
    const errors: { row: number; email: string; reason: string }[] = [];
    let successCount = 0;
    for (let i = 0; i < body.students.length; i++) {
      const student = body.students[i];
      if (!student.email || !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(student.email)) {
        errors.push({ row: i + 2, email: student.email || '', reason: 'Invalid email format' });
        continue;
      }
      if (!student.name || student.name.trim().length < 2) {
        errors.push({ row: i + 2, email: student.email, reason: 'Name must be at least 2 characters' });
        continue;
      }
      successCount++;
    }
    return HttpResponse.json({
      success: true,
      data: { successCount, failureCount: errors.length, errors },
    });
  }),

  // ─── Admin Course Moderation Endpoints ──────────────────────────────────

  http.get(`${API_BASE}/admin/courses`, async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const search = url.searchParams.get('search');
    const isPublished = url.searchParams.get('isPublished');

    let filtered = [...mockAdminCourses];
    if (isPublished === 'true') filtered = filtered.filter((c) => c.isPublished);
    if (isPublished === 'false') filtered = filtered.filter((c) => !c.isPublished);
    if (search) filtered = filtered.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));

    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    return HttpResponse.json({
      success: true,
      data: {
        courses: paged,
        total: filtered.length,
        page,
        limit,
      },
    });
  }),

  http.patch(`${API_BASE}/admin/courses/:id/approve`, async ({ params }) => {
    await delay(150);
    const course = mockAdminCourses.find((c) => c.id === Number(params.id));
    if (!course) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Course not found' } },
        { status: 404 },
      );
    }
    course.isPublished = true;
    return HttpResponse.json({ success: true, data: { message: 'Course approved' } });
  }),

  http.patch(`${API_BASE}/admin/courses/:id/reject`, async ({ params }) => {
    await delay(150);
    const idx = mockAdminCourses.findIndex((c) => c.id === Number(params.id));
    if (idx === -1) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Course not found' } },
        { status: 404 },
      );
    }
    mockAdminCourses.splice(idx, 1);
    return HttpResponse.json({ success: true, data: { message: 'Course rejected' } });
  }),

  http.patch(`${API_BASE}/admin/courses/:id/suspend`, async ({ params }) => {
    await delay(150);
    const course = mockAdminCourses.find((c) => c.id === Number(params.id));
    if (!course) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Course not found' } },
        { status: 404 },
      );
    }
    course.isPublished = false;
    return HttpResponse.json({ success: true, data: { message: 'Course suspended' } });
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
