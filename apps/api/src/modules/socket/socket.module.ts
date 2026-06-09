import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SocketGateway } from './socket.gateway';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { RoomService } from './services/room.service';
import { PresenceService } from './services/presence.service';
import { SocketRateLimiterService } from './services/rate-limiter.service';
import { RedisAdapterService } from './services/redis-adapter.service';
import { DRIZZLE_DB } from '../../db/database.module';
import { EnrollmentsRepository } from '../../db/repositories/enrollments.repository';
import { LiveClassesRepository } from '../../db/repositories/live-classes.repository';
import { LecturesRepository } from '../../db/repositories/lectures.repository';
import { SectionsRepository } from '../../db/repositories/sections.repository';

@Module({
  imports: [JwtModule.register({})],
  providers: [
    WsJwtGuard,
    {
      provide: EnrollmentsRepository,
      useFactory: (db: any) => new EnrollmentsRepository(db),
      inject: [DRIZZLE_DB],
    },
    {
      provide: LiveClassesRepository,
      useFactory: (db: any) => new LiveClassesRepository(db),
      inject: [DRIZZLE_DB],
    },
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
    RoomService,
    PresenceService,
    SocketRateLimiterService,
    RedisAdapterService,
    SocketGateway,
  ],
  exports: [SocketGateway, RoomService, PresenceService],
})
export class SocketModule {}
