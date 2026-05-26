import {
  Controller,
  Get,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/auth.decorators';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { InstructorStudentsService } from '../services/instructor-students.service';

@ApiTags('Courses')
@Controller('courses')
export class InstructorStudentsController {
  constructor(
    private readonly instructorStudentsService: InstructorStudentsService,
  ) {}

  @Get('instructor/students')
  @UseGuards(JwtAuthGuard)
  @Roles('instructor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get students enrolled in instructor courses' })
  @ApiResponse({ status: 200, description: 'Instructor students retrieved successfully' })
  async getInstructorStudents(
    @CurrentUser() user: { sub: number; role: string },
    @Query('search') search?: string,
    @Query('courseId') courseId?: string,
  ) {
    const data = await this.instructorStudentsService.getStudents(user.sub, { search, courseId });
    return {
      success: true,
      data,
    };
  }
}