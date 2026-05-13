import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';

export interface RazorpayOrderOptions {
  amount: number; // in paise
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
  receipt: string;
}

export interface RazorpayRefundOptions {
  paymentId: string;
  amount?: number; // partial refund amount in paise
  notes?: Record<string, string>;
}

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);
  private readonly razorpay: Razorpay;
  private readonly keyId: string;
  private readonly keySecret: string;
  private readonly webhookSecret: string;

  constructor(private configService: ConfigService) {
    this.keyId = this.configService.get<string>('RAZORPAY_KEY_ID') || '';
    this.keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || '';
    this.webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET') || '';

    if (!this.keyId || !this.keySecret) {
      this.logger.warn('Razorpay credentials not configured. Payment features will be disabled.');
      this.razorpay = {} as Razorpay;
    } else {
      this.razorpay = new Razorpay({
        key_id: this.keyId,
        key_secret: this.keySecret,
      });
      this.logger.log('RazorpayService initialized');
    }
  }

  /**
   * Check if Razorpay is properly configured
   */
  isConfigured(): boolean {
    return !!(this.keyId && this.keySecret);
  }

  /**
   * Create a Razorpay order
   */
  async createOrder(options: RazorpayOrderOptions): Promise<RazorpayOrderResponse> {
    try {
      if (!this.isConfigured()) {
        throw new InternalServerErrorException('Razorpay is not configured');
      }

      this.logger.log(`Creating Razorpay order for amount: ${options.amount} ${options.currency}`);

      const order = await this.razorpay.orders.create({
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        notes: options.notes || {},
      });

      this.logger.log(`Created Razorpay order: ${order.id}`);

      return {
        orderId: order.id as string,
        amount: Number(order.amount),
        currency: order.currency as string,
        key: this.keyId,
        receipt: (order.receipt as string) || options.receipt,
      };
    } catch (error) {
      this.logger.error('Error creating Razorpay order:', error);
      throw new InternalServerErrorException('Failed to create payment order');
    }
  }

  /**
   * Verify Razorpay payment signature
   */
  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(signature, 'hex'),
      );

      if (!isValid) {
        this.logger.warn('Payment signature verification failed');
      }

      return isValid;
    } catch (error) {
      this.logger.error('Error verifying payment signature:', error);
      return false;
    }
  }

  /**
   * Verify Razorpay webhook signature
   */
  verifyWebhookSignature(body: string, signature: string): boolean {
    try {
      if (!this.webhookSecret) {
        this.logger.warn('Razorpay webhook secret not configured. Skipping validation.');
        return true;
      }

      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(body)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(signature, 'hex'),
      );
    } catch (error) {
      this.logger.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Issue a refund for a payment
   */
  async processRefund(options: RazorpayRefundOptions): Promise<{
    refundId: string;
    paymentId: string;
    amount: number;
    status: string;
  }> {
    try {
      if (!this.isConfigured()) {
        throw new InternalServerErrorException('Razorpay is not configured');
      }

      this.logger.log(`Processing refund for payment: ${options.paymentId}`);

      const refundPayload: any = {
        notes: options.notes || {},
      };

      if (options.amount) {
        refundPayload.amount = options.amount;
      }

      const refund = await this.razorpay.payments.refund(
        options.paymentId,
        refundPayload,
      );

      this.logger.log(`Refund processed: ${refund.id} for payment ${options.paymentId}`);

      return {
        refundId: refund.id,
        paymentId: options.paymentId,
        amount: refund.amount || (options.amount || 0),
        status: refund.status || 'processed',
      };
    } catch (error) {
      this.logger.error('Error processing refund:', error);
      throw new InternalServerErrorException('Failed to process refund');
    }
  }

  /**
   * Fetch a payment by ID from Razorpay
   */
  async fetchPayment(paymentId: string): Promise<any> {
    try {
      if (!this.isConfigured()) {
        return null;
      }

      return await this.razorpay.payments.fetch(paymentId);
    } catch (error) {
      this.logger.error(`Error fetching payment ${paymentId}:`, error);
      return null;
    }
  }
}
