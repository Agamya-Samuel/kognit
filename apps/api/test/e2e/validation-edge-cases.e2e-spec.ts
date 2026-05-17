import { APP_GUARD } from '@nestjs/core';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from '../../src/modules/auth/auth.controller';
import { AuthService } from '../../src/modules/auth/auth.service';
import { createE2EApp } from './helpers/e2e-app.helper';

const JWT_SECRET = 'test-jwt-secret-key-for-e2e-testing-min-32-chars';

describe('Validation Edge Cases (e2e)', () => {
  let e2eApp: Awaited<ReturnType<typeof createE2EApp>>;

  const mockUser = {
    id: 1, email: 'test@edutech.test',
    role: 'student', name: 'Test User', avatarUrl: null,
    isVerified: true, isActive: true, deletedAt: null,
    createdAt: new Date(), updatedAt: new Date(),
  };

  let loginFn = () => Promise.resolve({ user: mockUser, tokens: { accessToken: 'at', refreshToken: 'rt', expiresIn: 900 } });
  let registerFn = () => Promise.resolve({ message: 'Verification code sent.', code: '123456' });

  beforeAll(async () => {
    e2eApp = await createE2EApp(
      [AuthController],
      [
        {
          provide: AuthService,
          useValue: {
            login: (...a: any[]) => loginFn(...a),
            requestRegistrationVerification: (...a: any[]) => registerFn(...a),
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
      ],
    );
  });

  afterAll(async () => { await e2eApp.close(); });

  // ─── Boundary Value Tests ────────────────────────────────────────────────

  describe('POST /api/v1/auth/login - Boundary Values', () => {
    it('should accept email with unicode characters', () => {
      loginFn = () => Promise.resolve({
        user: mockUser,
        tokens: { accessToken: 'at', refreshToken: 'rt', expiresIn: 900 },
      });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'tëst@edutech.test', password: 'Password123' })
        .expect(200);
    });

    it('should accept password at max length (128 chars)', () => {
      loginFn = () => Promise.resolve({
        user: mockUser,
        tokens: { accessToken: 'at', refreshToken: 'rt', expiresIn: 900 },
      });
      const request = require('supertest');
      const longPassword = 'A'.repeat(128);
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test@edutech.test', password: longPassword })
        .expect(200);
    });

    it('should reject empty password string', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test@edutech.test', password: '' })
        .expect(400);
    });
  });

  // ─── Special Characters & Unicode ─────────────────────────────────────────

  describe('POST /api/v1/auth/login - Special Characters & Unicode', () => {
    it('should accept unicode characters in email', () => {
      loginFn = () => Promise.resolve({
        user: mockUser,
        tokens: { accessToken: 'at', refreshToken: 'rt', expiresIn: 900 },
      });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'tëst@edutech.test', password: 'Password123' })
        .expect(200);
    });

    it('should accept special chars in password', () => {
      loginFn = () => Promise.resolve({
        user: mockUser,
        tokens: { accessToken: 'at', refreshToken: 'rt', expiresIn: 900 },
      });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test@edutech.test', password: 'P@ssw0rd!#$%^&*()' })
        .expect(200);
    });

    it('should accept unicode in password', () => {
      loginFn = () => Promise.resolve({
        user: mockUser,
        tokens: { accessToken: 'at', refreshToken: 'rt', expiresIn: 900 },
      });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test@edutech.test', password: 'Pässwörd123' })
        .expect(200);
    });
  });

  // ─── Unknown Fields (forbidNonWhitelisted) ────────────────────────────────

  describe('POST /api/v1/auth/login - Unknown Fields', () => {
    it('should reject unknown field in request body', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@edutech.test',
          password: 'Password123',
          unknownField: 'should be rejected',
        })
        .expect(400);
    });

    it('should reject multiple unknown fields', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@edutech.test',
          password: 'Password123',
          field1: 'test1',
          field2: 'test2',
          field3: 'test3',
        })
        .expect(400);
    });
  });

  // ─── Empty Body & Wrong Types ─────────────────────────────────────────────

  describe('POST /api/v1/auth/login - Empty Body & Wrong Types', () => {
    it('should reject empty body', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);
    });

    it('should reject null email', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: null, password: 'Password123' })
        .expect(400);
    });

    it('should reject email as array', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: ['test@edutech.test'], password: 'Password123' })
        .expect(400);
    });
  });

  // ─── Register Request Edge Cases ─────────────────────────────────────────

  describe('POST /api/v1/auth/register/request - Edge Cases', () => {
    it('should reject malformed email', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/register/request')
        .send({ email: 'not-an-email' })
        .expect(400);
    });

    it('should reject email without @', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/register/request')
        .send({ email: 'edutech.test' })
        .expect(400);
    });

    it('should reject email with multiple @', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/register/request')
        .send({ email: 'test@@edutech.test' })
        .expect(400);
    });

    it('should accept valid unicode email', () => {
      registerFn = () => Promise.resolve({ message: 'Verification code sent.', code: '123456' });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/register/request')
        .send({ email: '用户@edutech.test' })
        .expect(200);
    });

    it('should reject unknown field', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/register/request')
        .send({ email: 'test@edutech.test', extra: 'field' })
        .expect(400);
    });
  });
});