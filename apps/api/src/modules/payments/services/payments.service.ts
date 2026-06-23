import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PaymentsRepository } from '../../../db/repositories/payments.repository';
import { EnrollmentsRepository } from '../../../db/repositories/enrollments.repository';
import { CoursesRepository } from '../../../db/repositories/courses.repository';
import { RazorpayService } from './razorpay.service';

export interface CreateOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
  receipt: string;
  paymentRecordId: number;
}

export interface PaymentHistoryResult {
  payments: any[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly paymentsRepo: PaymentsRepository,
    private readonly enrollmentsRepo: EnrollmentsRepository,
    private readonly coursesRepo: CoursesRepository,
    private readonly razorpayService: RazorpayService,
  ) {}

  /**
   * Create a Razorpay order for course purchase
   */
  async createOrder(
    studentId: number,
    courseId: number,
  ): Promise<CreateOrderResult> {
    // Check if course exists and is paid
    const course = await this.coursesRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    if (course.pricingType !== 'paid') {
      throw new BadRequestException('This course is free. No payment required.');
    }

    if (course.status !== 'published') {
      throw new BadRequestException('This course is not available for purchase.');
    }

    if (course.priceInr <= 0) {
      throw new BadRequestException('Invalid course price.');
    }

    // Check if already enrolled
    const alreadyEnrolled = await this.enrollmentsRepo.checkEnrollmentExists(
      studentId,
      courseId,
    );
    if (alreadyEnrolled) {
      throw new BadRequestException('You are already enrolled in this course.');
    }

    // Check for existing pending payment
    const existingPayments = await this.paymentsRepo.findMany({
      studentId,
      courseId,
      status: 'pending',
      limit: 1,
    });

    if (existingPayments.data.length > 0) {
      const existingPayment = existingPayments.data[0];
      // Return existing order details
      return {
        orderId: existingPayment.razorpayOrderId,
        amount: existingPayment.amount,
        currency: existingPayment.currency,
        key: this.razorpayService.isConfigured()
          ? (this.razorpayService as any).keyId || ''
          : '',
        receipt: `course_${courseId}_student_${studentId}`,
        paymentRecordId: existingPayment.id,
      };
    }

    // Create Razorpay order
    const amountInPaise = course.priceInr * 100; // Convert INR to paise
    const orderResult = await this.razorpayService.createOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `course_${courseId}_student_${studentId}`,
      notes: {
        courseId: String(courseId),
        studentId: String(studentId),
        courseTitle: course.title,
      },
    });

    // Save payment record
    const payment = await this.paymentsRepo.create({
      studentId,
      courseId,
      razorpayOrderId: orderResult.orderId,
      razorpayPaymentId: '', // Will be updated on payment success
      amount: course.priceInr,
      currency: 'INR',
      status: 'pending',
    } as any);

    this.logger.log(
      `Created payment order for student ${studentId}, course ${courseId}: ${orderResult.orderId}`,
    );

    return {
      ...orderResult,
      paymentRecordId: payment.id,
    };
  }

  /**
   * Verify payment and grant enrollment
   */
  async verifyAndEnroll(
    studentId: number,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ): Promise<{ success: boolean; enrollmentId: number }> {
    // Verify signature
    const isValid = this.razorpayService.verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    );

    if (!isValid) {
      throw new BadRequestException('Payment verification failed. Invalid signature.');
    }

    // Find the payment record
    const payment = await this.paymentsRepo.findByRazorpayOrderId(razorpayOrderId);
    if (!payment) {
      throw new NotFoundException('Payment record not found.');
    }

    // Verify the student owns this payment
    if (payment.studentId !== studentId) {
      throw new ForbiddenException('This payment does not belong to you.');
    }

    // Atomic state transition: pending -> paid. If the row is already paid
    // (concurrent request or duplicate webhook) this returns null and we
    // treat the call as idempotent — find the existing enrollment.
    const updated = await this.paymentsRepo.markPaidIfPending(
      payment.id,
      razorpayPaymentId,
    );
    if (!updated) {
      // Payment was already paid. Look up the existing enrollment.
      const existing = await this.enrollmentsRepo.findByStudentAndCourse(
        payment.studentId,
        payment.courseId,
      );
      if (existing) {
        return { success: true, enrollmentId: existing.id };
      }
      throw new BadRequestException('Payment already processed but no enrollment found.');
    }

    // Grant enrollment. The (studentId, courseId) unique constraint on
    // enrollments is the final backstop against duplicate inserts.
    const enrollment = await this.enrollmentsRepo.create({
      studentId: payment.studentId,
      courseId: payment.courseId,
      enrolledAt: new Date(),
      paymentId: payment.id,
      accessType: 'purchased',
    } as any);

    this.logger.log(
      `Payment verified and enrollment granted: student ${studentId} enrolled in course ${payment.courseId}`,
    );

    return {
      success: true,
      enrollmentId: enrollment.id,
    };
  }

  /**
   * Handle webhook: payment.captured
   */
  async handlePaymentCaptured(
    razorpayOrderId: string,
    razorpayPaymentId: string,
  ): Promise<void> {
    const payment = await this.paymentsRepo.findByRazorpayOrderId(razorpayOrderId);
    if (!payment) {
      this.logger.warn(`No payment found for Razorpay order ${razorpayOrderId}`);
      return;
    }

    // Atomic pending -> paid transition. Idempotent: returns null on second call.
    const updated = await this.paymentsRepo.markPaidIfPending(
      payment.id,
      razorpayPaymentId,
    );
    if (!updated) {
      this.logger.log(`Payment ${razorpayOrderId} already processed. Skipping.`);
      return;
    }

    // Check if enrollment already exists (may have been created by verifyAndEnroll).
    // If it does, we're done. If not, create. The unique constraint catches the
    // race where a concurrent webhook + verifyAndEnroll both try to create.
    const alreadyEnrolled = await this.enrollmentsRepo.checkEnrollmentExists(
      payment.studentId,
      payment.courseId,
    );

    if (alreadyEnrolled) {
      this.logger.log(
        `Enrollment already exists for student ${payment.studentId}, course ${payment.courseId}`,
      );
      return;
    }

    try {
      await this.enrollmentsRepo.create({
        studentId: payment.studentId,
        courseId: payment.courseId,
        enrolledAt: new Date(),
        paymentId: payment.id,
        accessType: 'purchased',
      } as any);

      this.logger.log(
        `Webhook: Enrollment granted for student ${payment.studentId} in course ${payment.courseId}`,
      );
    } catch (err: unknown) {
      const e = err as { code?: string };
      // Unique constraint (PG 23505) means a concurrent call already created
      // the enrollment. That's fine — the call is idempotent.
      if (e?.code === '23505') {
        this.logger.log(
          `Webhook: Enrollment already exists (caught unique violation) for student ${payment.studentId}, course ${payment.courseId}`,
        );
        return;
      }
      throw err;
    }
  }

  /**
   * Handle webhook: payment.failed
   */
  async handlePaymentFailed(razorpayOrderId: string): Promise<void> {
    const payment = await this.paymentsRepo.findByRazorpayOrderId(razorpayOrderId);
    if (!payment) {
      this.logger.warn(`No payment found for Razorpay order ${razorpayOrderId}`);
      return;
    }

    await this.paymentsRepo.update(payment.id, {
      status: 'failed',
    });

    this.logger.log(`Payment failed for order ${razorpayOrderId}`);
  }

  /**
   * Process a refund (admin only)
   */
  async processRefund(
    adminId: number,
    paymentId: number,
    reason?: string,
    amount?: number,
  ): Promise<{ refundId: string; status: string }> {
    const payment = await this.paymentsRepo.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }

    if (payment.status === 'refunded') {
      throw new BadRequestException('Payment has already been refunded.');
    }

    if (payment.status !== 'paid') {
      throw new BadRequestException('Only successful payments can be refunded.');
    }

    if (!payment.razorpayPaymentId) {
      throw new BadRequestException('No Razorpay payment ID found for this payment.');
    }

    // Validate partial refund amount
    if (amount && amount > payment.amount * 100) {
      throw new BadRequestException('Refund amount cannot exceed payment amount.');
    }

    // Process refund via Razorpay
    const refundResult = await this.razorpayService.processRefund({
      paymentId: payment.razorpayPaymentId,
      amount,
      notes: { reason: reason || 'Admin initiated refund', adminId: String(adminId) },
    });

    // Update payment status
    await this.paymentsRepo.update(paymentId, {
      status: 'refunded',
    });

    this.logger.log(`Refund processed for payment ${paymentId} by admin ${adminId}`);

    return {
      refundId: refundResult.refundId,
      status: refundResult.status,
    };
  }

  /**
   * Get payment history for a student
   */
  async getPaymentHistory(
    studentId: number,
    options: { page?: number; limit?: number; status?: string; courseId?: number },
  ): Promise<PaymentHistoryResult> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const offset = (page - 1) * limit;

    const result = await this.paymentsRepo.findMany({
      studentId,
      status: options.status,
      courseId: options.courseId,
      offset,
      limit,
    });

    return {
      payments: result.data,
      total: result.total,
      page,
      limit,
    };
  }

  /**
   * Get a single payment by ID
   */
  async getPaymentById(paymentId: number, studentId: number) {
    const payment = await this.paymentsRepo.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }

    if (payment.studentId !== studentId) {
      throw new ForbiddenException('You can only view your own payments.');
    }

    return payment;
  }
}
