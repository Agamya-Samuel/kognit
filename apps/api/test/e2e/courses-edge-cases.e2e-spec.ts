import { APP_GUARD } from '@nestjs/core';
import { NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { CoursesController } from '../../src/modules/courses/courses.controller';
import { CoursesService } from '../../src/modules/courses/courses.service';
import { createE2EApp } from './helpers/e2e-app.helper';

const JWT_SECRET = 'test-jwt-secret-key-for-e2e-testing-min-32-chars';

describe('Courses Edge Cases (e2e)', () => {
  let e2eApp: Awaited<ReturnType<typeof createE2EApp>>;

  const mockCourse = {
    id: 1, instructorId: 10, title: 'Introduction to TypeScript',
    description: 'Learn TypeScript from scratch', thumbnailUrl: null,
    domain: 'Programming', pricingType: 'free', priceInr: 0,
    isPublished: true, deletedAt: null, createdAt: new Date(), updatedAt: new Date(),
  };

  let listCoursesFn = () => Promise.resolve({ courses: [mockCourse], total: 1, page: 1, limit: 20, hasNext: false, hasPrev: false });
  let getCourseFn = () => Promise.resolve(mockCourse);
  let createCourseFn = () => Promise.resolve(mockCourse);
  let updateCourseFn = () => Promise.resolve(mockCourse);
  let deleteCourseFn = () => Promise.resolve(undefined);

  beforeAll(async () => {
    e2eApp = await createE2EApp(
      [CoursesController],
      [
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

  // ─── Empty Course List ────────────────────────────────────────────────────

  describe('GET /api/v1/courses - Empty States', () => {
    it('should return empty list when no courses exist', () => {
      listCoursesFn = () => Promise.resolve({
        courses: [],
        total: 0,
        page: 1,
        limit: 20,
        hasNext: false,
        hasPrev: false,
      });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .get('/api/v1/courses')
        .expect(200)
        .expect((res: any) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toEqual([]);
          expect(res.body.meta.total).toBe(0);
        });
    });

    it('should return empty list when filter matches no courses', () => {
      listCoursesFn = () => Promise.resolve({
        courses: [],
        total: 0,
        page: 1,
        limit: 20,
        hasNext: false,
        hasPrev: false,
      });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .get('/api/v1/courses?domain=NonExistent')
        .expect(200)
        .expect((res: any) => {
          expect(res.body.data).toEqual([]);
          expect(res.body.meta.total).toBe(0);
        });
    });
  });

  // ─── Unicode & Special Characters ─────────────────────────────────────────

  describe('POST /api/v1/courses - Unicode & Special Characters', () => {
    it('should accept course title with unicode characters', () => {
      createCourseFn = () => Promise.resolve({
        ...mockCourse,
        id: 2,
        title: '学习TypeScript基础',
        isPublished: false,
      });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${makeToken('instructor')}`)
        .send({
          title: '学习TypeScript基础',
          domain: 'Programming',
          pricingType: 'free',
        })
        .expect(201);
    });

    it('should accept course title with emojis', () => {
      createCourseFn = () => Promise.resolve({
        ...mockCourse,
        id: 3,
        title: '🚀 TypeScript for Beginners 🔥',
        isPublished: false,
      });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${makeToken('instructor')}`)
        .send({
          title: '🚀 TypeScript for Beginners 🔥',
          domain: 'Programming',
          pricingType: 'free',
        })
        .expect(201);
    });

    it('should accept course title with RTL (right-to-left) text', () => {
      createCourseFn = () => Promise.resolve({
        ...mockCourse,
        id: 4,
        title: 'مقدمة في TypeScript',
        isPublished: false,
      });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${makeToken('instructor')}`)
        .send({
          title: 'مقدمة في TypeScript',
          domain: 'Programming',
          pricingType: 'free',
        })
        .expect(201);
    });

    it('should accept description with special HTML characters', () => {
      createCourseFn = () => Promise.resolve({
        ...mockCourse,
        id: 5,
        title: 'Test Course',
        description: 'Learn about <tags> & "quotes" & \'apostrophes\'',
        isPublished: false,
      });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${makeToken('instructor')}`)
        .send({
          title: 'Test Course',
          description: 'Learn about <tags> & "quotes" & \'apostrophes\'',
          domain: 'Programming',
          pricingType: 'free',
        })
        .expect(201);
    });

    it('should accept domain with unicode', () => {
      createCourseFn = () => Promise.resolve({
        ...mockCourse,
        id: 6,
        title: 'Test',
        domain: '开发',
        isPublished: false,
      });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${makeToken('instructor')}`)
        .send({
          title: 'Test',
          domain: '开发',
          pricingType: 'free',
        })
        .expect(201);
    });
  });

  // ─── 404 and Non-Existent Resources ───────────────────────────────────────

  describe('Course Not Found Scenarios', () => {
    it('should return 404 for non-existent course', () => {
      getCourseFn = () => { throw new NotFoundException('Course not found.'); };
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .get('/api/v1/courses/99999')
        .expect(404)
        .expect((res: any) => {
          expect(res.body.success).toBe(false);
        });
    });

    it('should return 404 when updating non-existent course', () => {
      updateCourseFn = () => { throw new NotFoundException('Course not found.'); };
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .put('/api/v1/courses/99999')
        .set('Authorization', `Bearer ${makeToken('instructor', 10)}`)
        .send({ title: 'Updated' })
        .expect(404);
    });

    it('should return 404 when deleting non-existent course', () => {
      deleteCourseFn = () => { throw new NotFoundException('Course not found.'); };
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .delete('/api/v1/courses/99999')
        .set('Authorization', `Bearer ${makeToken('instructor', 10)}`)
        .expect(404);
    });
  });

  // ─── Already-Deleted / Soft Delete Edge Cases ──────────────────────────────

  describe('Soft Delete Edge Cases', () => {
    it('should allow delete of already-deleted course (idempotent)', () => {
      deleteCourseFn = () => Promise.resolve(undefined);
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .delete('/api/v1/courses/1')
        .set('Authorization', `Bearer ${makeToken('instructor', 10)}`)
        .expect(200);
    });

    it('should not return deleted course in list', () => {
      listCoursesFn = () => Promise.resolve({
        courses: [],
        total: 0,
        page: 1,
        limit: 20,
        hasNext: false,
        hasPrev: false,
      });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .get('/api/v1/courses')
        .expect(200)
        .expect((res: any) => {
          expect(res.body.data).toHaveLength(0);
        });
    });
  });

  // ─── Pagination Boundary Cases ────────────────────────────────────────────

  describe('Pagination Boundary Cases', () => {
    it('should handle page beyond results (returns empty list)', () => {
      listCoursesFn = () => Promise.resolve({
        courses: [],
        total: 5,
        page: 999,
        limit: 20,
        hasNext: false,
        hasPrev: true,
      });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .get('/api/v1/courses?page=999')
        .expect(200)
        .expect((res: any) => {
          expect(res.body.data).toEqual([]);
          expect(res.body.meta.page).toBe(999);
          expect(res.body.meta.total).toBe(5);
        });
    });

    it('should handle page=0 (returns 400 - invalid per DTO @Min(1))', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .get('/api/v1/courses?page=0')
        .expect(400);
    });

    it('should handle negative page number (returns 400 - invalid per DTO @Min(1))', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .get('/api/v1/courses?page=-1')
        .expect(400);
    });

    it('should handle custom limit', () => {
      listCoursesFn = () => Promise.resolve({
        courses: [mockCourse],
        total: 5,
        page: 1,
        limit: 5,
        hasNext: true,
        hasPrev: false,
      });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .get('/api/v1/courses?limit=5')
        .expect(200)
        .expect((res: any) => {
          expect(res.body.meta.limit).toBe(5);
        });
    });

    it('should reject limit over maximum (100)', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .get('/api/v1/courses?limit=999')
        .expect(400);
    });
  });

  // ─── Pricing Edge Cases ───────────────────────────────────────────────────

  describe('Pricing Edge Cases', () => {
    it('should accept zero price for free course', () => {
      createCourseFn = () => Promise.resolve({
        ...mockCourse,
        id: 7,
        title: 'Free Course',
        pricingType: 'free',
        priceInr: 0,
        isPublished: false,
      });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${makeToken('instructor')}`)
        .send({
          title: 'Free Course',
          domain: 'Programming',
          pricingType: 'free',
          priceInr: 0,
        })
        .expect(201);
    });

    it('should reject negative price', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${makeToken('instructor')}`)
        .send({
          title: 'Invalid Price',
          domain: 'Programming',
          pricingType: 'paid',
          priceInr: -100,
        })
        .expect(400);
    });
  });
});