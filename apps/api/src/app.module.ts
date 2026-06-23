import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './db/database.module';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queue/queue.module';
import { HealthController } from './health/health.controller';
import { DevEmailPreviewController } from './email/dev-email-preview.controller';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { MediaModule } from './modules/media/media.module';
import { ProgressModule } from './modules/progress/progress.module';
import { LiveModule } from './modules/live/live.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ChatModule } from './modules/chat/chat.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminModule } from './modules/admin/admin.module';
import { SocketModule } from './modules/socket/socket.module';
import { LoggerModule } from './common/logger/logger.module';
import { SentryModule } from './common/sentry/sentry.module';
import { PlatformSettingsModule } from './modules/platform-settings/platform-settings.module';
import { CsrfGuard } from './common/guards/csrf.guard';

// Feature modules (to be implemented)

@Module({
  imports: [
    AppConfigModule,
    // Rate limiting: configurable via RATE_LIMIT_TTL (seconds) and RATE_LIMIT_LIMIT env vars
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [{
        ttl: (config.get<number>('RATE_LIMIT_TTL') ?? 60) * 1000,
        limit: config.get<number>('RATE_LIMIT_LIMIT') ?? 100,
      }],
    }),
    // Infrastructure modules
    LoggerModule,
    SentryModule.forRoot(),
    DatabaseModule,
    RedisModule,
    QueueModule,
    // Feature modules
    AuthModule,
    UsersModule,
    CoursesModule,
    EnrollmentsModule,
    UploadsModule,
    MediaModule,
    ProgressModule,
    LiveModule,
    PaymentsModule,
    NotificationsModule,
    ChatModule,
    AssignmentsModule,
    CertificatesModule,
    AnalyticsModule,
    AdminModule,
    SocketModule,
    PlatformSettingsModule,
  ],
  controllers: [HealthController, DevEmailPreviewController],
  providers: [
    // Global guards: JWT auth + RBAC applied to all routes
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: CsrfGuard },
  ],
})
export class AppModule {}
