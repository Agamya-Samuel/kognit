import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { LecturesRepository } from '../../db/repositories/lectures.repository';
import { SectionsRepository } from '../../db/repositories/sections.repository';
import { CoursesRepository } from '../../db/repositories/courses.repository';
import type { Lecture } from '../../db/schema';

@Injectable()
export class LecturesService {
  private readonly logger = new Logger(LecturesService.name);

  constructor(
    private readonly lecturesRepo: LecturesRepository,
    private readonly sectionsRepo: SectionsRepository,
    private readonly coursesRepo: CoursesRepository,
  ) {}

  /**
   * Create a new lecture within a section.
   */
  async createLecture(
    sectionId: number,
    userId: number,
    userRole: string,
    data: {
      title: string;
      description?: string;
      type?: 'video' | 'live' | 'text' | 'assignment' | 'quiz';
      orderIndex?: number;
      isFreePreview?: boolean;
      isPublished?: boolean;
    },
  ): Promise<Lecture> {
    const section = await this.sectionsRepo.findById(sectionId);
    if (!section) {
      throw new NotFoundException('Section not found.');
    }

    const course = await this.getCourseFromSection(sectionId);
    this.assertCanManage(course, userId, userRole);

    // If no orderIndex provided, place at the end
    if (data.orderIndex === undefined) {
      const existingLectures = await this.lecturesRepo.findBySectionId(sectionId, { limit: 1000 });
      data.orderIndex = existingLectures.data.length;
    }

    const lecture = await this.lecturesRepo.create({
      sectionId,
      title: data.title,
      description: data.description ?? null,
      orderIndex: data.orderIndex,
      type: data.type ?? 'video',
      uploadId: null,
      videoUrl: null,
      externalVideoUrl: null,
      muxAssetId: null,
      muxPlaybackId: null,
      durationSeconds: 0,
      isFreePreview: data.isFreePreview ?? false,
      isPublished: data.isPublished ?? false,
    });

    this.logger.log(`Lecture created: ${lecture.id} in section ${sectionId}`);
    return lecture;
  }

  /**
   * Get all lectures for a section.
   */
  async getLecturesBySection(
    sectionId: number,
    userId?: number,
    userRole?: string,
    isEnrolled?: boolean,
  ): Promise<Lecture[]> {
    const section = await this.sectionsRepo.findById(sectionId);
    if (!section) {
      throw new NotFoundException('Section not found.');
    }

    const course = await this.coursesRepo.findById(section.courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    // Access check
    if (course.status !== 'published') {
      if (!userId || (course.instructorId !== userId && userRole !== 'admin')) {
        throw new NotFoundException('Section not found.');
      }
    }

    const result = await this.lecturesRepo.findBySectionId(sectionId, { limit: 1000 });

    // Apply free preview logic for non-enrolled users
    if (!isEnrolled && userId !== course.instructorId && userRole !== 'admin') {
      return result.data.map((lecture) => {
        if (lecture.isFreePreview) return lecture;
        // Hide media details for non-preview lectures
        return {
          ...lecture,
          muxAssetId: null,
          muxPlaybackId: null,
          durationSeconds: 0,
          description: null,
        };
      });
    }

    return result.data;
  }

  /**
   * Get a single lecture by ID.
   */
  async getLectureById(
    lectureId: number,
    userId?: number,
    userRole?: string,
    isEnrolled?: boolean,
  ): Promise<Lecture> {
    const lecture = await this.lecturesRepo.findById(lectureId);
    if (!lecture) {
      throw new NotFoundException('Lecture not found.');
    }

    const course = await this.getCourseFromSection(lecture.sectionId);

    // Access check
    if (course.status !== 'published') {
      if (!userId || (course.instructorId !== userId && userRole !== 'admin')) {
        throw new NotFoundException('Lecture not found.');
      }
    }

    // Free preview enforcement
    if (
      !isEnrolled &&
      userId !== course.instructorId &&
      userRole !== 'admin' &&
      !lecture.isFreePreview
    ) {
      return {
        ...lecture,
        muxAssetId: null,
        muxPlaybackId: null,
        durationSeconds: 0,
        description: null,
      };
    }

    return lecture;
  }

  /**
   * Update a lecture.
   */
  async updateLecture(
    lectureId: number,
    userId: number,
    userRole: string,
    data: {
      title?: string;
      description?: string;
      type?: 'video' | 'live' | 'text' | 'assignment' | 'quiz';
      orderIndex?: number;
      isFreePreview?: boolean;
      isPublished?: boolean;
    },
  ): Promise<Lecture> {
    const lecture = await this.lecturesRepo.findById(lectureId);
    if (!lecture) {
      throw new NotFoundException('Lecture not found.');
    }

    const course = await this.getCourseFromSection(lecture.sectionId);
    this.assertCanManage(course, userId, userRole);

    const updated = await this.lecturesRepo.update(lectureId, data);
    if (!updated) {
      throw new NotFoundException('Lecture not found after update.');
    }

    this.logger.log(`Lecture updated: ${lectureId} by user ${userId}`);
    return updated;
  }

  /**
   * Delete a lecture.
   */
  async deleteLecture(
    lectureId: number,
    userId: number,
    userRole: string,
  ): Promise<void> {
    const lecture = await this.lecturesRepo.findById(lectureId);
    if (!lecture) {
      throw new NotFoundException('Lecture not found.');
    }

    const course = await this.getCourseFromSection(lecture.sectionId);
    this.assertCanManage(course, userId, userRole);

    const deleted = await this.lecturesRepo.delete(lectureId);
    if (!deleted) {
      throw new NotFoundException('Lecture not found for deletion.');
    }

    this.logger.log(`Lecture deleted: ${lectureId} by user ${userId}`);
  }

  /**
   * Reorder lectures within a section.
   */
  async reorderLectures(
    sectionId: number,
    userId: number,
    userRole: string,
    lectureIds: number[],
  ): Promise<Lecture[]> {
    const section = await this.sectionsRepo.findById(sectionId);
    if (!section) {
      throw new NotFoundException('Section not found.');
    }

    const course = await this.coursesRepo.findById(section.courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    this.assertCanManage(course, userId, userRole);

    // Verify all lectures belong to this section
    const existingLectures = await this.lecturesRepo.findBySectionId(sectionId, { limit: 1000 });
    const existingIds = new Set(existingLectures.data.map((l) => l.id));

    for (const id of lectureIds) {
      if (!existingIds.has(id)) {
        throw new NotFoundException(`Lecture ${id} does not belong to section ${sectionId}.`);
      }
    }

    // Update order for each lecture
    const updatePromises = lectureIds.map((id, index) =>
      this.lecturesRepo.update(id, { orderIndex: index }),
    );

    await Promise.all(updatePromises);

    // Return reordered lectures
    const result = await this.lecturesRepo.findBySectionId(sectionId, { limit: 1000 });
    return result.data;
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  /**
   * Get the course that owns the section containing a given lecture/section.
   */
  private async getCourseFromSection(sectionId: number): Promise<any> {
    const section = await this.sectionsRepo.findById(sectionId);
    if (!section) {
      throw new NotFoundException('Section not found.');
    }

    const course = await this.coursesRepo.findById(section.courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    return course;
  }

  /**
   * Assert the user can manage (create/update/delete) lectures in the course.
   */
  private assertCanManage(course: any, userId: number, userRole: string): void {
    if (userRole === 'admin') return;

    if (userRole !== 'instructor') {
      throw new ForbiddenException('Only instructors and admins can manage lectures.');
    }

    if (course.instructorId !== userId) {
      throw new ForbiddenException('You can only manage lectures in your own courses.');
    }
  }
}
