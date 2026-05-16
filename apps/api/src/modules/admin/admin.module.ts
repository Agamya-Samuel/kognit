import { Module } from '@nestjs/common';
import { DRIZZLE_DB } from '../../db/database.module';
import { UsersRepository } from '../../db/repositories/users.repository';
import { InstructorProfilesRepository } from '../../db/repositories/instructor-profiles.repository';
import { CoursesRepository } from '../../db/repositories/courses.repository';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

const repositories = [
  {
    provide: UsersRepository,
    useFactory: (db: any) => new UsersRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: InstructorProfilesRepository,
    useFactory: (db: any) => new InstructorProfilesRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: CoursesRepository,
    useFactory: (db: any) => new CoursesRepository(db),
    inject: [DRIZZLE_DB],
  },
];

@Module({
  controllers: [AdminController],
  providers: [...repositories, AdminService],
})
export class AdminModule {}
