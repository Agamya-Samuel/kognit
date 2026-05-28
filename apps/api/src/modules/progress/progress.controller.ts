import {
  Controller,
  Get,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { ProgressService } from './progress.service';
import {
  UpdateProgressDto,
  LectureProgressDto,
  CourseProgressResponseDto,
  WatchHistoryResponseDto,
  WatchTimeSummaryDto,
} from './dto/progress.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

@ApiTags('progress')
@Controller('progress')
export class ProgressController {
  private readonly logger = new Logger(ProgressController.name);

  constructor(private readonly progressService: ProgressService) {}

  @Post('update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update video progress for a lecture' })
  @ApiResponse({ status: 200, description: 'Progress updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not enrolled in course' })
  @ApiResponse({ status: 404, description: 'Lecture not found' })
  async updateProgress(
    @CurrentUser() user: { sub: number; role: string },
    @Body() dto: UpdateProgressDto,
  ) {
    try {
      // Verify enrollment
      const isEnrolled = await this.progressService.verifyEnrollment(user.sub, dto.lectureId);
      if (!isEnrolled) {
        throw new ForbiddenException('You are not enrolled in this course');
      }

      const result = await this.progressService.updateProgress(
        user.sub,
        dto.lectureId,
        dto.watchedSeconds,
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Error updating progress:', error);
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  @Get('lecture/:lectureId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'lectureId', description: 'Lecture ID' })
  @ApiOperation({ summary: 'Get progress for a specific lecture' })
  @ApiResponse({ status: 200, description: 'Progress retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lecture not found' })
  async getLectureProgress(
    @CurrentUser() user: { sub: number; role: string },
    @Param('lectureId') lectureId: string,
  ) {
    const lectureIdNum = parseInt(lectureId, 10);
    const result = await this.progressService.getLectureProgress(user.sub, lectureIdNum);

    if (!result) {
      throw new NotFoundException('Lecture not found');
    }

    return {
      success: true,
      data: result,
    };
  }

  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiOperation({ summary: 'Get course progress summary for the current student' })
  @ApiResponse({ status: 200, description: 'Course progress retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCourseProgress(
    @CurrentUser() user: { sub: number; role: string },
    @Param('courseId') courseId: string,
  ) {
    const courseIdNum = parseInt(courseId, 10);
    const summary = await this.progressService.getCourseProgress(user.sub, courseIdNum);

    if (!summary) {
      throw new NotFoundException('Course not found');
    }

    return {
      success: true,
      data: summary,
    };
  }

  @Get('course/:courseId/lectures')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiOperation({ summary: 'Get per-lecture progress for a course' })
  @ApiResponse({ status: 200, description: 'Lecture progress list retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCourseLectureProgress(
    @CurrentUser() user: { sub: number; role: string },
    @Param('courseId') courseId: string,
  ) {
    const courseIdNum = parseInt(courseId, 10);
    const data = await this.progressService.getCourseLectureProgress(user.sub, courseIdNum);

    return {
      success: true,
      data,
    };
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset for pagination' })
  @ApiOperation({ summary: 'Get watch history for the current student' })
  @ApiResponse({ status: 200, description: 'Watch history retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getWatchHistory(
    @CurrentUser() user: { sub: number; role: string },
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const result = await this.progressService.getWatchHistory(user.sub, {
      limit: limit ? parseInt(limit, 10) : 20,
      offset: offset ? parseInt(offset, 10) : 0,
    });

    return {
      success: true,
      data: result,
    };
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get watch time summary for the current student' })
  @ApiResponse({ status: 200, description: 'Watch time summary retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getWatchSummary(
    @CurrentUser() user: { sub: number; role: string },
  ) {
    const result = await this.progressService.getWatchSummary(user.sub);

    return {
      success: true,
      data: result,
    };
  }
}
