import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RazorpayService } from '../services/razorpay.service';

describe('RazorpayService', () => {
  let service: RazorpayService;
  let configService: ConfigService;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          RAZORPAY_KEY_ID: 'test_key_id',
          RAZORPAY_KEY_SECRET: 'test_key_secret',
          RAZORPAY_WEBHOOK_SECRET: 'test_webhook_secret',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RazorpayService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<RazorpayService>(RazorpayService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isConfigured', () => {
    it('should return true when credentials are set', () => {
      expect(service.isConfigured()).toBe(true);
    });

    it('should return false when key ID is missing', async () => {
      const mockConfig = {
        get: jest.fn((key: string) => {
          const config: Record<string, string> = {
            RAZORPAY_KEY_ID: '',
            RAZORPAY_KEY_SECRET: 'test_key_secret',
            RAZORPAY_WEBHOOK_SECRET: 'test_webhook_secret',
          };
          return config[key];
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          RazorpayService,
          { provide: ConfigService, useValue: mockConfig },
        ],
      }).compile();

      const svc = module.get<RazorpayService>(RazorpayService);
      expect(svc.isConfigured()).toBe(false);
    });
  });

  describe('verifyPaymentSignature', () => {
    it('should return true for a valid signature', () => {
      // We need to generate the expected signature to test verification
      const crypto = require('crypto');
      const orderId = 'order_123';
      const paymentId = 'pay_123';
      const secret = 'test_key_secret';

      const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const result = service.verifyPaymentSignature(orderId, paymentId, expectedSig);
      expect(result).toBe(true);
    });

    it('should return false for an invalid signature', () => {
      const result = service.verifyPaymentSignature(
        'order_123',
        'pay_123',
        'invalid_signature',
      );
      expect(result).toBe(false);
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should return true for a valid webhook signature', () => {
      const crypto = require('crypto');
      const body = JSON.stringify({ event: 'payment.captured' });
      const secret = 'test_webhook_secret';

      const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      const result = service.verifyWebhookSignature(body, expectedSig);
      expect(result).toBe(true);
    });

    it('should return false for an invalid webhook signature', () => {
      const result = service.verifyWebhookSignature(
        '{"event":"test"}',
        'invalid_signature',
      );
      expect(result).toBe(false);
    });

    it('should return true when webhook secret is not configured', async () => {
      const mockConfig = {
        get: jest.fn((key: string) => {
          const config: Record<string, string> = {
            RAZORPAY_KEY_ID: 'test_key_id',
            RAZORPAY_KEY_SECRET: 'test_key_secret',
            RAZORPAY_WEBHOOK_SECRET: '',
          };
          return config[key];
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          RazorpayService,
          { provide: ConfigService, useValue: mockConfig },
        ],
      }).compile();

      const svc = module.get<RazorpayService>(RazorpayService);
      const result = svc.verifyWebhookSignature('body', 'any_sig');
      expect(result).toBe(true);
    });
  });

  describe('createOrder', () => {
    it('should create an order and return response', async () => {
      // Mock the razorpay instance
      const mockOrder = {
        id: 'order_abc123',
        amount: 50000,
        currency: 'INR',
        receipt: 'course_1_student_1',
      };

      (service as any).razorpay = {
        orders: {
          create: jest.fn().mockResolvedValue(mockOrder),
        },
      };

      const result = await service.createOrder({
        amount: 50000,
        currency: 'INR',
        receipt: 'course_1_student_1',
      });

      expect(result).toEqual({
        orderId: 'order_abc123',
        amount: 50000,
        currency: 'INR',
        key: 'test_key_id',
        receipt: 'course_1_student_1',
      });

      expect((service as any).razorpay.orders.create).toHaveBeenCalledWith({
        amount: 50000,
        currency: 'INR',
        receipt: 'course_1_student_1',
        notes: {},
      });
    });

    it('should throw when Razorpay is not configured', async () => {
      (service as any).keyId = '';
      (service as any).keySecret = '';

      await expect(
        service.createOrder({
          amount: 50000,
          currency: 'INR',
          receipt: 'test',
        }),
      ).rejects.toThrow('Failed to create payment order');
    });

    it('should throw when order creation fails', async () => {
      (service as any).razorpay = {
        orders: {
          create: jest.fn().mockRejectedValue(new Error('API error')),
        },
      };

      await expect(
        service.createOrder({
          amount: 50000,
          currency: 'INR',
          receipt: 'test',
        }),
      ).rejects.toThrow('Failed to create payment order');
    });
  });

  describe('processRefund', () => {
    it('should process a refund and return result', async () => {
      const mockRefund = {
        id: 'rfn_123',
        amount: 50000,
        status: 'processed',
      };

      (service as any).razorpay = {
        payments: {
          refund: jest.fn().mockResolvedValue(mockRefund),
        },
      };

      const result = await service.processRefund({
        paymentId: 'pay_123',
        amount: 50000,
      });

      expect(result).toEqual({
        refundId: 'rfn_123',
        paymentId: 'pay_123',
        amount: 50000,
        status: 'processed',
      });
    });

    it('should throw when Razorpay is not configured', async () => {
      (service as any).keyId = '';
      (service as any).keySecret = '';

      await expect(
        service.processRefund({ paymentId: 'pay_123' }),
      ).rejects.toThrow('Failed to process refund');
    });

    it('should throw when refund API fails', async () => {
      (service as any).razorpay = {
        payments: {
          refund: jest.fn().mockRejectedValue(new Error('API error')),
        },
      };

      await expect(
        service.processRefund({ paymentId: 'pay_123' }),
      ).rejects.toThrow('Failed to process refund');
    });
  });

  describe('fetchPayment', () => {
    it('should fetch a payment from Razorpay', async () => {
      const mockPayment = { id: 'pay_123', amount: 50000, status: 'captured' };

      (service as any).razorpay = {
        payments: {
          fetch: jest.fn().mockResolvedValue(mockPayment),
        },
      };

      const result = await service.fetchPayment('pay_123');
      expect(result).toEqual(mockPayment);
    });

    it('should return null when not configured', async () => {
      (service as any).keyId = '';
      (service as any).keySecret = '';

      const result = await service.fetchPayment('pay_123');
      expect(result).toBeNull();
    });

    it('should return null on API error', async () => {
      (service as any).razorpay = {
        payments: {
          fetch: jest.fn().mockRejectedValue(new Error('API error')),
        },
      };

      const result = await service.fetchPayment('pay_123');
      expect(result).toBeNull();
    });
  });
});
