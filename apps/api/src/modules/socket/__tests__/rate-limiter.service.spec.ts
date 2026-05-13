import { Test, TestingModule } from '@nestjs/testing';
import { SocketRateLimiterService, RateLimitConfig } from '../services/rate-limiter.service';
import { RedisService } from '../../../redis/redis.service';

// ─── Mock Factory ─────────────────────────────────────────────────────────────

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
    }),
    _store: store,
  };
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('SocketRateLimiterService', () => {
  let service: SocketRateLimiterService;
  let redisService: ReturnType<typeof createMockRedisService>;

  const testConfig: RateLimitConfig = {
    maxMessages: 3,
    windowMs: 60000,
  };

  beforeEach(async () => {
    redisService = createMockRedisService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocketRateLimiterService,
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    service = module.get<SocketRateLimiterService>(SocketRateLimiterService);
  });

  describe('checkLimit', () => {
    it('should allow the first message', async () => {
      const result = await service.checkLimit('socket-1', testConfig);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2); // 3 - 1 = 2
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });

    it('should allow messages within the limit', async () => {
      await service.checkLimit('socket-1', testConfig);
      await service.checkLimit('socket-1', testConfig);

      const result = await service.checkLimit('socket-1', testConfig);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it('should block messages over the limit', async () => {
      await service.checkLimit('socket-1', testConfig);
      await service.checkLimit('socket-1', testConfig);
      await service.checkLimit('socket-1', testConfig);

      // 4th message should be blocked
      const result = await service.checkLimit('socket-1', testConfig);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should track limits independently per socket', async () => {
      await service.checkLimit('socket-1', testConfig);
      await service.checkLimit('socket-1', testConfig);

      const result = await service.checkLimit('socket-2', testConfig);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2); // socket-2 has its own counter
    });

    it('should reset after window expires', async () => {
      // Send 3 messages to fill the limit
      await service.checkLimit('socket-1', testConfig);
      await service.checkLimit('socket-1', testConfig);
      await service.checkLimit('socket-1', testConfig);

      // Simulate window expiration by manipulating the stored entry
      const key = 'edutech:ratelimit:socket:socket-1';
      const expiredEntry = JSON.stringify({ count: 3, windowStart: Date.now() - 61000 });
      redisService._store.set(key, expiredEntry);

      // Should now be allowed (new window)
      const result = await service.checkLimit('socket-1', testConfig);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });
  });

  describe('resetLimit', () => {
    it('should reset the rate limit for a socket', async () => {
      await service.checkLimit('socket-1', testConfig);
      await service.checkLimit('socket-1', testConfig);

      await service.resetLimit('socket-1');

      const result = await service.checkLimit('socket-1', testConfig);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });
  });

  describe('cleanup', () => {
    it('should remove rate limit data for a disconnected socket', async () => {
      await service.checkLimit('socket-1', testConfig);

      await service.cleanup('socket-1');

      const result = await service.checkLimit('socket-1', testConfig);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });
  });
});
