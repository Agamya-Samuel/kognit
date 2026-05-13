import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SocketGateway } from './socket.gateway';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { RoomService } from './services/room.service';
import { PresenceService } from './services/presence.service';
import { SocketRateLimiterService } from './services/rate-limiter.service';
import { RedisAdapterService } from './services/redis-adapter.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [
    WsJwtGuard,
    RoomService,
    PresenceService,
    SocketRateLimiterService,
    RedisAdapterService,
    SocketGateway,
  ],
  exports: [SocketGateway, RoomService, PresenceService],
})
export class SocketModule {}
