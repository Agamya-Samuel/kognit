import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { progress, lectures, sections } from '../schema';
import { eq, and, desc, asc, sql, inArray } from 'drizzle-orm';
import type { Progress } from '../schema';

export interface CourseProgressSummary {
  courseId: number;
  totalLectures: number;
  completedLectures: number;
  watchedSeconds: number;
  totalDurationSeconds: number;
  progressPercentage: number;
}

export interface LectureProgressWithDetails extends Progress {
  lectureTitle: string;
  lectureDuration: number;
  sectionTitle: string;
  courseId: number;
  courseTitle: string;
}

@Injectable()
export class ProgressRepository extends BaseRepository<Progress> {
  constructor(db: any) {
    super(db, progress);
  }

  async findById(id: number): Promise<Progress | null> {
    try {
      const result = await this.db
        .select()
        .from(progress)
        .where(eq(progress.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findByStudentAndLecture(studentId: number, lectureId: number): Promise<Progress | null> {
    try {
      const result = await this.db
        .select()
        .from(progress)
        .where(and(eq(progress.studentId, studentId), eq(progress.lectureId, lectureId)))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByStudentAndLecture');
      return null;
    }
  }

  async findByStudent(studentId: number, options: { offset?: number; limit?: number } = {}) {
    const defaultLimit = 50;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;
      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(progress)
          .where(eq(progress.studentId, studentId))
          .orderBy(desc(progress.lastWatchedAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: progress.id }).from(progress).where(eq(progress.studentId, studentId)),
      ]);
      return { data, total: totalResult.length, limit, offset };
    } catch (error) {
      this.handleError(error, 'findByStudent');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async upsert(studentId: number, lectureId: number, watchedSeconds: number, isCompleted: boolean): Promise<Progress> {
    try {
      const existing = await this.findByStudentAndLecture(studentId, lectureId);
      if (existing) {
        const result = await this.db
          .update(progress)
          .set({
            watchedSeconds: Math.max(watchedSeconds, existing.watchedSeconds),
            isCompleted: isCompleted || existing.isCompleted,
            lastWatchedAt: new Date(),
          })
          .where(eq(progress.id, existing.id))
          .returning();
        return result[0];
      }
      const result = await this.db
        .insert(progress)
        .values({ studentId, lectureId, watchedSeconds, isCompleted })
        .returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'upsert');
      throw error;
    }
  }

  async count(filters?: { studentId?: number }): Promise<number> {
    try {
      const whereClause = filters?.studentId
        ? eq(progress.studentId, filters.studentId)
        : undefined;
      const result = await this.db.select({ count: progress.id }).from(progress).where(whereClause);
      return result.length;
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }

  async countCompleted(): Promise<number> {
    try {
      const result = await this.db
        .select({ count: progress.id })
        .from(progress)
        .where(eq(progress.isCompleted, true));
      return result.length;
    } catch (error) {
      this.handleError(error, 'countCompleted');
      return 0;
    }
  }

  /**
   * Get all lecture IDs for a course (published only)
   */
  async getCourseLectureIds(courseId: number): Promise<number[]> {
    try {
      const courseSections = await this.db
        .select({ id: sections.id })
        .from(sections)
        .where(eq(sections.courseId, courseId));

      if (courseSections.length === 0) return [];

      const sectionIds = courseSections.map(s => s.id);
      const courseLectures = await this.db
        .select({ id: lectures.id })
        .from(lectures)
        .where(
          and(
            inArray(lectures.sectionId, sectionIds),
            eq(lectures.isPublished, true),
          )
        );

      return courseLectures.map(l => l.id);
    } catch (error) {
      this.handleError(error, 'getCourseLectureIds');
      return [];
    }
  }

  /**
   * Get course progress summary for a student
   */
  async getCourseProgressSummary(studentId: number, courseId: number): Promise<CourseProgressSummary | null> {
    try {
      const lectureIds = await this.getCourseLectureIds(courseId);
      if (lectureIds.length === 0) {
        return {
          courseId,
          totalLectures: 0,
          completedLectures: 0,
          watchedSeconds: 0,
          totalDurationSeconds: 0,
          progressPercentage: 0,
        };
      }

      // Get all progress records for this student + course lectures
      const progressRecords = await this.db
        .select()
        .from(progress)
        .where(
          and(
            eq(progress.studentId, studentId),
            inArray(progress.lectureId, lectureIds),
          )
        );

      // Get total duration for all lectures
      const sectionIds = (await this.db
        .select({ id: sections.id })
        .from(sections)
        .where(eq(sections.courseId, courseId))
      ).map(s => s.id);

      const courseLectures = sectionIds.length > 0
        ? await this.db
            .select({ id: lectures.id, durationSeconds: lectures.durationSeconds })
            .from(lectures)
            .where(
              and(
                inArray(lectures.sectionId, sectionIds),
                eq(lectures.isPublished, true),
              )
            )
        : [];

      const totalDurationSeconds = courseLectures.reduce((sum, l) => sum + l.durationSeconds, 0);
      const completedLectures = progressRecords.filter(p => p.isCompleted).length;
      const watchedSeconds = progressRecords.reduce((sum, p) => sum + p.watchedSeconds, 0);

      return {
        courseId,
        totalLectures: lectureIds.length,
        completedLectures,
        watchedSeconds,
        totalDurationSeconds,
        progressPercentage: lectureIds.length > 0
          ? Math.round((completedLectures / lectureIds.length) * 100)
          : 0,
      };
    } catch (error) {
      this.handleError(error, 'getCourseProgressSummary');
      return null;
    }
  }

/**
 * Get watch time summary for a student
 */
export interface WatchTimeSummary {
  totalWatchedSeconds: number;
  totalCourses: number;
  lastWatchedAt: string | null;
}

/**
 * Get all progress for a student in a specific course
 */
async findByStudentAndCourse(studentId: number, courseId: number): Promise<Progress[]> {
  try {
    const lectureIds = await this.getCourseLectureIds(courseId);
    if (lectureIds.length === 0) return [];

    return this.db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.studentId, studentId),
          inArray(progress.lectureId, lectureIds),
        )
      );
  } catch (error) {
    this.handleError(error, 'findByStudentAndCourse');
    return [];
  }
}

/**
 * Get recently watched lectures with details for a student
 */
async getRecentWatchHistory(
  studentId: number,
  options: { offset?: number; limit?: number } = {},
): Promise<LectureProgressWithDetails[]> {
  try {
    const offset = options.offset ?? 0;
    const limit = options.limit ?? 20;

    const result = await this.db
      .select({
        progressId: progress.id,
        studentId: progress.studentId,
        lectureId: progress.lectureId,
        watchedSeconds: progress.watchedSeconds,
        isCompleted: progress.isCompleted,
        lastWatchedAt: progress.lastWatchedAt,
        lectureTitle: lectures.title,
        lectureDuration: lectures.durationSeconds,
        sectionTitle: sections.title,
        sectionCourseId: sections.courseId,
      })
      .from(progress)
      .innerJoin(lectures, eq(progress.lectureId, lectures.id))
      .innerJoin(sections, eq(lectures.sectionId, sections.id))
      .where(eq(progress.studentId, studentId))
      .orderBy(desc(progress.lastWatchedAt))
      .limit(limit)
      .offset(offset);

    return result.map(r => ({
      id: r.progressId,
      studentId: r.studentId,
      lectureId: r.lectureId,
      watchedSeconds: r.watchedSeconds,
      isCompleted: r.isCompleted,
      lastWatchedAt: r.lastWatchedAt,
      lectureTitle: r.lectureTitle,
      lectureDuration: r.lectureDuration,
      sectionTitle: r.sectionTitle,
      courseId: r.sectionCourseId,
      courseTitle: '', // Will be populated by service if needed
    }));
  } catch (error) {
    this.handleError(error, 'getRecentWatchHistory');
    return [];
  }
}

/**
 * Get watch time summary for a student
 */
async getWatchTimeSummary(studentId: number): Promise<WatchTimeSummary | null> {
  try {
    const result = await this.db
      .select({
        totalWatchedSeconds: sql<number>`SUM(${progress.watchedSeconds})`,
        totalCourses: sql<number>`COUNT(DISTINCT ${progress.courseId})`,
        lastWatchedAt: sql<string | null>`MAX(${progress.lastWatchedAt})`,
      })
      .from(progress)
      .where(eq(progress.studentId, studentId));

    if (result.length === 0) {
      return {
        totalWatchedSeconds: 0,
        totalCourses: 0,
        lastWatchedAt: null,
      };
    }

    const row = result[0];
    return {
      totalWatchedSeconds: row.totalWatchedSeconds ?? 0,
      totalCourses: row.totalCourses ?? 0,
      lastWatchedAt: row.lastWatchedAt ?? null,
    };
  } catch (error) {
    this.handleError(error, 'getWatchTimeSummary');
    return {
      totalWatchedSeconds: 0,
      totalCourses: 0,
      lastWatchedAt: null,
    };
  }
}
}
