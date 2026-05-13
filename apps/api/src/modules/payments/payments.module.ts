import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DRIZZLE_DB } from '../../db/database.module';

// Repositories
import { PaymentsRepository } from '../../db/repositories/payments.repository';
import { EnrollmentsRepository } from '../../db/repositories/enrollments.repository';
import { CoursesRepository } from '../../db/repositories/courses.repository';

// Services
import { RazorpayService } from './services/razorpay.service';
import { PaymentsService } from './services/payments.service';

// Controllers
import { PaymentsController } from './payments.controller';
import { RazorpayWebhookController } from './razorpay-webhook.controller';

const repositories = [
  {
    provide: PaymentsRepository,
    useFactory: (db: any) => new PaymentsRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: EnrollmentsRepository,
    useFactory: (db: any) => new EnrollmentsRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: CoursesRepository,
    useFactory: (db: any) => new CoursesRepository(db),
    inject: [DRIZZLE_DB],
  },
];

@Module({
  imports: [ConfigModule],
  controllers: [PaymentsController, RazorpayWebhookController],
  providers: [
    ...repositories,
    RazorpayService,
    PaymentsService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
