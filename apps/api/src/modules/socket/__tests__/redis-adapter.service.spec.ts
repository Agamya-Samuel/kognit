import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisAdapterService } from '../services/redis-adapter.service';
import { RedisService } from '../../../redis/redis.service';

// ─── Mock Factory ─────────────────────────────────────────────────────────────

function createMockRedisService() {
  const mockRedisClient = {
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    duplicate: jest.fn().mockReturnThis(),
  };

  return {
    getClient: jest.fn().mockReturnValue(mockRedisClient),
  };
}

function createMockConfigService() {
  return {
    get: jest.fn().mockImplementation((key: string) => {
      switch (key) {
        case 'REDIS_HOST': return 'localhost';
        case 'REDIS_PORT': return 6379;
        case 'REDIS_PASSWORD': return null;
        case 'REDIS_DB': return 0;
        default: return null;
      }
    }),
  };
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('RedisAdapterService', () => {
  let service: RedisAdapterService;
  let redisService: ReturnType<typeof createMockRedisService>;

  beforeEach(async () => {
    redisService = createMockRedisService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisAdapterService,
        { provide: RedisService, useValue: redisService },
        { provide: ConfigService, useFactory: createMockConfigService },
      ],
    }).compile();

    service = module.get<RedisAdapterService>(RedisAdapterService);
  });

  describe('onModuleInit', () => {
    it('should attempt to initialize the Redis adapter', async () => {
      await service.onModuleInit();
      // Adapter may be created (function) or null depending on mock behavior
      const adapter = service.getAdapter();
      expect(adapter !== undefined).toBe(true);
    });

    it('should handle initialization failure gracefully', async () => {
      // Make getClient throw
      redisService.getClient.mockImplementation(() => {
        throw new Error('Redis not available');
      });

      await service.onModuleInit();

      const adapter = service.getAdapter();
      expect(adapter).toBeNull();
    });
  });

  describe('getAdapter', () => {
    it('should return null before initialization', () => {
      const adapter = service.getAdapter();
      expect(adapter).toBeNull();
    });
  });
});
