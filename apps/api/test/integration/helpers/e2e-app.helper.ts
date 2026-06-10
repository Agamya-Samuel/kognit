import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
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
 * Matches the real app's routing configuration: global prefix `api` + URI
 * versioning with default version `1`, so routes are exposed as `/api/v1/...`.
 * Controllers use relative `@Controller('auth')` etc. paths.
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
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();
  return app;
}
