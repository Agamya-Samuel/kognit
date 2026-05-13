import { Module } from '@nestjs/common';
import { DRIZZLE_DB } from '../../db/database.module';

// Repositories
import { ProgressRepository } from '../../db/repositories/progress.repository';
import { LecturesRepository } from '../../db/repositories/lectures.repository';
import { SectionsRepository } from '../../db/repositories/sections.repository';
import { EnrollmentsRepository } from '../../db/repositories/enrollments.repository';
import { CoursesRepository } from '../../db/repositories/courses.repository';

// Services
import { ProgressService } from './progress.service';

// Controllers
import { ProgressController } from './progress.controller';

const repositories = [
  {
    provide: ProgressRepository,
    useFactory: (db: any) => new ProgressRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: LecturesRepository,
    useFactory: (db: any) => new LecturesRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: SectionsRepository,
    useFactory: (db: any) => new SectionsRepository(db),
    inject: [DRIZZLE_DB],
  },
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
];

@Module({
  controllers: [ProgressController],
  providers: [
    ...repositories,
    ProgressService,
  ],
  exports: [ProgressService],
})
export class ProgressModule {}
