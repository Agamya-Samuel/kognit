import { Module } from '@nestjs/common';
import { DRIZZLE_DB } from '../../db/database.module';
import { UsersRepository } from '../../db/repositories/users.repository';
import { InstructorProfilesRepository } from '../../db/repositories/instructor-profiles.repository';
import { CoursesRepository } from '../../db/repositories/courses.repository';
import { AssignmentsRepository } from '../../db/repositories/assignments.repository';
import { PaymentsRepository } from '../../db/repositories/payments.repository';
import { ProgressRepository } from '../../db/repositories/progress.repository';
import { SettingsRepository } from '../../db/repositories/settings.repository';
import { StudentProfilesRepository } from '../../db/repositories/student-profiles.repository';
import { InstitutionAccountsRepository } from '../../db/repositories/institution-accounts.repository';
import { EmailVerificationsRepository } from '../../db/repositories/email-verifications.repository';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { NotificationsService } from '../notifications/services/notifications.service';
import { UserNotificationPreferencesRepository } from '../notifications/repositories/notifications-preferences.repository';
import { NotificationsModule } from '../notifications/notifications.module';

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
  {
    provide: AssignmentsRepository,
    useFactory: (db: any) => new AssignmentsRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: PaymentsRepository,
    useFactory: (db: any) => new PaymentsRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: ProgressRepository,
    useFactory: (db: any) => new ProgressRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: SettingsRepository,
    useFactory: (db: any) => new SettingsRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: StudentProfilesRepository,
    useFactory: (db: any) => new StudentProfilesRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: InstitutionAccountsRepository,
    useFactory: (db: any) => new InstitutionAccountsRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: EmailVerificationsRepository,
    useFactory: (db: any) => new EmailVerificationsRepository(db),
    inject: [DRIZZLE_DB],
  },
];

@Module({
  imports: [NotificationsModule],
  controllers: [AdminController],
  providers: [...repositories, AdminService],
})
export class AdminModule {}
