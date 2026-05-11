import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { progress } from '../schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import type { Progress } from '../schema';

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

  async upsert(studentId: number, lectureId: number, watchedSeconds: number): Promise<Progress> {
    try {
      const existing = await this.findByStudentAndLecture(studentId, lectureId);
      if (existing) {
        const result = await this.db
          .update(progress)
          .set({ watchedSeconds, lastWatchedAt: new Date() })
          .where(eq(progress.id, existing.id))
          .returning();
        return result[0];
      }
      const result = await this.db
        .insert(progress)
        .values({ studentId, lectureId, watchedSeconds })
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
}
