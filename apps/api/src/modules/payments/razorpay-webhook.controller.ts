import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './services/payments.service';
import { RazorpayService } from './services/razorpay.service';
import { Public } from '../auth/decorators/auth.decorators';

@ApiTags('webhooks')
@Controller('webhooks/razorpay')
export class RazorpayWebhookController {
  private readonly logger = new Logger(RazorpayWebhookController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly razorpayService: RazorpayService,
  ) {
    this.logger.log('RazorpayWebhookController initialized');
  }

  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Razorpay webhook events' })
  @ApiHeader({
    name: 'x-razorpay-signature',
    required: true,
    description: 'Razorpay webhook signature',
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook payload' })
  @ApiResponse({ status: 401, description: 'Invalid webhook signature' })
  async handleWebhook(
    @Body() webhookData: any,
    @Headers('x-razorpay-signature') signature: string,
    @Req() req: Request,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verify webhook signature using raw body
      const rawBody = (req as RawBodyRequest<Request>).rawBody
        ? (req as RawBodyRequest<Request>).rawBody.toString()
        : JSON.stringify(webhookData);

      if (!signature) {
        this.logger.warn('No webhook signature provided');
        return { success: false, message: 'Missing signature' };
      }

      const isValid = this.razorpayService.verifyWebhookSignature(
        rawBody,
        signature,
      );

      if (!isValid) {
        this.logger.warn('Invalid Razorpay webhook signature');
        return { success: false, message: 'Invalid webhook signature' };
      }

      const event = webhookData;
      const eventType = event.event;

      if (!eventType) {
        this.logger.warn('No event type in webhook payload');
        return { success: false, message: 'Missing event type' };
      }

      this.logger.log(`Received Razorpay webhook: ${eventType}`);

      switch (eventType) {
        case 'payment.captured':
          await this.handlePaymentCaptured(event);
          break;

        case 'payment.failed':
          await this.handlePaymentFailed(event);
          break;

        case 'refund.processed':
          await this.handleRefundProcessed(event);
          break;

        default:
          this.logger.log(`Unhandled Razorpay event type: ${eventType}`);
          return { success: true, message: `Event type '${eventType}' not handled` };
      }

      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      this.logger.error('Error handling Razorpay webhook:', error);
      return { success: false, message: 'Error processing webhook' };
    }
  }

  /**
   * Handle payment.captured event
   */
  private async handlePaymentCaptured(event: any): Promise<void> {
    const paymentEntity = event.payload?.payment?.entity;
    if (!paymentEntity) {
      this.logger.warn('No payment entity in payment.captured event');
      return;
    }

    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;

    if (!razorpayOrderId) {
      this.logger.warn('No order ID in payment.captured event');
      return;
    }

    this.logger.log(
      `Processing payment.captured for order ${razorpayOrderId}, payment ${razorpayPaymentId}`,
    );

    await this.paymentsService.handlePaymentCaptured(
      razorpayOrderId,
      razorpayPaymentId,
    );
  }

  /**
   * Handle payment.failed event
   */
  private async handlePaymentFailed(event: any): Promise<void> {
    const paymentEntity = event.payload?.payment?.entity;
    if (!paymentEntity) {
      this.logger.warn('No payment entity in payment.failed event');
      return;
    }

    const razorpayOrderId = paymentEntity.order_id;

    if (!razorpayOrderId) {
      this.logger.warn('No order ID in payment.failed event');
      return;
    }

    this.logger.log(`Processing payment.failed for order ${razorpayOrderId}`);

    await this.paymentsService.handlePaymentFailed(razorpayOrderId);
  }

  /**
   * Handle refund.processed event
   */
  private async handleRefundProcessed(event: any): Promise<void> {
    const refundEntity = event.payload?.refund?.entity;
    if (!refundEntity) {
      this.logger.warn('No refund entity in refund.processed event');
      return;
    }

    const paymentId = refundEntity.payment_id;
    this.logger.log(`Refund processed for Razorpay payment ${paymentId}`);
    // The payment status is already updated by the admin refund endpoint.
    // This webhook serves as confirmation / audit log.
  }
}
