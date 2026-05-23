import { APP_GUARD } from '@nestjs/core';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CoursesController } from '../../src/modules/courses/courses.controller';
import { CoursesService } from '../../src/modules/courses/courses.service';
import { createE2EApp } from './helpers/e2e-app.helper';

const JWT_SECRET = 'test-jwt-secret-key-for-e2e-testing-min-32-chars';

describe('Courses (e2e)', () => {
  let e2eApp: Awaited<ReturnType<typeof createE2EApp>>;

  const mockCourse = {
    id: 1, instructorId: 10, title: 'Introduction to TypeScript',
    description: 'Learn TypeScript from scratch', thumbnailUrl: null,
    domain: 'Programming', pricingType: 'free', priceInr: 0,
    isPublished: true, deletedAt: null, createdAt: new Date(), updatedAt: new Date(),
  };

  // Mutable mock functions — reassigned per test
  let listCoursesFn = () => Promise.resolve({ courses: [mockCourse], total: 1, page: 1, limit: 20, hasNext: false, hasPrev: false });
  let getCourseFn = () => Promise.resolve(mockCourse);
  let createCourseFn = () => Promise.resolve(mockCourse);
  let updateCourseFn = () => Promise.resolve(mockCourse);
  let deleteCourseFn = () => Promise.resolve(undefined);

  beforeAll(async () => {
    e2eApp = await createE2EApp(
      [CoursesController],
      [
        // Mock CoursesService — the controller only delegates to it
        {
          provide: CoursesService,
          useValue: {
            listCourses: (...a: any[]) => listCoursesFn(...a),
            getCourseById: (...a: any[]) => getCourseFn(...a),
            createCourse: (...a: any[]) => createCourseFn(...a),
            updateCourse: (...a: any[]) => updateCourseFn(...a),
            deleteCourse: (...a: any[]) => deleteCourseFn(...a),
          },
        },
        // Global guard 1: JWT auth (checks @Public() + Bearer token)
        {
          provide: APP_GUARD,
          useValue: {
            canActivate: (ctx: any) => {
              const Reflector = require('@nestjs/core').Reflector;
              const reflector = new Reflector();
              const isPublic = reflector.getAllAndOverride('isPublic', [
                ctx.getHandler(), ctx.getClass(),
              ]);
              if (isPublic) return true;
              const auth = ctx.switchToHttp().getRequest().headers?.authorization;
              if (!auth) throw new UnauthorizedException();
              try {
                const token = auth.replace('Bearer ', '');
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, JWT_SECRET);
                ctx.switchToHttp().getRequest().user = decoded;
                return true;
              } catch (e) { throw e instanceof UnauthorizedException ? e : new UnauthorizedException(); }
            },
          },
        },
        // Global guard 2: Roles (checks @Roles() decorator)
        {
          provide: APP_GUARD,
          useValue: {
            canActivate: (ctx: any) => {
              const Reflector = require('@nestjs/core').Reflector;
              const reflector = new Reflector();
              const requiredRoles = reflector.getAllAndOverride('roles', [
                ctx.getHandler(), ctx.getClass(),
              ]);
              if (!requiredRoles || requiredRoles.length === 0) return true;
              const user = ctx.switchToHttp().getRequest().user;
              if (!user) return false;
              return requiredRoles.includes(user.role);
            },
          },
        },
      ],
    );
  });

  afterAll(async () => { await e2eApp.close(); });

  function makeToken(role: string, userId = 1): string {
    const jwt = require('jsonwebtoken');
    return jwt.sign({ sub: userId, email: `${role}@edutech.test`, role }, JWT_SECRET);
  }

  // ─── GET /api/v1/courses (public) ─────────────────────────────────────

  describe('GET /api/v1/courses', () => {
    it('should list published courses (public)', () => {
      listCoursesFn = () => Promise.resolve({
        courses: [mockCourse], total: 1, page: 1, limit: 20, hasNext: false, hasPrev: false,
      });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .get('/api/v1/courses')
        .expect(200)
        .expect((res: any) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveLength(1);
          expect(res.body.meta).toHaveProperty('total', 1);
        });
    });
  });

  // ─── GET /api/v1/courses/:id (public) ──────────────────────────────────

  describe('GET /api/v1/courses/:id', () => {
    it('should return a published course by ID', () => {
      getCourseFn = () => Promise.resolve(mockCourse);
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .get('/api/v1/courses/1')
        .expect(200)
        .expect((res: any) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.title).toBe('Introduction to TypeScript');
        });
    });

    it('should return 404 for non-existent course', () => {
      getCourseFn = () => { throw new NotFoundException('Course not found.'); };
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .get('/api/v1/courses/999')
        .expect(404);
    });
  });

  // ─── POST /api/v1/courses (instructor/admin only) ──────────────────────

  describe('POST /api/v1/courses', () => {
    it('should return 401 without token', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/courses')
        .send({ title: 'New Course', domain: 'Programming', pricingType: 'free' })
        .expect(401);
    });

    it('should return 403 for student role', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${makeToken('student')}`)
        .send({ title: 'New Course', domain: 'Programming', pricingType: 'free' })
        .expect(403);
    });

    it('should create course as instructor', () => {
      createCourseFn = () => Promise.resolve({ ...mockCourse, id: 2, title: 'New Course', isPublished: false });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${makeToken('instructor')}`)
        .send({ title: 'New Course', domain: 'Programming', pricingType: 'free' })
        .expect(201)
        .expect((res: any) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.title).toBe('New Course');
          expect(res.body.data.isPublished).toBe(false);
        });
    });

    it('should create course as admin', () => {
      createCourseFn = () => Promise.resolve({ ...mockCourse, id: 3, title: 'Admin Course', pricingType: 'paid', priceInr: 4999 });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${makeToken('admin')}`)
        .send({ title: 'Admin Course', domain: 'DevOps', pricingType: 'paid', priceInr: 4999 })
        .expect(201)
        .expect((res: any) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.priceInr).toBe(4999);
        });
    });

    it('should return 400 for missing title', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${makeToken('instructor')}`)
        .send({ domain: 'Programming', pricingType: 'free' })
        .expect(400);
    });

    it('should return 400 for invalid pricingType', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${makeToken('instructor')}`)
        .send({ title: 'Test', domain: 'Programming', pricingType: 'invalid' })
        .expect(400);
    });
  });

  // ─── PUT /api/v1/courses/:id ───────────────────────────────────────────

  describe('PUT /api/v1/courses/:id', () => {
    it('should return 401 without token', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .put('/api/v1/courses/1')
        .send({ title: 'Updated' })
        .expect(401);
    });

    it('should return 403 for student role', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .put('/api/v1/courses/1')
        .set('Authorization', `Bearer ${makeToken('student')}`)
        .send({ title: 'Updated' })
        .expect(403);
    });

    it('should update course as owner instructor', () => {
      updateCourseFn = () => Promise.resolve({ ...mockCourse, title: 'Updated Title' });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .put('/api/v1/courses/1')
        .set('Authorization', `Bearer ${makeToken('instructor', 10)}`)
        .send({ title: 'Updated Title' })
        .expect(200)
        .expect((res: any) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.title).toBe('Updated Title');
        });
    });
  });

  // ─── DELETE /api/v1/courses/:id ────────────────────────────────────────

  describe('DELETE /api/v1/courses/:id', () => {
    it('should return 401 without token', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .delete('/api/v1/courses/1')
        .expect(401);
    });

    it('should return 403 for student role', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .delete('/api/v1/courses/1')
        .set('Authorization', `Bearer ${makeToken('student')}`)
        .expect(403);
    });

    it('should soft-delete course as owner instructor', () => {
      deleteCourseFn = () => Promise.resolve(undefined);
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .delete('/api/v1/courses/1')
        .set('Authorization', `Bearer ${makeToken('instructor', 10)}`)
        .expect(200)
        .expect((res: any) => {
          expect(res.body.success).toBe(true);
        });
    });
  });
});
