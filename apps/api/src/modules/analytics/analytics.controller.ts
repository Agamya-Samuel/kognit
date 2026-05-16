import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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

  @Get('track')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Track a custom analytics event' })
  async trackEvent(
    @CurrentUser() user: { sub: number; role: string },
    @Query('event') event: string,
    @Query('properties') properties?: string,
  ) {
    await this.analyticsService.capture({
      distinctId: String(user.sub),
      event,
      properties: properties ? JSON.parse(properties) : undefined,
    });

    return { success: true };
  }
}
