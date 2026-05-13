import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../redis/redis.service';

export interface RateLimitEntry {
  count: number;
  windowStart: number;
}

export interface RateLimitConfig {
  maxMessages: number;
  windowMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxMessages: 30, // 30 messages
  windowMs: 60000, // per 60 seconds
};

@Injectable()
export class SocketRateLimiterService {
  private readonly logger = new Logger(SocketRateLimiterService.name);
  private readonly PREFIX = 'edutech:ratelimit:socket';

  constructor(private readonly redisService: RedisService) {}

  /**
   * Check if a socket/user is allowed to send a message.
   * Uses a sliding-window counter stored in Redis.
   * Returns { allowed, remaining, resetAt }
   */
  async checkLimit(
    socketId: string,
    config: RateLimitConfig = DEFAULT_CONFIG,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const key = `${this.PREFIX}:${socketId}`;
    const client = this.redisService.getClient();
    const now = Date.now();

    const data = await client.get(key);
    let entry: RateLimitEntry;

    if (!data) {
      // First message in window
      entry = { count: 1, windowStart: now };
      await client.setex(key, Math.ceil(config.windowMs / 1000), JSON.stringify(entry));
      return {
        allowed: true,
        remaining: config.maxMessages - 1,
        resetAt: now + config.windowMs,
      };
    }

    entry = JSON.parse(data) as RateLimitEntry;

    // Check if the window has expired — reset if so
    if (now - entry.windowStart >= config.windowMs) {
      entry = { count: 1, windowStart: now };
      await client.setex(key, Math.ceil(config.windowMs / 1000), JSON.stringify(entry));
      return {
        allowed: true,
        remaining: config.maxMessages - 1,
        resetAt: now + config.windowMs,
      };
    }

    // Within current window — increment count
    entry.count += 1;
    await client.setex(key, Math.ceil(config.windowMs / 1000), JSON.stringify(entry));

    if (entry.count > config.maxMessages) {
      const resetAt = entry.windowStart + config.windowMs;
      this.logger.warn(`Rate limit exceeded for socket ${socketId}: ${entry.count}/${config.maxMessages}`);
      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    return {
      allowed: true,
      remaining: config.maxMessages - entry.count,
      resetAt: entry.windowStart + config.windowMs,
    };
  }

  /**
   * Reset the rate limit counter for a specific socket.
   */
  async resetLimit(socketId: string): Promise<void> {
    const key = `${this.PREFIX}:${socketId}`;
    await this.redisService.getClient().del(key);
  }

  /**
   * Clean up rate limit data when a socket disconnects.
   */
  async cleanup(socketId: string): Promise<void> {
    await this.resetLimit(socketId);
  }
}
