import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { messages } from '../schema';
import { eq, and, desc, ne, asc, sql } from 'drizzle-orm';
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
    replyToId?: number | null;
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
      if (options.replyToId !== undefined) {
        if (options.replyToId === null) {
          // Top-level messages only (no reply)
          conditions.push(sql`${messages.replyToId} IS NULL`);
        } else {
          conditions.push(eq(messages.replyToId, options.replyToId));
        }
      }

      const whereClause = and(...conditions);

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(messages)
          .where(whereClause)
          .orderBy(asc(messages.createdAt))
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

  async create(data: Omit<Message, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'isEdited' | 'moderationStatus'>): Promise<Message> {
    try {
      const result = await this.db.insert(messages).values(data).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async update(id: number, data: Partial<Pick<Message, 'content' | 'isEdited' | 'isDeleted' | 'moderationStatus'>>): Promise<Message | null> {
    try {
      const result = await this.db
        .update(messages)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(messages.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'update');
      return null;
    }
  }

  async softDelete(id: number): Promise<boolean> {
    try {
      const result = await this.db
        .update(messages)
        .set({ isDeleted: true, updatedAt: new Date() })
        .where(eq(messages.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      this.handleError(error, 'softDelete');
      return false;
    }
  }

  async findByChannel(channelId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<Message>> {
    return this.findMany({ ...options, channelId, replyToId: null });
  }

  async findReplies(parentMessageId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<Message>> {
    return this.findMany({ ...options, replyToId: parentMessageId });
  }

  async flagMessage(id: number): Promise<Message | null> {
    return this.update(id, { moderationStatus: 'flagged' });
  }

  async unflagMessage(id: number): Promise<Message | null> {
    return this.update(id, { moderationStatus: 'visible' });
  }

  async hideMessage(id: number): Promise<Message | null> {
    return this.update(id, { moderationStatus: 'hidden' });
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

