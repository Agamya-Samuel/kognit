/**
 * E2E test setup for the NestJS API.
 * This file runs before E2E tests and configures the test environment.
 */

import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { ResponseInterceptor } from '../../src/common/interceptors/response.interceptor';
import { ZodValidationPipe } from '../../src/common/pipes/zod-validation.pipe';

/**
 * Creates and configures a NestJS application for E2E testing.
 * Returns the application instance that should be closed after tests.
 */
export async function setupE2EApp(): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Apply the same pipes and interceptors as in main.ts
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.init();

  return app;
}

/**
 * Tears down the E2E application after tests complete.
 */
export async function teardownE2EApp(app: INestApplication): Promise<void> {
  await app.close();
}
