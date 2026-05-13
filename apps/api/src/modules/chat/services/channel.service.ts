import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ChannelsRepository } from '../../../db/repositories/channels.repository';
import { ChannelMembersRepository } from '../../../db/repositories/channel-members.repository';
import type { Channel } from '../../../db/schema';

@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name);

  constructor(
    private readonly channelsRepo: ChannelsRepository,
    private readonly channelMembersRepo: ChannelMembersRepository,
  ) {}

  // ─── Create Channel ────────────────────────────────────────────────────────

  async createChannel(
    name: string,
    type: 'course' | 'general' | 'dm',
    creatorId: number,
    courseId?: number,
  ): Promise<Channel> {
    // Only instructors/admins can create channels
    const channel = await this.channelsRepo.create({
      name,
      type,
      courseId: courseId || null,
    });

    // Auto-join the creator
    await this.channelMembersRepo.addMember(channel.id, creatorId);

    return channel;
  }

  // ─── Get Channels ──────────────────────────────────────────────────────────

  async getChannels(
    userId: number,
    options: { courseId?: number; type?: string; limit?: number; offset?: number } = {},
  ) {
    return this.channelsRepo.findMany(options);
  }

  // ─── Get Channel by ID ─────────────────────────────────────────────────────

  async getChannel(channelId: number): Promise<Channel> {
    const channel = await this.channelsRepo.findById(channelId);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }
    return channel;
  }

  // ─── Update Channel ────────────────────────────────────────────────────────

  async updateChannel(channelId: number, name: string, userId: number, userRole: string): Promise<Channel> {
    const channel = await this.channelsRepo.findById(channelId);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    if (userRole !== 'admin' && userRole !== 'instructor') {
      throw new ForbiddenException('Only admins or instructors can update channels');
    }

    // Use the repository's update method
    const updated = await this.channelsRepo.update(channelId, { name });
    if (!updated) {
      throw new NotFoundException('Channel not found after update');
    }
    return updated;
  }

  // ─── Join Channel ──────────────────────────────────────────────────────────

  async joinChannel(channelId: number, userId: number) {
    const channel = await this.channelsRepo.findById(channelId);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Check if already a member
    const existing = await this.channelMembersRepo.findByChannelAndUser(channelId, userId);
    if (existing) {
      throw new BadRequestException('Already a member of this channel');
    }

    return this.channelMembersRepo.addMember(channelId, userId);
  }

  // ─── Leave Channel ─────────────────────────────────────────────────────────

  async leaveChannel(channelId: number, userId: number): Promise<boolean> {
    const channel = await this.channelsRepo.findById(channelId);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    return this.channelMembersRepo.removeMember(channelId, userId);
  }

  // ─── List Members ──────────────────────────────────────────────────────────

  async listMembers(channelId: number, userId: number) {
    const channel = await this.channelsRepo.findById(channelId);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Verify membership
    const membership = await this.channelMembersRepo.findByChannelAndUser(channelId, userId);
    if (!membership) {
      throw new ForbiddenException('You are not a member of this channel');
    }

    return this.channelMembersRepo.findMembersByChannel(channelId);
  }

  // ─── Get Channels for Course ───────────────────────────────────────────────

  async getCourseChannels(courseId: number) {
    return this.channelsRepo.findByCourse(courseId);
  }

  // ─── Get User's Channels ───────────────────────────────────────────────────

  async getUserChannels(userId: number) {
    return this.channelMembersRepo.findChannelsByUser(userId);
  }
}
