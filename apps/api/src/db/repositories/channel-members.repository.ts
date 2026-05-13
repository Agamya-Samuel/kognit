import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { channelMembers } from '../schema';
import { eq, and } from 'drizzle-orm';
import type { ChannelMember } from '../schema';

@Injectable()
export class ChannelMembersRepository extends BaseRepository<ChannelMember> {
  constructor(db: any) {
    super(db, channelMembers);
  }

  async findByChannelAndUser(channelId: number, userId: number): Promise<ChannelMember | null> {
    try {
      const result = await this.db
        .select()
        .from(channelMembers)
        .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, userId)))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByChannelAndUser');
      return null;
    }
  }

  async findMembersByChannel(channelId: number): Promise<ChannelMember[]> {
    try {
      return await this.db
        .select()
        .from(channelMembers)
        .where(eq(channelMembers.channelId, channelId));
    } catch (error) {
      this.handleError(error, 'findMembersByChannel');
      return [];
    }
  }

  async findChannelsByUser(userId: number): Promise<ChannelMember[]> {
    try {
      return await this.db
        .select()
        .from(channelMembers)
        .where(eq(channelMembers.userId, userId));
    } catch (error) {
      this.handleError(error, 'findChannelsByUser');
      return [];
    }
  }

  async addMember(channelId: number, userId: number): Promise<ChannelMember> {
    try {
      const result = await this.db
        .insert(channelMembers)
        .values({ channelId, userId })
        .returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'addMember');
      throw error;
    }
  }

  async removeMember(channelId: number, userId: number): Promise<boolean> {
    try {
      const result = await this.db
        .delete(channelMembers)
        .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, userId)))
        .returning();
      return result.length > 0;
    } catch (error) {
      this.handleError(error, 'removeMember');
      return false;
    }
  }

  async updateLastRead(channelId: number, userId: number): Promise<boolean> {
    try {
      const result = await this.db
        .update(channelMembers)
        .set({ lastReadAt: new Date() })
        .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, userId)))
        .returning();
      return result.length > 0;
    } catch (error) {
      this.handleError(error, 'updateLastRead');
      return false;
    }
  }

  async countMembers(channelId: number): Promise<number> {
    try {
      const result = await this.db
        .select()
        .from(channelMembers)
        .where(eq(channelMembers.channelId, channelId));
      return result.length;
    } catch (error) {
      this.handleError(error, 'countMembers');
      return 0;
    }
  }
}
