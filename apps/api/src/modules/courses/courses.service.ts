import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CoursesRepository } from '../../db/repositories/courses.repository';
import { SectionsRepository } from '../../db/repositories/sections.repository';
import { LecturesRepository } from '../../db/repositories/lectures.repository';
import { CourseSessionsRepository } from '../../db/repositories/course-sessions.repository';
import type { Course } from '../../db/schema';
// Domain list - must match @edutech/validation COURSE_DOMAINS
const COURSE_DOMAINS = [
  'Engineering & Tech', 'Design & Creativity', 'Business & Management',
  'Science & Mathematics', 'Language & Communication', 'Health & Wellness',
  'Arts & Humanities', 'Finance & Accounting', 'Personal Development', 'Competitive Exams',
] as const;

export interface CourseListOptions {
  page?: number;
  limit?: number;
  domain?: string;
  status?: string;
  courseStructure?: string;
  instructorId?: number;
  search?: string;
}

export interface PaginatedCoursesResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(
    private readonly coursesRepo: CoursesRepository,
    private readonly sectionsRepo: SectionsRepository,
    private readonly lecturesRepo: LecturesRepository,
    private readonly courseSessionsRepo: CourseSessionsRepository,
  ) {}

  // --- Course CRUD ---

  async createCourse(
    userId: number,
    userRole: string,
    data: {
      title: string;
      description?: string;
      domain: string;
      pricingType: 'free' | 'paid';
      priceInr?: number;
      courseStructure: 'live' | 'normal';
      thumbnailUrl?: string;
    },
  ): Promise<Course> {
    if (userRole !== 'instructor' && userRole !== 'admin') {
      throw new ForbiddenException('Only instructors and admins can create courses.');
    }

    if (data.pricingType === 'paid' && (!data.priceInr || data.priceInr <= 0)) {
      throw new BadRequestException('Paid courses must have a price greater than 0.');
    }

    const course = await this.coursesRepo.create({
      instructorId: userId,
      title: data.title,
      description: data.description ?? null,
      thumbnailUrl: data.thumbnailUrl ?? null,
      domain: data.domain,
      pricingType: data.pricingType,
      priceInr: data.pricingType === 'paid' ? (data.priceInr ?? 0) : 0,
      courseStructure: data.courseStructure,
      status: 'draft',
      revisionNotes: null,
      deletedAt: null,
    });

    this.logger.log(`Course created: ${course.id} by instructor ${userId}`);
    return course;
  }

  async getCourseById(
    courseId: number,
    userId?: number,
    userRole?: string,
  ): Promise<Course> {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    // Non-published courses: only owner or admin can see
    if (course.status !== 'published') {
      if (!userId || (course.instructorId !== userId && userRole !== 'admin')) {
        throw new NotFoundException('Course not found.');
      }
    }

    return course;
  }

  async getCourseWithCurriculum(
    courseId: number,
    userId?: number,
    userRole?: string,
    isEnrolled?: boolean,
  ) {
    const course = await this.getCourseById(courseId, userId, userRole);

    const sectionsResult = await this.sectionsRepo.findByCourseId(courseId, { limit: 1000 });
    const sections = sectionsResult.data;

    const sectionsWithLectures = await Promise.all(
      sections.map(async (section) => {
        const lecturesResult = await this.lecturesRepo.findBySectionId(section.id, { limit: 1000 });
        const lectures = lecturesResult.data;

        const filteredLectures = lectures.map((lecture) => {
          const isOwner = userId && course.instructorId === userId;
          const isAdmin = userRole === 'admin';

          if (isOwner || isAdmin || isEnrolled) {
            return lecture;
          }

          if (lecture.isFreePreview) {
            return lecture;
          }

          return {
            ...lecture,
            muxAssetId: null,
            muxPlaybackId: null,
            durationSeconds: 0,
            description: null,
          };
        });

        return {
          ...section,
          lectures: filteredLectures,
        };
      }),
    );

    return {
      ...course,
      sections: sectionsWithLectures,
    };
  }

  async listCourses(options: CourseListOptions): Promise<PaginatedCoursesResponse> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const offset = (page - 1) * limit;

    const result = await this.coursesRepo.findMany({
      offset,
      limit,
      instructorId: options.instructorId,
      status: options.status,
      courseStructure: options.courseStructure,
      domain: options.domain,
      search: options.search,
    });

    const totalPages = Math.ceil(result.total / limit);

    return {
      courses: result.data,
      total: result.total,
      page,
      limit,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async updateCourse(
    courseId: number,
    userId: number,
    userRole: string,
    data: {
      title?: string;
      description?: string;
      thumbnailUrl?: string;
      domain?: string;
      pricingType?: 'free' | 'paid';
      priceInr?: number;
      status?: string;
      revisionNotes?: string;
    },
  ): Promise<Course> {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    this.assertCanManage(course, userId, userRole);

    // Cannot edit a course that is in review (unless admin requesting revision)
    if (course.status === 'in_review' && userRole !== 'admin') {
      throw new ForbiddenException('Cannot edit a course that is currently in review.');
    }

    // Cannot edit an archived course
    if (course.status === 'archived') {
      throw new ForbiddenException('Cannot edit an archived course.');
    }

    // Validate pricing if being updated
    if (data.pricingType === 'paid' && data.priceInr !== undefined && data.priceInr <= 0) {
      throw new BadRequestException('Paid courses must have a price greater than 0.');
    }

    if (data.pricingType === 'free') {
      data.priceInr = 0;
    }

    // Build the update payload — exclude status and revisionNotes from regular update
    const { status: _status, revisionNotes: _revisionNotes, ...updateData } = data;

    const updated = await this.coursesRepo.update(courseId, updateData);
    if (!updated) {
      throw new NotFoundException('Course not found after update.');
    }

    this.logger.log(`Course updated: ${courseId} by user ${userId}`);
    return updated;
  }

  async deleteCourse(courseId: number, userId: number, userRole: string): Promise<void> {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    this.assertCanManage(course, userId, userRole);

    const deleted = await this.coursesRepo.softDelete(courseId);
    if (!deleted) {
      throw new NotFoundException('Course not found for deletion.');
    }

    this.logger.log(`Course deleted: ${courseId} by user ${userId}`);
  }

  // --- Lifecycle Actions ---

  async submitForReview(courseId: number, userId: number, userRole: string): Promise<Course> {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    this.assertCanManage(course, userId, userRole);

    if (course.status !== 'draft' && course.status !== 'revision_requested') {
      throw new BadRequestException(`Cannot submit for review from status: ${course.status}`);
    }

    // Validate pre-submission
    const validation = await this.validatePreSubmission(courseId);
    if (!validation.isValid) {
      throw new BadRequestException(
        `Course is not ready for review: ${validation.errors.map(e => e.message).join(', ')}`,
      );
    }

    const updated = await this.coursesRepo.updateStatus(courseId, 'in_review');
    if (!updated) {
      throw new NotFoundException('Course not found after status update.');
    }

    this.logger.log(`Course submitted for review: ${courseId} by user ${userId}`);
    return updated;
  }

  async approveCourse(courseId: number, adminId: number): Promise<Course> {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    if (course.status !== 'in_review') {
      throw new BadRequestException(`Cannot approve a course with status: ${course.status}`);
    }

    const updated = await this.coursesRepo.updateStatus(courseId, 'published');
    if (!updated) {
      throw new NotFoundException('Course not found after status update.');
    }

    this.logger.log(`Course approved: ${courseId} by admin ${adminId}`);
    return updated;
  }

  async requestRevision(courseId: number, adminId: number, notes: string): Promise<Course> {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    if (course.status !== 'in_review') {
      throw new BadRequestException(`Cannot request revision for a course with status: ${course.status}`);
    }

    const updated = await this.coursesRepo.updateStatus(courseId, 'revision_requested', notes);
    if (!updated) {
      throw new NotFoundException('Course not found after status update.');
    }

    this.logger.log(`Revision requested for course: ${courseId} by admin ${adminId}`);
    return updated;
  }

  async archiveCourse(courseId: number, userId: number, userRole: string): Promise<Course> {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    this.assertCanManage(course, userId, userRole);

    if (course.status === 'archived') {
      throw new BadRequestException('Course is already archived.');
    }

    const updated = await this.coursesRepo.updateStatus(courseId, 'archived');
    if (!updated) {
      throw new NotFoundException('Course not found after status update.');
    }

    this.logger.log(`Course archived: ${courseId} by user ${userId}`);
    return updated;
  }

  async validatePreSubmission(courseId: number): Promise<{
    isValid: boolean;
    errors: Array<{ field: string; message: string }>;
  }> {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    const errors: Array<{ field: string; message: string }> = [];

    // Basic info checks
    if (!course.description || course.description.trim().length === 0) {
      errors.push({ field: 'description', message: 'Course description is required.' });
    }

    if (!course.thumbnailUrl || course.thumbnailUrl.trim().length === 0) {
      errors.push({ field: 'thumbnailUrl', message: 'Course thumbnail is required.' });
    }

    if (course.courseStructure === 'normal') {
      // Must have at least one section with at least one lecture
      const sectionsResult = await this.sectionsRepo.findByCourseId(courseId, { limit: 1000 });
      if (sectionsResult.data.length === 0) {
        errors.push({ field: 'sections', message: 'At least one section is required.' });
      } else {
        let totalLectures = 0;
        for (const section of sectionsResult.data) {
          const lecturesResult = await this.lecturesRepo.findBySectionId(section.id, { limit: 1000 });
          totalLectures += lecturesResult.data.length;
        }
        if (totalLectures === 0) {
          errors.push({ field: 'lectures', message: 'At least one lesson is required.' });
        }
      }
    } else if (course.courseStructure === 'live') {
      // Must have at least one scheduled session
      const sessionCount = await this.courseSessionsRepo.countByCourse(courseId);
      if (sessionCount === 0) {
        errors.push({ field: 'sessions', message: 'At least one session is required for live courses.' });
      }
    }

    // Paid courses must have a price
    if (course.pricingType === 'paid' && (!course.priceInr || course.priceInr <= 0)) {
      errors.push({ field: 'priceInr', message: 'Paid courses must have a price greater than 0.' });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  getDomains(): string[] {
    return [...COURSE_DOMAINS];
  }

  // --- RBAC Helpers ---

  private assertCanManage(course: Course, userId: number, userRole: string): void {
    if (userRole === 'admin') return;

    if (userRole !== 'instructor') {
      throw new ForbiddenException('Only instructors and admins can manage courses.');
    }

    if (course.instructorId !== userId) {
      throw new ForbiddenException('You can only manage your own courses.');
    }
  }
}
