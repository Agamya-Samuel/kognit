import { RedisService } from "../../src/redis/redis.service";
import { DatabaseService } from "../../src/db/connection";
import { HealthController } from "../../src/health/health.controller";
import { ConnectionStateService } from "../../src/common/services/connection-state.service";
import { createE2EApp } from "./helpers/e2e-app.helper";

function mockQueueProvider(name: string) {
  return {
    provide: `BullQueue_${name}`,
    useValue: {
      getJobCounts: () => Promise.resolve({ waiting: 0 }),
    },
  };
}

describe("Health Check (e2e)", () => {
  let e2eApp: Awaited<ReturnType<typeof createE2EApp>>;

  beforeAll(async () => {
    e2eApp = await createE2EApp(
      [HealthController],
      [
        {
          provide: RedisService,
          useValue: {
            healthCheck: () => Promise.resolve({ status: "ok", latencyMs: 1 }),
          },
        },
        {
          provide: DatabaseService,
          useValue: {
            healthCheck: () => Promise.resolve(true),
            isConnected: () => true,
          },
        },
        {
          provide: ConnectionStateService,
          useValue: {
            getHealth: () => ({ database: "up", redis: "up" }),
          },
        },
        {
          provide: "SENTRY_INITIALIZED",
          useValue: false,
        },
        mockQueueProvider("media-processing"),
        mockQueueProvider("email-notifications"),
        mockQueueProvider("certificate-generation"),
        mockQueueProvider("scheduled-notifications"),
        mockQueueProvider("sms-notifications"),
      ],
    );
  });

  afterAll(async () => {
    await e2eApp.close();
  });

  it("GET /api/v1/health should return 200 with status ok", () => {
    const request = require("supertest");
    return request(e2eApp.getHttpServer())
      .get("/api/v1/health")
      .expect(200)
      .expect((res: any) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe("ok");
        expect(res.body.data).toHaveProperty("timestamp");
        expect(res.body.data).toHaveProperty("uptime");
        expect(res.body.data).toHaveProperty("connections");
        expect(res.body.data.connections).toHaveProperty("redis");
      });
  });
});
