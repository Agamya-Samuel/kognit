import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { SubmissionsRepository } from '../../../db/repositories/submissions.repository';
import { AssignmentsRepository } from '../../../db/repositories/assignments.repository';
import { QuizService } from './quiz.service';
import { AssignmentService } from './assignment.service';
import type { Submission, Assignment } from '../../../db/schema';

export interface GradeResult {
  submission: Submission;
  originalScore: number;
  penaltyPercent: number;
  finalScore: number;
}

export interface BulkGradeResult {
  results: GradeResult[];
  errors: Array<{ submissionId: number; error: string }>;
}

@Injectable()
export class GradingService {
  private readonly logger = new Logger(GradingService.name);

  constructor(
    private readonly submissionsRepo: SubmissionsRepository,
    private readonly assignmentsRepo: AssignmentsRepository,
    private readonly quizService: QuizService,
    private readonly assignmentService: AssignmentService,
  ) {}

  // ─── Auto-Grade MCQ ────────────────────────────────────────────────────

  /**
   * Auto-grade an MCQ submission. Called after submission is created.
   */
  async autoGradeSubmission(submissionId: number): Promise<GradeResult> {
    const submission = await this.submissionsRepo.findById(submissionId);
    if (!submission) {
      throw new NotFoundException('Submission not found.');
    }

    const assignment = await this.assignmentsRepo.findById(submission.assignmentId);
    if (!assignment) {
      throw new NotFoundException('Assignment not found.');
    }

    if (assignment.type !== 'mcq') {
      throw new BadRequestException('Auto-grading is only available for MCQ submissions.');
    }

    // Auto-grade using quiz engine
    const gradeResult = await this.quizService.autoGradeMcq(assignment.id, submission.content);

    // Check late penalty
    const lateStatus = this.assignmentService.evaluateLateSubmission(
      assignment,
      new Date(submission.submittedAt),
    );

    // Calculate final score with penalty
    const penalizedScore = lateStatus.isLate && lateStatus.isWithinWindow
      ? this.assignmentService.calculatePenalizedScore(gradeResult.score, lateStatus.penaltyPercent)
      : gradeResult.score;

    // Update submission with score
    const updated = await this.submissionsRepo.grade(submissionId, penalizedScore, null);

    this.logger.log(
      `Auto-graded submission ${submissionId}: raw=${gradeResult.score}, penalty=${lateStatus.penaltyPercent}%, final=${penalizedScore}`,
    );

    return {
      submission: updated!,
      originalScore: gradeResult.score,
      penaltyPercent: lateStatus.penaltyPercent,
      finalScore: penalizedScore,
    };
  }

  // ─── Manual Grade ──────────────────────────────────────────────────────

  /**
   * Manually grade a submission (instructor/admin).
   * Applies late penalty if applicable.
   */
  async manualGrade(
    submissionId: number,
    instructorId: number,
    userRole: string,
    score: number,
    feedback?: string,
  ): Promise<GradeResult> {
    this.assertCanGrade(userRole);

    const submission = await this.submissionsRepo.findById(submissionId);
    if (!submission) {
      throw new NotFoundException('Submission not found.');
    }

    const assignment = await this.assignmentsRepo.findById(submission.assignmentId);
    if (!assignment) {
      throw new NotFoundException('Assignment not found.');
    }

    // Validate score range
    if (score < 0) {
      throw new BadRequestException('Score cannot be negative.');
    }
    if (score > assignment.maxScore) {
      throw new BadRequestException(`Score cannot exceed max score of ${assignment.maxScore}.`);
    }

    // Check late penalty
    const lateStatus = this.assignmentService.evaluateLateSubmission(
      assignment,
      new Date(submission.submittedAt),
    );

    // Calculate final score with penalty
    const penalizedScore = lateStatus.isLate && lateStatus.isWithinWindow
      ? this.assignmentService.calculatePenalizedScore(score, lateStatus.penaltyPercent)
      : score;

    // Update submission
    const updated = await this.submissionsRepo.grade(
      submissionId,
      penalizedScore,
      feedback ?? null,
    );

    this.logger.log(
      `Manually graded submission ${submissionId} by instructor ${instructorId}: raw=${score}, penalty=${lateStatus.penaltyPercent}%, final=${penalizedScore}`,
    );

    return {
      submission: updated!,
      originalScore: score,
      penaltyPercent: lateStatus.isLate ? lateStatus.penaltyPercent : 0,
      finalScore: penalizedScore,
    };
  }

  // ─── Bulk Grade ────────────────────────────────────────────────────────

  /**
   * Bulk grade multiple submissions.
   */
  async bulkGrade(
    instructorId: number,
    userRole: string,
    grades: Array<{ submissionId: number; score: number; feedback?: string }>,
  ): Promise<BulkGradeResult> {
    this.assertCanGrade(userRole);

    const results: GradeResult[] = [];
    const errors: Array<{ submissionId: number; error: string }> = [];

    for (const grade of grades) {
      try {
        const result = await this.manualGrade(
          grade.submissionId,
          instructorId,
          userRole,
          grade.score,
          grade.feedback,
        );
        results.push(result);
      } catch (error) {
        errors.push({
          submissionId: grade.submissionId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    this.logger.log(
      `Bulk grade: ${results.length} succeeded, ${errors.length} failed by instructor ${instructorId}`,
    );

    return { results, errors };
  }

  // ─── Helpers ───────────────────────────────────────────────────────────

  private assertCanGrade(userRole: string): void {
    if (userRole !== 'instructor' && userRole !== 'admin') {
      throw new ForbiddenException('Only instructors and admins can grade submissions.');
    }
  }
}
