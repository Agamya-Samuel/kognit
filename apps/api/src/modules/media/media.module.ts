import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DRIZZLE_DB } from '../../db/database.module';

// Repositories
import { LecturesRepository } from '../../db/repositories/lectures.repository';
import { SectionsRepository } from '../../db/repositories/sections.repository';
import { EnrollmentsRepository } from '../../db/repositories/enrollments.repository';

// Services
import { MuxService } from './services/mux.service';

// Controllers
import { MediaController } from './media.controller';
import { MuxWebhookController } from './mux-webhook.controller';

const repositories = [
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
];

@Module({
  imports: [ConfigModule],
  controllers: [MediaController, MuxWebhookController],
  providers: [
    ...repositories,
    MuxService,
  ],
  exports: [MuxService],
})
export class MediaModule {}
