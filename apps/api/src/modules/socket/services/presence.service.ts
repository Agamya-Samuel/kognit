import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../redis/redis.service';

export interface PresenceEntry {
  userId: number;
  email: string;
  role: string;
  socketId: string;
  connectedAt: number;
  rooms: string[];
}

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);
  private readonly PRESENCE_PREFIX = 'edutech:presence';
  private readonly PRESENCE_TTL = 86400; // 24 hours

  constructor(private readonly redisService: RedisService) {}

  /**
   * Register a user as online when they connect via WebSocket.
   */
  async setUserOnline(
    userId: number,
    email: string,
    role: string,
    socketId: string,
  ): Promise<void> {
    const key = `${this.PRESENCE_PREFIX}:user:${userId}`;
    const entry: PresenceEntry = {
      userId,
      email,
      role,
      socketId,
      connectedAt: Date.now(),
      rooms: [],
    };

    const client = this.redisService.getClient();
    await client.setex(key, this.PRESENCE_TTL, JSON.stringify(entry));

    // Also add to the global online set
    await client.sadd(`${this.PRESENCE_PREFIX}:online`, String(userId));

    this.logger.debug(`User ${userId} is now online (socket: ${socketId})`);
  }

  /**
   * Mark a user as offline when they disconnect.
   */
  async setUserOffline(userId: number): Promise<void> {
    const key = `${this.PRESENCE_PREFIX}:user:${userId}`;
    const client = this.redisService.getClient();

    await client.del(key);
    await client.srem(`${this.PRESENCE_PREFIX}:online`, String(userId));

    this.logger.debug(`User ${userId} is now offline`);
  }

  /**
   * Update the list of rooms a user is currently in.
   */
  async updateUserRooms(userId: number, rooms: string[]): Promise<void> {
    const key = `${this.PRESENCE_PREFIX}:user:${userId}`;
    const client = this.redisService.getClient();

    const data = await client.get(key);
    if (!data) return;

    const entry: PresenceEntry = JSON.parse(data);
    entry.rooms = rooms;
    await client.setex(key, this.PRESENCE_TTL, JSON.stringify(entry));
  }

  /**
   * Check if a user is currently online.
   */
  async isUserOnline(userId: number): Promise<boolean> {
    const client = this.redisService.getClient();
    return (await client.sismember(`${this.PRESENCE_PREFIX}:online`, String(userId))) === 1;
  }

  /**
   * Get the presence entry for a specific user.
   */
  async getUserPresence(userId: number): Promise<PresenceEntry | null> {
    const key = `${this.PRESENCE_PREFIX}:user:${userId}`;
    const client = this.redisService.getClient();
    const data = await client.get(key);
    if (!data) return null;
    return JSON.parse(data) as PresenceEntry;
  }

  /**
   * Get the list of all online user IDs.
   */
  async getOnlineUserIds(): Promise<number[]> {
    const client = this.redisService.getClient();
    const ids = await client.smembers(`${this.PRESENCE_PREFIX}:online`);
    return ids.map(Number);
  }

  /**
   * Get the list of users currently in a specific room.
   * Scans all online users and filters by room membership.
   */
  async getUsersInRoom(roomName: string): Promise<PresenceEntry[]> {
    const client = this.redisService.getClient();
    const userIds = await client.smembers(`${this.PRESENCE_PREFIX}:online`);
    const users: PresenceEntry[] = [];

    for (const uid of userIds) {
      const data = await client.get(`${this.PRESENCE_PREFIX}:user:${uid}`);
      if (data) {
        const entry: PresenceEntry = JSON.parse(data);
        if (entry.rooms.includes(roomName)) {
          users.push(entry);
        }
      }
    }

    return users;
  }
}
