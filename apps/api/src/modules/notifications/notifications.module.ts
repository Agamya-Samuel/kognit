import { Module } from '@nestjs/common';
import { DRIZZLE_DB } from '../../db/database.module';
import { NotificationsRepository } from '../../db/repositories/notifications.repository';
import { UserNotificationPreferencesRepository } from './repositories/notifications-preferences.repository';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './controllers/notifications.controller';

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
  controllers: [NotificationsController],
  providers: [...repositories, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}