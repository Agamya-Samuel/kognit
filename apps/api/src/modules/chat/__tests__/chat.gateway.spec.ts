process.env.CORS_ORIGINS = 'http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004';

import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from '../chat.gateway';
import { ChatService } from '../services/chat.service';
import { TypingService, TypingUser } from '../services/typing.service';

// ─── Mock Factories ─────────────────────────────────────────────────────────

function createMockUser() {
  return { sub: 100, email: 'user@test.com', role: 'student' };
}

function createMockSocket(overrides: Record<string, any> = {}): any {
  return {
    id: 'socket-123',
    data: {} as Record<string, any>,
    emit: jest.fn(),
    join: jest.fn().mockResolvedValue(undefined),
    leave: jest.fn().mockResolvedValue(undefined),
    to: jest.fn().mockReturnThis(),
    ...overrides,
  };
}

function createMockServer() {
  return {
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
  };
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
    moderationStatus: 'visible' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let chatService: jest.Mocked<ChatService>;
  let typingService: jest.Mocked<TypingService>;
  let mockServer: ReturnType<typeof createMockServer>;

  beforeEach(async () => {
    mockServer = createMockServer();

    const mockChatService = {
      sendMessage: jest.fn(),
      editMessage: jest.fn(),
      deleteMessage: jest.fn(),
      getMessage: jest.fn(),
    };

    const mockTypingService = {
      startTyping: jest.fn(),
      stopTyping: jest.fn(),
      getTypingUsers: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: ChatService, useValue: mockChatService },
        { provide: TypingService, useValue: mockTypingService },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    chatService = module.get(ChatService);
    typingService = module.get(TypingService);

    // Inject mock server
    (gateway as any).server = mockServer;
  });

  afterEach(() => jest.clearAllMocks());

  // ─── handleSendMessage ─────────────────────────────────────────────────

  describe('handleSendMessage', () => {
    it('should send a message and broadcast to the channel room', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();
      const msg = createMockMessage();
      chatService.sendMessage.mockResolvedValue(msg);

      await gateway.handleSendMessage(
        { channelId: 10, content: 'Hello' },
        client,
      );

      expect(chatService.sendMessage).toHaveBeenCalledWith(100, 10, 'Hello', undefined);
      expect(mockServer.to).toHaveBeenCalledWith('channel:10');
      expect(typingService.stopTyping).toHaveBeenCalledWith(100, 10);
    });

    it('should send a reply message with replyToId', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();
      const reply = createMockMessage({ replyToId: 5 });
      chatService.sendMessage.mockResolvedValue(reply);

      await gateway.handleSendMessage(
        { channelId: 10, content: 'Reply', replyToId: 5 },
        client,
      );

      expect(chatService.sendMessage).toHaveBeenCalledWith(100, 10, 'Reply', 5);
    });

    it('should reject unauthenticated user', async () => {
      const client = createMockSocket();
      // No user data

      await gateway.handleSendMessage({ channelId: 10, content: 'Hello' }, client);

      expect(client.emit).toHaveBeenCalledWith('error', {
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
      expect(chatService.sendMessage).not.toHaveBeenCalled();
    });

    it('should emit error when service throws', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();
      chatService.sendMessage.mockRejectedValue(new Error('Channel not found'));

      await gateway.handleSendMessage({ channelId: 999, content: 'Hello' }, client);

      expect(client.emit).toHaveBeenCalledWith('error', {
        code: 'CHAT_ERROR',
        message: 'Channel not found',
      });
    });
  });

  // ─── handleEditMessage ─────────────────────────────────────────────────

  describe('handleEditMessage', () => {
    it('should edit a message and broadcast the update', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();
      const edited = createMockMessage({ content: 'Edited', isEdited: true });
      chatService.editMessage.mockResolvedValue(edited);

      await gateway.handleEditMessage(
        { messageId: 1, content: 'Edited' },
        client,
      );

      expect(chatService.editMessage).toHaveBeenCalledWith(1, 100, 'Edited');
      expect(mockServer.to).toHaveBeenCalledWith('channel:10');
    });

    it('should reject unauthenticated user', async () => {
      const client = createMockSocket();

      await gateway.handleEditMessage({ messageId: 1, content: 'X' }, client);

      expect(client.emit).toHaveBeenCalledWith('error', {
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
    });

    it('should emit error when service throws', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();
      chatService.editMessage.mockRejectedValue(new Error('Not found'));

      await gateway.handleEditMessage({ messageId: 999, content: 'X' }, client);

      expect(client.emit).toHaveBeenCalledWith('error', {
        code: 'CHAT_ERROR',
        message: 'Not found',
      });
    });
  });

  // ─── handleDeleteMessage ───────────────────────────────────────────────

  describe('handleDeleteMessage', () => {
    it('should delete a message and broadcast deletion', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();
      const msg = createMockMessage();
      chatService.getMessage.mockResolvedValue(msg);
      chatService.deleteMessage.mockResolvedValue(true);

      await gateway.handleDeleteMessage({ messageId: 1 }, client);

      expect(chatService.getMessage).toHaveBeenCalledWith(1, 100);
      expect(chatService.deleteMessage).toHaveBeenCalledWith(1, 100, 'student');
      expect(mockServer.to).toHaveBeenCalledWith('channel:10');
    });

    it('should reject unauthenticated user', async () => {
      const client = createMockSocket();

      await gateway.handleDeleteMessage({ messageId: 1 }, client);

      expect(client.emit).toHaveBeenCalledWith('error', {
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
    });

    it('should emit error when getMessage throws', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();
      chatService.getMessage.mockRejectedValue(new Error('Not found'));

      await gateway.handleDeleteMessage({ messageId: 999 }, client);

      expect(client.emit).toHaveBeenCalledWith('error', {
        code: 'CHAT_ERROR',
        message: 'Not found',
      });
    });
  });

  // ─── handleTyping ──────────────────────────────────────────────────────

  describe('handleTyping', () => {
    it('should start typing and broadcast to channel', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();
      const typingUsers: TypingUser[] = [
        { userId: 100, email: 'user@test.com', channelId: 10, startedAt: Date.now() },
      ];
      typingService.getTypingUsers.mockResolvedValue(typingUsers);

      await gateway.handleTyping({ channelId: 10, isTyping: true }, client);

      expect(typingService.startTyping).toHaveBeenCalledWith(100, 'user@test.com', 10);
      expect(client.to).toHaveBeenCalledWith('channel:10');
    });

    it('should stop typing when isTyping is false', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();
      typingService.getTypingUsers.mockResolvedValue([]);

      await gateway.handleTyping({ channelId: 10, isTyping: false }, client);

      expect(typingService.stopTyping).toHaveBeenCalledWith(100, 10);
      expect(typingService.startTyping).not.toHaveBeenCalled();
    });

    it('should do nothing for unauthenticated user', async () => {
      const client = createMockSocket();

      await gateway.handleTyping({ channelId: 10, isTyping: true }, client);

      expect(typingService.startTyping).not.toHaveBeenCalled();
      expect(typingService.stopTyping).not.toHaveBeenCalled();
    });
  });

  // ─── handleJoinChannel ─────────────────────────────────────────────────

  describe('handleJoinChannel', () => {
    it('should join a channel room and emit joined event', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();

      await gateway.handleJoinChannel({ channelId: 10 }, client);

      expect(client.join).toHaveBeenCalledWith('channel:10');
      expect(client.emit).toHaveBeenCalledWith('chat:joined', { channelId: 10 });
      expect(client.to).toHaveBeenCalledWith('channel:10');
    });

    it('should reject unauthenticated user', async () => {
      const client = createMockSocket();

      await gateway.handleJoinChannel({ channelId: 10 }, client);

      expect(client.emit).toHaveBeenCalledWith('error', {
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
      expect(client.join).not.toHaveBeenCalled();
    });
  });

  // ─── handleLeaveChannel ────────────────────────────────────────────────

  describe('handleLeaveChannel', () => {
    it('should leave a channel room and clear typing', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();

      await gateway.handleLeaveChannel({ channelId: 10 }, client);

      expect(client.leave).toHaveBeenCalledWith('channel:10');
      expect(typingService.stopTyping).toHaveBeenCalledWith(100, 10);
      expect(client.to).toHaveBeenCalledWith('channel:10');
    });

    it('should do nothing for unauthenticated user', async () => {
      const client = createMockSocket();

      await gateway.handleLeaveChannel({ channelId: 10 }, client);

      expect(client.leave).not.toHaveBeenCalled();
      expect(typingService.stopTyping).not.toHaveBeenCalled();
    });
  });
});

