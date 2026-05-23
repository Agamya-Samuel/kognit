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

  // ─── Instructor Approval ─────────────────────────────────────────────────

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

  // ─── Course Moderation ───────────────────────────────────────────────────

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
}
