import { APP_GUARD } from '@nestjs/core';
import {
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { AuthController } from '../../src/modules/auth/auth.controller';
import { AuthService } from '../../src/modules/auth/auth.service';
import { createE2EApp } from './helpers/e2e-app.helper';

const JWT_SECRET = 'test-jwt-secret-key-for-e2e-testing-min-32-chars';

describe('Auth (e2e)', () => {
  let e2eApp: Awaited<ReturnType<typeof createE2EApp>>;

  const mockUser = {
    id: 1, email: 'test@edutech.test',
    role: 'student', name: 'Test User', avatarUrl: null,
    isVerified: true, isActive: true, deletedAt: null,
    createdAt: new Date(), updatedAt: new Date(),
  };

  // Mutable mock functions — reassigned per test
  let loginFn = () => Promise.resolve({ user: mockUser, tokens: { accessToken: 'at', refreshToken: 'rt', expiresIn: 900 } });
  let registerFn = () => Promise.resolve({ message: 'Verification code sent.', code: '123456' });
  let getProfileFn = () => Promise.resolve(mockUser);
  let logoutFn = () => Promise.resolve({ message: 'Logged out successfully.' });
  let forgotPasswordFn = () => Promise.resolve({ message: 'If an account exists with this email, a password reset link has been sent.' });

  beforeAll(async () => {
    e2eApp = await createE2EApp(
      [AuthController],
      [
        // Mock AuthService — the controller only delegates to it
        {
          provide: AuthService,
          useValue: {
            login: (...a: any[]) => loginFn(...a),
            requestRegistrationVerification: (...a: any[]) => registerFn(...a),
            getProfile: (...a: any[]) => getProfileFn(...a),
            logout: (...a: any[]) => logoutFn(...a),
            forgotPassword: (...a: any[]) => forgotPasswordFn(...a),
          },
        },
        // Register mock guards as global APP_GUARD providers
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

  function makeToken(role: string, userId = 1): string {
    const jwt = require('jsonwebtoken');
    return jwt.sign({ sub: userId, email: `${role}@edutech.test`, role }, JWT_SECRET);
  }

  // ─── POST /api/v1/auth/login ───────────────────────────────────────────

  describe('POST /api/v1/auth/login', () => {
    it('should return 401 for non-existent user', () => {
      loginFn = () => { throw new UnauthorizedException('Invalid email or password.'); };
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@edutech.test', password: 'Password123' })
        .expect(401);
    });

    it('should return tokens on successful login', () => {
      loginFn = () => Promise.resolve({
        user: mockUser,
        tokens: { accessToken: 'at', refreshToken: 'rt', expiresIn: 900 },
      });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test@edutech.test', password: 'Password123' })
        .expect(200) // @HttpCode(HttpStatus.OK)
        .expect((res: any) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('tokens');
          expect(res.body.data.user.email).toBe('test@edutech.test');
        });
    });

    it('should return 400 for invalid email format', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'not-an-email', password: 'Password123' })
        .expect(400);
    });

    it('should return 400 for missing password', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test@edutech.test' })
        .expect(400);
    });
  });

  // ─── POST /api/v1/auth/register/request ────────────────────────────────

  describe('POST /api/v1/auth/register/request', () => {
    it('should accept a valid email and return verification code', () => {
      registerFn = () => Promise.resolve({ message: 'Verification code sent.', code: '123456' });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/register/request')
        .send({ email: 'newuser@edutech.test' })
        .expect(200) // @HttpCode(HttpStatus.OK)
        .expect((res: any) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('code');
        });
    });

    it('should return 409 for existing email', () => {
      registerFn = () => { throw new ConflictException('An account with this email already exists.'); };
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/register/request')
        .send({ email: 'test@edutech.test' })
        .expect(409);
    });

    it('should return 400 for invalid email', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/register/request')
        .send({ email: 'invalid' })
        .expect(400);
    });
  });

  // ─── GET /api/v1/auth/me ───────────────────────────────────────────────

  describe('GET /api/v1/auth/me', () => {
    it('should return user profile with valid token', () => {
      const sanitizedUser = { ...mockUser };
      delete (sanitizedUser as any).passwordHash;
      getProfileFn = () => Promise.resolve(sanitizedUser);
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${makeToken('student')}`)
        .expect(200)
        .expect((res: any) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.email).toBe('test@edutech.test');
        });
    });

    it('should return 401 without token', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);
    });
  });

  // ─── POST /api/v1/auth/logout ──────────────────────────────────────────

  describe('POST /api/v1/auth/logout', () => {
    it('should logout with valid token', () => {
      logoutFn = () => Promise.resolve({ message: 'Logged out successfully.' });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${makeToken('student')}`)
        .expect(200) // @HttpCode(HttpStatus.OK)
        .expect((res: any) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('should return 401 without token', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/logout')
        .expect(401);
    });
  });

  // ─── POST /api/v1/auth/forgot-password ─────────────────────────────────

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should always return 200 (prevent email enumeration)', () => {
      forgotPasswordFn = () => Promise.resolve({ message: 'If an account exists with this email, a password reset link has been sent.' });
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'anyone@edutech.test' })
        .expect(200); // @HttpCode(HttpStatus.OK)
    });

    it('should return 400 for invalid email', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'not-an-email' })
        .expect(400);
    });
  });
});
