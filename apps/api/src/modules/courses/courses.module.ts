import { Module } from '@nestjs/common';
import { DRIZZLE_DB } from '../../db/database.module';

// Repositories
import { CoursesRepository } from '../../db/repositories/courses.repository';
import { SectionsRepository } from '../../db/repositories/sections.repository';
import { LecturesRepository } from '../../db/repositories/lectures.repository';

// Services
import { CoursesService } from './courses.service';
import { SectionsService } from './sections.service';
import { LecturesService } from './lectures.service';

// Controllers
import { CoursesController } from './courses.controller';
import { SectionsController } from './sections.controller';
import { LecturesController } from './lectures.controller';

const repositories = [
  {
    provide: CoursesRepository,
    useFactory: (db: any) => new CoursesRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: SectionsRepository,
    useFactory: (db: any) => new SectionsRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: LecturesRepository,
    useFactory: (db: any) => new LecturesRepository(db),
    inject: [DRIZZLE_DB],
  },
];

@Module({
  controllers: [CoursesController, SectionsController, LecturesController],
  providers: [
    ...repositories,
    CoursesService,
    SectionsService,
    LecturesService,
  ],
  exports: [CoursesService, SectionsService, LecturesService],
})
export class CoursesModule {}
