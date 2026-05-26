import { Module } from '@nestjs/common';
import { DRIZZLE_DB } from '../../db/database.module';
import { PlatformSettingsRepository } from './repositories/platform-settings.repository';
import { PlatformSettingsService } from './services/platform-settings.service';
import { PlatformSettingsController } from './controllers/platform-settings.controller';

const repositories = [
  {
    provide: PlatformSettingsRepository,
    useFactory: (db: any) => new PlatformSettingsRepository(db),
    inject: [DRIZZLE_DB],
  },
];

@Module({
  controllers: [PlatformSettingsController],
  providers: [...repositories, PlatformSettingsService],
})
export class PlatformSettingsModule {}