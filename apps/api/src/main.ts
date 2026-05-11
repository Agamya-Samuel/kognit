import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(), {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT') || 3000;
  const NODE_ENV = configService.get<string>('NODE_ENV') || 'development';

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
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL') || 'http://localhost:3000',
    credentials: true,
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

  // Global Response Interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

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
    console.log(`\n🚀 Server is running on: http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health\n`);
    console.log(`🌍 Environment: ${NODE_ENV}\n`);
  });

  await app.listen(PORT);

  // Graceful shutdown handler
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n⚠️  Received ${signal}. Starting graceful shutdown...`);
    await app.close();
    console.log('✅ Application closed gracefully');
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
