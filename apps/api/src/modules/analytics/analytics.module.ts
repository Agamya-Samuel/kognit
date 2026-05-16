import { Module } from '@nestjs/common';
import { DRIZZLE_DB } from '../../db/database.module';

// Repositories
import { EnrollmentsRepository } from '../../db/repositories/enrollments.repository';
import { CoursesRepository } from '../../db/repositories/courses.repository';
import { CertificatesRepository } from '../../db/repositories/certificates.repository';
import { PaymentsRepository } from '../../db/repositories/payments.repository';
import { ProgressRepository } from '../../db/repositories/progress.repository';

// Services
import { AnalyticsService } from './analytics.service';
import { InstructorAnalyticsService } from './instructor-analytics.service';

// Controllers
import { AnalyticsController } from './analytics.controller';

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
];

@Module({
  controllers: [AnalyticsController],
  providers: [
    ...repositories,
    AnalyticsService,
    InstructorAnalyticsService,
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
