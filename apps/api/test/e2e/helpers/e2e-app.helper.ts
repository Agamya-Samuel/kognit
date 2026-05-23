import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ResponseInterceptor } from '../../../src/common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../../../src/common/filters/http-exception.filter';

/**
 * Creates a minimal NestJS E2E test application.
 *
 * Instead of importing the full AppModule (which triggers real DB/Redis/Bull
 * connections), we build a focused test module with only the controller under
 * test + mocked providers.
 *
 * NOTE: Global prefix and URI versioning are NOT set here because
 * AuthController and CoursesController already include `api/v1/` in their
 * @Controller() paths. Only HealthController uses a short path (`health`).
 *
 * IMPORTANT: Use plain functions (not jest.fn().mockResolvedValue()) for async
 * mock return values — Jest 30 has issues with mockResolvedValue in NestJS
 * async controllers.
 *
 * @param controllers - Array of controller classes to register
 * @param providers - Array of { provide, useValue } provider overrides
 */
export async function createE2EApp(
  controllers: any[],
  providers: Array<{ provide: any; useValue: any }> = [],
): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    controllers,
    providers,
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();
  return app;
}
