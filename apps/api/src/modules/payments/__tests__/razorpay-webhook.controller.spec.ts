import { Test, TestingModule } from '@nestjs/testing';
import { RazorpayWebhookController } from '../razorpay-webhook.controller';
import { PaymentsService } from '../services/payments.service';
import { RazorpayService } from '../services/razorpay.service';

describe('RazorpayWebhookController', () => {
  let controller: RazorpayWebhookController;
  let paymentsService: PaymentsService;
  let razorpayService: RazorpayService;

  beforeEach(async () => {
    const mockPaymentsService = {
      handlePaymentCaptured: jest.fn(),
      handlePaymentFailed: jest.fn(),
    };

    const mockRazorpayService = {
      verifyWebhookSignature: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RazorpayWebhookController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
        {
          provide: RazorpayService,
          useValue: mockRazorpayService,
        },
      ],
    }).compile();

    controller = module.get<RazorpayWebhookController>(RazorpayWebhookController);
    paymentsService = module.get<PaymentsService>(PaymentsService);
    razorpayService = module.get<RazorpayService>(RazorpayService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleWebhook', () => {
    const mockRequest = {} as any;

    it('should reject webhook without signature', async () => {
      const result = await controller.handleWebhook(
        { event: 'payment.captured' } as any,
        '',
        mockRequest,
      );

      expect(result).toEqual({
        success: false,
        message: 'Missing signature',
      });
    });

    it('should reject webhook with invalid signature', async () => {
      jest.spyOn(razorpayService, 'verifyWebhookSignature').mockReturnValue(false);

      const result = await controller.handleWebhook(
        { event: 'payment.captured' } as any,
        'invalid_sig',
        mockRequest,
      );

      expect(result).toEqual({
        success: false,
        message: 'Invalid webhook signature',
      });

      expect(paymentsService.handlePaymentCaptured).not.toHaveBeenCalled();
    });

    it('should reject webhook without event type', async () => {
      jest.spyOn(razorpayService, 'verifyWebhookSignature').mockReturnValue(true);

      const result = await controller.handleWebhook(
        {} as any,
        'valid_sig',
        mockRequest,
      );

      expect(result).toEqual({
        success: false,
        message: 'Missing event type',
      });
    });

    it('should handle payment.captured event', async () => {
      jest.spyOn(razorpayService, 'verifyWebhookSignature').mockReturnValue(true);
      jest.spyOn(paymentsService, 'handlePaymentCaptured').mockResolvedValue(undefined);

      const webhookData = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_123',
              order_id: 'order_abc',
            },
          },
        },
      };

      const result = await controller.handleWebhook(
        webhookData as any,
        'valid_sig',
        mockRequest,
      );

      expect(result).toEqual({
        success: true,
        message: 'Webhook processed successfully',
      });

      expect(paymentsService.handlePaymentCaptured).toHaveBeenCalledWith(
        'order_abc',
        'pay_123',
      );
    });

    it('should handle payment.failed event', async () => {
      jest.spyOn(razorpayService, 'verifyWebhookSignature').mockReturnValue(true);
      jest.spyOn(paymentsService, 'handlePaymentFailed').mockResolvedValue(undefined);

      const webhookData = {
        event: 'payment.failed',
        payload: {
          payment: {
            entity: {
              id: 'pay_456',
              order_id: 'order_def',
            },
          },
        },
      };

      const result = await controller.handleWebhook(
        webhookData as any,
        'valid_sig',
        mockRequest,
      );

      expect(result).toEqual({
        success: true,
        message: 'Webhook processed successfully',
      });

      expect(paymentsService.handlePaymentFailed).toHaveBeenCalledWith('order_def');
    });

    it('should handle refund.processed event', async () => {
      jest.spyOn(razorpayService, 'verifyWebhookSignature').mockReturnValue(true);

      const webhookData = {
        event: 'refund.processed',
        payload: {
          refund: {
            entity: {
              id: 'rfn_123',
              payment_id: 'pay_789',
            },
          },
        },
      };

      const result = await controller.handleWebhook(
        webhookData as any,
        'valid_sig',
        mockRequest,
      );

      expect(result).toEqual({
        success: true,
        message: 'Webhook processed successfully',
      });
    });

    it('should return success for unhandled event types', async () => {
      jest.spyOn(razorpayService, 'verifyWebhookSignature').mockReturnValue(true);

      const webhookData = {
        event: 'order.paid',
        payload: {},
      };

      const result = await controller.handleWebhook(
        webhookData as any,
        'valid_sig',
        mockRequest,
      );

      expect(result).toEqual({
        success: true,
        message: "Event type 'order.paid' not handled",
      });
    });

    it('should handle payment.captured with missing entity gracefully', async () => {
      jest.spyOn(razorpayService, 'verifyWebhookSignature').mockReturnValue(true);

      const webhookData = {
        event: 'payment.captured',
        payload: {},
      };

      const result = await controller.handleWebhook(
        webhookData as any,
        'valid_sig',
        mockRequest,
      );

      // Missing entity logs a warning but still returns success (the switch succeeded)
      expect(result.success).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      jest.spyOn(razorpayService, 'verifyWebhookSignature').mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await controller.handleWebhook(
        { event: 'payment.captured' } as any,
        'sig',
        mockRequest,
      );

      expect(result).toEqual({
        success: false,
        message: 'Error processing webhook',
      });
    });
  });
});
