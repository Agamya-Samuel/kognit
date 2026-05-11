import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RedisService } from '../redis/redis.service';
import { Public } from '../modules/auth/decorators/auth.decorators';

@ApiTags('health')
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly redisService: RedisService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Server is healthy',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            uptime: { type: 'number', example: 123.456 },
            environment: { type: 'string', example: 'development' },
            redis: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'ok' },
                latencyMs: { type: 'number', example: 2 },
              },
            },
          },
        },
      },
    },
  })
  async healthCheck() {
    const redisHealth = await this.redisService.healthCheck();

    return {
      status: redisHealth.status === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      redis: redisHealth,
    };
  }
}
