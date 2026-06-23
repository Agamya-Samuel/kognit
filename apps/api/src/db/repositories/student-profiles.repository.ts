import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { studentProfiles } from '../schema';
import { eq, desc, count } from 'drizzle-orm';
import type { StudentProfile } from '../schema';

@Injectable()
export class StudentProfilesRepository extends BaseRepository<StudentProfile> {
  constructor(db: any) {
    super(db, studentProfiles);
  }

  async findById(id: number): Promise<StudentProfile | null> {
    try {
      const result = await this.db
        .select()
        .from(studentProfiles)
        .where(eq(studentProfiles.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findByUserId(userId: number): Promise<StudentProfile | null> {
    try {
      const result = await this.db
        .select()
        .from(studentProfiles)
        .where(eq(studentProfiles.userId, userId))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByUserId');
      return null;
    }
  }

  async findMany(options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<StudentProfile>> {
    const defaultLimit = 10;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;
      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(studentProfiles)
          .orderBy(desc(studentProfiles.createdAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: count(studentProfiles.id) }).from(studentProfiles),
      ]);
      return { data, total: Number(totalResult[0]?.count ?? 0), limit, offset };
    } catch (error) {
      this.handleError(error, 'findMany');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async create(profileData: Omit<StudentProfile, 'id' | 'createdAt'>): Promise<StudentProfile> {
    try {
      const result = await this.db.insert(studentProfiles).values(profileData).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async update(id: number, profileData: Partial<Omit<StudentProfile, 'id' | 'createdAt'>>): Promise<StudentProfile | null> {
    try {
      const result = await this.db
        .update(studentProfiles)
        .set(profileData)
        .where(eq(studentProfiles.id, id))
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
        .delete(studentProfiles)
        .where(eq(studentProfiles.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      this.handleError(error, 'delete');
      return false;
    }
  }
}
