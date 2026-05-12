import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DRIZZLE_DB } from '../../db/database.module';

// Repositories
import { UploadsRepository } from '../../db/repositories/uploads.repository';
import { LecturesRepository } from '../../db/repositories/lectures.repository';

// Services
import { S3Service } from './services/s3.service';
import { UploadService } from './services/upload.service';

// Controllers
import { UploadsController } from './uploads.controller';
import { S3WebhookController } from './s3-webhook.controller';

const repositories = [
  {
    provide: UploadsRepository,
    useFactory: (db: any) => new UploadsRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: LecturesRepository,
    useFactory: (db: any) => new LecturesRepository(db),
    inject: [DRIZZLE_DB],
  },
];

@Module({
  imports: [ConfigModule],
  controllers: [UploadsController, S3WebhookController],
  providers: [
    ...repositories,
    S3Service,
    UploadService,
  ],
  exports: [S3Service, UploadService],
})
export class UploadsModule {}
