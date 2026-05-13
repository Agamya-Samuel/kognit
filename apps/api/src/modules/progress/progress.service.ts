import { Injectable, Logger } from '@nestjs/common';
import { ProgressRepository } from '../../db/repositories/progress.repository';
import { LecturesRepository } from '../../db/repositories/lectures.repository';
import { SectionsRepository } from '../../db/repositories/sections.repository';
import { EnrollmentsRepository } from '../../db/repositories/enrollments.repository';
import { CoursesRepository } from '../../db/repositories/courses.repository';
import type { Lecture } from '../../db/schema';

export interface CompletionCheckResult {
  isCompleted: boolean;
  watchedSeconds: number;
  durationSeconds: number;
  percentage: number;
}

@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);

  /** Completion threshold: video must be watched to at least 95% to be marked complete */
  private readonly COMPLETION_THRESHOLD = 0.95;

  constructor(
    private readonly progressRepository: ProgressRepository,
    private readonly lecturesRepository: LecturesRepository,
    private readonly sectionsRepository: SectionsRepository,
    private readonly enrollmentsRepository: EnrollmentsRepository,
    private readonly coursesRepository: CoursesRepository,
  ) {}

  /**
   * Check if a lecture should be marked as completed
   * A lecture is complete when watchedSeconds >= 95% of durationSeconds
   */
  checkCompletion(watchedSeconds: number, durationSeconds: number): CompletionCheckResult {
    const percentage = durationSeconds > 0 ? (watchedSeconds / durationSeconds) * 100 : 0;
    const isCompleted = durationSeconds > 0 && (watchedSeconds / durationSeconds) >= this.COMPLETION_THRESHOLD;

    return {
      isCompleted,
      watchedSeconds,
      durationSeconds,
      percentage: Math.min(Math.round(percentage), 100),
    };
  }

  /**
   * Update progress for a student watching a lecture
   */
  async updateProgress(
    studentId: number,
    lectureId: number,
    watchedSeconds: number,
  ): Promise<{ watchedSeconds: number; isCompleted: boolean; progressPercentage: number }> {
    // Get lecture to know duration
    const lecture = await this.lecturesRepository.findById(lectureId);
    if (!lecture) {
      throw new Error('Lecture not found');
    }

    // Check completion
    const completion = this.checkCompletion(watchedSeconds, lecture.durationSeconds);

    // Upsert progress
    const progress = await this.progressRepository.upsert(
      studentId,
      lectureId,
      watchedSeconds,
      completion.isCompleted,
    );

    this.logger.log(
      `Progress updated for student ${studentId}, lecture ${lectureId}: ${watchedSeconds}s/${lecture.durationSeconds}s (${completion.percentage}%)${completion.isCompleted ? ' - COMPLETED' : ''}`,
    );

    return {
      watchedSeconds: progress.watchedSeconds,
      isCompleted: progress.isCompleted,
      progressPercentage: completion.percentage,
    };
  }

  /**
   * Get progress for a specific lecture
   */
  async getLectureProgress(
    studentId: number,
    lectureId: number,
  ): Promise<{
    lectureId: number;
    watchedSeconds: number;
    isCompleted: boolean;
    lastWatchedAt: string;
    durationSeconds: number;
    progressPercentage: number;
  } | null> {
    const lecture = await this.lecturesRepository.findById(lectureId);
    if (!lecture) return null;

    const progress = await this.progressRepository.findByStudentAndLecture(studentId, lectureId);

    if (!progress) {
      return {
        lectureId,
        watchedSeconds: 0,
        isCompleted: false,
        lastWatchedAt: new Date().toISOString(),
        durationSeconds: lecture.durationSeconds,
        progressPercentage: 0,
      };
    }

    const percentage = lecture.durationSeconds > 0
      ? Math.min(Math.round((progress.watchedSeconds / lecture.durationSeconds) * 100), 100)
      : 0;

    return {
      lectureId,
      watchedSeconds: progress.watchedSeconds,
      isCompleted: progress.isCompleted,
      lastWatchedAt: progress.lastWatchedAt.toISOString(),
      durationSeconds: lecture.durationSeconds,
      progressPercentage: percentage,
    };
  }

  /**
   * Get course progress summary for a student
   */
  async getCourseProgress(studentId: number, courseId: number) {
    return this.progressRepository.getCourseProgressSummary(studentId, courseId);
  }

  /**
   * Get all lecture progress for a student in a course
   */
  async getCourseLectureProgress(studentId: number, courseId: number) {
    const progressRecords = await this.progressRepository.findByStudentAndCourse(studentId, courseId);

    // Get lecture details for each progress record
    const result = await Promise.all(
      progressRecords.map(async (p) => {
        const lecture = await this.lecturesRepository.findById(p.lectureId);
        const percentage = lecture && lecture.durationSeconds > 0
          ? Math.min(Math.round((p.watchedSeconds / lecture.durationSeconds) * 100), 100)
          : 0;

        return {
          lectureId: p.lectureId,
          watchedSeconds: p.watchedSeconds,
          isCompleted: p.isCompleted,
          lastWatchedAt: p.lastWatchedAt.toISOString(),
          durationSeconds: lecture?.durationSeconds ?? 0,
          progressPercentage: percentage,
        };
      }),
    );

    return result;
  }

  /**
   * Get watch history for a student (recently watched lectures)
   */
  async getWatchHistory(
    studentId: number,
    options: { offset?: number; limit?: number } = {},
  ) {
    const { offset = 0, limit = 20 } = options;

    const items = await this.progressRepository.getRecentWatchHistory(studentId, { offset, limit });

    // Enrich with course titles
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        let courseTitle = '';
        if (item.courseId) {
          const course = await this.coursesRepository.findById(item.courseId);
          courseTitle = course?.title ?? '';
        }

        const percentage = item.lectureDuration > 0
          ? Math.min(Math.round((item.watchedSeconds / item.lectureDuration) * 100), 100)
          : 0;

        return {
          lectureId: item.lectureId,
          lectureTitle: item.lectureTitle,
          lectureDuration: item.lectureDuration,
          sectionTitle: item.sectionTitle,
          courseId: item.courseId,
          courseTitle,
          watchedSeconds: item.watchedSeconds,
          isCompleted: item.isCompleted,
          lastWatchedAt: item.lastWatchedAt.toISOString(),
          progressPercentage: percentage,
        };
      }),
    );

    const total = await this.progressRepository.count({ studentId });

    return {
      items: enrichedItems,
      total,
      limit,
      offset,
    };
  }

  /**
   * Verify enrollment before allowing progress updates
   */
  async verifyEnrollment(studentId: number, lectureId: number): Promise<boolean> {
    const lecture = await this.lecturesRepository.findById(lectureId);
    if (!lecture) return false;

    // Free preview lectures don't require enrollment for viewing
    if (lecture.isFreePreview) return true;

    const section = await this.sectionsRepository.findById(lecture.sectionId);
    if (!section) return false;

    return this.enrollmentsRepository.checkEnrollmentExists(studentId, section.courseId);
  }
}
