import {
  Controller,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { InstructorAnalyticsService } from './instructor-analytics.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { InstructorAnalyticsQueryDto } from './dto/analytics.dto';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly instructorAnalyticsService: InstructorAnalyticsService,
  ) {}

  @Get('instructor')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Instructor analytics overview' })
  @ApiOperation({ summary: 'Get analytics overview for the current instructor' })
  async getInstructorAnalytics(
    @CurrentUser() user: { sub: number; role: string },
    @Query() query: InstructorAnalyticsQueryDto,
  ) {
    const data = await this.instructorAnalyticsService.getInstructorAnalytics(
      user.sub,
      query.courseId,
    );

    return {
      success: true,
      data,
    };
  }

  @Get('instructor/charts')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Instructor chart data' })
  @ApiOperation({ summary: 'Get chart data for the current instructor' })
  async getInstructorChartData(
    @CurrentUser() user: { sub: number; role: string },
    @Query('days') days?: string,
  ) {
    const data = await this.instructorAnalyticsService.getInstructorChartData(
      user.sub,
      days ? parseInt(days, 10) : 30,
    );

    return {
      success: true,
      data,
    };
  }

  @Get('track')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Event tracked successfully' })
  @ApiOperation({ summary: 'Track a custom analytics event' })
  async trackEvent(
    @CurrentUser() user: { sub: number; role: string },
    @Query('event') event: string,
    @Query('properties') properties?: string,
  ) {
    let parsedProperties: Record<string, unknown> | undefined;
    if (properties) {
      try {
        parsedProperties = JSON.parse(properties);
      } catch {
        throw new BadRequestException('Invalid JSON in properties query parameter');
      }
    }

    await this.analyticsService.capture({
      distinctId: String(user.sub),
      event,
      properties: parsedProperties,
    });

    return { success: true };
  }
}
