import { Module } from '@nestjs/common';
import { DRIZZLE_DB } from '../../db/database.module';

// Repositories
import { CertificatesRepository } from '../../db/repositories/certificates.repository';
import { ProgressRepository } from '../../db/repositories/progress.repository';
import { EnrollmentsRepository } from '../../db/repositories/enrollments.repository';
import { UsersRepository } from '../../db/repositories/users.repository';
import { CoursesRepository } from '../../db/repositories/courses.repository';

// Services
import { CertificatesService } from './certificates.service';

// Controllers
import { CertificatesController } from './certificates.controller';

const repositories = [
  {
    provide: CertificatesRepository,
    useFactory: (db: any) => new CertificatesRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: ProgressRepository,
    useFactory: (db: any) => new ProgressRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: EnrollmentsRepository,
    useFactory: (db: any) => new EnrollmentsRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: UsersRepository,
    useFactory: (db: any) => new UsersRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: CoursesRepository,
    useFactory: (db: any) => new CoursesRepository(db),
    inject: [DRIZZLE_DB],
  },
];

@Module({
  controllers: [CertificatesController],
  providers: [
    ...repositories,
    CertificatesService,
  ],
  exports: [CertificatesService],
})
export class CertificatesModule {}
