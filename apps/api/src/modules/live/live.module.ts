import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DRIZZLE_DB } from '../../db/database.module';

import { LiveClassesRepository } from '../../db/repositories/live-classes.repository';
import { EnrollmentsRepository } from '../../db/repositories/enrollments.repository';
import { NotificationsRepository } from '../../db/repositories/notifications.repository';
import { CoursesRepository } from '../../db/repositories/courses.repository';

import { LiveKitService } from './services/livekit.service';
import { ScheduleService } from './services/schedule.service';
import { RecordingService } from './services/recording.service';
import { LiveNotificationService } from './services/live-notification.service';

import { MediaModule } from '../media/media.module';
import { QueueModule } from '../../queue/queue.module';

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
    provide: NotificationsRepository,
    useFactory: (db: any) => new NotificationsRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: CoursesRepository,
    useFactory: (db: any) => new CoursesRepository(db),
    inject: [DRIZZLE_DB],
  },
];

@Module({
  imports: [ConfigModule, MediaModule, QueueModule],
  controllers: [LiveController],
  providers: [
    ...repositories,
    LiveKitService,
    ScheduleService,
    RecordingService,
    LiveNotificationService,
  ],
  exports: [LiveKitService, ScheduleService, RecordingService, LiveNotificationService],
})
export class LiveModule {}
