import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/auth.decorators';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { DashboardMetricsService } from '../services/dashboard-metrics.service';

@ApiTags('Analytics')
@Controller('analytics')
export class DashboardController {
  constructor(
    private readonly dashboardMetricsService: DashboardMetricsService,
  ) {}

  @Get('dashboard/metrics')
  @UseGuards(JwtAuthGuard)
  @Roles('instructor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get instructor dashboard metrics' })
  @ApiResponse({ status: 200, description: 'Dashboard metrics retrieved successfully' })
  async getDashboardMetrics(
    @CurrentUser() user: { sub: number; role: string },
  ) {
    const data = await this.dashboardMetricsService.getDashboardMetrics(user.sub);
    return {
      success: true,
      data,
    };
  }
}