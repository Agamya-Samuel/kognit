/**
 * E2E test setup for the NestJS API.
 * This file runs before E2E tests and configures the test environment.
 */

import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { ResponseInterceptor } from '../../src/common/interceptors/response.interceptor';
import { SlowQueryInterceptor } from '../../src/common/interceptors/slow-query.interceptor';
import { CacheHeadersInterceptor } from '../../src/common/interceptors/cache-headers.interceptor';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

/**
 * Creates and configures a NestJS application for E2E testing.
 * Applies the same pipes, interceptors, filters, and versioning as main.ts.
 * Returns the application instance that should be closed after tests.
 */
export async function setupE2EApp(): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Match main.ts configuration
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(
    new SlowQueryInterceptor(),
    new CacheHeadersInterceptor(),
    new ResponseInterceptor(),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();

  return app;
}

/**
 * Tears down the E2E application after tests complete.
 */
export async function teardownE2EApp(app: INestApplication): Promise<void> {
  await app.close();
}
