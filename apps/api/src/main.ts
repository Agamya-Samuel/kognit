import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { SlowQueryInterceptor } from './common/interceptors/slow-query.interceptor';
import { CacheHeadersInterceptor } from './common/interceptors/cache-headers.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ThrottlerExceptionFilter as CustomThrottlerFilter } from './common/filters/throttler-exception.filter';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(), {
    bufferLogs: true,
    rawBody: true,
  });

  // Use Pino as the application logger
  app.useLogger(app.get(PinoLogger));

  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT') || 3000;
  const NODE_ENV = configService.get<string>('NODE_ENV') || 'development';
  const logger = new Logger('Bootstrap');

  // Security headers (helmet). crossOriginResourcePolicy: 'cross-origin' is
  // required so the API can serve S3-hosted assets via signed URLs.
  // CSP is configured for an API-only server: JSON responses + Swagger docs.
  // 'unsafe-inline' for styles/scripts is required by Swagger UI's inline CSS and JS.
  // In production the policy is enforced; in development it is also applied so
  // issues surface early.
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    // HSTS: enforce HTTPS for 1 year, include subdomains
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  // Response compression (gzip)
  app.use(require('compression')({ threshold: 1024 }));

  // Enable shutdown hooks for graceful shutdown
  app.enableShutdownHooks();

  // Global prefix
  app.setGlobalPrefix('api');

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // CORS Configuration
  const corsOrigins = (configService.get<string>('CORS_ORIGINS') || '')
    .split(',')
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    exposedHeaders: ['X-XSRF-TOKEN'],
  });

  // Global Validation Pipe with Zod-like detailed errors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map(error => ({
          field: error.property,
          constraints: Object.values(error.constraints || {}),
          value: error.value,
        }));

        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: formattedErrors,
            timestamp: new Date().toISOString(),
          },
        };
      },
    }),
  );

  // Global Interceptors
  app.useGlobalInterceptors(
    new SlowQueryInterceptor(),
    new CacheHeadersInterceptor(),
    new ResponseInterceptor(),
  );

  // Global Exception Filters
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new CustomThrottlerFilter(),
  );

  // Socket.IO with Redis adapter for horizontal scaling
  const redisAdapterService = app.get(
    require('./modules/socket/services/redis-adapter.service').RedisAdapterService,
  );
  const redisAdapter = redisAdapterService.getAdapter();
  if (redisAdapter) {
    const { createAdapter } = require('@socket.io/redis-adapter');
    app.useWebSocketAdapter(new IoAdapter(app));
    // Store adapter reference for gateway to pick up
    (app as any).__redisAdapter = redisAdapter;
  } else {
    app.useWebSocketAdapter(new IoAdapter(app));
  }
  logger.log('Socket.IO adapter configured');

  // Swagger API Documentation
  if (NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('EduTech API')
      .setDescription('EduTech Platform API Documentation')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('auth', 'Authentication and authorization endpoints')
      .addTag('users', 'User management endpoints')
      .addTag('courses', 'Course management endpoints')
      .addTag('enrollments', 'Student enrollment endpoints')
      .addTag('media', 'Media upload and management endpoints')
      .addTag('live', 'Live class endpoints')
      .addTag('payments', 'Payment processing endpoints')
      .addTag('notifications', 'Notification management endpoints')
      .addTag('chat', 'Chat and messaging endpoints')
      .addTag('assignments', 'Assignment and quiz endpoints')
      .addTag('certificates', 'Certificate generation endpoints')
      .addTag('analytics', 'Analytics and reporting endpoints')
      .addTag('admin', 'Admin dashboard endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customSiteTitle: 'EduTech API Docs',
    });
  }

  // Health check endpoint
  app.getHttpServer().on('listening', () => {
    logger.log(`Server is running on: http://localhost:${PORT}`);
    logger.log(`API Documentation: http://localhost:${PORT}/api/docs`);
    logger.log(`Health Check: http://localhost:${PORT}/api/health`);
    logger.log(`Environment: ${NODE_ENV}`);
  });

  await app.listen(PORT);

  // Graceful shutdown handler
  const gracefulShutdown = async (signal: string) => {
    logger.warn(`Received ${signal}. Starting graceful shutdown...`);
    await app.close();
    logger.log('Application closed gracefully');
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
