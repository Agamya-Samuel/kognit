import { Module } from '@nestjs/common';
import { DRIZZLE_DB } from '../../db/database.module';

// Repositories
import { EnrollmentsRepository } from '../../db/repositories/enrollments.repository';
import { CoursesRepository } from '../../db/repositories/courses.repository';
import { CertificatesRepository } from '../../db/repositories/certificates.repository';
import { PaymentsRepository } from '../../db/repositories/payments.repository';
import { ProgressRepository } from '../../db/repositories/progress.repository';
import { LiveClassesRepository } from '../../db/repositories/live-classes.repository';
import { UsersRepository } from '../../db/repositories/users.repository';

// Services
import { AnalyticsService } from './analytics.service';
import { InstructorAnalyticsService } from './instructor-analytics.service';
import { DashboardMetricsService } from './services/dashboard-metrics.service';

// Controllers
import { AnalyticsController } from './analytics.controller';
import { DashboardController } from './controllers/dashboard.controller';

const repositories = [
  {
    provide: EnrollmentsRepository,
    useFactory: (db: any) => new EnrollmentsRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: CoursesRepository,
    useFactory: (db: any) => new CoursesRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: CertificatesRepository,
    useFactory: (db: any) => new CertificatesRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: PaymentsRepository,
    useFactory: (db: any) => new PaymentsRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: ProgressRepository,
    useFactory: (db: any) => new ProgressRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: LiveClassesRepository,
    useFactory: (db: any) => new LiveClassesRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: UsersRepository,
    useFactory: (db: any) => new UsersRepository(db),
    inject: [DRIZZLE_DB],
  },
];

@Module({
  controllers: [AnalyticsController, DashboardController],
  providers: [
    ...repositories,
    AnalyticsService,
    InstructorAnalyticsService,
    DashboardMetricsService,
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
