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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/auth.decorators';
import { Roles } from '../auth/decorators/auth.decorators';
import type { JwtPayload } from '../auth/strategies';
import { CreateCourseDto, UpdateCourseDto, CourseQueryDto } from './dto/course.dto';

@ApiTags('Courses')
@Controller('api/v1/courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // ─── Public: Browse Courses ─────────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: 'List published courses with pagination, filtering, and search' })
  async listCourses(@Query() query: CourseQueryDto) {
    // Public listing only shows published courses
    const result = await this.coursesService.listCourses({
      page: query.page,
      limit: query.limit,
      domain: query.domain,
      isPublished: query.isPublished ?? true,
      instructorId: query.instructorId,
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
