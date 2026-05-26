import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UsersRepository } from '../../db/repositories/users.repository';
import { DRIZZLE_DB } from '../../db/database.module';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: UsersRepository,
      useFactory: (db: any) => new UsersRepository(db),
      inject: [DRIZZLE_DB],
    },
  ],
})
export class UsersModule {}