import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DRIZZLE_DB } from '../../db/database.module';
import { NotificationsRepository } from '../../db/repositories/notifications.repository';
import { UserNotificationPreferencesRepository } from './repositories/notifications-preferences.repository';
import { NotificationsService } from './services/notifications.service';
import { NotificationDispatcherService } from './services/notification-dispatcher.service';
import { NotificationsController } from './controllers/notifications.controller';
import { QueueModule } from '../../queue/queue.module';
import { ProvidersModule } from './providers/providers.module';

const repositories = [
  {
    provide: NotificationsRepository,
    useFactory: (db: any) => new NotificationsRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: UserNotificationPreferencesRepository,
    useFactory: (db: any) => new UserNotificationPreferencesRepository(db),
    inject: [DRIZZLE_DB],
  },
];

@Module({
  imports: [QueueModule, ProvidersModule],
  controllers: [NotificationsController],
  providers: [...repositories, NotificationsService, NotificationDispatcherService],
  exports: [NotificationsService, NotificationDispatcherService],
})
export class NotificationsModule {}
