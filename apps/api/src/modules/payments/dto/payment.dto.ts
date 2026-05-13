import { IsNumber, IsString, IsNotEmpty, IsOptional, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty({ example: 1, description: 'Course ID to purchase' })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  courseId: number;
}

export class VerifyPaymentDto {
  @ApiProperty({ example: 'order_xxxxxxxxxxxx', description: 'Razorpay order ID' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  razorpayOrderId: string;

  @ApiProperty({ example: 'pay_xxxxxxxxxxxx', description: 'Razorpay payment ID' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  razorpayPaymentId: string;

  @ApiProperty({ example: 'abc123signature', description: 'Razorpay payment signature' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  razorpaySignature: string;
}

export class RefundDto {
  @ApiProperty({ example: 1, description: 'Payment ID to refund' })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  paymentId: number;

  @ApiPropertyOptional({ example: 'Customer requested refund', description: 'Refund reason' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({ example: 5000, description: 'Partial refund amount in paise (defaults to full)' })
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsNumber()
  @Min(1)
  @IsOptional()
  amount?: number;
}

export class PaymentQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Items per page' })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'paid', description: 'Filter by payment status' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 1, description: 'Filter by course ID' })
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsNumber()
  @Min(1)
  @IsOptional()
  courseId?: number;
}
