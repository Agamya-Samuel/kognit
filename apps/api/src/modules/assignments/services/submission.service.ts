import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { SubmissionsRepository } from '../../../db/repositories/submissions.repository';
import { AssignmentsRepository } from '../../../db/repositories/assignments.repository';
import { AssignmentService, LateSubmissionResult } from './assignment.service';
import type { Submission, Assignment } from '../../../db/schema';

export interface SubmissionResult {
  submission: Submission;
  lateStatus: LateSubmissionResult;
  autoGradedScore?: number;
}

export interface PaginatedSubmissionsResponse {
  submissions: Submission[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

@Injectable()
export class SubmissionService {
  private readonly logger = new Logger(SubmissionService.name);

  constructor(
    private readonly submissionsRepo: SubmissionsRepository,
    private readonly assignmentsRepo: AssignmentsRepository,
    private readonly assignmentService: AssignmentService,
  ) {}

  // ─── Submit Assignment ─────────────────────────────────────────────────

  /**
   * Student submits an assignment. Handles MCQ auto-grading and late policy.
   */
  async submitAssignment(
    studentId: number,
    assignmentId: number,
    content: string,
  ): Promise<SubmissionResult> {
    // Verify assignment exists
    const assignment = await this.assignmentsRepo.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundException('Assignment not found.');
    }

    // Check for existing submission (one per student per assignment)
    const existing = await this.submissionsRepo.findByAssignmentAndStudent(
      assignmentId,
      studentId,
    );
    if (existing) {
      throw new BadRequestException('You have already submitted this assignment.');
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      throw new BadRequestException('Submission content cannot be empty.');
    }

    // Evaluate late submission
    const submittedAt = new Date();
    const lateStatus = this.assignmentService.evaluateLateSubmission(assignment, submittedAt);

    if (lateStatus.isLate && !lateStatus.isAccepted) {
      throw new BadRequestException(
        'The late submission window has closed. No further submissions are accepted.',
      );
    }

    // Auto-grade MCQ if applicable
    let autoGradedScore: number | undefined;
    const score: number | null = null;
    const gradedAt: Date | null = null;

    if (assignment.type === 'mcq') {
      // Validate MCQ answer format
      try {
        JSON.parse(content);
      } catch {
        throw new BadRequestException('MCQ submission must be valid JSON with question answers.');
      }

      // Import and use quiz service via lazy evaluation to avoid circular deps
      // The auto-grading is handled by the grading service, but for MCQ we do inline
      const { QuizService } = await import('./quiz.service');
      // We'll inject it properly through the module, for now set a flag
      autoGradedScore = undefined; // Will be set by grading service
    }

    // Create submission
    const submission = await this.submissionsRepo.create({
      assignmentId,
      studentId,
      content,
      score: null,
      feedback: null,
      gradedAt: null,
    });

    this.logger.log(
      `Submission created: ${submission.id} by student ${studentId} for assignment ${assignmentId}${lateStatus.isLate ? ' (LATE)' : ''}`,
    );

    return {
      submission,
      lateStatus,
      autoGradedScore,
    };
  }

  // ─── Get Submissions ───────────────────────────────────────────────────

  /**
   * Get a submission by ID.
   */
  async getSubmissionById(submissionId: number): Promise<Submission> {
    const submission = await this.submissionsRepo.findById(submissionId);
    if (!submission) {
      throw new NotFoundException('Submission not found.');
    }
    return submission;
  }

  /**
   * Get the student's submission for a specific assignment.
   */
  async getStudentSubmission(
    studentId: number,
    assignmentId: number,
  ): Promise<Submission | null> {
    return this.submissionsRepo.findByAssignmentAndStudent(assignmentId, studentId);
  }

  /**
   * List all submissions for an assignment (instructor view).
   */
  async listSubmissionsByAssignment(
    assignmentId: number,
    options: { page?: number; limit?: number } = {},
  ): Promise<PaginatedSubmissionsResponse> {
    const assignment = await this.assignmentsRepo.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundException('Assignment not found.');
    }

    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const offset = (page - 1) * limit;

    const result = await this.submissionsRepo.findByAssignment(assignmentId, { offset, limit });
    const totalPages = Math.ceil(result.total / limit);

    return {
      submissions: result.data,
      total: result.total,
      page,
      limit,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * List all submissions by a student.
   */
  async listSubmissionsByStudent(
    studentId: number,
    options: { page?: number; limit?: number; assignmentId?: number } = {},
  ): Promise<PaginatedSubmissionsResponse> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const offset = (page - 1) * limit;

    const result = await this.submissionsRepo.findMany({
      offset,
      limit,
      studentId,
      assignmentId: options.assignmentId,
    });
    const totalPages = Math.ceil(result.total / limit);

    return {
      submissions: result.data,
      total: result.total,
      page,
      limit,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}
