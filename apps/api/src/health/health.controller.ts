import { Controller, Get, Inject, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { RedisService } from '../redis/redis.service';
import { DatabaseService } from '../db/connection';
import { Public } from '../modules/auth/decorators/auth.decorators';

interface DependencyStatus {
  status: 'ok' | 'error';
  latencyMs: number;
}

interface QueueStatus {
  name: string;
  status: 'ok' | 'error';
  waitingJobs: number;
}

interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  uptime: number;
  environment: string;
  dependencies: {
    database: DependencyStatus;
    redis: DependencyStatus;
    queues: QueueStatus[];
  };
  sentry: { enabled: boolean };
}

@ApiTags('health')
@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly redisService: RedisService,
    private readonly databaseService: DatabaseService,
    @Inject('SENTRY_INITIALIZED') private readonly sentryInitialized: boolean,
    @InjectQueue('media-processing') private readonly mediaQueue: Queue,
    @InjectQueue('email-notifications') private readonly emailQueue: Queue,
    @InjectQueue('certificate-generation') private readonly certQueue: Queue,
    @InjectQueue('scheduled-notifications') private readonly scheduledQueue: Queue,
    @InjectQueue('sms-notifications') private readonly smsQueue: Queue,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Server is healthy' })
  @ApiResponse({ status: 503, description: 'A critical dependency is down' })
  async healthCheck(): Promise<HealthResponse> {
    const [dbHealth, redisHealth, queueStatuses] = await Promise.all([
      this.checkDatabase(),
      this.redisService.healthCheck(),
      this.checkQueues(),
    ]);

    const criticalDown =
      dbHealth.status === 'error' || redisHealth.status === 'error';

    return {
      status: criticalDown
        ? 'down'
        : queueStatuses.some((q) => q.status === 'error')
          ? 'degraded'
          : 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      dependencies: {
        database: dbHealth,
        redis: redisHealth as DependencyStatus,
        queues: queueStatuses,
      },
      sentry: {
        enabled: this.sentryInitialized,
      },
    };
  }

  private async checkDatabase(): Promise<DependencyStatus> {
    const start = Date.now();
    try {
      const healthy = await this.databaseService.healthCheck();
      return {
        status: healthy ? 'ok' : 'error',
        latencyMs: Date.now() - start,
      };
    } catch {
      return { status: 'error', latencyMs: Date.now() - start };
    }
  }

  private async checkQueues(): Promise<QueueStatus[]> {
    const queues = [
      this.mediaQueue,
      this.emailQueue,
      this.certQueue,
      this.scheduledQueue,
      this.smsQueue,
    ];

    const results = await Promise.allSettled(
      queues.map(async (queue) => {
        const counts = await queue.getJobCounts('waiting');
        return {
          name: queue.name,
          status: 'ok' as const,
          waitingJobs: counts.waiting ?? 0,
        };
      }),
    );

    return results.map((r) =>
      r.status === 'fulfilled'
        ? r.value
        : { name: 'unknown', status: 'error' as const, waitingJobs: -1 },
    );
  }
}
