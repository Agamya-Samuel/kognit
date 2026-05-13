import { Test, TestingModule } from '@nestjs/testing';
import { TypingService, TypingUser } from '../services/typing.service';
import { RedisService } from '../../../redis/redis.service';

describe('TypingService', () => {
  let service: TypingService;
  let redisClient: {
    setex: jest.Mock;
    del: jest.Mock;
    keys: jest.Mock;
    get: jest.Mock;
  };

  beforeEach(async () => {
    redisClient = {
      setex: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      keys: jest.fn().mockResolvedValue([]),
      get: jest.fn().mockResolvedValue(null),
    };

    const mockRedisService = {
      getClient: jest.fn().mockReturnValue(redisClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypingService,
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<TypingService>(TypingService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── startTyping ─────────────────────────────────────────────────────────

  describe('startTyping', () => {
    it('should set a Redis key with TTL for the typing user', async () => {
      const entry = await service.startTyping(100, 'user@test.com', 10);

      expect(entry.userId).toBe(100);
      expect(entry.email).toBe('user@test.com');
      expect(entry.channelId).toBe(10);
      expect(typeof entry.startedAt).toBe('number');

      expect(redisClient.setex).toHaveBeenCalledWith(
        'edutech:typing:10:100',
        5, // TTL in seconds (5000ms / 1000)
        expect.any(String),
      );

      // Verify stored data is valid JSON
      const storedArg = redisClient.setex.mock.calls[0][2];
      const parsed = JSON.parse(storedArg);
      expect(parsed.userId).toBe(100);
    });
  });

  // ─── stopTyping ──────────────────────────────────────────────────────────

  describe('stopTyping', () => {
    it('should delete the Redis key for the user', async () => {
      await service.stopTyping(100, 10);

      expect(redisClient.del).toHaveBeenCalledWith('edutech:typing:10:100');
    });
  });

  // ─── getTypingUsers ──────────────────────────────────────────────────────

  describe('getTypingUsers', () => {
    it('should return empty array when no users are typing', async () => {
      redisClient.keys.mockResolvedValue([]);

      const result = await service.getTypingUsers(10);
      expect(result).toEqual([]);
    });

    it('should return typing users for a channel', async () => {
      const user1: TypingUser = { userId: 100, email: 'a@test.com', channelId: 10, startedAt: Date.now() };
      const user2: TypingUser = { userId: 200, email: 'b@test.com', channelId: 10, startedAt: Date.now() };

      redisClient.keys.mockResolvedValue(['edutech:typing:10:100', 'edutech:typing:10:200']);
      redisClient.get
        .mockResolvedValueOnce(JSON.stringify(user1))
        .mockResolvedValueOnce(JSON.stringify(user2));

      const result = await service.getTypingUsers(10);
      expect(result).toHaveLength(2);
      expect(result[0].userId).toBe(100);
      expect(result[1].userId).toBe(200);
    });

    it('should skip keys with null values', async () => {
      redisClient.keys.mockResolvedValue(['edutech:typing:10:100', 'edutech:typing:10:200']);
      redisClient.get
        .mockResolvedValueOnce(JSON.stringify({ userId: 100, email: 'a@test.com', channelId: 10, startedAt: 1 }))
        .mockResolvedValueOnce(null);

      const result = await service.getTypingUsers(10);
      expect(result).toHaveLength(1);
    });
  });

  // ─── clearChannelTyping ──────────────────────────────────────────────────

  describe('clearChannelTyping', () => {
    it('should delete all typing keys for a channel', async () => {
      redisClient.keys.mockResolvedValue(['edutech:typing:10:100', 'edutech:typing:10:200']);

      await service.clearChannelTyping(10);

      expect(redisClient.del).toHaveBeenCalledWith('edutech:typing:10:100', 'edutech:typing:10:200');
    });

    it('should do nothing when no keys exist', async () => {
      redisClient.keys.mockResolvedValue([]);

      await service.clearChannelTyping(10);

      expect(redisClient.del).not.toHaveBeenCalled();
    });
  });

  // ─── isUserTyping ────────────────────────────────────────────────────────

  describe('isUserTyping', () => {
    it('should return true if user key exists', async () => {
      redisClient.get.mockResolvedValue('{"userId":100}');
      const result = await service.isUserTyping(100, 10);
      expect(result).toBe(true);
    });

    it('should return false if user key does not exist', async () => {
      redisClient.get.mockResolvedValue(null);
      const result = await service.isUserTyping(100, 10);
      expect(result).toBe(false);
    });
  });
});
