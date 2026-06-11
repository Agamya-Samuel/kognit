import { Module } from '@nestjs/common';
import { DRIZZLE_DB } from '../../db/database.module';

// Repositories
import { CoursesRepository } from '../../db/repositories/courses.repository';
import { SectionsRepository } from '../../db/repositories/sections.repository';
import { LecturesRepository } from '../../db/repositories/lectures.repository';
import { EnrollmentsRepository } from '../../db/repositories/enrollments.repository';
import { UsersRepository } from '../../db/repositories/users.repository';
import { ProgressRepository } from '../../db/repositories/progress.repository';
import { CourseSessionsRepository } from '../../db/repositories/course-sessions.repository';
import { RecurringSchedulesRepository } from '../../db/repositories/recurring-schedules.repository';
import { LessonAttachmentsRepository } from '../../db/repositories/lesson-attachments.repository';

// Services
import { CoursesService } from './courses.service';
import { SectionsService } from './sections.service';
import { LecturesService } from './lectures.service';
import { InstructorStudentsService } from './services/instructor-students.service';
import { CourseSessionsService } from './services/course-sessions.service';
import { RecurringSchedulesService } from './services/recurring-schedules.service';
import { AttachmentsService } from './services/attachments.service';

// Controllers
import { CoursesController } from './courses.controller';
import { SectionsController } from './sections.controller';
import { LecturesController } from './lectures.controller';
import { InstructorStudentsController } from './controllers/instructor-students.controller';
import { CourseSessionsController } from './controllers/course-sessions.controller';
import { AttachmentsController } from './controllers/attachments.controller';

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
    provide: ProgressRepository,
    useFactory: (db: any) => new ProgressRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: CourseSessionsRepository,
    useFactory: (db: any) => new CourseSessionsRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: RecurringSchedulesRepository,
    useFactory: (db: any) => new RecurringSchedulesRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: LessonAttachmentsRepository,
    useFactory: (db: any) => new LessonAttachmentsRepository(db),
    inject: [DRIZZLE_DB],
  },
];

@Module({
  controllers: [
    CoursesController,
    SectionsController,
    LecturesController,
    InstructorStudentsController,
    CourseSessionsController,
    AttachmentsController,
  ],
  providers: [
    ...repositories,
    CoursesService,
    SectionsService,
    LecturesService,
    InstructorStudentsService,
    CourseSessionsService,
    RecurringSchedulesService,
    AttachmentsService,
  ],
  exports: [CoursesService, SectionsService, LecturesService, CourseSessionsService, AttachmentsService],
})
export class CoursesModule {}
