import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { HealthController } from './health/health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { MediaModule } from './modules/media/media.module';
import { LiveModule } from './modules/live/live.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ChatModule } from './modules/chat/chat.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminModule } from './modules/admin/admin.module';

// Feature modules (to be implemented)

@Module({
  imports: [
    AppConfigModule,
    // Feature modules
    AuthModule,
    UsersModule,
    CoursesModule,
    EnrollmentsModule,
    UploadsModule,
    MediaModule,
    LiveModule,
    PaymentsModule,
    NotificationsModule,
    ChatModule,
    AssignmentsModule,
    CertificatesModule,
    AnalyticsModule,
    AdminModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
