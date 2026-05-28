import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/auth.decorators';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiResponse({ status: 200, description: 'Paginated user list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin only' })
  @ApiOperation({ summary: 'List all users with pagination and filters' })
  async listUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.listUsers({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      role,
      search,
    });
  }

  @Get('users/:id')
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOperation({ summary: 'Get a single user by ID' })
  async getUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUser(id);
  }

  @Patch('users/:id/role')
  @ApiResponse({ status: 200, description: 'Role updated' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOperation({ summary: 'Update a user role' })
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { role: string },
  ) {
    return this.adminService.updateUserRole(id, body.role);
  }

  @Patch('users/:id/toggle-active')
  @ApiResponse({ status: 200, description: 'User active status toggled' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOperation({ summary: 'Toggle user active/inactive status' })
  async toggleUserActive(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.toggleUserActive(id);
  }

  @Delete('users/:id')
  @ApiResponse({ status: 200, description: 'User soft-deleted' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOperation({ summary: 'Soft-delete a user' })
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUser(id);
  }

  @Get('instructors')
  @ApiResponse({ status: 200, description: 'Paginated instructor list' })
  @ApiOperation({ summary: 'List instructor applications with filters' })
  async listInstructors(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.listPendingInstructors({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
    });
  }

  @Patch('instructors/:id/approve')
  @ApiResponse({ status: 200, description: 'Instructor approved' })
  @ApiParam({ name: 'id', description: 'Instructor ID' })
  @ApiOperation({ summary: 'Approve an instructor application' })
  async approveInstructor(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.approveInstructor(id);
  }

  @Patch('instructors/:id/reject')
  @ApiResponse({ status: 200, description: 'Instructor rejected' })
  @ApiParam({ name: 'id', description: 'Instructor ID' })
  @ApiOperation({ summary: 'Reject an instructor application' })
  async rejectInstructor(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reason: string },
  ) {
    return this.adminService.rejectInstructor(id, body.reason);
  }

  @Get('courses')
  @ApiResponse({ status: 200, description: 'Paginated course list for moderation' })
  @ApiOperation({ summary: 'List all courses with filters for moderation' })
  async listCourses(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('isPublished') isPublished?: string,
  ) {
    return this.adminService.listCourses({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      isPublished: isPublished === 'true' ? true : isPublished === 'false' ? false : undefined,
    });
  }

  @Patch('courses/:id/approve')
  @ApiResponse({ status: 200, description: 'Course approved and published' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiOperation({ summary: 'Approve a course (publish)' })
  async approveCourse(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.approveCourse(id);
  }

  @Patch('courses/:id/reject')
  @ApiResponse({ status: 200, description: 'Course rejected' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiOperation({ summary: 'Reject a course with reason' })
  async rejectCourse(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reason: string },
  ) {
    return this.adminService.rejectCourse(id, body.reason);
  }

  @Patch('courses/:id/suspend')
  @ApiResponse({ status: 200, description: 'Course suspended' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiOperation({ summary: 'Suspend a course (unpublish)' })
  async suspendCourse(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.suspendCourse(id);
  }

  @Get('dashboard/metrics')
  @ApiResponse({ status: 200, description: 'Dashboard metrics data' })
  @ApiOperation({ summary: 'Get platform dashboard metrics' })
  async getDashboardMetrics() {
    return this.adminService.getDashboardMetrics();
  }

  @Get('dashboard/chart')
  @ApiResponse({ status: 200, description: 'Chart data for analytics' })
  @ApiOperation({ summary: 'Get chart data for analytics' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to fetch data for' })
  async getChartData(@Query('days') days?: string) {
    return this.adminService.getChartData(days ? parseInt(days, 10) : 30);
  }

  @Get('assignments')
  @ApiResponse({ status: 200, description: 'Paginated assignment list' })
  @ApiOperation({ summary: 'List all assignments for admin management' })
  async listAssignments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.listAssignments({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      status,
    });
  }

  @Delete('assignments/:id')
  @ApiResponse({ status: 200, description: 'Assignment deleted' })
  @ApiParam({ name: 'id', description: 'Assignment ID' })
  @ApiOperation({ summary: 'Delete an assignment' })
  async deleteAssignment(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteAssignment(id);
  }

    @Get('settings')
    @ApiResponse({ status: 200, description: 'Platform settings data' })
    @ApiOperation({ summary: 'Get platform settings' })
    async getSettings() {
        return this.adminService.getSettings();
    }

     @Get('dashboard/demographics')
     @ApiResponse({ status: 200, description: 'User counts by role' })
     @ApiOperation({ summary: 'Get user counts by role for dashboard demographics' })
     async getUserCountsByRole() {
         return this.adminService.getUserCountsByRole();
     }

      @Get('dashboard/course-stats')
      @ApiResponse({ status: 200, description: 'Course counts by status' })
      @ApiOperation({ summary: 'Get course counts by status (active/draft/archived)' })
      async getCourseCountsByStatus() {
          return this.adminService.getCourseCountsByStatus();
      }

    @Get('dashboard/revenue-breakdown')
    @ApiResponse({ status: 200, description: 'Revenue breakdown by type' })
    @ApiOperation({ summary: 'Get revenue breakdown by type (course_sales, subscriptions, other)' })
    async getRevenueBreakdown() {
        return this.adminService.getRevenueBreakdown();
    }

    @Patch('settings')
    @ApiResponse({ status: 200, description: 'Platform settings updated' })
    @ApiOperation({ summary: 'Update platform settings' })
    async updateSettings(@Body() settingsData: any) {
        return this.adminService.updateSettings(settingsData);
    }
}