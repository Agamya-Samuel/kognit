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
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseQueryDto,
  RequestRevisionDto,
} from './dto/course.dto';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // --- Public/Authenticated: Browse Courses ---

  @Public()
  @Get('domains')
  @ApiResponse({ status: 200, description: 'Available course domains' })
  @ApiOperation({ summary: 'Get available course domain categories' })
  async getDomains() {
    return {
      success: true,
      data: this.coursesService.getDomains(),
      error: null,
    };
  }

  @Public()
  @Get()
  @ApiResponse({ status: 200, description: 'Paginated course list' })
  @ApiOperation({ summary: 'List courses with pagination, filtering, and search' })
  async listCourses(@Query() query: CourseQueryDto, @CurrentUser() user?: JwtPayload) {
    const instructorId = query.instructorOnly && user?.sub ? user.sub : query.instructorId;

    // For instructor view, show all statuses; for public, only published
    const status = query.instructorOnly && user?.sub ? query.status : (query.status ?? 'published');

    const result = await this.coursesService.listCourses({
      page: query.page,
      limit: query.limit,
      domain: query.domain,
      status,
      courseStructure: query.courseStructure,
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
    const course = await this.coursesService.getCourseById(id, user?.sub, user?.role);

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
      false,
    );

    return {
      success: true,
      data: course,
      error: null,
    };
  }

  // --- Pre-submission Validation ---

  @Get(':id/validation')
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiResponse({ status: 200, description: 'Validation result' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiOperation({ summary: 'Validate course readiness for submission' })
  async validateCourse(@Param('id', ParseIntPipe) id: number) {
    const result = await this.coursesService.validatePreSubmission(id);

    return {
      success: true,
      data: result,
      error: null,
    };
  }

  // --- Instructor/Admin: Create & Manage ---

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiResponse({ status: 201, description: 'Course created' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
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

  // --- Lifecycle Actions ---

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiResponse({ status: 200, description: 'Course submitted for review' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiOperation({ summary: 'Submit course for review' })
  async submitForReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const course = await this.coursesService.submitForReview(id, user.sub, user.role);

    return {
      success: true,
      data: course,
      error: null,
    };
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles('admin')
  @ApiResponse({ status: 200, description: 'Course approved and published' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiOperation({ summary: 'Approve a course (admin only)' })
  async approveCourse(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const course = await this.coursesService.approveCourse(id, user.sub);

    return {
      success: true,
      data: course,
      error: null,
    };
  }

  @Post(':id/request-revision')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles('admin')
  @ApiResponse({ status: 200, description: 'Revision requested' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiOperation({ summary: 'Request revision for a course (admin only)' })
  async requestRevision(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: RequestRevisionDto,
  ) {
    const course = await this.coursesService.requestRevision(id, user.sub, dto.notes);

    return {
      success: true,
      data: course,
      error: null,
    };
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiResponse({ status: 200, description: 'Course archived' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiOperation({ summary: 'Archive a course' })
  async archiveCourse(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const course = await this.coursesService.archiveCourse(id, user.sub, user.role);

    return {
      success: true,
      data: course,
      error: null,
    };
  }
}
