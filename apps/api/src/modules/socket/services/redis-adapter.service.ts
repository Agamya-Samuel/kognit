import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RedisService } from "../../../redis/redis.service";
import { createAdapter } from "@socket.io/redis-adapter";
import type { Adapter } from "socket.io-adapter";

@Injectable()
export class RedisAdapterService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisAdapterService.name);
  private adapterInstance: Adapter | null = null;
  private subClient: any = null;
  private connectionAttempt = 0;
  private isReconnecting = false;
  private shuttingDown = false;

  private createRetryStrategy = () => {
    return (times: number) => {
      this.connectionAttempt = times;
      return Math.min(2 ** times * 500, 30000);
    };
  };

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      const client = this.redisService.getClient();

      const host = this.configService.get<string>("REDIS_HOST");
      const port = this.configService.get<number>("REDIS_PORT");
      const password = this.configService.get<string>("REDIS_PASSWORD");
      const db = this.configService.get<number>("REDIS_DB");

      const Redis = await import("ioredis");
      this.subClient = new Redis.default({
        host,
        port,
        password: password || undefined,
        db,
        maxRetriesPerRequest: null,
        lazyConnect: true,
        retryStrategy: this.createRetryStrategy(),
      });

      this.subClient.on("connect", () => {
        this.isReconnecting = false;
        this.logger.log("Socket.IO Redis sub-client connected");
      });

      this.subClient.on("ready", () => {
        this.isReconnecting = false;
        this.logger.log("Socket.IO Redis sub-client ready");
      });

      this.subClient.on("error", (err) => {
        this.logger.warn(`Socket.IO Redis sub-client error: ${err.message}`);
      });

      this.subClient.on("close", () => {
        this.logger.warn("Socket.IO Redis sub-client closed");
      });

      this.subClient.on("end", () => {
        this.logger.log("Socket.IO Redis sub-client disconnected (will retry)");
        this.reconnectSubClient();
      });

      await this.connectSubClientWithRetry();

      this.adapterInstance = createAdapter(
        client,
        this.subClient,
      ) as unknown as Adapter;

      this.logger.log("Socket.IO Redis adapter initialized");
    } catch (error) {
      this.logger.error(`Failed to initialize Redis adapter: ${error.message}`);
      this.adapterInstance = null;
    }
  }

  private async connectSubClientWithRetry(): Promise<void> {
    while (!this.shuttingDown) {
      try {
        await this.subClient.connect();
        this.connectionAttempt = 0;
        return;
      } catch (error) {
        if (this.shuttingDown) return;
        this.connectionAttempt++;
        const delayMs = Math.min(2 ** this.connectionAttempt * 500, 30000);
        this.logger.warn(
          `Socket.IO Redis sub-client connection attempt #${this.connectionAttempt} failed: ${error.message}. Retrying in ${delayMs}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  private reconnectSubClient(): void {
    if (this.isReconnecting || this.shuttingDown) return;
    this.isReconnecting = true;

    this.connectSubClientWithRetry()
      .then(() => {
        if (this.shuttingDown) return;
        this.isReconnecting = false;
        this.logger.log("Socket.IO Redis sub-client reconnected");
        this.adapterInstance = createAdapter(
          this.redisService.getClient(),
          this.subClient,
        ) as unknown as Adapter;
      })
      .catch((error) => {
        this.isReconnecting = false;
        this.logger.error(
          `Socket.IO Redis sub-client reconnection failed: ${error.message}`,
        );
      });
  }

  async onModuleDestroy() {
    this.shuttingDown = true;
    this.isReconnecting = false;
    if (this.subClient) {
      try {
        await this.subClient.quit();
        this.logger.log("Redis adapter sub-client closed gracefully");
      } catch (error) {
        this.logger.warn(
          `Error closing Redis adapter sub-client: ${error.message}`,
        );
      }
      this.subClient = null;
    }
    this.adapterInstance = null;
  }

  getAdapter(): Adapter | null {
    return this.adapterInstance;
  }
}
