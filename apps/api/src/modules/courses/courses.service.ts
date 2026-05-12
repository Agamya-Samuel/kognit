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
import type { Course } from '../../db/schema';

export interface CourseListOptions {
  page?: number;
  limit?: number;
  domain?: string;
  isPublished?: boolean;
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
  ) {}

  // ─── Course CRUD ────────────────────────────────────────────────────────

  /**
   * Create a new course. Only instructors and admins can create courses.
   */
  async createCourse(
    userId: number,
    userRole: string,
    data: {
      title: string;
      description?: string;
      domain: string;
      pricingType: 'free' | 'paid';
      priceInr?: number;
    },
  ): Promise<Course> {
    if (userRole !== 'instructor' && userRole !== 'admin') {
      throw new ForbiddenException('Only instructors and admins can create courses.');
    }

    // Validate pricing: paid courses must have a price > 0
    if (data.pricingType === 'paid' && (!data.priceInr || data.priceInr <= 0)) {
      throw new BadRequestException('Paid courses must have a price greater than 0.');
    }

    const course = await this.coursesRepo.create({
      instructorId: userId,
      title: data.title,
      description: data.description ?? null,
      thumbnailUrl: null,
      domain: data.domain,
      pricingType: data.pricingType,
      priceInr: data.pricingType === 'paid' ? (data.priceInr ?? 0) : 0,
      isPublished: false,
      deletedAt: null,
    });

    this.logger.log(`Course created: ${course.id} by instructor ${userId}`);
    return course;
  }

  /**
   * Get a course by ID. Returns full details if user is the owner or admin.
   * For other users, only returns published courses.
   */
  async getCourseById(
    courseId: number,
    userId?: number,
    userRole?: string,
  ): Promise<Course> {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    // If not the owner or admin, only show published courses
    if (course.isPublished === false) {
      if (!userId || (course.instructorId !== userId && userRole !== 'admin')) {
        throw new NotFoundException('Course not found.');
      }
    }

    return course;
  }

  /**
   * Get a course with its sections and lectures (full curriculum).
   * Respects free preview rules for non-enrolled students.
   */
  async getCourseWithCurriculum(
    courseId: number,
    userId?: number,
    userRole?: string,
    isEnrolled?: boolean,
  ) {
    const course = await this.getCourseById(courseId, userId, userRole);

    // Get sections for this course
    const sectionsResult = await this.sectionsRepo.findByCourseId(courseId, { limit: 1000 });
    const sections = sectionsResult.data;

    // Get lectures for all sections
    const sectionsWithLectures = await Promise.all(
      sections.map(async (section) => {
        const lecturesResult = await this.lecturesRepo.findBySectionId(section.id, { limit: 1000 });
        const lectures = lecturesResult.data;

        // Apply free preview logic for non-enrolled students
        const filteredLectures = lectures.map((lecture) => {
          const isOwner = userId && course.instructorId === userId;
          const isAdmin = userRole === 'admin';

          if (isOwner || isAdmin || isEnrolled) {
            // Full access: return all lecture data
            return lecture;
          }

          // Non-enrolled user: only show title/meta for non-preview lectures
          if (lecture.isFreePreview) {
            return lecture;
          }

          // Hide media details for non-preview lectures
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

  /**
   * List courses with pagination, filtering, and search.
   */
  async listCourses(options: CourseListOptions): Promise<PaginatedCoursesResponse> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const offset = (page - 1) * limit;

    const result = await this.coursesRepo.findMany({
      offset,
      limit,
      instructorId: options.instructorId,
      isPublished: options.isPublished,
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

  /**
   * Update a course. Only the course owner (instructor) or admin can update.
   */
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
      isPublished?: boolean;
    },
  ): Promise<Course> {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    this.assertCanManage(course, userId, userRole);

    // Validate pricing if being updated
    if (data.pricingType === 'paid' && data.priceInr !== undefined && data.priceInr <= 0) {
      throw new BadRequestException('Paid courses must have a price greater than 0.');
    }

    // If switching to free, reset price
    if (data.pricingType === 'free') {
      data.priceInr = 0;
    }

    // If publishing, validate course has at least one section with a lecture
    if (data.isPublished === true && !course.isPublished) {
      const sections = await this.sectionsRepo.findByCourseId(courseId, { limit: 1000 });
      if (sections.data.length === 0) {
        throw new BadRequestException('Cannot publish a course without any sections.');
      }

      let hasLectures = false;
      for (const section of sections.data) {
        const lectures = await this.lecturesRepo.findBySectionId(section.id, { limit: 1 });
        if (lectures.data.length > 0) {
          hasLectures = true;
          break;
        }
      }
      if (!hasLectures) {
        throw new BadRequestException('Cannot publish a course without any lectures.');
      }
    }

    const updated = await this.coursesRepo.update(courseId, data);
    if (!updated) {
      throw new NotFoundException('Course not found after update.');
    }

    this.logger.log(`Course updated: ${courseId} by user ${userId}`);
    return updated;
  }

  /**
   * Soft-delete a course. Only the course owner or admin can delete.
   */
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

  // ─── RBAC Helpers ───────────────────────────────────────────────────────

  /**
   * Assert that the user can manage (update/delete) the course.
   * Instructors can only manage their own courses. Admins can manage all.
   */
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
