import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from '../payments.controller';
import { PaymentsService } from '../services/payments.service';
import { CreateOrderResult, PaymentHistoryResult } from '../services/payments.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let paymentsService: PaymentsService;

  const mockUser = {
    sub: 1,
    email: 'student@test.com',
    role: 'student',
  };

  const mockAdmin = {
    sub: 2,
    email: 'admin@test.com',
    role: 'admin',
  };

  const mockOrderResult: CreateOrderResult = {
    orderId: 'order_abc123',
    amount: 500,
    currency: 'INR',
    key: 'test_key_id',
    receipt: 'course_1_student_1',
    paymentRecordId: 1,
  };

  beforeEach(async () => {
    const mockPaymentsService = {
      createOrder: jest.fn(),
      verifyAndEnroll: jest.fn(),
      getPaymentHistory: jest.fn(),
      getPaymentById: jest.fn(),
      processRefund: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    paymentsService = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order and return success response', async () => {
      jest.spyOn(paymentsService, 'createOrder').mockResolvedValue(mockOrderResult);

      const result = await controller.createOrder(mockUser as any, { courseId: 1 });

      expect(result).toEqual({
        success: true,
        data: mockOrderResult,
        error: null,
      });

      expect(paymentsService.createOrder).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment and return enrollment result', async () => {
      const verifyResult = { success: true, enrollmentId: 1 };
      jest.spyOn(paymentsService, 'verifyAndEnroll').mockResolvedValue(verifyResult);

      const dto = {
        razorpayOrderId: 'order_123',
        razorpayPaymentId: 'pay_123',
        razorpaySignature: 'sig_abc',
      };

      const result = await controller.verifyPayment(mockUser as any, dto);

      expect(result).toEqual({
        success: true,
        data: verifyResult,
        error: null,
      });

      expect(paymentsService.verifyAndEnroll).toHaveBeenCalledWith(
        1,
        'order_123',
        'pay_123',
        'sig_abc',
      );
    });
  });

  describe('getPaymentHistory', () => {
    it('should return paginated payment history', async () => {
      const historyResult: PaymentHistoryResult = {
        payments: [{ id: 1, amount: 500 }],
        total: 1,
        page: 1,
        limit: 10,
      };
      jest.spyOn(paymentsService, 'getPaymentHistory').mockResolvedValue(historyResult);

      const result = await controller.getPaymentHistory(mockUser as any, { page: 1, limit: 10 });

      expect(result).toEqual({
        success: true,
        data: [{ id: 1, amount: 500 }],
        meta: { page: 1, limit: 10, total: 1 },
        error: null,
      });

      expect(paymentsService.getPaymentHistory).toHaveBeenCalledWith(1, {
        page: 1,
        limit: 10,
        status: undefined,
        courseId: undefined,
      });
    });
  });

  describe('getPayment', () => {
    it('should return a single payment', async () => {
      const payment = { id: 1, amount: 500, status: 'paid' };
      jest.spyOn(paymentsService, 'getPaymentById').mockResolvedValue(payment);

      const result = await controller.getPayment(mockUser as any, 1);

      expect(result).toEqual({
        success: true,
        data: payment,
        error: null,
      });

      expect(paymentsService.getPaymentById).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('processRefund', () => {
    it('should process a refund as admin', async () => {
      const refundResult = { refundId: 'rfn_123', status: 'processed' };
      jest.spyOn(paymentsService, 'processRefund').mockResolvedValue(refundResult);

      const dto = { paymentId: 1, reason: 'Customer requested' };

      const result = await controller.processRefund(mockAdmin as any, dto);

      expect(result).toEqual({
        success: true,
        data: refundResult,
        error: null,
      });

      expect(paymentsService.processRefund).toHaveBeenCalledWith(
        2,
        1,
        'Customer requested',
        undefined,
      );
    });

    it('should process partial refund with amount', async () => {
      const refundResult = { refundId: 'rfn_456', status: 'processed' };
      jest.spyOn(paymentsService, 'processRefund').mockResolvedValue(refundResult);

      const dto = { paymentId: 1, amount: 25000, reason: 'Partial refund' };

      const result = await controller.processRefund(mockAdmin as any, dto);

      expect(result.success).toBe(true);
      expect(paymentsService.processRefund).toHaveBeenCalledWith(
        2,
        1,
        'Partial refund',
        25000,
      );
    });
  });
});
