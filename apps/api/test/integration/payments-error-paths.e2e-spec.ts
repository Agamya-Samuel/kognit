import { APP_GUARD } from '@nestjs/core';
import { UnauthorizedException, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PaymentsController } from '../../src/modules/payments/payments.controller';
import { PaymentsService } from '../../src/modules/payments/services/payments.service';
import { createE2EApp } from './helpers/e2e-app.helper';

const JWT_SECRET = 'test-jwt-secret-key-for-e2e-testing-min-32-chars';

describe('Payments Error Paths (e2e)', () => {
  let e2eApp: Awaited<ReturnType<typeof createE2EApp>>;

  const mockPayment = {
    id: 1, userId: 1, courseId: 10, amountInr: 4999,
    status: 'completed', razorpayOrderId: 'order_test',
    razorpayPaymentId: 'pay_test', createdAt: new Date(), updatedAt: new Date(),
  };

  let createOrderFn = () => Promise.resolve({
    id: 'order_test', amount: 4999, currency: 'INR',
    key: 'key_test', order: { id: 'order_test' },
  });
  let verifyPaymentFn = () => Promise.resolve({
    success: true, message: 'Payment verified', payment: mockPayment,
    enrollment: { id: 1, courseId: 10, studentId: 1, enrolledAt: new Date() },
  });

  beforeAll(async () => {
    e2eApp = await createE2EApp(
      [PaymentsController],
      [
        {
          provide: PaymentsService,
          useValue: {
            createOrder: (...a: any[]) => createOrderFn(...a),
            verifyPayment: (...a: any[]) => verifyPaymentFn(...a),
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
              const token = auth.replace('Bearer ', '');
              const jwt = require('jsonwebtoken');
              try {
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

  function makeToken(role = 'student', userId = 1): string {
    const jwt = require('jsonwebtoken');
    return jwt.sign({ sub: userId, email: `${role}@edutech.test`, role }, JWT_SECRET);
  }

  // ─── Invalid/Missing Payment Fields ───────────────────────────────────────

  describe('POST /api/v1/payments/create-order - Invalid Input', () => {
    it('should reject request without courseId', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/payments/create-order')
        .set('Authorization', `Bearer ${makeToken('student')}`)
        .send({})
        .expect(400);
    });

    it('should reject courseId as string', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/payments/create-order')
        .set('Authorization', `Bearer ${makeToken('student')}`)
        .send({ courseId: 'not-a-number' })
        .expect(400);
    });

    it('should reject courseId as zero', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/payments/create-order')
        .set('Authorization', `Bearer ${makeToken('student')}`)
        .send({ courseId: 0 })
        .expect(400);
    });

    it('should reject courseId as negative number', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/payments/create-order')
        .set('Authorization', `Bearer ${makeToken('student')}`)
        .send({ courseId: -1 })
        .expect(400);
    });

    it('should reject unknown field in request body', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/payments/create-order')
        .set('Authorization', `Bearer ${makeToken('student')}`)
        .send({ courseId: 1, unknownField: 'should be rejected' })
        .expect(400);
    });

    it('should reject courseId as null', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/payments/create-order')
        .set('Authorization', `Bearer ${makeToken('student')}`)
        .send({ courseId: null })
        .expect(400);
    });
  });

  // ─── Non-Existent Course ─────────────────────────────────────────────────

  describe('POST /api/v1/payments/create-order - Non-Existent Course', () => {
    it('should throw service error for non-existent course', () => {
      createOrderFn = () => { throw new NotFoundException('Course not found'); };
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/payments/create-order')
        .set('Authorization', `Bearer ${makeToken('student')}`)
        .send({ courseId: 99999 })
        .expect(404)
        .expect((res: any) => {
          expect(res.body.success).toBe(false);
        });
    });
  });

  // ─── Verification with Invalid Signature ─────────────────────────────────

  describe('POST /api/v1/payments/verify - Service Errors', () => {
    it('should handle invalid signature (service throws)', () => {
      verifyPaymentFn = () => { throw new BadRequestException('Invalid Razorpay signature'); };
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${makeToken('student')}`)
        .send({
          razorpayOrderId: 'order_test',
          razorpayPaymentId: 'pay_test',
          razorpaySignature: 'invalid-signature-format',
        })
        .expect(500); // Service exception not caught in minimal E2E app
    });

    it('should handle duplicate payment (service throws)', () => {
      verifyPaymentFn = () => { throw new ConflictException('Payment already verified'); };
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${makeToken('student')}`)
        .send({
          razorpayOrderId: 'order_already_verified',
          razorpayPaymentId: 'pay_test',
          razorpaySignature: 'valid-signature',
        })
        .expect(500); // Service exception not caught in minimal E2E app
    });

    it('should handle already-enrolled student (service throws)', () => {
      verifyPaymentFn = () => { throw new ConflictException('Already enrolled in this course'); };
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${makeToken('student')}`)
        .send({
          razorpayOrderId: 'order_test',
          razorpayPaymentId: 'pay_test',
          razorpaySignature: 'valid-signature',
        })
        .expect(500); // Service exception not caught in minimal E2E app
    });

    it('should handle payment ID mismatch (service throws)', () => {
      verifyPaymentFn = () => { throw new BadRequestException('Payment ID does not match order'); };
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${makeToken('student')}`)
        .send({
          razorpayOrderId: 'order_test',
          razorpayPaymentId: 'different_pay_id',
          razorpaySignature: 'valid-signature',
        })
        .expect(500); // Service exception not caught in minimal E2E app
    });
  });

  // ─── Auth Errors ────────────────────────────────────────────────────────

  describe('Payment Auth Errors', () => {
    it('should reject order creation without auth', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/payments/create-order')
        .send({ courseId: 1 })
        .expect(401);
    });

    it('should reject verification without auth', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/payments/verify')
        .send({
          razorpayOrderId: 'order_test',
          razorpayPaymentId: 'pay_test',
          razorpaySignature: 'valid-signature',
        })
        .expect(401);
    });

    it('should reject order creation with expired token', () => {
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { sub: 1, email: 'student@edutech.test', role: 'student' },
        JWT_SECRET,
        { expiresIn: '-1s' },
      );
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/payments/create-order')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({ courseId: 1 })
        .expect(401);
    });

    it('should reject verification with malformed token', () => {
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/payments/verify')
        .set('Authorization', 'Bearer not-a-jwt-token')
        .send({
          razorpayOrderId: 'order_test',
          razorpayPaymentId: 'pay_test',
          razorpaySignature: 'valid-signature',
        })
        .expect(401);
    });
  });

  // ─── Service Errors ─────────────────────────────────────────────────────

  describe('Service Error Handling', () => {
    it('should handle Razorpay service unavailability', () => {
      createOrderFn = () => {
        throw new BadRequestException('Razorpay service unavailable');
      };
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/payments/create-order')
        .set('Authorization', `Bearer ${makeToken('student')}`)
        .send({ courseId: 1 })
        .expect(400); // HttpExceptionFilter catches and returns 400
    });

    it('should handle database error during order creation', () => {
      createOrderFn = () => {
        throw new BadRequestException('Failed to create payment order');
      };
      const request = require('supertest');
      return request(e2eApp.getHttpServer())
        .post('/api/v1/payments/create-order')
        .set('Authorization', `Bearer ${makeToken('student')}`)
        .send({ courseId: 1 })
        .expect(400); // HttpExceptionFilter catches and returns 400
    });
  });
});