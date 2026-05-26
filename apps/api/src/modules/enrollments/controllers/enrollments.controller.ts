import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { EnrollmentsService } from './services/enrollments.service';
import type { Enrollment } from '../../db/schema/enrollments';

@ApiTags('Enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user enrollments' })
  @ApiResponse({ status: 200, description: 'User enrollments retrieved successfully' })
  async getMyEnrollments(@CurrentUser() user: { sub: number }): Promise<{ success: true; data: Enrollment[] }> {
    const enrollments = await this.enrollmentsService.getMyEnrollments(user.sub);
    return {
      success: true,
      data: enrollments,
    };
  }

  @Get('me/count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user enrollment count' })
  @ApiResponse({ status: 200, description: 'User enrollment count retrieved successfully' })
  async getMyEnrollmentCount(@CurrentUser() user: { sub: number }): Promise<{ success: true; data: { count: number } }> {
    const count = await this.enrollmentsService.getEnrollmentCount(user.sub);
    return {
      success: true,
      data: { count },
    };
  }
}