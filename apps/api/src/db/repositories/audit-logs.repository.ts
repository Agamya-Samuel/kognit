import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { auditLogs } from '../schema';
import { eq, and, desc } from 'drizzle-orm';
import type { AuditLog } from '../schema';

@Injectable()
export class AuditLogsRepository extends BaseRepository<AuditLog> {
  constructor(db: any) {
    super(db, auditLogs);
  }

  async findById(id: number): Promise<AuditLog | null> {
    try {
      const result = await this.db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.id, id))
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
    actorId?: number;
    action?: string;
    entityType?: string;
    entityId?: number;
  } = {}): Promise<PaginatedResult<AuditLog>> {
    const defaultLimit = 20;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const conditions = [];
      if (options.actorId) {
        conditions.push(eq(auditLogs.actorId, options.actorId));
      }
      if (options.action) {
        conditions.push(eq(auditLogs.action, options.action));
      }
      if (options.entityType) {
        conditions.push(eq(auditLogs.entityType, options.entityType));
      }
      if (options.entityId) {
        conditions.push(eq(auditLogs.entityId, options.entityId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(auditLogs)
          .where(whereClause)
          .orderBy(desc(auditLogs.createdAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: auditLogs.id }).from(auditLogs).where(whereClause),
      ]);

      return { data, total: totalResult.length, limit, offset };
    } catch (error) {
      this.handleError(error, 'findMany');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async create(data: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    try {
      const result = await this.db.insert(auditLogs).values(data).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async findByActor(actorId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<AuditLog>> {
    return this.findMany({ ...options, actorId });
  }

  async findByEntity(entityType: string, entityId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<AuditLog>> {
    return this.findMany({ ...options, entityType, entityId });
  }

  async count(filters?: { actorId?: number; action?: string; entityType?: string; entityId?: number }): Promise<number> {
    try {
      const conditions = [];
      if (filters?.actorId) {
        conditions.push(eq(auditLogs.actorId, filters.actorId));
      }
      if (filters?.action) {
        conditions.push(eq(auditLogs.action, filters.action));
      }
      if (filters?.entityType) {
        conditions.push(eq(auditLogs.entityType, filters.entityType));
      }
      if (filters?.entityId) {
        conditions.push(eq(auditLogs.entityId, filters.entityId));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const result = await this.db.select({ count: auditLogs.id }).from(auditLogs).where(whereClause);
      return result.length;
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }
}
