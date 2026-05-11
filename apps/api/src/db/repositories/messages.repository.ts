import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { messages } from '../schema';
import { eq, and, desc, ne } from 'drizzle-orm';
import type { Message } from '../schema';

@Injectable()
export class MessagesRepository extends BaseRepository<Message> {
  constructor(db: any) {
    super(db, messages);
  }

  async findById(id: number): Promise<Message | null> {
    try {
      const result = await this.db
        .select()
        .from(messages)
        .where(eq(messages.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findMany(options: {
    offset?: number;
    limit?: number;
    channelId?: number;
    senderId?: number;
  } = {}): Promise<PaginatedResult<Message>> {
    const defaultLimit = 50;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const conditions = [ne(messages.isDeleted, true)];
      if (options.channelId) {
        conditions.push(eq(messages.channelId, options.channelId));
      }
      if (options.senderId) {
        conditions.push(eq(messages.senderId, options.senderId));
      }

      const whereClause = and(...conditions);

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(messages)
          .where(whereClause)
          .orderBy(desc(messages.createdAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: messages.id }).from(messages).where(whereClause),
      ]);

      return { data, total: totalResult.length, limit, offset };
    } catch (error) {
      this.handleError(error, 'findMany');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async create(data: Omit<Message, 'id' | 'createdAt' | 'isDeleted'>): Promise<Message> {
    try {
      const result = await this.db.insert(messages).values(data).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async softDelete(id: number): Promise<boolean> {
    try {
      const result = await this.db
        .update(messages)
        .set({ isDeleted: true })
        .where(eq(messages.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      this.handleError(error, 'softDelete');
      return false;
    }
  }

  async findByChannel(channelId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<Message>> {
    return this.findMany({ ...options, channelId });
  }

  async count(filters?: { channelId?: number; senderId?: number }): Promise<number> {
    try {
      const conditions = [ne(messages.isDeleted, true)];
      if (filters?.channelId) {
        conditions.push(eq(messages.channelId, filters.channelId));
      }
      if (filters?.senderId) {
        conditions.push(eq(messages.senderId, filters.senderId));
      }
      const whereClause = and(...conditions);
      const result = await this.db.select({ count: messages.id }).from(messages).where(whereClause);
      return result.length;
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }
}

