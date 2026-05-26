import { Module } from '@nestjs/common';
import { DRIZZLE_DB } from '../../db/database.module';
import { EnrollmentsRepository } from '../../db/repositories/enrollments.repository';
import { EnrollmentsService } from './services/enrollments.service';
import { EnrollmentsController } from './controllers/enrollments.controller';

const repositories = [
  {
    provide: EnrollmentsRepository,
    useFactory: (db: any) => new EnrollmentsRepository(db),
    inject: [DRIZZLE_DB],
  },
];

@Module({
  controllers: [EnrollmentsController],
  providers: [...repositories, EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}