import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { lessonAttachments } from '../schema';
import { eq, asc } from 'drizzle-orm';
import type { LessonAttachment } from '../schema';

@Injectable()
export class LessonAttachmentsRepository extends BaseRepository<LessonAttachment> {
  constructor(db: any) {
    super(db, lessonAttachments);
  }

  async findById(id: number): Promise<LessonAttachment | null> {
    try {
      const result = await this.db
        .select()
        .from(lessonAttachments)
        .where(eq(lessonAttachments.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findByLectureId(lectureId: number): Promise<LessonAttachment[]> {
    try {
      const result = await this.db
        .select()
        .from(lessonAttachments)
        .where(eq(lessonAttachments.lectureId, lectureId))
        .orderBy(asc(lessonAttachments.orderIndex));
      return result;
    } catch (error) {
      this.handleError(error, 'findByLectureId');
      return [];
    }
  }

  async create(data: Omit<LessonAttachment, 'id' | 'createdAt'>): Promise<LessonAttachment> {
    try {
      const result = await this.db
        .insert(lessonAttachments)
        .values(data)
        .returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.db
        .delete(lessonAttachments)
        .where(eq(lessonAttachments.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      this.handleError(error, 'delete');
      return false;
    }
  }

  async deleteByLectureId(lectureId: number): Promise<boolean> {
    try {
      await this.db
        .delete(lessonAttachments)
        .where(eq(lessonAttachments.lectureId, lectureId));
      return true;
    } catch (error) {
      this.handleError(error, 'deleteByLectureId');
      return false;
    }
  }

  async reorder(lectureId: number, orderedIds: number[]): Promise<boolean> {
    try {
      await this.db.transaction(async (trx: any) => {
        for (let i = 0; i < orderedIds.length; i++) {
          await trx
            .update(lessonAttachments)
            .set({ orderIndex: i })
            .where(eq(lessonAttachments.id, orderedIds[i]));
        }
      });
      return true;
    } catch (error) {
      this.handleError(error, 'reorder');
      return false;
    }
  }

  async countByLecture(lectureId: number): Promise<number> {
    try {
      const result = await this.db
        .select({ id: lessonAttachments.id })
        .from(lessonAttachments)
        .where(eq(lessonAttachments.lectureId, lectureId));
      return result.length;
    } catch (error) {
      this.handleError(error, 'countByLecture');
      return 0;
    }
  }
}
