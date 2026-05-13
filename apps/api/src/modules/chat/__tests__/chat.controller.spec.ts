import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from '../chat.controller';
import { ChatService } from '../services/chat.service';
import { ChannelService } from '../services/channel.service';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createMockUser(overrides: Record<string, any> = {}) {
  return { sub: 100, email: 'user@test.com', role: 'student', ...overrides };
}

function createMockMessage(overrides: Record<string, any> = {}) {
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
  };
}

function createMockChannel(overrides: Record<string, any> = {}) {
  return {
    id: 10,
    courseId: 1,
    type: 'course',
    name: 'General Chat',
    createdAt: new Date(),
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ChatController', () => {
  let controller: ChatController;
  let chatService: jest.Mocked<ChatService>;
  let channelService: jest.Mocked<ChannelService>;

  beforeEach(async () => {
    const mockChatService = {
      sendMessage: jest.fn(),
      getMessages: jest.fn(),
      getMessage: jest.fn(),
      editMessage: jest.fn(),
      deleteMessage: jest.fn(),
      getReplies: jest.fn(),
      flagMessage: jest.fn(),
      moderateMessage: jest.fn(),
      markAsRead: jest.fn(),
    };

    const mockChannelService = {
      createChannel: jest.fn(),
      getChannels: jest.fn(),
      getChannel: jest.fn(),
      updateChannel: jest.fn(),
      joinChannel: jest.fn(),
      leaveChannel: jest.fn(),
      listMembers: jest.fn(),
      getCourseChannels: jest.fn(),
      getUserChannels: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        { provide: ChatService, useValue: mockChatService },
        { provide: ChannelService, useValue: mockChannelService },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    chatService = module.get(ChatService);
    channelService = module.get(ChannelService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── Message Endpoints ──────────────────────────────────────────────────

  describe('sendMessage', () => {
    it('should send a message', async () => {
      const msg = createMockMessage();
      chatService.sendMessage.mockResolvedValue(msg);
      const user = createMockUser();

      const result = await controller.sendMessage(
        { channelId: 10, content: 'Hello' } as any,
        user,
      );

      expect(result).toEqual(msg);
      expect(chatService.sendMessage).toHaveBeenCalledWith(100, 10, 'Hello', undefined);
    });

    it('should pass replyToId when provided', async () => {
      const msg = createMockMessage({ replyToId: 5 });
      chatService.sendMessage.mockResolvedValue(msg);
      const user = createMockUser();

      const result = await controller.sendMessage(
        { channelId: 10, content: 'Reply', replyToId: 5 } as any,
        user,
      );

      expect(chatService.sendMessage).toHaveBeenCalledWith(100, 10, 'Reply', 5);
    });
  });

  describe('getMessages', () => {
    it('should get messages for a channel', async () => {
      const paginated = { data: [createMockMessage()], total: 1, limit: 50, offset: 0 };
      chatService.getMessages.mockResolvedValue(paginated);
      const user = createMockUser();

      const result = await controller.getMessages(10, { limit: 50, offset: 0 } as any, user);

      expect(result).toEqual(paginated);
      expect(chatService.getMessages).toHaveBeenCalledWith(10, 100, { limit: 50, offset: 0 });
    });
  });

  describe('getMessage', () => {
    it('should get a single message', async () => {
      const msg = createMockMessage();
      chatService.getMessage.mockResolvedValue(msg);
      const user = createMockUser();

      const result = await controller.getMessage(1, user);

      expect(result).toEqual(msg);
      expect(chatService.getMessage).toHaveBeenCalledWith(1, 100);
    });
  });

  describe('editMessage', () => {
    it('should edit a message', async () => {
      const edited = createMockMessage({ content: 'Edited', isEdited: true });
      chatService.editMessage.mockResolvedValue(edited);
      const user = createMockUser();

      const result = await controller.editMessage(1, { content: 'Edited' } as any, user);

      expect(result.content).toBe('Edited');
      expect(chatService.editMessage).toHaveBeenCalledWith(1, 100, 'Edited');
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message and pass user role', async () => {
      chatService.deleteMessage.mockResolvedValue(true);
      const user = createMockUser({ role: 'student' });

      const result = await controller.deleteMessage(1, user);

      expect(result).toBe(true);
      expect(chatService.deleteMessage).toHaveBeenCalledWith(1, 100, 'student');
    });

    it('should pass admin role to service', async () => {
      chatService.deleteMessage.mockResolvedValue(true);
      const user = createMockUser({ role: 'admin' });

      await controller.deleteMessage(1, user);

      expect(chatService.deleteMessage).toHaveBeenCalledWith(1, 100, 'admin');
    });
  });

  describe('getReplies', () => {
    it('should get replies for a message', async () => {
      const paginated = { data: [createMockMessage({ replyToId: 5 })], total: 1, limit: 50, offset: 0 };
      chatService.getReplies.mockResolvedValue(paginated);
      const user = createMockUser();

      const result = await controller.getReplies(5, { limit: 50, offset: 0 } as any, user);

      expect(result).toEqual(paginated);
      expect(chatService.getReplies).toHaveBeenCalledWith(5, 100, { limit: 50, offset: 0 });
    });
  });

  describe('flagMessage', () => {
    it('should flag a message', async () => {
      const flagged = createMockMessage({ moderationStatus: 'flagged' });
      chatService.flagMessage.mockResolvedValue(flagged);
      const user = createMockUser();

      const result = await controller.flagMessage(1, { reason: 'spam' } as any, user);

      expect(result.moderationStatus).toBe('flagged');
      expect(chatService.flagMessage).toHaveBeenCalledWith(1, 100);
    });
  });

  describe('moderateMessage', () => {
    it('should moderate a message with action', async () => {
      const hidden = createMockMessage({ moderationStatus: 'hidden' });
      chatService.moderateMessage.mockResolvedValue(hidden);
      const user = createMockUser({ role: 'admin' });

      const result = await controller.moderateMessage(1, { action: 'hide' } as any, user);

      expect(result).toEqual(hidden);
      expect(chatService.moderateMessage).toHaveBeenCalledWith(1, 100, 'admin', 'hide');
    });

    it('should pass delete action to service', async () => {
      chatService.moderateMessage.mockResolvedValue(true);
      const user = createMockUser({ role: 'instructor' });

      await controller.moderateMessage(1, { action: 'delete' } as any, user);

      expect(chatService.moderateMessage).toHaveBeenCalledWith(1, 100, 'instructor', 'delete');
    });
  });

  describe('markAsRead', () => {
    it('should mark channel as read', async () => {
      chatService.markAsRead.mockResolvedValue(true);
      const user = createMockUser();

      const result = await controller.markAsRead(10, user);

      expect(result).toBe(true);
      expect(chatService.markAsRead).toHaveBeenCalledWith(10, 100);
    });
  });

  // ─── Channel Endpoints ──────────────────────────────────────────────────

  describe('createChannel', () => {
    it('should create a channel', async () => {
      const channel = createMockChannel();
      channelService.createChannel.mockResolvedValue(channel);
      const user = createMockUser({ role: 'instructor' });

      const result = await controller.createChannel(
        { name: 'General Chat', type: 'course', courseId: 1 } as any,
        user,
      );

      expect(result).toEqual(channel);
      expect(channelService.createChannel).toHaveBeenCalledWith('General Chat', 'course', 100, 1);
    });
  });

  describe('getChannels', () => {
    it('should list channels', async () => {
      const paginated = { data: [createMockChannel()], total: 1, limit: 20, offset: 0 };
      channelService.getChannels.mockResolvedValue(paginated);
      const user = createMockUser();

      const result = await controller.getChannels({ courseId: 1 } as any, user);

      expect(result).toEqual(paginated);
      expect(channelService.getChannels).toHaveBeenCalledWith(100, { courseId: 1 });
    });
  });

  describe('getChannel', () => {
    it('should get a channel by ID', async () => {
      const channel = createMockChannel();
      channelService.getChannel.mockResolvedValue(channel);

      const result = await controller.getChannel(10);

      expect(result).toEqual(channel);
      expect(channelService.getChannel).toHaveBeenCalledWith(10);
    });
  });

  describe('updateChannel', () => {
    it('should update a channel', async () => {
      const updated = createMockChannel({ name: 'Updated' });
      channelService.updateChannel.mockResolvedValue(updated);
      const user = createMockUser({ role: 'admin' });

      const result = await controller.updateChannel(10, { name: 'Updated' } as any, user);

      expect(result.name).toBe('Updated');
      expect(channelService.updateChannel).toHaveBeenCalledWith(10, 'Updated', 100, 'admin');
    });
  });

  describe('joinChannel', () => {
    it('should join a channel', async () => {
      const membership = { id: 1, channelId: 10, userId: 100, joinedAt: new Date(), lastReadAt: null };
      channelService.joinChannel.mockResolvedValue(membership);
      const user = createMockUser();

      const result = await controller.joinChannel(10, user);

      expect(result).toEqual(membership);
      expect(channelService.joinChannel).toHaveBeenCalledWith(10, 100);
    });
  });

  describe('leaveChannel', () => {
    it('should leave a channel', async () => {
      channelService.leaveChannel.mockResolvedValue(true);
      const user = createMockUser();

      const result = await controller.leaveChannel(10, user);

      expect(result).toBe(true);
      expect(channelService.leaveChannel).toHaveBeenCalledWith(10, 100);
    });
  });

  describe('listMembers', () => {
    it('should list members of a channel', async () => {
      const members = [{ id: 1, channelId: 10, userId: 100, joinedAt: new Date(), lastReadAt: null }];
      channelService.listMembers.mockResolvedValue(members);
      const user = createMockUser();

      const result = await controller.listMembers(10, user);

      expect(result).toHaveLength(1);
      expect(channelService.listMembers).toHaveBeenCalledWith(10, 100);
    });
  });

  describe('addMember', () => {
    it('should add a member to a channel', async () => {
      const membership = { id: 2, channelId: 10, userId: 200, joinedAt: new Date(), lastReadAt: null };
      channelService.joinChannel.mockResolvedValue(membership);
      const user = createMockUser({ role: 'instructor' });

      const result = await controller.addMember(10, { userId: 200 } as any, user);

      expect(result).toEqual(membership);
      expect(channelService.joinChannel).toHaveBeenCalledWith(10, 200);
    });
  });

  describe('getCourseChannels', () => {
    it('should get channels for a course', async () => {
      const paginated = { data: [createMockChannel()], total: 1, limit: 20, offset: 0 };
      channelService.getCourseChannels.mockResolvedValue(paginated);

      const result = await controller.getCourseChannels(1);

      expect(result).toEqual(paginated);
      expect(channelService.getCourseChannels).toHaveBeenCalledWith(1);
    });
  });

  describe('getMyChannels', () => {
    it('should get current user channels', async () => {
      const channels = [createMockChannel()];
      channelService.getUserChannels.mockResolvedValue(channels);
      const user = createMockUser();

      const result = await controller.getMyChannels(user);

      expect(result).toHaveLength(1);
      expect(channelService.getUserChannels).toHaveBeenCalledWith(100);
    });
  });
});

