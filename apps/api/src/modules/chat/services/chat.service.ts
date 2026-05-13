import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { MessagesRepository } from '../../../db/repositories/messages.repository';
import { ChannelsRepository } from '../../../db/repositories/channels.repository';
import { ChannelMembersRepository } from '../../../db/repositories/channel-members.repository';
import type { Message } from '../../../db/schema';

export interface MessageWithReplies extends Message {
  replies?: Message[];
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly messagesRepo: MessagesRepository,
    private readonly channelsRepo: ChannelsRepository,
    private readonly channelMembersRepo: ChannelMembersRepository,
  ) {}

  // ─── Send Message ──────────────────────────────────────────────────────────

  async sendMessage(senderId: number, channelId: number, content: string, replyToId?: number): Promise<Message> {
    // Verify channel exists
    const channel = await this.channelsRepo.findById(channelId);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Verify user is a member of the channel
    const membership = await this.channelMembersRepo.findByChannelAndUser(channelId, senderId);
    if (!membership) {
      throw new ForbiddenException('You are not a member of this channel');
    }

    // If replying, verify parent message exists and belongs to same channel
    if (replyToId) {
      const parentMessage = await this.messagesRepo.findById(replyToId);
      if (!parentMessage || parentMessage.channelId !== channelId) {
        throw new BadRequestException('Parent message not found in this channel');
      }
      // Enforce max threading depth of 2 (can only reply to top-level messages)
      if (parentMessage.replyToId) {
        throw new BadRequestException('Cannot reply to a reply (max threading depth is 2)');
      }
    }

    return this.messagesRepo.create({
      channelId,
      senderId,
      content,
      replyToId: replyToId || null,
    });
  }

  // ─── Edit Message ──────────────────────────────────────────────────────────

  async editMessage(messageId: number, userId: number, content: string): Promise<Message> {
    const message = await this.messagesRepo.findById(messageId);
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }
    if (message.isDeleted) {
      throw new BadRequestException('Cannot edit a deleted message');
    }

    const updated = await this.messagesRepo.update(messageId, {
      content,
      isEdited: true,
    });
    if (!updated) {
      throw new NotFoundException('Message not found after update');
    }
    return updated;
  }

  // ─── Delete Message ────────────────────────────────────────────────────────

  async deleteMessage(messageId: number, userId: number, userRole: string): Promise<boolean> {
    const message = await this.messagesRepo.findById(messageId);
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Students can only delete their own messages
    if (userRole === 'student' && message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    // Instructors can delete any message in their course channels
    // Admins can delete any message
    if (userRole !== 'admin' && userRole !== 'instructor' && message.senderId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this message');
    }

    return this.messagesRepo.softDelete(messageId);
  }

  // ─── Get Messages (with pagination) ────────────────────────────────────────

  async getMessages(
    channelId: number,
    userId: number,
    options: { limit?: number; offset?: number } = {},
  ) {
    // Verify user is a member
    const membership = await this.channelMembersRepo.findByChannelAndUser(channelId, userId);
    if (!membership) {
      throw new ForbiddenException('You are not a member of this channel');
    }

    return this.messagesRepo.findByChannel(channelId, options);
  }

  // ─── Get Message Replies (threading) ───────────────────────────────────────

  async getReplies(
    parentMessageId: number,
    userId: number,
    options: { limit?: number; offset?: number } = {},
  ) {
    const parentMessage = await this.messagesRepo.findById(parentMessageId);
    if (!parentMessage) {
      throw new NotFoundException('Parent message not found');
    }

    // Verify membership
    const membership = await this.channelMembersRepo.findByChannelAndUser(parentMessage.channelId, userId);
    if (!membership) {
      throw new ForbiddenException('You are not a member of this channel');
    }

    return this.messagesRepo.findReplies(parentMessageId, options);
  }

  // ─── Message Moderation ────────────────────────────────────────────────────

  async flagMessage(messageId: number, userId: number): Promise<Message> {
    const message = await this.messagesRepo.findById(messageId);
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    if (message.isDeleted) {
      throw new BadRequestException('Cannot flag a deleted message');
    }

    const updated = await this.messagesRepo.flagMessage(messageId);
    if (!updated) {
      throw new NotFoundException('Message not found after flag');
    }
    return updated;
  }

  async unflagMessage(messageId: number, userId: number, userRole: string): Promise<Message> {
    if (userRole !== 'instructor' && userRole !== 'admin') {
      throw new ForbiddenException('Only instructors or admins can unflag messages');
    }

    const message = await this.messagesRepo.findById(messageId);
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const updated = await this.messagesRepo.unflagMessage(messageId);
    if (!updated) {
      throw new NotFoundException('Message not found after unflag');
    }
    return updated;
  }

  async moderateMessage(
    messageId: number,
    userId: number,
    userRole: string,
    action: 'flag' | 'unflag' | 'hide' | 'delete',
  ): Promise<Message | boolean> {
    if (userRole !== 'instructor' && userRole !== 'admin') {
      throw new ForbiddenException('Only instructors or admins can moderate messages');
    }

    const message = await this.messagesRepo.findById(messageId);
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    switch (action) {
      case 'flag':
        return this.messagesRepo.flagMessage(messageId);
      case 'unflag':
        return this.messagesRepo.unflagMessage(messageId);
      case 'hide':
        return this.messagesRepo.hideMessage(messageId);
      case 'delete':
        return this.messagesRepo.softDelete(messageId);
      default:
        throw new BadRequestException('Invalid moderation action');
    }
  }

  // ─── Mark as Read ──────────────────────────────────────────────────────────

  async markAsRead(channelId: number, userId: number): Promise<boolean> {
    const membership = await this.channelMembersRepo.findByChannelAndUser(channelId, userId);
    if (!membership) {
      throw new ForbiddenException('You are not a member of this channel');
    }
    return this.channelMembersRepo.updateLastRead(channelId, userId);
  }

  // ─── Get Single Message ────────────────────────────────────────────────────

  async getMessage(messageId: number, userId: number): Promise<Message> {
    const message = await this.messagesRepo.findById(messageId);
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Verify membership
    const membership = await this.channelMembersRepo.findByChannelAndUser(message.channelId, userId);
    if (!membership) {
      throw new ForbiddenException('You are not a member of this channel');
    }

    return message;
  }
}
