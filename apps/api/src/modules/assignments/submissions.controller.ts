import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SubmissionService } from './services/submission.service';
import { GradingService } from './services/grading.service';
import { AssignmentsRepository } from '../../db/repositories/assignments.repository';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/auth.decorators';
import type { JwtPayload } from '../auth/strategies';
import {
  SubmitAssignmentDto,
  GradeSubmissionDto,
  SubmissionQueryDto,
  BulkGradeDto,
} from './dto/assignment.dto';

@ApiTags('Submissions')
@Controller()
export class SubmissionsController {
  constructor(
    private readonly submissionService: SubmissionService,
    private readonly gradingService: GradingService,
    private readonly assignmentsRepo: AssignmentsRepository,
  ) {}

  // ─── Student: Submit Assignment ─────────────────────────────────────────

  @Post('assignments/:assignmentId/submit')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @Roles('student')
  @ApiResponse({ status: 201, description: 'Assignment submitted' })
  @ApiParam({ name: 'assignmentId', description: 'Assignment ID' })
  @ApiOperation({ summary: 'Submit an assignment (student only)' })
  async submitAssignment(
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitAssignmentDto,
  ) {
    const result = await this.submissionService.submitAssignment(
      user.sub,
      assignmentId,
      dto.content,
    );

    // Auto-grade MCQ submissions immediately
    let gradeResult = null;
    if (result.lateStatus.isAccepted) {
      const submission = await this.submissionService.getSubmissionById(result.submission.id);
      // Check if assignment is MCQ type for auto-grading
      const assignment = await this.assignmentsRepo.findById(result.submission.assignmentId);
      if (assignment && assignment.type === 'mcq') {
        try {
          gradeResult = await this.gradingService.autoGradeSubmission(result.submission.id);
        } catch (error) {
          // Log error but don't fail the submission
          console.error('Auto-grading failed for submission:', error);
        }
      }
    }

    return {
      success: true,
      data: {
        submission: result.submission,
        lateStatus: result.lateStatus,
      },
      error: null,
    };
  }

  // ─── Student: View Own Submissions ──────────────────────────────────────

  @Get('students/me/submissions')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Submission history retrieved' })
  @ApiOperation({ summary: 'Get current student submission history' })
  async getMySubmissions(
    @CurrentUser() user: JwtPayload,
    @Query() query: SubmissionQueryDto,
  ) {
    const result = await this.submissionService.listSubmissionsByStudent(user.sub, {
      page: query.page,
      limit: query.limit,
      assignmentId: query.assignmentId,
    });

    return {
      success: true,
      data: result.submissions,
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

  @Get('assignments/:assignmentId/my-submission')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Submission details' })
  @ApiResponse({ status: 404, description: 'No submission found' })
  @ApiParam({ name: 'assignmentId', description: 'Assignment ID' })
  @ApiOperation({ summary: "Get current student's submission for a specific assignment" })
  async getMySubmission(
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const submission = await this.submissionService.getStudentSubmission(
      user.sub,
      assignmentId,
    );

    return {
      success: true,
      data: submission,
      error: null,
    };
  }

  // ─── Instructor: View & Grade Submissions ───────────────────────────────

  @Get('assignments/:assignmentId/submissions')
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiResponse({ status: 200, description: 'Submission list retrieved' })
  @ApiParam({ name: 'assignmentId', description: 'Assignment ID' })
  @ApiOperation({ summary: 'List all submissions for an assignment (instructor/admin)' })
  async listSubmissions(
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Query() query: SubmissionQueryDto,
  ) {
    const result = await this.submissionService.listSubmissionsByAssignment(assignmentId, {
      page: query.page,
      limit: query.limit,
    });

    return {
      success: true,
      data: result.submissions,
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

  @Get('submissions/:id')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Submission details' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  @ApiParam({ name: 'id', description: 'Submission ID' })
  @ApiOperation({ summary: 'Get a submission by ID' })
  async getSubmission(@Param('id', ParseIntPipe) id: number) {
    const submission = await this.submissionService.getSubmissionById(id);

    return {
      success: true,
      data: submission,
      error: null,
    };
  }

  @Put('submissions/:id/grade')
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiResponse({ status: 200, description: 'Submission graded' })
  @ApiParam({ name: 'id', description: 'Submission ID' })
  @ApiOperation({ summary: 'Manually grade a submission (instructor/admin)' })
  async gradeSubmission(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: GradeSubmissionDto,
  ) {
    const result = await this.gradingService.manualGrade(
      id,
      user.sub,
      user.role,
      dto.score,
      dto.feedback,
    );

    return {
      success: true,
      data: {
        submission: result.submission,
        originalScore: result.originalScore,
        penaltyPercent: result.penaltyPercent,
        finalScore: result.finalScore,
      },
      error: null,
    };
  }

  // ─── Bulk Grade ─────────────────────────────────────────────────────────

  @Post('submissions/bulk-grade')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiResponse({ status: 200, description: 'Bulk grading completed' })
  @ApiOperation({ summary: 'Bulk grade multiple submissions' })
  async bulkGrade(@CurrentUser() user: JwtPayload, @Body() dto: BulkGradeDto) {
    const result = await this.gradingService.bulkGrade(
      user.sub,
      user.role,
      dto.grades.map((g) => ({
        submissionId: g.submissionId,
        score: g.score,
        feedback: g.feedback,
      })),
    );

    return {
      success: true,
      data: {
        graded: result.results.map((r) => ({
          submission: r.submission,
          originalScore: r.originalScore,
          penaltyPercent: r.penaltyPercent,
          finalScore: r.finalScore,
        })),
        errors: result.errors,
      },
      error: null,
    };
  }

  // ─── Auto-Grade (trigger manually) ──────────────────────────────────────

  @Post('submissions/:id/auto-grade')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiResponse({ status: 200, description: 'Auto-grading completed' })
  @ApiParam({ name: 'id', description: 'Submission ID' })
  @ApiOperation({ summary: 'Trigger auto-grading for an MCQ submission' })
  async autoGradeSubmission(@Param('id', ParseIntPipe) id: number) {
    const result = await this.gradingService.autoGradeSubmission(id);

    return {
      success: true,
      data: {
        submission: result.submission,
        originalScore: result.originalScore,
        penaltyPercent: result.penaltyPercent,
        finalScore: result.finalScore,
      },
      error: null,
    };
  }
}
