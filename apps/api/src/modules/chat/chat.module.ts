import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DRIZZLE_DB } from '../../db/database.module';

// Repositories
import { MessagesRepository } from '../../db/repositories/messages.repository';
import { ChannelsRepository } from '../../db/repositories/channels.repository';
import { ChannelMembersRepository } from '../../db/repositories/channel-members.repository';

// Services
import { ChatService } from './services/chat.service';
import { ChannelService } from './services/channel.service';
import { TypingService } from './services/typing.service';

// Gateway & Controller
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';

// Socket module (for WsJwtGuard dependency)
import { SocketModule } from '../socket/socket.module';
import { RedisModule } from '../../redis/redis.module';

const repositories = [
  {
    provide: MessagesRepository,
    useFactory: (db: any) => new MessagesRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: ChannelsRepository,
    useFactory: (db: any) => new ChannelsRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: ChannelMembersRepository,
    useFactory: (db: any) => new ChannelMembersRepository(db),
    inject: [DRIZZLE_DB],
  },
];

@Module({
  imports: [JwtModule.register({}), SocketModule, RedisModule],
  controllers: [ChatController],
  providers: [
    ...repositories,
    ChatService,
    ChannelService,
    TypingService,
    ChatGateway,
  ],
  exports: [ChatService, ChannelService, TypingService],
})
export class ChatModule {}
