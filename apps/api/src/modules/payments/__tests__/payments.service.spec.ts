import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { PaymentsRepository } from '../../../db/repositories/payments.repository';
import { EnrollmentsRepository } from '../../../db/repositories/enrollments.repository';
import { CoursesRepository } from '../../../db/repositories/courses.repository';
import { RazorpayService } from '../services/razorpay.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentsRepo: jest.Mocked<PaymentsRepository>;
  let enrollmentsRepo: jest.Mocked<EnrollmentsRepository>;
  let coursesRepo: jest.Mocked<CoursesRepository>;
  let razorpayService: jest.Mocked<RazorpayService>;

  const mockCourse = {
    id: 1,
    title: 'React Masterclass',
    pricingType: 'paid',
    status: 'published',
    priceInr: 1999,
  };

  const mockFreeCourse = {
    id: 2,
    title: 'Free Course',
    pricingType: 'free',
    status: 'published',
    priceInr: 0,
  };

  const mockUnpublishedCourse = {
    id: 3,
    title: 'Draft Course',
    pricingType: 'paid',
    status: 'draft',
    priceInr: 999,
  };

  const mockOrderResult = {
    orderId: 'order_abc123',
    amount: 199900,
    currency: 'INR',
  };

  const mockPayment = {
    id: 10,
    studentId: 1,
    courseId: 1,
    razorpayOrderId: 'order_abc123',
    razorpayPaymentId: 'pay_xyz789',
    amount: 1999,
    currency: 'INR',
    status: 'pending',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PaymentsRepository,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            findById: jest.fn(),
            findByRazorpayOrderId: jest.fn(),
            findMany: jest.fn(),
          },
        },
        {
          provide: EnrollmentsRepository,
          useValue: {
            create: jest.fn(),
            checkEnrollmentExists: jest.fn(),
          },
        },
        {
          provide: CoursesRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: RazorpayService,
          useValue: {
            isConfigured: jest.fn().mockReturnValue(true),
            createOrder: jest.fn(),
            verifyPaymentSignature: jest.fn(),
            processRefund: jest.fn(),
            keyId: 'test_key_id',
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    paymentsRepo = module.get(PaymentsRepository);
    enrollmentsRepo = module.get(EnrollmentsRepository);
    coursesRepo = module.get(CoursesRepository);
    razorpayService = module.get(RazorpayService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should throw NotFoundException when course does not exist', async () => {
      coursesRepo.findById.mockResolvedValue(null);

      await expect(service.createOrder(1, 999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for free courses', async () => {
      coursesRepo.findById.mockResolvedValue(mockFreeCourse as any);

      await expect(service.createOrder(1, 2)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for unpublished courses', async () => {
      coursesRepo.findById.mockResolvedValue(mockUnpublishedCourse as any);

      await expect(service.createOrder(1, 3)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when course price is invalid', async () => {
      coursesRepo.findById.mockResolvedValue({ ...mockCourse, priceInr: 0 } as any);

      await expect(service.createOrder(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when student is already enrolled', async () => {
      coursesRepo.findById.mockResolvedValue(mockCourse as any);
      enrollmentsRepo.checkEnrollmentExists.mockResolvedValue(true);

      await expect(service.createOrder(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('should return existing pending payment order if one exists', async () => {
      coursesRepo.findById.mockResolvedValue(mockCourse as any);
      enrollmentsRepo.checkEnrollmentExists.mockResolvedValue(false);
      paymentsRepo.findMany.mockResolvedValue({
        data: [mockPayment],
        total: 1,
      } as any);

      const result = await service.createOrder(1, 1);
      expect(result.orderId).toBe('order_abc123');
      expect(result.paymentRecordId).toBe(10);
      expect(razorpayService.createOrder).not.toHaveBeenCalled();
    });

    it('should create a new Razorpay order when no pending payment exists', async () => {
      coursesRepo.findById.mockResolvedValue(mockCourse as any);
      enrollmentsRepo.checkEnrollmentExists.mockResolvedValue(false);
      paymentsRepo.findMany.mockResolvedValue({ data: [], total: 0 } as any);
      razorpayService.createOrder.mockResolvedValue(mockOrderResult as any);
      paymentsRepo.create.mockResolvedValue({ ...mockPayment, id: 11 } as any);

      const result = await service.createOrder(1, 1);
      expect(result.orderId).toBe('order_abc123');
      expect(razorpayService.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 199900, currency: 'INR' }),
      );
    });
  });

  describe('verifyAndEnroll', () => {
    it('should throw BadRequestException for invalid signature', async () => {
      razorpayService.verifyPaymentSignature.mockReturnValue(false);

      await expect(
        service.verifyAndEnroll(1, 'order_1', 'pay_1', 'bad_sig'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when payment record is missing', async () => {
      razorpayService.verifyPaymentSignature.mockReturnValue(true);
      paymentsRepo.findByRazorpayOrderId.mockResolvedValue(null);

      await expect(
        service.verifyAndEnroll(1, 'order_1', 'pay_1', 'sig'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when payment belongs to another student', async () => {
      razorpayService.verifyPaymentSignature.mockReturnValue(true);
      paymentsRepo.findByRazorpayOrderId.mockResolvedValue({
        ...mockPayment,
        studentId: 99,
      } as any);

      await expect(
        service.verifyAndEnroll(1, 'order_abc123', 'pay_xyz789', 'sig'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when payment is already processed', async () => {
      razorpayService.verifyPaymentSignature.mockReturnValue(true);
      paymentsRepo.findByRazorpayOrderId.mockResolvedValue({
        ...mockPayment,
        status: 'paid',
      } as any);

      await expect(
        service.verifyAndEnroll(1, 'order_abc123', 'pay_xyz789', 'sig'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should verify payment and create enrollment on success', async () => {
      razorpayService.verifyPaymentSignature.mockReturnValue(true);
      paymentsRepo.findByRazorpayOrderId.mockResolvedValue(mockPayment as any);
      paymentsRepo.update.mockResolvedValue({ ...mockPayment, status: 'paid' } as any);
      enrollmentsRepo.create.mockResolvedValue({ id: 50 } as any);

      const result = await service.verifyAndEnroll(
        1,
        'order_abc123',
        'pay_xyz789',
        'sig',
      );
      expect(result.success).toBe(true);
      expect(result.enrollmentId).toBe(50);
      expect(paymentsRepo.update).toHaveBeenCalledWith(
        10,
        expect.objectContaining({ status: 'paid' }),
      );
      expect(enrollmentsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ studentId: 1, courseId: 1 }),
      );
    });
  });

  describe('handlePaymentCaptured', () => {
    it('should skip when payment record not found', async () => {
      paymentsRepo.findByRazorpayOrderId.mockResolvedValue(null);

      await service.handlePaymentCaptured('order_missing', 'pay_1');
      expect(paymentsRepo.update).not.toHaveBeenCalled();
    });

    it('should skip when payment is already paid (idempotency)', async () => {
      paymentsRepo.findByRazorpayOrderId.mockResolvedValue({
        ...mockPayment,
        status: 'paid',
      } as any);

      await service.handlePaymentCaptured('order_abc123', 'pay_xyz789');
      expect(paymentsRepo.update).not.toHaveBeenCalled();
    });

    it('should skip enrollment creation if already enrolled', async () => {
      paymentsRepo.findByRazorpayOrderId.mockResolvedValue(mockPayment as any);
      paymentsRepo.update.mockResolvedValue(mockPayment as any);
      enrollmentsRepo.checkEnrollmentExists.mockResolvedValue(true);

      await service.handlePaymentCaptured('order_abc123', 'pay_xyz789');
      expect(enrollmentsRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('handlePaymentFailed', () => {
    it('should skip when payment record not found', async () => {
      paymentsRepo.findByRazorpayOrderId.mockResolvedValue(null);

      await service.handlePaymentFailed('order_missing');
      expect(paymentsRepo.update).not.toHaveBeenCalled();
    });

    it('should mark payment as failed', async () => {
      paymentsRepo.findByRazorpayOrderId.mockResolvedValue(mockPayment as any);
      paymentsRepo.update.mockResolvedValue({ ...mockPayment, status: 'failed' } as any);

      await service.handlePaymentFailed('order_abc123');
      expect(paymentsRepo.update).toHaveBeenCalledWith(10, { status: 'failed' });
    });
  });

  describe('processRefund', () => {
    it('should throw NotFoundException when payment not found', async () => {
      paymentsRepo.findById.mockResolvedValue(null);

      await expect(service.processRefund(1, 999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when already refunded', async () => {
      paymentsRepo.findById.mockResolvedValue({ ...mockPayment, status: 'refunded' } as any);

      await expect(service.processRefund(1, 10)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for non-paid payments', async () => {
      paymentsRepo.findById.mockResolvedValue({ ...mockPayment, status: 'pending' } as any);

      await expect(service.processRefund(1, 10)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for excessive refund amount', async () => {
      paymentsRepo.findById.mockResolvedValue({ ...mockPayment, status: 'paid' } as any);

      await expect(
        service.processRefund(1, 10, 'reason', 500000),
      ).rejects.toThrow(BadRequestException);
    });

    it('should process refund successfully', async () => {
      const paidPayment = { ...mockPayment, status: 'paid' };
      paymentsRepo.findById.mockResolvedValue(paidPayment as any);
      razorpayService.processRefund.mockResolvedValue({
        refundId: 'rfnd_1',
        status: 'processed',
      } as any);
      paymentsRepo.update.mockResolvedValue({ ...paidPayment, status: 'refunded' } as any);

      const result = await service.processRefund(1, 10, 'Customer request', 100000);
      expect(result.refundId).toBe('rfnd_1');
      expect(paymentsRepo.update).toHaveBeenCalledWith(10, { status: 'refunded' });
    });
  });

  describe('getPaymentHistory', () => {
    it('should return paginated payment history', async () => {
      paymentsRepo.findMany.mockResolvedValue({
        data: [mockPayment],
        total: 1,
      } as any);

      const result = await service.getPaymentHistory(1, { page: 1, limit: 10 });
      expect(result.payments).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('getPaymentById', () => {
    it('should throw NotFoundException when payment not found', async () => {
      paymentsRepo.findById.mockResolvedValue(null);

      await expect(service.getPaymentById(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when accessing another student payment', async () => {
      paymentsRepo.findById.mockResolvedValue({ ...mockPayment, studentId: 99 } as any);

      await expect(service.getPaymentById(10, 1)).rejects.toThrow(ForbiddenException);
    });

    it('should return payment for owning student', async () => {
      paymentsRepo.findById.mockResolvedValue(mockPayment as any);

      const result = await service.getPaymentById(10, 1);
      expect(result.id).toBe(10);
    });
  });
});
