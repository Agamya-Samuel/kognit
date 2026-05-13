import { Module } from '@nestjs/common';
import { DRIZZLE_DB } from '../../db/database.module';

// Repositories
import { AssignmentsRepository } from '../../db/repositories/assignments.repository';
import { SubmissionsRepository } from '../../db/repositories/submissions.repository';
import { QuizQuestionsRepository } from '../../db/repositories/quiz-questions.repository';
import { LecturesRepository } from '../../db/repositories/lectures.repository';
import { SectionsRepository } from '../../db/repositories/sections.repository';
import { CoursesRepository } from '../../db/repositories/courses.repository';

// Services
import { AssignmentService } from './services/assignment.service';
import { QuizService } from './services/quiz.service';
import { SubmissionService } from './services/submission.service';
import { GradingService } from './services/grading.service';

// Controllers
import { AssignmentsController } from './assignments.controller';
import { SubmissionsController } from './submissions.controller';

const repositories = [
  {
    provide: AssignmentsRepository,
    useFactory: (db: any) => new AssignmentsRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: SubmissionsRepository,
    useFactory: (db: any) => new SubmissionsRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: QuizQuestionsRepository,
    useFactory: (db: any) => new QuizQuestionsRepository(db),
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
    provide: CoursesRepository,
    useFactory: (db: any) => new CoursesRepository(db),
    inject: [DRIZZLE_DB],
  },
];

@Module({
  controllers: [AssignmentsController, SubmissionsController],
  providers: [
    ...repositories,
    AssignmentService,
    QuizService,
    SubmissionService,
    GradingService,
  ],
  exports: [AssignmentService, QuizService, SubmissionService, GradingService],
})
export class AssignmentsModule {}
