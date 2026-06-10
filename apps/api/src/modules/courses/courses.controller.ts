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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/auth.decorators';
import { Roles } from '../auth/decorators/auth.decorators';
import type { JwtPayload } from '../auth/strategies';
import { CreateCourseDto, UpdateCourseDto, CourseQueryDto } from './dto/course.dto';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // ─── Public/Authenticated: Browse Courses ────────────────────────────────────

  @Public()
  @Get()
  @ApiResponse({ status: 200, description: 'Paginated course list' })
  @ApiOperation({ summary: 'List courses with pagination, filtering, and search' })
  async listCourses(@Query() query: CourseQueryDto, @CurrentUser() user?: JwtPayload) {
    // Handle instructorOnly: when true, filter by current user's instructor ID
    // Also, if authenticated, show unpublished courses belonging to this instructor
    const instructorId = query.instructorOnly && user?.sub ? user.sub : query.instructorId;

    const shouldShowUnpublished = query.instructorOnly && user?.sub;

    const result = await this.coursesService.listCourses({
      page: query.page,
      limit: query.limit,
      domain: query.domain,
      isPublished: shouldShowUnpublished ? undefined : query.isPublished ?? true,
      instructorId,
      search: query.search,
    });

    return {
      success: true,
      data: result.courses,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      },
      error: null,
    };
  }

  @Public()
  @Get(':id')
  @ApiResponse({ status: 200, description: 'Course details' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiOperation({ summary: 'Get a course by ID (published courses are publicly viewable)' })
  async getCourse(@Param('id', ParseIntPipe) id: number, @CurrentUser() user?: JwtPayload) {
    const course = await this.coursesService.getCourseById(
      id,
      user?.sub,
      user?.role,
    );

    return {
      success: true,
      data: course,
      error: null,
    };
  }

  @Public()
  @Get(':id/curriculum')
  @ApiResponse({ status: 200, description: 'Course with curriculum' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiOperation({ summary: 'Get course with full curriculum (sections + lectures)' })
  async getCourseCurriculum(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: JwtPayload,
  ) {
    const course = await this.coursesService.getCourseWithCurriculum(
      id,
      user?.sub,
      user?.role,
      false, // isEnrolled will be checked properly in future integration
    );

    return {
      success: true,
      data: course,
      error: null,
    };
  }

  // ─── Instructor/Admin: Create & Manage ──────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiResponse({ status: 201, description: 'Course created' })
  @ApiResponse({ status: 403, description: 'Forbidden — instructor/admin only' })
  @ApiOperation({ summary: 'Create a new course (instructor/admin only)' })
  async createCourse(@CurrentUser() user: JwtPayload, @Body() dto: CreateCourseDto) {
    const course = await this.coursesService.createCourse(user.sub, user.role, dto);

    return {
      success: true,
      data: course,
      error: null,
    };
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiResponse({ status: 200, description: 'Course updated' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiOperation({ summary: 'Update a course (owner instructor or admin only)' })
  async updateCourse(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateCourseDto,
  ) {
    const course = await this.coursesService.updateCourse(id, user.sub, user.role, dto);

    return {
      success: true,
      data: course,
      error: null,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiResponse({ status: 200, description: 'Course soft-deleted' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiOperation({ summary: 'Soft-delete a course (owner instructor or admin only)' })
  async deleteCourse(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.coursesService.deleteCourse(id, user.sub, user.role);

    return {
      success: true,
      data: { message: 'Course deleted successfully.' },
      error: null,
    };
  }
}
