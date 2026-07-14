import {
  Controller,
  Get,
  Inject,
  HttpStatus,
  HttpCode,
  ServiceUnavailableException,
  Logger,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { RedisService } from "../redis/redis.service";
import { DatabaseService } from "../db/connection";
import { Public } from "../modules/auth/decorators/auth.decorators";
import { ConnectionStateService } from "../common/services/connection-state.service";

interface DependencyStatus {
  status: "ok" | "degraded" | "error";
  latencyMs: number;
  error?: string;
}

interface DetailedQueueStatus {
  name: string;
  status: "ok" | "error";
  waitingJobs: number;
}

interface DetailedQueueResult {
  connected: boolean;
  error?: string;
  queues: DetailedQueueStatus[];
}

interface HealthResponse {
  status: "ok" | "degraded" | "down";
  timestamp: string;
  uptime: number;
  environment: string;
  connections: {
    database: "up" | "down";
    redis: "up" | "down";
  };
  dependencies: {
    database: DependencyStatus;
    redis: DependencyStatus;
    queues: DetailedQueueResult;
  };
  sentry: { enabled: boolean };
}

@ApiTags("health")
@Public()
@Controller("health")
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  constructor(
    private readonly redisService: RedisService,
    private readonly databaseService: DatabaseService,
    private readonly connectionStateService: ConnectionStateService,
    @Inject("SENTRY_INITIALIZED") private readonly sentryInitialized: boolean,
    @InjectQueue("media-processing") private readonly mediaQueue: Queue,
    @InjectQueue("email-notifications") private readonly emailQueue: Queue,
    @InjectQueue("certificate-generation") private readonly certQueue: Queue,
    @InjectQueue("scheduled-notifications")
    private readonly scheduledQueue: Queue,
    @InjectQueue("sms-notifications") private readonly smsQueue: Queue,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Health check endpoint" })
  @ApiResponse({ status: 200, description: "Server is healthy" })
  @ApiResponse({ status: 503, description: "A critical dependency is down" })
  async healthCheck(): Promise<HealthResponse> {
    const dbStatus = await this.checkDatabase();
    const redisStatus = await this.checkRedis();
    const queueResult = await this.checkQueues();

    const connections = this.connectionStateService.getHealth();
    const databaseDown = dbStatus.status === "error";
    const redisDown = redisStatus.status === "error";

    let overallStatus: "ok" | "degraded" | "down";
    if (databaseDown || redisDown) {
      overallStatus = "down";
    } else if (queueResult.queues.some((q) => q.status === "error")) {
      overallStatus = "degraded";
    } else {
      overallStatus = "ok";
    }

    const response: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      connections,
      dependencies: {
        database: dbStatus,
        redis: redisStatus,
        queues: queueResult,
      },
      sentry: {
        enabled: this.sentryInitialized,
      },
    };

    if (overallStatus === "down") {
      this.logger.warn(
        "Health check returning 503 — critical dependency is down",
      );
      throw new ServiceUnavailableException(response);
    }

    return response;
  }

  private async checkDatabase(): Promise<DependencyStatus> {
    const start = Date.now();
    try {
      const healthy = await this.databaseService.healthCheck();
      return {
        status: healthy ? "ok" : "error",
        latencyMs: Date.now() - start,
        error: healthy ? undefined : "health check query failed",
      };
    } catch (error) {
      return {
        status: "error",
        latencyMs: Date.now() - start,
        error: error.message,
      };
    }
  }

  private async checkRedis(): Promise<DependencyStatus> {
    const start = Date.now();
    try {
      const result = await this.redisService.healthCheck();
      return {
        status: result.status,
        latencyMs: result.latencyMs,
        error: result.status === "error" ? "PING failed" : undefined,
      };
    } catch (error) {
      return {
        status: "error",
        latencyMs: Date.now() - start,
        error: error.message,
      };
    }
  }

  private async checkQueues(): Promise<DetailedQueueResult> {
    const queues = [
      { queue: this.mediaQueue, name: "media-processing" },
      { queue: this.emailQueue, name: "email-notifications" },
      { queue: this.certQueue, name: "certificate-generation" },
      { queue: this.scheduledQueue, name: "scheduled-notifications" },
      { queue: this.smsQueue, name: "sms-notifications" },
    ];

    const results: DetailedQueueStatus[] = [];
    const queueErrors: string[] = [];

    for (const { queue, name } of queues) {
      try {
        const counts = await queue.getJobCounts("waiting");
        results.push({
          name,
          status: "ok",
          waitingJobs: counts.waiting ?? 0,
        });
      } catch (error) {
        results.push({
          name,
          status: "error",
          waitingJobs: -1,
        });
        queueErrors.push(`${name}: ${error.message}`);
      }
    }

    return {
      connected: queueErrors.length === 0,
      error: queueErrors.length > 0 ? queueErrors.join("; ") : undefined,
      queues: results,
    };
  }
}
