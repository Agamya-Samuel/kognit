import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { ConnectionStateService } from "../common/services/connection-state.service";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  private isConnected = false;
  private connectionAttempt = 0;
  private shuttingDown = false;
  private destroyed = false;
  private isReconnecting = false;

  private createRetryStrategy = () => {
    return (times: number) => {
      this.connectionAttempt = times;
      return Math.min(2 ** times * 500, 30000);
    };
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly connectionStateService: ConnectionStateService,
  ) {
    const host = this.configService.get<string>("REDIS_HOST");
    const port = this.configService.get<number>("REDIS_PORT");
    const password = this.configService.get<string>("REDIS_PASSWORD");
    const db = this.configService.get<number>("REDIS_DB");

    this.client = new Redis({
      host,
      port,
      password: password || undefined,
      db,
      maxRetriesPerRequest: null,
      retryStrategy: this.createRetryStrategy(),
      lazyConnect: true,
    });

    this.client.on("connect", () => {
      this.isConnected = true;
      this.connectionAttempt = 0;
      this.connectionStateService.setRedisState(true);
      this.logger.log("Redis connected");
    });

    this.client.on("ready", () => {
      this.isConnected = true;
      this.connectionAttempt = 0;
      this.connectionStateService.setRedisState(true);
      this.logger.log("Redis connection ready");
    });

    this.client.on("error", (err) => {
      this.isConnected = false;
      this.connectionStateService.setRedisState(false);
      const code = (err as NodeJS.ErrnoException).code;
      if (this.connectionAttempt > 0 && code === "ECONNREFUSED") {
        this.logger.debug(
          `Redis connection error (attempt #${this.connectionAttempt}): ${err.message}`,
        );
      } else {
        this.logger.error(`Redis error: ${err.message}`);
      }
    });

    this.client.on("reconnecting", (delay) => {
      this.isConnected = false;
      this.connectionStateService.setRedisState(false);
      this.logger.warn(`Redis reconnecting in ${delay}ms...`);
    });

    this.client.on("close", () => {
      this.isConnected = false;
      this.connectionStateService.setRedisState(false);
      this.logger.warn("Redis connection closed");
    });

    this.client.on("end", () => {
      this.isConnected = false;
      this.connectionStateService.setRedisState(false);
      this.logger.warn("Redis connection ended");
      this.startReconnection();
    });
  }

  async onModuleInit() {
    while (true) {
      if (this.shuttingDown) {
        this.logger.warn(
          "Redis connection shutdown requested — aborting retry loop",
        );
        return;
      }
      try {
        await this.client.connect();
        this.isConnected = true;
        this.connectionAttempt = 0;
        this.connectionStateService.setRedisState(true);
        this.logger.log("Redis connection established");
        return;
      } catch (error) {
        this.isConnected = false;
        this.connectionStateService.setRedisState(false);
        this.client.disconnect();
        const delayMs = Math.min(
          this.connectionAttempt * this.connectionAttempt * 100,
          30000,
        );
        this.logger.warn(
          `Redis connection attempt #${this.connectionAttempt + 1} failed: ${error.message}. Retrying in ${delayMs}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        this.connectionAttempt++;
      }
    }
  }

  async onModuleDestroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.shuttingDown = true;
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      this.connectionStateService.setRedisState(false);
      this.logger.log("Redis connection closed gracefully");
    }
  }

  private async startReconnection(): Promise<void> {
    if (this.isReconnecting || this.shuttingDown) return;
    this.isReconnecting = true;
    this.logger.log("Starting Redis reconnection loop after connection ended");

    while (!this.shuttingDown) {
      try {
        this.client.disconnect();
        await this.client.connect();
        this.isConnected = true;
        this.connectionAttempt = 0;
        this.connectionStateService.setRedisState(true);
        this.logger.log("Redis reconnected successfully");
        this.isReconnecting = false;
        return;
      } catch (error) {
        this.isConnected = false;
        this.connectionStateService.setRedisState(false);
        const delayMs = Math.min(2 ** this.connectionAttempt * 500, 30000);
        this.logger.warn(
          `Redis reconnection attempt #${this.connectionAttempt + 1} failed: ${error.message}. Retrying in ${delayMs}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        this.connectionAttempt++;
      }
    }
    this.isReconnecting = false;
  }

  getClient(): Redis {
    return this.client;
  }

  getConnectionState(): boolean {
    return this.isConnected;
  }

  async healthCheck(): Promise<{
    status: "ok" | "degraded" | "error";
    latencyMs: number;
  }> {
    const start = Date.now();
    try {
      const response = await this.client.ping();
      const latencyMs = Date.now() - start;
      if (response === "PONG") {
        this.isConnected = true;
        this.connectionStateService.setRedisState(true);
        return { status: "ok", latencyMs };
      }
      return { status: "degraded", latencyMs };
    } catch (error) {
      this.logger.warn(`Redis health check failed: ${error.message}`);
      this.isConnected = false;
      this.connectionStateService.setRedisState(false);
      return { status: "error", latencyMs: Date.now() - start };
    }
  }
}
