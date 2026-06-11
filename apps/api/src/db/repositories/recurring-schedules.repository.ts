import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { recurringSchedules } from '../schema';
import { eq, and, asc } from 'drizzle-orm';
import type { RecurringSchedule } from '../schema';

@Injectable()
export class RecurringSchedulesRepository extends BaseRepository<RecurringSchedule> {
  constructor(db: any) {
    super(db, recurringSchedules);
  }

  async findById(id: number): Promise<RecurringSchedule | null> {
    try {
      const result = await this.db
        .select()
        .from(recurringSchedules)
        .where(eq(recurringSchedules.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findByCourseId(courseId: number): Promise<RecurringSchedule[]> {
    try {
      const result = await this.db
        .select()
        .from(recurringSchedules)
        .where(eq(recurringSchedules.courseId, courseId))
        .orderBy(asc(recurringSchedules.startDate));
      return result;
    } catch (error) {
      this.handleError(error, 'findByCourseId');
      return [];
    }
  }

  async create(data: Omit<RecurringSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<RecurringSchedule> {
    try {
      const result = await this.db
        .insert(recurringSchedules)
        .values(data)
        .returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async update(id: number, data: Partial<Omit<RecurringSchedule, 'id' | 'createdAt' | 'updatedAt'>>): Promise<RecurringSchedule | null> {
    try {
      const result = await this.db
        .update(recurringSchedules)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(recurringSchedules.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'update');
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.db
        .delete(recurringSchedules)
        .where(eq(recurringSchedules.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      this.handleError(error, 'delete');
      return false;
    }
  }

  async countByCourse(courseId: number): Promise<number> {
    try {
      const result = await this.db
        .select({ id: recurringSchedules.id })
        .from(recurringSchedules)
        .where(eq(recurringSchedules.courseId, courseId));
      return result.length;
    } catch (error) {
      this.handleError(error, 'countByCourse');
      return 0;
    }
  }
}
