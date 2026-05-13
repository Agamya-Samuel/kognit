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
import { AssignmentService } from './services/assignment.service';
import { QuizService } from './services/quiz.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/auth.decorators';
import type { JwtPayload } from '../auth/strategies';
import {
  CreateAssignmentDto,
  UpdateAssignmentDto,
  AssignmentQueryDto,
  QuizQuestionDto,
  BulkCreateAssignmentsDto,
} from './dto/assignment.dto';

@ApiTags('Assignments')
@Controller('api/v1/assignments')
export class AssignmentsController {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly quizService: QuizService,
  ) {}

  // ─── Assignment CRUD ────────────────────────────────────────────────────

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List assignments with pagination and filtering' })
  async listAssignments(@Query() query: AssignmentQueryDto) {
    const result = await this.assignmentService.listAssignments({
      page: query.page,
      limit: query.limit,
      lectureId: query.lectureId,
      type: query.type,
    });

    return {
      success: true,
      data: result.assignments,
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

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get assignment by ID' })
  async getAssignment(@Param('id', ParseIntPipe) id: number) {
    const assignment = await this.assignmentService.getAssignmentById(id);

    return {
      success: true,
      data: assignment,
      error: null,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Create a new assignment (instructor/admin only)' })
  async createAssignment(@CurrentUser() user: JwtPayload, @Body() dto: CreateAssignmentDto) {
    const assignment = await this.assignmentService.createAssignment(user.sub, user.role, dto);

    return {
      success: true,
      data: assignment,
      error: null,
    };
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Update an assignment (owner or admin only)' })
  async updateAssignment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateAssignmentDto,
  ) {
    const assignment = await this.assignmentService.updateAssignment(
      id,
      user.sub,
      user.role,
      dto,
    );

    return {
      success: true,
      data: assignment,
      error: null,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Delete an assignment (owner or admin only)' })
  async deleteAssignment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.assignmentService.deleteAssignment(id, user.sub, user.role);

    return {
      success: true,
      data: { message: 'Assignment deleted successfully.' },
      error: null,
    };
  }

  // ─── Bulk Operations ────────────────────────────────────────────────────

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Bulk create assignments' })
  async bulkCreateAssignments(
    @CurrentUser() user: JwtPayload,
    @Body() dto: BulkCreateAssignmentsDto,
  ) {
    const result = await this.assignmentService.bulkCreateAssignments(
      user.sub,
      user.role,
      dto.assignments,
    );

    return {
      success: true,
      data: {
        created: result.created,
        errors: result.errors,
      },
      error: null,
    };
  }

  // ─── Quiz Questions ─────────────────────────────────────────────────────

  @Get(':id/questions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get quiz questions for an assignment' })
  async getQuizQuestions(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    // Instructors/admins see correct answers, students don't
    const includeAnswers = user.role === 'instructor' || user.role === 'admin';
    const questions = await this.quizService.getQuestions(id, includeAnswers);

    return {
      success: true,
      data: questions,
      error: null,
    };
  }

  @Post(':id/questions')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Add a quiz question to an MCQ assignment' })
  async addQuizQuestion(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: QuizQuestionDto,
  ) {
    const question = await this.quizService.addQuestion(id, user.sub, user.role, dto);

    return {
      success: true,
      data: question,
      error: null,
    };
  }

  @Post(':id/questions/bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Add multiple quiz questions to an MCQ assignment' })
  async addQuizQuestions(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Body() dtos: QuizQuestionDto[],
  ) {
    const questions = await this.quizService.addQuestions(id, user.sub, user.role, dtos);

    return {
      success: true,
      data: questions,
      error: null,
    };
  }

  @Put('questions/:questionId')
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Update a quiz question' })
  async updateQuizQuestion(
    @Param('questionId', ParseIntPipe) questionId: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: Partial<QuizQuestionDto>,
  ) {
    const question = await this.quizService.updateQuestion(
      questionId,
      user.sub,
      user.role,
      dto as any,
    );

    return {
      success: true,
      data: question,
      error: null,
    };
  }

  @Delete('questions/:questionId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Delete a quiz question' })
  async deleteQuizQuestion(
    @Param('questionId', ParseIntPipe) questionId: number,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.quizService.deleteQuestion(questionId, user.sub, user.role);

    return {
      success: true,
      data: { message: 'Question deleted successfully.' },
      error: null,
    };
  }
}
