import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../../redis/redis.service';
import { createAdapter } from '@socket.io/redis-adapter';
import type { Adapter } from 'socket.io-adapter';

@Injectable()
export class RedisAdapterService implements OnModuleInit {
  private readonly logger = new Logger(RedisAdapterService.name);
  private adapterInstance: Adapter | null = null;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      const client = this.redisService.getClient();

      // Create a dedicated Redis client for the pub sub sub-connection
      // socket.io-redis-adapter requires two clients: one for publishing, one for subscribing
      const host = this.configService.get<string>('REDIS_HOST');
      const port = this.configService.get<number>('REDIS_PORT');
      const password = this.configService.get<string>('REDIS_PASSWORD');
      const db = this.configService.get<number>('REDIS_DB');

      const Redis = await import('ioredis');
      const subClient = new Redis.default({
        host,
        port,
        password: password || undefined,
        db,
        maxRetriesPerRequest: null, // Required for Redis adapter
        lazyConnect: false,
      });

      // createAdapter(pubClient, subClient)
      this.adapterInstance = createAdapter(client, subClient) as unknown as Adapter;

      this.logger.log('Socket.IO Redis adapter initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize Redis adapter: ${error.message}`);
      // Fallback: no adapter — single-process mode
      this.adapterInstance = null;
    }
  }

  /**
   * Get the Redis adapter instance, or null if not configured.
   */
  getAdapter(): Adapter | null {
    return this.adapterInstance;
  }
}
