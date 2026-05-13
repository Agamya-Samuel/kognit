import { Module } from '@nestjs/common';
import { DRIZZLE_DB } from '../../db/database.module';
import { NotificationsRepository } from '../../db/repositories/notifications.repository';

const repositories = [
  {
    provide: NotificationsRepository,
    useFactory: (db: any) => new NotificationsRepository(db),
    inject: [DRIZZLE_DB],
  },
];

@Module({
  providers: [...repositories],
  exports: [NotificationsRepository],
})
export class NotificationsModule {}
