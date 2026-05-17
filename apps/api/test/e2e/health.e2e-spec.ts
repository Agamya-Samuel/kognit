import { RedisService } from '../../src/redis/redis.service';
import { HealthController } from '../../src/health/health.controller';
import { createE2EApp } from './helpers/e2e-app.helper';

describe('Health Check (e2e)', () => {
  let e2eApp: Awaited<ReturnType<typeof createE2EApp>>;

  beforeAll(async () => {
    e2eApp = await createE2EApp(
      [HealthController],
      [
        {
          provide: RedisService,
          useValue: {
            healthCheck: () => Promise.resolve({ status: 'ok', latencyMs: 1 }),
          },
        },
        {
          provide: 'SENTRY_INITIALIZED',
          useValue: false,
        },
      ],
    );
  });

  afterAll(async () => {
    await e2eApp.close();
  });

  it('GET /health should return 200 with status ok', () => {
    const request = require('supertest');
    return request(e2eApp.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res: any) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('ok');
        expect(res.body.data).toHaveProperty('timestamp');
        expect(res.body.data).toHaveProperty('uptime');
        expect(res.body.data).toHaveProperty('redis');
      });
  });
});
