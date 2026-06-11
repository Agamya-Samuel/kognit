import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SectionsRepository } from '../../db/repositories/sections.repository';
import { CoursesRepository } from '../../db/repositories/courses.repository';
import type { Section } from '../../db/schema';

@Injectable()
export class SectionsService {
  private readonly logger = new Logger(SectionsService.name);

  constructor(
    private readonly sectionsRepo: SectionsRepository,
    private readonly coursesRepo: CoursesRepository,
  ) {}

  /**
   * Create a new section within a course.
   */
  async createSection(
    courseId: number,
    userId: number,
    userRole: string,
    data: { title: string; description?: string; orderIndex?: number },
  ): Promise<Section> {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    this.assertCanManage(course, userId, userRole);

    // If no orderIndex provided, place at the end
    if (data.orderIndex === undefined) {
      const existingSections = await this.sectionsRepo.findByCourseId(courseId, { limit: 1000 });
      data.orderIndex = existingSections.data.length;
    }

    const section = await this.sectionsRepo.create({
      courseId,
      title: data.title,
      description: data.description ?? null,
      orderIndex: data.orderIndex,
    });

    this.logger.log(`Section created: ${section.id} in course ${courseId}`);
    return section;
  }

  /**
   * Get all sections for a course.
   */
  async getSectionsByCourse(
    courseId: number,
    userId?: number,
    userRole?: string,
  ): Promise<Section[]> {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    // Allow access to published courses or if user is owner/admin
    if (course.status !== 'published') {
      if (!userId || (course.instructorId !== userId && userRole !== 'admin')) {
        throw new NotFoundException('Course not found.');
      }
    }

    const result = await this.sectionsRepo.findByCourseId(courseId, { limit: 1000 });
    return result.data;
  }

  /**
   * Get a single section by ID (with course ownership verification).
   */
  async getSectionById(
    sectionId: number,
    userId?: number,
    userRole?: string,
  ): Promise<Section> {
    const section = await this.sectionsRepo.findById(sectionId);
    if (!section) {
      throw new NotFoundException('Section not found.');
    }

    // Verify course access
    const course = await this.coursesRepo.findById(section.courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    if (course.status !== 'published') {
      if (!userId || (course.instructorId !== userId && userRole !== 'admin')) {
        throw new NotFoundException('Section not found.');
      }
    }

    return section;
  }

  /**
   * Update a section.
   */
  async updateSection(
    sectionId: number,
    userId: number,
    userRole: string,
    data: { title?: string; orderIndex?: number },
  ): Promise<Section> {
    const section = await this.sectionsRepo.findById(sectionId);
    if (!section) {
      throw new NotFoundException('Section not found.');
    }

    const course = await this.coursesRepo.findById(section.courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    this.assertCanManage(course, userId, userRole);

    const updated = await this.sectionsRepo.update(sectionId, data);
    if (!updated) {
      throw new NotFoundException('Section not found after update.');
    }

    this.logger.log(`Section updated: ${sectionId} by user ${userId}`);
    return updated;
  }

  /**
   * Delete a section (and cascade delete lectures).
   */
  async deleteSection(
    sectionId: number,
    userId: number,
    userRole: string,
  ): Promise<void> {
    const section = await this.sectionsRepo.findById(sectionId);
    if (!section) {
      throw new NotFoundException('Section not found.');
    }

    const course = await this.coursesRepo.findById(section.courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    this.assertCanManage(course, userId, userRole);

    const deleted = await this.sectionsRepo.delete(sectionId);
    if (!deleted) {
      throw new NotFoundException('Section not found for deletion.');
    }

    this.logger.log(`Section deleted: ${sectionId} by user ${userId}`);
  }

  /**
   * Reorder sections by providing an ordered array of section IDs.
   */
  async reorderSections(
    courseId: number,
    userId: number,
    userRole: string,
    sectionIds: number[],
  ): Promise<Section[]> {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    this.assertCanManage(course, userId, userRole);

    // Verify all sections belong to this course
    const existingSections = await this.sectionsRepo.findByCourseId(courseId, { limit: 1000 });
    const existingIds = new Set(existingSections.data.map((s) => s.id));

    for (const id of sectionIds) {
      if (!existingIds.has(id)) {
        throw new NotFoundException(`Section ${id} does not belong to course ${courseId}.`);
      }
    }

    // Update order for each section
    const updatePromises = sectionIds.map((id, index) =>
      this.sectionsRepo.update(id, { orderIndex: index }),
    );

    await Promise.all(updatePromises);

    // Return reordered sections
    const result = await this.sectionsRepo.findByCourseId(courseId, { limit: 1000 });
    return result.data;
  }

  // ─── RBAC Helper ────────────────────────────────────────────────────────

  private assertCanManage(course: any, userId: number, userRole: string): void {
    if (userRole === 'admin') return;

    if (userRole !== 'instructor') {
      throw new ForbiddenException('Only instructors and admins can manage sections.');
    }

    if (course.instructorId !== userId) {
      throw new ForbiddenException('You can only manage sections in your own courses.');
    }
  }
}
