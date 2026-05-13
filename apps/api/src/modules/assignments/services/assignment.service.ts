import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { AssignmentsRepository } from '../../../db/repositories/assignments.repository';
import { LecturesRepository } from '../../../db/repositories/lectures.repository';
import { SectionsRepository } from '../../../db/repositories/sections.repository';
import { CoursesRepository } from '../../../db/repositories/courses.repository';
import type { Assignment } from '../../../db/schema';

export interface AssignmentListOptions {
  page?: number;
  limit?: number;
  lectureId?: number;
  type?: string;
}

export interface PaginatedAssignmentsResponse {
  assignments: Assignment[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface LateSubmissionResult {
  isLate: boolean;
  isWithinWindow: boolean;
  penaltyPercent: number;
  isAccepted: boolean;
}

@Injectable()
export class AssignmentService {
  private readonly logger = new Logger(AssignmentService.name);

  constructor(
    private readonly assignmentsRepo: AssignmentsRepository,
    private readonly lecturesRepo: LecturesRepository,
    private readonly sectionsRepo: SectionsRepository,
    private readonly coursesRepo: CoursesRepository,
  ) {}

  // ─── Assignment CRUD ───────────────────────────────────────────────────

  /**
   * Create a new assignment. Only instructors and admins can create.
   */
  async createAssignment(
    userId: number,
    userRole: string,
    data: {
      lectureId: number;
      title: string;
      description?: string;
      type: 'mcq' | 'short' | 'code';
      maxScore: number;
      dueAt: string;
      lateWindowHours?: number;
      latePenaltyPercent?: number;
    },
  ): Promise<Assignment> {
    this.assertCanManage(userRole);

    // Verify lecture exists and user owns the course
    const lecture = await this.lecturesRepo.findById(data.lectureId);
    if (!lecture) {
      throw new NotFoundException('Lecture not found.');
    }

    const course = await this.getCourseFromLecture(data.lectureId);
    this.assertCourseOwner(course, userId, userRole);

    // Validate due date is in the future
    const dueDate = new Date(data.dueAt);
    if (isNaN(dueDate.getTime())) {
      throw new BadRequestException('Invalid due date format.');
    }

    // Validate late submission config
    if (data.lateWindowHours !== undefined && data.lateWindowHours < 0) {
      throw new BadRequestException('Late window hours cannot be negative.');
    }
    if (data.latePenaltyPercent !== undefined && (data.latePenaltyPercent < 0 || data.latePenaltyPercent > 100)) {
      throw new BadRequestException('Late penalty percent must be between 0 and 100.');
    }

    const assignment = await this.assignmentsRepo.create({
      lectureId: data.lectureId,
      title: data.title,
      description: data.description ?? null,
      type: data.type,
      maxScore: data.maxScore,
      dueAt: dueDate,
      lateWindowHours: data.lateWindowHours ?? null,
      latePenaltyPercent: data.latePenaltyPercent ?? 0,
    });

    this.logger.log(`Assignment created: ${assignment.id} by user ${userId}`);
    return assignment;
  }

  /**
   * Get assignment by ID.
   */
  async getAssignmentById(assignmentId: number): Promise<Assignment> {
    const assignment = await this.assignmentsRepo.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundException('Assignment not found.');
    }
    return assignment;
  }

  /**
   * List assignments with pagination and filtering.
   */
  async listAssignments(options: AssignmentListOptions): Promise<PaginatedAssignmentsResponse> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const offset = (page - 1) * limit;

    const result = await this.assignmentsRepo.findMany({
      offset,
      limit,
      lectureId: options.lectureId,
      type: options.type,
    });

    const totalPages = Math.ceil(result.total / limit);

    return {
      assignments: result.data,
      total: result.total,
      page,
      limit,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Update an assignment. Only course owner or admin can update.
   */
  async updateAssignment(
    assignmentId: number,
    userId: number,
    userRole: string,
    data: {
      title?: string;
      description?: string;
      type?: 'mcq' | 'short' | 'code';
      maxScore?: number;
      dueAt?: string;
      lateWindowHours?: number;
      latePenaltyPercent?: number;
    },
  ): Promise<Assignment> {
    this.assertCanManage(userRole);

    const assignment = await this.assignmentsRepo.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundException('Assignment not found.');
    }

    const course = await this.getCourseFromLecture(assignment.lectureId);
    this.assertCourseOwner(course, userId, userRole);

    // Validate due date if provided
    if (data.dueAt) {
      const dueDate = new Date(data.dueAt);
      if (isNaN(dueDate.getTime())) {
        throw new BadRequestException('Invalid due date format.');
      }
      data.dueAt = dueDate.toISOString();
    }

    // Validate late submission config
    if (data.lateWindowHours !== undefined && data.lateWindowHours < 0) {
      throw new BadRequestException('Late window hours cannot be negative.');
    }
    if (data.latePenaltyPercent !== undefined && (data.latePenaltyPercent < 0 || data.latePenaltyPercent > 100)) {
      throw new BadRequestException('Late penalty percent must be between 0 and 100.');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.maxScore !== undefined) updateData.maxScore = data.maxScore;
    if (data.dueAt !== undefined) updateData.dueAt = new Date(data.dueAt);
    if (data.lateWindowHours !== undefined) updateData.lateWindowHours = data.lateWindowHours;
    if (data.latePenaltyPercent !== undefined) updateData.latePenaltyPercent = data.latePenaltyPercent;

    const updated = await this.assignmentsRepo.update(assignmentId, updateData);
    if (!updated) {
      throw new NotFoundException('Assignment not found after update.');
    }

    this.logger.log(`Assignment updated: ${assignmentId} by user ${userId}`);
    return updated;
  }

  /**
   * Delete an assignment. Only course owner or admin can delete.
   */
  async deleteAssignment(assignmentId: number, userId: number, userRole: string): Promise<void> {
    this.assertCanManage(userRole);

    const assignment = await this.assignmentsRepo.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundException('Assignment not found.');
    }

    const course = await this.getCourseFromLecture(assignment.lectureId);
    this.assertCourseOwner(course, userId, userRole);

    const deleted = await this.assignmentsRepo.delete(assignmentId);
    if (!deleted) {
      throw new NotFoundException('Assignment not found for deletion.');
    }

    this.logger.log(`Assignment deleted: ${assignmentId} by user ${userId}`);
  }

  // ─── Late Submission Policy ────────────────────────────────────────────

  /**
   * Evaluate late submission status against the assignment's policy.
   */
  evaluateLateSubmission(
    assignment: Assignment,
    submittedAt: Date,
  ): LateSubmissionResult {
    const dueDate = new Date(assignment.dueAt);

    // On-time submission
    if (submittedAt <= dueDate) {
      return {
        isLate: false,
        isWithinWindow: false,
        penaltyPercent: 0,
        isAccepted: true,
      };
    }

    // Late submission
    const lateWindowHours = assignment.lateWindowHours;

    // If no late window configured, late submissions are not accepted
    if (lateWindowHours === null || lateWindowHours === undefined) {
      return {
        isLate: true,
        isWithinWindow: false,
        penaltyPercent: 0,
        isAccepted: false,
      };
    }

    // Calculate the late deadline
    const lateDeadline = new Date(dueDate.getTime() + lateWindowHours * 60 * 60 * 1000);
    const isWithinWindow = submittedAt <= lateDeadline;

    return {
      isLate: true,
      isWithinWindow,
      penaltyPercent: isWithinWindow ? assignment.latePenaltyPercent : 0,
      isAccepted: isWithinWindow,
    };
  }

  /**
   * Calculate the final score after applying late penalty.
   */
  calculatePenalizedScore(rawScore: number, penaltyPercent: number): number {
    if (penaltyPercent <= 0) return rawScore;
    const penalty = Math.round((rawScore * penaltyPercent) / 100);
    return Math.max(0, rawScore - penalty);
  }

  // ─── Bulk Operations ──────────────────────────────────────────────────

  /**
   * Bulk create assignments. Returns created assignments and any failures.
   */
  async bulkCreateAssignments(
    userId: number,
    userRole: string,
    items: Array<{
      lectureId: number;
      title: string;
      description?: string;
      type: 'mcq' | 'short' | 'code';
      maxScore: number;
      dueAt: string;
      lateWindowHours?: number;
      latePenaltyPercent?: number;
    }>,
  ): Promise<{ created: Assignment[]; errors: Array<{ index: number; error: string }> }> {
    this.assertCanManage(userRole);

    const created: Assignment[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const assignment = await this.createAssignment(userId, userRole, items[i]);
        created.push(assignment);
      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    this.logger.log(`Bulk create: ${created.length} succeeded, ${errors.length} failed`);
    return { created, errors };
  }

  // ─── RBAC Helpers ──────────────────────────────────────────────────────

  private assertCanManage(userRole: string): void {
    if (userRole !== 'instructor' && userRole !== 'admin') {
      throw new ForbiddenException('Only instructors and admins can manage assignments.');
    }
  }

  private assertCourseOwner(course: any, userId: number, userRole: string): void {
    if (userRole === 'admin') return;
    if (course.instructorId !== userId) {
      throw new ForbiddenException('You can only manage assignments in your own courses.');
    }
  }

  private async getCourseFromLecture(lectureId: number): Promise<any> {
    const lecture = await this.lecturesRepo.findById(lectureId);
    if (!lecture) {
      throw new NotFoundException('Lecture not found.');
    }
    const section = await this.sectionsRepo.findById(lecture.sectionId);
    if (!section) {
      throw new NotFoundException('Section not found.');
    }
    const course = await this.coursesRepo.findById(section.courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }
    return course;
  }
}
