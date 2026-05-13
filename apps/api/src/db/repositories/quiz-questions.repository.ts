import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { quizQuestions } from '../schema';
import { eq, and, asc } from 'drizzle-orm';
import type { QuizQuestion } from '../schema';

@Injectable()
export class QuizQuestionsRepository extends BaseRepository<QuizQuestion> {
  constructor(db: any) {
    super(db, quizQuestions);
  }

  async findById(id: number): Promise<QuizQuestion | null> {
    try {
      const result = await this.db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findByAssignmentId(assignmentId: number): Promise<QuizQuestion[]> {
    try {
      return await this.db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.assignmentId, assignmentId))
        .orderBy(asc(quizQuestions.orderIndex));
    } catch (error) {
      this.handleError(error, 'findByAssignmentId');
      return [];
    }
  }

  async create(data: Omit<QuizQuestion, 'id'>): Promise<QuizQuestion> {
    try {
      const result = await this.db.insert(quizQuestions).values(data).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async createMany(items: Omit<QuizQuestion, 'id'>[]): Promise<QuizQuestion[]> {
    try {
      const result = await this.db.insert(quizQuestions).values(items).returning();
      return result;
    } catch (error) {
      this.handleError(error, 'createMany');
      throw error;
    }
  }

  async update(id: number, data: Partial<Omit<QuizQuestion, 'id'>>): Promise<QuizQuestion | null> {
    try {
      const result = await this.db
        .update(quizQuestions)
        .set(data)
        .where(eq(quizQuestions.id, id))
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
        .delete(quizQuestions)
        .where(eq(quizQuestions.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      this.handleError(error, 'delete');
      return false;
    }
  }

  async deleteByAssignmentId(assignmentId: number): Promise<boolean> {
    try {
      await this.db
        .delete(quizQuestions)
        .where(eq(quizQuestions.assignmentId, assignmentId));
      return true;
    } catch (error) {
      this.handleError(error, 'deleteByAssignmentId');
      return false;
    }
  }
}
