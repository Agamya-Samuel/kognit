import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SocketGateway } from '../socket.gateway';
import { WsJwtGuard, WsAuthenticatedUser } from '../guards/ws-jwt.guard';
import { RoomService } from '../services/room.service';
import { PresenceService } from '../services/presence.service';
import { SocketRateLimiterService } from '../services/rate-limiter.service';
import { RedisService } from '../../../redis/redis.service';

// ─── Mock Factories ───────────────────────────────────────────────────────────

function createMockUser(): WsAuthenticatedUser {
  return { sub: 1, email: 'user@test.com', role: 'student' };
}

function createMockSocket(overrides: Record<string, any> = {}): any {
  const rooms = new Set<string>();
  return {
    id: 'socket-123',
    data: {} as Record<string, any>,
    handshake: {
      auth: {},
      headers: {},
      query: {},
      ...overrides.handshake,
    },
    rooms,
    emit: jest.fn(),
    disconnect: jest.fn(),
    join: jest.fn((room: string) => { rooms.add(room); return Promise.resolve(); }),
    leave: jest.fn((room: string) => { rooms.delete(room); return Promise.resolve(); }),
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

function createMockJwtService() {
  return {
    verify: jest.fn().mockImplementation((token: string) => {
      if (token === 'valid-token') return createMockUser();
      throw new Error('Invalid token');
    }),
    sign: jest.fn().mockReturnValue('signed-token'),
  };
}

function createMockConfigService() {
  return {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') return 'test-jwt-secret';
      return null;
    }),
  };
}

function createMockPresenceService() {
  return {
    setUserOnline: jest.fn().mockResolvedValue(undefined),
    setUserOffline: jest.fn().mockResolvedValue(undefined),
    updateUserRooms: jest.fn().mockResolvedValue(undefined),
    getUserPresence: jest.fn().mockResolvedValue(null),
    isUserOnline: jest.fn().mockResolvedValue(false),
    getOnlineUserIds: jest.fn().mockResolvedValue([]),
    getUsersInRoom: jest.fn().mockResolvedValue([]),
  };
}

function createMockRateLimiter() {
  return {
    checkLimit: jest.fn().mockResolvedValue({
      allowed: true,
      remaining: 29,
      resetAt: Date.now() + 60000,
    }),
    cleanup: jest.fn().mockResolvedValue(undefined),
    resetLimit: jest.fn().mockResolvedValue(undefined),
  };
}

function createMockRedisService() {
  const store: Map<string, string> = new Map();
  return {
    getClient: jest.fn().mockReturnValue({
      get: jest.fn((key: string) => Promise.resolve(store.get(key) || null)),
      setex: jest.fn((key: string, ttl: number, value: string) => {
        store.set(key, value);
        return Promise.resolve('OK');
      }),
      del: jest.fn((key: string) => {
        store.delete(key);
        return Promise.resolve(1);
      }),
      sadd: jest.fn().mockResolvedValue(1),
      srem: jest.fn().mockResolvedValue(1),
      smembers: jest.fn().mockResolvedValue([]),
      sismember: jest.fn().mockResolvedValue(0),
    }),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SocketGateway', () => {
  let gateway: SocketGateway;
  let wsJwtGuard: WsJwtGuard;
  let presenceService: PresenceService;
  let rateLimiter: SocketRateLimiterService;
  let mockServer: ReturnType<typeof createMockServer>;

  beforeEach(async () => {
    mockServer = createMockServer();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocketGateway,
        WsJwtGuard,
        RoomService,
        { provide: PresenceService, useValue: createMockPresenceService() },
        { provide: SocketRateLimiterService, useValue: createMockRateLimiter() },
        { provide: JwtService, useFactory: createMockJwtService },
        { provide: ConfigService, useFactory: createMockConfigService },
        { provide: RedisService, useFactory: createMockRedisService },
      ],
    }).compile();

    gateway = module.get<SocketGateway>(SocketGateway);
    wsJwtGuard = module.get<WsJwtGuard>(WsJwtGuard);
    presenceService = module.get<PresenceService>(PresenceService);
    rateLimiter = module.get<SocketRateLimiterService>(SocketRateLimiterService);

    // Inject mock server
    (gateway as any).server = mockServer;
  });

  describe('handleConnection', () => {
    it('should reject connection without token', async () => {
      const client = createMockSocket();

      await gateway.handleConnection(client);

      expect(client.emit).toHaveBeenCalledWith('error', {
        code: 'AUTH_MISSING',
        message: 'Authentication token required',
      });
      expect(client.disconnect).toHaveBeenCalledWith(true);
    });

    it('should reject connection with invalid token', async () => {
      const client = createMockSocket({
        handshake: { auth: { token: 'invalid-token' }, headers: {}, query: {} },
      });

      await gateway.handleConnection(client);

      expect(client.emit).toHaveBeenCalledWith('error', {
        code: 'AUTH_INVALID',
        message: 'Invalid or expired authentication token',
      });
      expect(client.disconnect).toHaveBeenCalledWith(true);
    });

    it('should accept connection with valid token', async () => {
      const client = createMockSocket({
        handshake: { auth: { token: 'valid-token' }, headers: {}, query: {} },
      });

      await gateway.handleConnection(client);

      expect(client.data.user).toEqual(createMockUser());
      expect(presenceService.setUserOnline).toHaveBeenCalledWith(
        1, 'user@test.com', 'student', 'socket-123',
      );
      expect(client.emit).toHaveBeenCalledWith('connection:established', {
        socketId: 'socket-123',
        userId: 1,
      });
    });

    it('should broadcast presence:online on connect', async () => {
      const client = createMockSocket({
        handshake: { auth: { token: 'valid-token' }, headers: {}, query: {} },
      });

      await gateway.handleConnection(client);

      expect(mockServer.emit).toHaveBeenCalledWith('presence:online', expect.objectContaining({
        userId: 1,
        email: 'user@test.com',
      }));
    });
  });

  describe('handleDisconnect', () => {
    it('should clean up user on disconnect', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();

      await gateway.handleDisconnect(client);

      expect(presenceService.setUserOffline).toHaveBeenCalledWith(1);
      expect(rateLimiter.cleanup).toHaveBeenCalledWith('socket-123');
    });

    it('should broadcast presence:offline on disconnect', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();

      await gateway.handleDisconnect(client);

      expect(mockServer.emit).toHaveBeenCalledWith('presence:offline', expect.objectContaining({
        userId: 1,
      }));
    });

    it('should handle disconnect without user data gracefully', async () => {
      const client = createMockSocket();
      // No user data

      await gateway.handleDisconnect(client);

      expect(presenceService.setUserOffline).not.toHaveBeenCalled();
    });
  });

  describe('handleJoinRoom', () => {
    it('should join a valid room', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();

      await gateway.handleJoinRoom({ room: 'course:42' }, client);

      expect(client.join).toHaveBeenCalledWith('course:42');
      expect(client.emit).toHaveBeenCalledWith('room:joined', { room: 'course:42' });
    });

    it('should reject join without user', async () => {
      const client = createMockSocket();
      // No user data

      await gateway.handleJoinRoom({ room: 'course:42' }, client);

      expect(client.emit).toHaveBeenCalledWith('error', expect.objectContaining({
        code: 'UNAUTHORIZED',
      }));
    });

    it('should reject join with invalid room format', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();

      await gateway.handleJoinRoom({ room: 'invalid-room' }, client);

      expect(client.emit).toHaveBeenCalledWith('error', expect.objectContaining({
        code: 'VALIDATION_ERROR',
      }));
    });

    it('should notify room members when user joins', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();

      await gateway.handleJoinRoom({ room: 'course:42' }, client);

      expect(client.to).toHaveBeenCalledWith('course:42');
    });
  });

  describe('handleLeaveRoom', () => {
    it('should leave a room', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();

      await gateway.handleLeaveRoom({ room: 'course:42' }, client);

      expect(client.leave).toHaveBeenCalledWith('course:42');
      expect(client.emit).toHaveBeenCalledWith('room:left', { room: 'course:42' });
    });
  });

  describe('handleChatMessage', () => {
    it('should broadcast a valid chat message to the room', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();
      client.rooms.add('course:1');

      await gateway.handleChatMessage(
        { roomId: 'course:1', content: 'Hello!' },
        client,
      );

      expect(mockServer.to).toHaveBeenCalledWith('course:1');
    });

    it('should reject message without user', async () => {
      const client = createMockSocket();

      await gateway.handleChatMessage(
        { roomId: 'course:1', content: 'Hello!' },
        client,
      );

      expect(client.emit).toHaveBeenCalledWith('error', expect.objectContaining({
        code: 'UNAUTHORIZED',
      }));
    });

    it('should reject message when rate limited', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();
      client.rooms.add('course:1');

      (rateLimiter.checkLimit as jest.Mock).mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 30000,
      });

      await gateway.handleChatMessage(
        { roomId: 'course:1', content: 'Hello!' },
        client,
      );

      expect(client.emit).toHaveBeenCalledWith('error', expect.objectContaining({
        code: 'RATE_LIMITED',
      }));
    });

    it('should reject message when user is not in the room', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();
      // Not in any rooms

      await gateway.handleChatMessage(
        { roomId: 'course:1', content: 'Hello!' },
        client,
      );

      expect(client.emit).toHaveBeenCalledWith('error', expect.objectContaining({
        code: 'NOT_IN_ROOM',
      }));
    });

    it('should reject message with empty content', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();
      client.rooms.add('course:1');

      await gateway.handleChatMessage(
        { roomId: 'course:1', content: '' },
        client,
      );

      expect(client.emit).toHaveBeenCalledWith('error', expect.objectContaining({
        code: 'VALIDATION_ERROR',
      }));
    });

    it('should reject message with content over 2000 chars', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();
      client.rooms.add('course:1');

      await gateway.handleChatMessage(
        { roomId: 'course:1', content: 'a'.repeat(2001) },
        client,
      );

      expect(client.emit).toHaveBeenCalledWith('error', expect.objectContaining({
        code: 'VALIDATION_ERROR',
      }));
    });
  });

  describe('handleTyping', () => {
    it('should broadcast typing indicator to room', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();

      await gateway.handleTyping(
        { roomId: 'course:1', isTyping: true },
        client,
      );

      expect(client.to).toHaveBeenCalledWith('course:1');
    });

    it('should not broadcast typing without user', async () => {
      const client = createMockSocket();

      await gateway.handleTyping(
        { roomId: 'course:1', isTyping: true },
        client,
      );

      expect(client.to).not.toHaveBeenCalled();
    });
  });

  describe('handlePresenceUpdate', () => {
    it('should broadcast presence update', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();

      await gateway.handlePresenceUpdate({ status: 'away' }, client);

      expect(mockServer.emit).toHaveBeenCalledWith('presence:updated', expect.objectContaining({
        userId: 1,
        status: 'away',
      }));
    });

    it('should reject invalid status', async () => {
      const client = createMockSocket();
      client.data.user = createMockUser();

      await gateway.handlePresenceUpdate({ status: 'invalid' as any }, client);

      // Should not broadcast invalid status
      expect(mockServer.emit).not.toHaveBeenCalledWith(
        'presence:updated', expect.anything(),
      );
    });
  });
});
