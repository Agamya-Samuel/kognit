import { Module } from '@nestjs/common';
import { DRIZZLE_DB } from '../../db/database.module';
import { UsersRepository } from '../../db/repositories/users.repository';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

const repositories = [
  {
    provide: UsersRepository,
    useFactory: (db: any) => new UsersRepository(db),
    inject: [DRIZZLE_DB],
  },
];

@Module({
  controllers: [AdminController],
  providers: [...repositories, AdminService],
})
export class AdminModule {}
