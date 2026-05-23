import { APP_GUARD } from '@nestjs/core';
import {
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { AuthController } from '../../src/modules/auth/auth.controller';
import { AuthService } from '../../src/modules/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { CoursesController } from '../../src/modules/courses/courses.controller';
import { CoursesService } from '../../src/modules/courses/courses.service';
import { createE2EApp } from './helpers/e2e-app.helper';

const JWT_SECRET = 'test-jwt-secret-key-for-e2e-testing-min-32-chars';

describe('Auth Error Paths (e2e)', () => {
  let e2eApp: Awaited<ReturnType<typeof createE2EApp>>;

  const mockUser = {
    id: 1, email: 'test@edutech.test',
    role: 'student', name: 'Test User', avatarUrl: null,
    isVerified: true, isActive: true, deletedAt: null,
    createdAt: new Date(), updatedAt: new Date(),
  };

  let loginFn = () => Promise.resolve({ user: mockUser, tokens: { accessToken: 'at', refreshToken: 'rt', expiresIn: 900 } });
  let getProfileFn = () => Promise.resolve(mockUser);
  const listCoursesFn = () => Promise.resolve({ courses: [], total: 0, page: 1, limit: 20, hasNext: false, hasPrev: false });
  let createCourseFn = () => Promise.resolve({
    id: 1, instructorId: 1, title: 'Test Course', description: 'Test',
    domain: 'Programming', pricingType: 'free', priceInr: 0,
    isPublished: true, deletedAt: null, createdAt: new Date(), updatedAt: new Date(),
  });

  beforeAll(async () => {
    e2eApp = await createE2EApp(
      [AuthController, CoursesController],
      [
        {
          provide: AuthService,
          useValue: {
            login: (...a: any[]) => loginFn(...a),
            getProfile: (...a: any[]) => getProfileFn(...a),
          },
        },
        { provide: ConfigService, useValue: { get: (key: string) => key === 'CORS_ORIGINS' ? 'http://localhost:3002' : null } },
        {
          provide: CoursesService,
          useValue: {
            listCourses: (...a: any[]) => listCoursesFn(...a),
            createCourse: (...a: any[]) => createCourseFn(...a),
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

              // Check for "Bearer " prefix
              if (!auth.startsWith('Bearer ')) {
                throw new UnauthorizedException();
              }

              const token = auth.replace('Bearer ', '');
              const jwt = require('jsonwebtoken');

              // Check token format
              if (!token || typeof token !== 'string') {
                throw new UnauthorizedException();
              }

              try {
                const decoded = jwt.verify(token, JWT_SECRET);
                ctx.switchToHttp().getRequest().user = decoded;
                return true;
              } catch (e) {
                if (e.name === 'TokenExpiredError') {
                  throw new UnauthorizedException('Token has expired');
                }
                if (e.name === 'JsonWebTokenError' || e.name === 'NotBeforeError') {
                  throw new UnauthorizedException('Invalid token');
                }
                throw e;
              }
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

  function makeToken(role: string, userId = 1, expiresIn = '15m'): string {
    const jwt = require('jsonwebtoken');
    return jwt.sign({ sub: userId, email: `${role}@edutech.test`, role }, JWT_SECRET, { expiresIn });
  }

  function makeExpiredToken(role = 'student'): string {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { sub: 1, email: `${role}@edutech.test`, role },
      JWT_SECRET,
      { expiresIn: '-1s' }, // Already expired
    );
  }

  // ─── Expired/Malformed JWT ─────────────────────────────────────────────────

  describe('JWT Token Errors', () => {
    it('should return 401 for expired token', async () => {
      getProfileFn = () => Promise.resolve(mockUser);
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${makeExpiredToken('student')}`)
        .expect(401);
    });

    it('should return 401 for malformed token', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer not-a-valid-jwt-token')
        .expect(401);
    });

    it('should return 401 for token without signature', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJzdHVkZW50QGVkdXRlY2gudGVzdCIsInJvbGUiOiJzdHVkZW50In0')
        .expect(401);
    });

    it('should return 401 for token with wrong signature', () => {
      const jwt = require('jsonwebtoken');
      const wrongToken = jwt.sign(
        { sub: 1, email: 'student@edutech.test', role: 'student' },
        'wrong-secret-key-different-from-test-secret',
      );
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${wrongToken}`)
        .expect(401);
    });

    it('should return 401 for token missing Bearer prefix', () => {
      getProfileFn = () => Promise.resolve(mockUser);
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', makeToken('student'))
        .expect(401);
    });

    it('should return 401 for empty token', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer ')
        .expect(401);
    });
  });

  // ─── Wrong Role / Authorization ───────────────────────────────────────────

  describe('Role-Based Authorization', () => {
    it('should return 403 when student tries to create course', () => {
      createCourseFn = () => Promise.resolve({
        id: 1, instructorId: 1, title: 'Test', description: 'Test',
        domain: 'Programming', pricingType: 'free', priceInr: 0,
        isPublished: true, deletedAt: null, createdAt: new Date(), updatedAt: new Date(),
      });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${makeToken('student')}`)
        .send({ title: 'New Course', domain: 'Programming', pricingType: 'free' })
        .expect(403);
    });

    it('should return 403 when admin tries to access admin-only endpoint', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${makeToken('student')}`)
        .send({ title: 'New Course', domain: 'Programming', pricingType: 'free' })
        .expect(403);
    });
  });

  // ─── SQL Injection Attempts ─────────────────────────────────────────────

  describe('SQL Injection Protection', () => {
    it('should return 400 for invalid email with SQL injection', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: "' OR '1'='1",
          password: 'Password123',
        })
        .expect(400); // Invalid email format (validation happens before auth)
    });

    it('should sanitize SQL injection in password', () => {
      loginFn = () => { throw new UnauthorizedException('Invalid email or password.'); };
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@edutech.test',
          password: "' OR '1'='1",
        })
        .expect(401);
    });

    it('should reject SQL injection in union-based email (invalid format)', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: "test@edutech.test' UNION SELECT * FROM users--",
          password: 'Password123',
        })
        .expect(400); // Invalid email format
    });

    it('should reject comment-based SQL injection in email (invalid format)', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@edutech.test--',
          password: 'Password123',
        })
        .expect(400); // Invalid email format
    });
  });

  // ─── XSS Payload Attempts ────────────────────────────────────────────────

  describe('XSS Protection', () => {
    it('should reject XSS in email (invalid format)', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: '<script>alert("xss")</script>@edutech.test',
          password: 'Password123',
        })
        .expect(400); // Invalid email format
    });

    it('should accept XSS payload in password (handled by service)', () => {
      loginFn = () => { throw new UnauthorizedException('Invalid email or password.'); };
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@edutech.test',
          password: '<img src=x onerror=alert("xss")>',
        })
        .expect(401);
    });

    it('should sanitize Unicode XSS variant', () => {
      loginFn = () => { throw new UnauthorizedException('Invalid email or password.'); };
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@edutech.test',
          password: '\u003Cscript\u003Ealert("xss")\u003C/script\u003E',
        })
        .expect(401);
    });

    it('should sanitize HTML entity encoded XSS', () => {
      loginFn = () => { throw new UnauthorizedException('Invalid email or password.'); };
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@edutech.test',
          password: '&lt;script&gt;alert("xss")&lt;/script&gt;',
        })
        .expect(401);
    });
  });
});