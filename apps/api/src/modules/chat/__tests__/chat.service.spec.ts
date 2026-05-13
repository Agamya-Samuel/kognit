import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { MessagesRepository } from '../../../db/repositories/messages.repository';
import { ChannelsRepository } from '../../../db/repositories/channels.repository';
import { ChannelMembersRepository } from '../../../db/repositories/channel-members.repository';
import type { Message } from '../../../db/schema';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createMockMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 1,
    channelId: 10,
    senderId: 100,
    content: 'Hello world',
    replyToId: null,
    isEdited: false,
    isDeleted: false,
    moderationStatus: 'visible',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Message;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ChatService', () => {
  let service: ChatService;
  let messagesRepo: jest.Mocked<MessagesRepository>;
  let channelsRepo: jest.Mocked<ChannelsRepository>;
  let channelMembersRepo: jest.Mocked<ChannelMembersRepository>;

  beforeEach(async () => {
    const mockMessagesRepo = {
      findById: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      findByChannel: jest.fn(),
      findReplies: jest.fn(),
      flagMessage: jest.fn(),
      unflagMessage: jest.fn(),
      hideMessage: jest.fn(),
    };

    const mockChannelsRepo = {
      findById: jest.fn(),
    };

    const mockChannelMembersRepo = {
      findByChannelAndUser: jest.fn(),
      addMember: jest.fn(),
      updateLastRead: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: MessagesRepository, useValue: mockMessagesRepo },
        { provide: ChannelsRepository, useValue: mockChannelsRepo },
        { provide: ChannelMembersRepository, useValue: mockChannelMembersRepo },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    messagesRepo = module.get(MessagesRepository);
    channelsRepo = module.get(ChannelsRepository);
    channelMembersRepo = module.get(ChannelMembersRepository);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── sendMessage ─────────────────────────────────────────────────────────

  describe('sendMessage', () => {
    it('should send a message to a channel when user is a member', async () => {
      channelsRepo.findById.mockResolvedValue({ id: 10 } as any);
      channelMembersRepo.findByChannelAndUser.mockResolvedValue({ id: 1 } as any);
      const msg = createMockMessage();
      messagesRepo.create.mockResolvedValue(msg);

      const result = await service.sendMessage(100, 10, 'Hello');
      expect(result).toEqual(msg);
      expect(messagesRepo.create).toHaveBeenCalledWith({
        channelId: 10,
        senderId: 100,
        content: 'Hello',
        replyToId: null,
      });
    });

    it('should throw NotFoundException if channel does not exist', async () => {
      channelsRepo.findById.mockResolvedValue(null);
      await expect(service.sendMessage(100, 999, 'Hello')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not a channel member', async () => {
      channelsRepo.findById.mockResolvedValue({ id: 10 } as any);
      channelMembersRepo.findByChannelAndUser.mockResolvedValue(null);
      await expect(service.sendMessage(100, 10, 'Hello')).rejects.toThrow(ForbiddenException);
    });

    it('should allow replying to a top-level message', async () => {
      channelsRepo.findById.mockResolvedValue({ id: 10 } as any);
      channelMembersRepo.findByChannelAndUser.mockResolvedValue({ id: 1 } as any);
      const parent = createMockMessage({ id: 5, replyToId: null });
      messagesRepo.findById.mockResolvedValue(parent);
      const reply = createMockMessage({ replyToId: 5 });
      messagesRepo.create.mockResolvedValue(reply);

      const result = await service.sendMessage(100, 10, 'Reply', 5);
      expect(result.replyToId).toBe(5);
    });

    it('should reject reply to a reply (max depth 2)', async () => {
      channelsRepo.findById.mockResolvedValue({ id: 10 } as any);
      channelMembersRepo.findByChannelAndUser.mockResolvedValue({ id: 1 } as any);
      const parentReply = createMockMessage({ id: 5, replyToId: 3 });
      messagesRepo.findById.mockResolvedValue(parentReply);

      await expect(service.sendMessage(100, 10, 'Nested reply', 5))
        .rejects.toThrow(BadRequestException);
    });

    it('should reject reply to a message in a different channel', async () => {
      channelsRepo.findById.mockResolvedValue({ id: 10 } as any);
      channelMembersRepo.findByChannelAndUser.mockResolvedValue({ id: 1 } as any);
      const otherChannelMsg = createMockMessage({ id: 5, channelId: 99 });
      messagesRepo.findById.mockResolvedValue(otherChannelMsg);

      await expect(service.sendMessage(100, 10, 'Reply', 5))
        .rejects.toThrow(BadRequestException);
    });
  });

  // ─── editMessage ─────────────────────────────────────────────────────────

  describe('editMessage', () => {
    it('should edit own message', async () => {
      const msg = createMockMessage();
      const updated = createMockMessage({ content: 'Edited', isEdited: true });
      messagesRepo.findById.mockResolvedValue(msg);
      messagesRepo.update.mockResolvedValue(updated);

      const result = await service.editMessage(1, 100, 'Edited');
      expect(result.content).toBe('Edited');
      expect(messagesRepo.update).toHaveBeenCalledWith(1, { content: 'Edited', isEdited: true });
    });

    it('should throw ForbiddenException when editing another user message', async () => {
      messagesRepo.findById.mockResolvedValue(createMockMessage({ senderId: 999 }));
      await expect(service.editMessage(1, 100, 'Hack')).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when editing a deleted message', async () => {
      messagesRepo.findById.mockResolvedValue(createMockMessage({ isDeleted: true }));
      await expect(service.editMessage(1, 100, 'Nope')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when message not found', async () => {
      messagesRepo.findById.mockResolvedValue(null);
      await expect(service.editMessage(999, 100, 'Nope')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── deleteMessage ───────────────────────────────────────────────────────

  describe('deleteMessage', () => {
    it('should allow student to delete own message', async () => {
      messagesRepo.findById.mockResolvedValue(createMockMessage({ senderId: 100 }));
      messagesRepo.softDelete.mockResolvedValue(true);

      const result = await service.deleteMessage(1, 100, 'student');
      expect(result).toBe(true);
    });

    it('should reject student deleting another user message', async () => {
      messagesRepo.findById.mockResolvedValue(createMockMessage({ senderId: 999 }));
      await expect(service.deleteMessage(1, 100, 'student')).rejects.toThrow(ForbiddenException);
    });

    it('should allow instructor to delete any message', async () => {
      messagesRepo.findById.mockResolvedValue(createMockMessage({ senderId: 999 }));
      messagesRepo.softDelete.mockResolvedValue(true);

      const result = await service.deleteMessage(1, 200, 'instructor');
      expect(result).toBe(true);
    });

    it('should allow admin to delete any message', async () => {
      messagesRepo.findById.mockResolvedValue(createMockMessage({ senderId: 999 }));
      messagesRepo.softDelete.mockResolvedValue(true);

      const result = await service.deleteMessage(1, 300, 'admin');
      expect(result).toBe(true);
    });
  });

  // ─── getMessages ─────────────────────────────────────────────────────────

  describe('getMessages', () => {
    it('should return messages for a channel member', async () => {
      channelMembersRepo.findByChannelAndUser.mockResolvedValue({ id: 1 } as any);
      const paginated = { data: [createMockMessage()], total: 1, limit: 50, offset: 0 };
      messagesRepo.findByChannel.mockResolvedValue(paginated);

      const result = await service.getMessages(10, 100);
      expect(result.data).toHaveLength(1);
    });

    it('should throw ForbiddenException for non-member', async () => {
      channelMembersRepo.findByChannelAndUser.mockResolvedValue(null);
      await expect(service.getMessages(10, 100)).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── getReplies ──────────────────────────────────────────────────────────

  describe('getReplies', () => {
    it('should return replies for a channel member', async () => {
      const parent = createMockMessage({ id: 5 });
      messagesRepo.findById.mockResolvedValue(parent);
      channelMembersRepo.findByChannelAndUser.mockResolvedValue({ id: 1 } as any);
      const paginated = { data: [createMockMessage({ replyToId: 5 })], total: 1, limit: 50, offset: 0 };
      messagesRepo.findReplies.mockResolvedValue(paginated);

      const result = await service.getReplies(5, 100);
      expect(result.data).toHaveLength(1);
    });

    it('should throw NotFoundException if parent not found', async () => {
      messagesRepo.findById.mockResolvedValue(null);
      await expect(service.getReplies(999, 100)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── flagMessage ─────────────────────────────────────────────────────────

  describe('flagMessage', () => {
    it('should flag a visible message', async () => {
      const msg = createMockMessage();
      const flagged = createMockMessage({ moderationStatus: 'flagged' });
      messagesRepo.findById.mockResolvedValue(msg);
      messagesRepo.flagMessage.mockResolvedValue(flagged);

      const result = await service.flagMessage(1, 100);
      expect(result.moderationStatus).toBe('flagged');
    });

    it('should reject flagging a deleted message', async () => {
      messagesRepo.findById.mockResolvedValue(createMockMessage({ isDeleted: true }));
      await expect(service.flagMessage(1, 100)).rejects.toThrow(BadRequestException);
    });
  });

  // ─── moderateMessage ─────────────────────────────────────────────────────

  describe('moderateMessage', () => {
    it('should allow admin to hide a message', async () => {
      const msg = createMockMessage();
      const hidden = createMockMessage({ moderationStatus: 'hidden' });
      messagesRepo.findById.mockResolvedValue(msg);
      messagesRepo.hideMessage.mockResolvedValue(hidden);

      const result = await service.moderateMessage(1, 300, 'admin', 'hide');
      expect(result).toEqual(hidden);
    });

    it('should reject student moderating a message', async () => {
      await expect(service.moderateMessage(1, 100, 'student', 'hide'))
        .rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to delete via moderation', async () => {
      messagesRepo.findById.mockResolvedValue(createMockMessage());
      messagesRepo.softDelete.mockResolvedValue(true);

      const result = await service.moderateMessage(1, 300, 'admin', 'delete');
      expect(result).toBe(true);
    });
  });

  // ─── markAsRead ──────────────────────────────────────────────────────────

  describe('markAsRead', () => {
    it('should update lastReadAt for a member', async () => {
      channelMembersRepo.findByChannelAndUser.mockResolvedValue({ id: 1 } as any);
      channelMembersRepo.updateLastRead.mockResolvedValue(true);

      const result = await service.markAsRead(10, 100);
      expect(result).toBe(true);
    });

    it('should reject non-member', async () => {
      channelMembersRepo.findByChannelAndUser.mockResolvedValue(null);
      await expect(service.markAsRead(10, 100)).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── getMessage ──────────────────────────────────────────────────────────

  describe('getMessage', () => {
    it('should return a message for a member', async () => {
      const msg = createMockMessage();
      messagesRepo.findById.mockResolvedValue(msg);
      channelMembersRepo.findByChannelAndUser.mockResolvedValue({ id: 1 } as any);

      const result = await service.getMessage(1, 100);
      expect(result).toEqual(msg);
    });

    it('should throw NotFoundException if message not found', async () => {
      messagesRepo.findById.mockResolvedValue(null);
      await expect(service.getMessage(999, 100)).rejects.toThrow(NotFoundException);
    });
  });
});

