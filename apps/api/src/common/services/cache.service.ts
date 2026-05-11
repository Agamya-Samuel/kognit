import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly prefix = 'edutech';

  constructor(private readonly redisService: RedisService) {}

  /**
   * Build a namespaced cache key: edutech:{namespace}:{key}
   */
  private buildKey(namespace: string, key: string): string {
    return `${this.prefix}:${namespace}:${key}`;
  }

  /**
   * Get a cached value by namespace and key
   */
  async get<T>(namespace: string, key: string): Promise<T | null> {
    try {
      const fullKey = this.buildKey(namespace, key);
      const data = await this.redisService.getClient().get(fullKey);
      if (data === null) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.error(`Cache get error [${namespace}:${key}]: ${error.message}`);
      return null;
    }
  }

  /**
   * Set a cached value with optional TTL (in seconds)
   */
  async set<T>(namespace: string, key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const fullKey = this.buildKey(namespace, key);
      const serialized = JSON.stringify(value);

      if (ttlSeconds) {
        await this.redisService.getClient().setex(fullKey, ttlSeconds, serialized);
      } else {
        await this.redisService.getClient().set(fullKey, serialized);
      }
    } catch (error) {
      this.logger.error(`Cache set error [${namespace}:${key}]: ${error.message}`);
    }
  }

  /**
   * Delete a cached value
   */
  async del(namespace: string, key: string): Promise<void> {
    try {
      const fullKey = this.buildKey(namespace, key);
      await this.redisService.getClient().del(fullKey);
    } catch (error) {
      this.logger.error(`Cache del error [${namespace}:${key}]: ${error.message}`);
    }
  }

  /**
   * Invalidate all keys matching a namespace pattern.
   * Uses SCAN to safely iterate without blocking Redis.
   */
  async invalidate(namespace: string): Promise<number> {
    try {
      const pattern = `${this.prefix}:${namespace}:*`;
      const client = this.redisService.getClient();
      let cursor = '0';
      let deletedCount = 0;

      do {
        const [nextCursor, keys] = await client.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100,
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          deletedCount += await client.del(...keys);
        }
      } while (cursor !== '0');

      return deletedCount;
    } catch (error) {
      this.logger.error(`Cache invalidate error [${namespace}]: ${error.message}`);
      return 0;
    }
  }

  /**
   * Check if a key exists
   */
  async exists(namespace: string, key: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(namespace, key);
      const result = await this.redisService.getClient().exists(fullKey);
      return result === 1;
    } catch (error) {
      this.logger.error(`Cache exists error [${namespace}:${key}]: ${error.message}`);
      return false;
    }
  }

  /**
   * Set TTL on an existing key (in seconds)
   */
  async expire(namespace: string, key: string, ttlSeconds: number): Promise<boolean> {
    try {
      const fullKey = this.buildKey(namespace, key);
      const result = await this.redisService.getClient().expire(fullKey, ttlSeconds);
      return result === 1;
    } catch (error) {
      this.logger.error(`Cache expire error [${namespace}:${key}]: ${error.message}`);
      return false;
    }
  }
}
