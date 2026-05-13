import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../redis/redis.service';

export interface TypingUser {
  userId: number;
  email: string;
  channelId: number;
  startedAt: number;
}

@Injectable()
export class TypingService {
  private readonly logger = new Logger(TypingService.name);
  private readonly PREFIX = 'edutech:typing';
  private readonly TYPING_TIMEOUT_MS = 5000; // 5 seconds debounce

  constructor(private readonly redisService: RedisService) {}

  // ─── Start Typing ──────────────────────────────────────────────────────────

  async startTyping(userId: number, email: string, channelId: number): Promise<TypingUser> {
    const key = `${this.PREFIX}:${channelId}:${userId}`;
    const entry: TypingUser = {
      userId,
      email,
      channelId,
      startedAt: Date.now(),
    };

    const client = this.redisService.getClient();
    // Set with TTL for auto-expiry (debounce)
    await client.setex(key, Math.ceil(this.TYPING_TIMEOUT_MS / 1000), JSON.stringify(entry));

    return entry;
  }

  // ─── Stop Typing ───────────────────────────────────────────────────────────

  async stopTyping(userId: number, channelId: number): Promise<void> {
    const key = `${this.PREFIX}:${channelId}:${userId}`;
    const client = this.redisService.getClient();
    await client.del(key);
  }

  // ─── Get Typing Users for a Channel ────────────────────────────────────────

  async getTypingUsers(channelId: number): Promise<TypingUser[]> {
    const client = this.redisService.getClient();
    const pattern = `${this.PREFIX}:${channelId}:*`;
    const keys = await client.keys(pattern);

    if (!keys || keys.length === 0) {
      return [];
    }

    const users: TypingUser[] = [];
    for (const key of keys) {
      const data = await client.get(key);
      if (data) {
        users.push(JSON.parse(data) as TypingUser);
      }
    }

    return users;
  }

  // ─── Clear All Typing for a Channel ────────────────────────────────────────

  async clearChannelTyping(channelId: number): Promise<void> {
    const client = this.redisService.getClient();
    const pattern = `${this.PREFIX}:${channelId}:*`;
    const keys = await client.keys(pattern);

    if (keys && keys.length > 0) {
      await client.del(...keys);
    }
  }

  // ─── Check if a User is Typing ─────────────────────────────────────────────

  async isUserTyping(userId: number, channelId: number): Promise<boolean> {
    const key = `${this.PREFIX}:${channelId}:${userId}`;
    const client = this.redisService.getClient();
    const data = await client.get(key);
    return !!data;
  }
}
