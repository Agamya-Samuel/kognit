import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST');
    const port = this.configService.get<number>('REDIS_PORT');
    const password = this.configService.get<string>('REDIS_PASSWORD');
    const db = this.configService.get<number>('REDIS_DB');

    this.client = new Redis({
      host,
      port,
      password: password || undefined,
      db,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 200, 5000);
        return delay;
      },
      lazyConnect: true,
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connected');
    });

    this.client.on('error', (err) => {
      this.logger.error(`Redis error: ${err.message}`);
    });

    this.client.on('reconnecting', () => {
      this.logger.warn('Redis reconnecting...');
    });

    this.client.on('close', () => {
      this.logger.warn('Redis connection closed');
    });
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log('Redis connection established');
    } catch (error) {
      this.logger.error(`Failed to connect to Redis: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Redis connection closed gracefully');
  }

  /**
   * Get the underlying ioredis client for direct use
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * Check Redis connection health via PING
   */
  async healthCheck(): Promise<{ status: string; latencyMs: number }> {
    const start = Date.now();
    try {
      const response = await this.client.ping();
      const latencyMs = Date.now() - start;
      return { status: response === 'PONG' ? 'ok' : 'degraded', latencyMs };
    } catch (error) {
      return { status: 'error', latencyMs: Date.now() - start };
    }
  }
}
