import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PaymentsService } from './services/payments.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/auth.decorators';
import type { JwtPayload } from '../auth/strategies';
import {
  CreateOrderDto,
  VerifyPaymentDto,
  RefundDto,
  PaymentQueryDto,
} from './dto/payment.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ─── Student: Create Order ──────────────────────────────────────────────

  @Post('create-order')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles('student')
  @ApiResponse({ status: 200, description: 'Razorpay order created' })
  @ApiOperation({ summary: 'Create a Razorpay order for course purchase' })
  async createOrder(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateOrderDto,
  ) {
    const result = await this.paymentsService.createOrder(user.sub, dto.courseId);

    return {
      success: true,
      data: result,
      error: null,
    };
  }

  // ─── Student: Verify Payment ───────────────────────────────────────────

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles('student')
  @ApiResponse({ status: 200, description: 'Payment verified, enrollment granted' })
  @ApiOperation({ summary: 'Verify Razorpay payment and grant enrollment' })
  async verifyPayment(
    @CurrentUser() user: JwtPayload,
    @Body() dto: VerifyPaymentDto,
  ) {
    const result = await this.paymentsService.verifyAndEnroll(
      user.sub,
      dto.razorpayOrderId,
      dto.razorpayPaymentId,
      dto.razorpaySignature,
    );

    return {
      success: true,
      data: result,
      error: null,
    };
  }

  // ─── Student: Payment History ──────────────────────────────────────────

  @Get('history')
  @ApiBearerAuth()
  @Roles('student')
  @ApiResponse({ status: 200, description: 'Payment history retrieved' })
  @ApiOperation({ summary: 'Get payment history for the current student' })
  async getPaymentHistory(
    @CurrentUser() user: JwtPayload,
    @Query() query: PaymentQueryDto,
  ) {
    const result = await this.paymentsService.getPaymentHistory(user.sub, {
      page: query.page,
      limit: query.limit,
      status: query.status,
      courseId: query.courseId,
    });

    return {
      success: true,
      data: result.payments,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
      },
      error: null,
    };
  }

  // ─── Student: Get Single Payment ──────────────────────────────────────

  @Get(':id')
  @ApiBearerAuth()
  @Roles('student')
  @ApiResponse({ status: 200, description: 'Payment details' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiOperation({ summary: 'Get details of a specific payment' })
  async getPayment(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const payment = await this.paymentsService.getPaymentById(id, user.sub);

    return {
      success: true,
      data: payment,
      error: null,
    };
  }

  // ─── Admin: Issue Refund ───────────────────────────────────────────────

  @Post('refund')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles('admin')
  @ApiResponse({ status: 200, description: 'Refund processed' })
  @ApiOperation({ summary: 'Issue a refund for a payment (admin only)' })
  async processRefund(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RefundDto,
  ) {
    const result = await this.paymentsService.processRefund(
      user.sub,
      dto.paymentId,
      dto.reason,
      dto.amount,
    );

    return {
      success: true,
      data: result,
      error: null,
    };
  }
}
