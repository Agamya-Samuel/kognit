import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/auth.decorators';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CourseSessionsService } from '../services/course-sessions.service';
import { RecurringSchedulesService } from '../services/recurring-schedules.service';
import {
  CreateCourseSessionDto,
  UpdateCourseSessionDto,
  CreateRecurringScheduleDto,
  UpdateRecurringScheduleDto,
} from '../dto/course.dto';

@ApiTags('Course Sessions')
@Controller('courses/:courseId')
@ApiBearerAuth()
@Roles('instructor', 'admin')
export class CourseSessionsController {
  constructor(
    private readonly sessionsService: CourseSessionsService,
    private readonly schedulesService: RecurringSchedulesService,
  ) {}

  // --- Sessions ---

  @Get('sessions')
  @ApiOperation({ summary: 'List all sessions for a course' })
  @ApiResponse({ status: 200, description: 'Sessions list' })
  @ApiQuery({ name: 'status', required: false })
  async listSessions(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('status') status?: string,
  ) {
    const result = await this.sessionsService.listSessions(courseId, { status });
    return { success: true, data: result, error: null };
  }

  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a one-time session' })
  @ApiResponse({ status: 201, description: 'Session created' })
  async createSession(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: { sub: number; role: string },
    @Body() dto: CreateCourseSessionDto,
  ) {
    const session = await this.sessionsService.createSession(courseId, user.sub, dto);
    return { success: true, data: session, error: null };
  }

  @Put('sessions/:sessionId')
  @ApiOperation({ summary: 'Update a session' })
  @ApiResponse({ status: 200, description: 'Session updated' })
  async updateSession(
    @Param('courseId', ParseIntPipe) _courseId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @CurrentUser() user: { sub: number; role: string },
    @Body() dto: UpdateCourseSessionDto,
  ) {
    const session = await this.sessionsService.updateSession(sessionId, user.sub, dto);
    return { success: true, data: session, error: null };
  }

  @Post('sessions/:sessionId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a session' })
  @ApiResponse({ status: 200, description: 'Session cancelled' })
  async cancelSession(
    @Param('courseId', ParseIntPipe) _courseId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @CurrentUser() user: { sub: number; role: string },
  ) {
    const session = await this.sessionsService.cancelSession(sessionId, user.sub);
    return { success: true, data: session, error: null };
  }

  // --- Recurring Schedules ---

  @Get('recurring-schedules')
  @ApiOperation({ summary: 'List recurring schedules for a course' })
  @ApiResponse({ status: 200, description: 'Recurring schedules list' })
  async listSchedules(@Param('courseId', ParseIntPipe) courseId: number) {
    const schedules = await this.schedulesService.listSchedules(courseId);
    return { success: true, data: schedules, error: null };
  }

  @Get('recurring-schedules/:scheduleId')
  @ApiOperation({ summary: 'Get a recurring schedule with its sessions' })
  @ApiResponse({ status: 200, description: 'Recurring schedule with sessions' })
  async getSchedule(
    @Param('courseId', ParseIntPipe) _courseId: number,
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
  ) {
    const result = await this.schedulesService.getScheduleWithSessions(scheduleId);
    return { success: true, data: result, error: null };
  }

  @Post('recurring-schedules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a recurring schedule (auto-generates sessions)' })
  @ApiResponse({ status: 201, description: 'Schedule created and sessions generated' })
  async createSchedule(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: { sub: number; role: string },
    @Body() dto: CreateRecurringScheduleDto,
  ) {
    const schedule = await this.schedulesService.createSchedule(courseId, user.sub, dto);
    return { success: true, data: schedule, error: null };
  }

  @Put('recurring-schedules/:scheduleId')
  @ApiOperation({ summary: 'Update a recurring schedule' })
  @ApiResponse({ status: 200, description: 'Schedule updated' })
  async updateSchedule(
    @Param('courseId', ParseIntPipe) _courseId: number,
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @Body() dto: UpdateRecurringScheduleDto,
  ) {
    const schedule = await this.schedulesService.updateSchedule(scheduleId, dto);
    return { success: true, data: schedule, error: null };
  }

  @Delete('recurring-schedules/:scheduleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a recurring schedule and cancel future sessions' })
  @ApiResponse({ status: 200, description: 'Schedule deleted' })
  async deleteSchedule(
    @Param('courseId', ParseIntPipe) _courseId: number,
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
  ) {
    await this.schedulesService.deleteSchedule(scheduleId);
    return {
      success: true,
      data: { message: 'Recurring schedule deleted and future sessions cancelled.' },
      error: null,
    };
  }
}
