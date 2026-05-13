import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DRIZZLE_DB } from '../../db/database.module';

// Repositories
import { LiveClassesRepository } from '../../db/repositories/live-classes.repository';
import { EnrollmentsRepository } from '../../db/repositories/enrollments.repository';
import { LecturesRepository } from '../../db/repositories/lectures.repository';
import { SectionsRepository } from '../../db/repositories/sections.repository';

// Services
import { LiveKitService } from './services/livekit.service';

// Controllers
import { LiveController } from './live.controller';

const repositories = [
  {
    provide: LiveClassesRepository,
    useFactory: (db: any) => new LiveClassesRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: EnrollmentsRepository,
    useFactory: (db: any) => new EnrollmentsRepository(db),
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
];

@Module({
  imports: [ConfigModule],
  controllers: [LiveController],
  providers: [
    ...repositories,
    LiveKitService,
  ],
  exports: [LiveKitService],
})
export class LiveModule {}
