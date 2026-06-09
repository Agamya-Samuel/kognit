import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard, WsAuthenticatedUser } from './guards/ws-jwt.guard';
import { RoomService } from './services/room.service';
import { PresenceService } from './services/presence.service';
import { SocketRateLimiterService } from './services/rate-limiter.service';
import { IncomingMessageSchema, validateMessage } from './schemas/message.schema';

@WebSocketGateway({
  cors: {
    origin: (process.env.CORS_ORIGINS).split(','),
    credentials: true,
  },
  namespace: '/',
  transports: ['websocket', 'polling'],
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(SocketGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly wsJwtGuard: WsJwtGuard,
    private readonly roomService: RoomService,
    private readonly presenceService: PresenceService,
    private readonly rateLimiter: SocketRateLimiterService,
  ) {}

  // ─── Lifecycle hooks ──────────────────────────────────────────────────────

  afterInit(server: Server) {
    this.logger.log('Socket.IO gateway initialized');
  }

  async handleConnection(client: Socket) {
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '') ||
      (client.handshake.query?.token as string);

    if (!token) {
      this.logger.warn(`Connection rejected: no token (socket: ${client.id})`);
      client.emit('error', {
        code: 'AUTH_MISSING',
        message: 'Authentication token required',
      });
      client.disconnect(true);
      return;
    }

    const user = this.wsJwtGuard.validateToken(token);
    if (!user) {
      this.logger.warn(`Connection rejected: invalid/expired token (socket: ${client.id})`);
      client.emit('error', {
        code: 'AUTH_INVALID',
        message: 'Invalid or expired authentication token',
      });
      client.disconnect(true);
      return;
    }

    // Attach user info to socket
    client.data.user = user;

    // Track presence
    await this.presenceService.setUserOnline(
      user.sub,
      user.email,
      user.role,
      client.id,
    );

    // Notify others of user presence
    this.server.emit('presence:online', {
      userId: user.sub,
      email: user.email,
      role: user.role,
      connectedAt: Date.now(),
    });

    this.logger.log(`Client connected: ${client.id} (user: ${user.sub})`);
    client.emit('connection:established', {
      socketId: client.id,
      userId: user.sub,
    });
  }

  async handleDisconnect(client: Socket) {
    const user: WsAuthenticatedUser | undefined = client.data?.user;
    if (user) {
      await this.presenceService.setUserOffline(user.sub);
      await this.rateLimiter.cleanup(client.id);

      // Notify others
      this.server.emit('presence:offline', {
        userId: user.sub,
        disconnectedAt: Date.now(),
      });

      this.logger.log(`Client disconnected: ${client.id} (user: ${user.sub})`);
    }
  }

  // ─── Room Management ──────────────────────────────────────────────────────

  @SubscribeMessage('room:join')
  async handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user: WsAuthenticatedUser = client.data?.user;
    if (!user) {
      client.emit('error', { code: 'UNAUTHORIZED', message: 'Not authenticated' });
      return;
    }

    // Validate message
    const validation = validateMessage(
      require('./schemas/message.schema').JoinRoomSchema,
      { type: 'room:join', payload: data },
    );
    if (!validation.success) {
      client.emit('error', {
        code: 'VALIDATION_ERROR',
        message: 'Invalid room join data',
        details: validation.errors,
      });
      return;
    }

    const roomName = data.room;
    const canJoin = await this.roomService.canJoinRoom(roomName, user.sub, user.role);
    if (!canJoin.allowed) {
      client.emit('error', {
        code: 'ROOM_DENIED',
        message: canJoin.reason || 'Cannot join this room',
      });
      return;
    }

    await client.join(roomName);

    // Update presence with new room
    const rooms = Array.from(client.rooms).filter((r) => r !== client.id);
    await this.presenceService.updateUserRooms(user.sub, rooms);

    // Notify room members
    client.to(roomName).emit('room:user_joined', {
      room: roomName,
      userId: user.sub,
      email: user.email,
      role: user.role,
      joinedAt: Date.now(),
    });

    // Acknowledge join to sender
    client.emit('room:joined', { room: roomName });

    this.logger.debug(`User ${user.sub} joined room ${roomName}`);
  }

  @SubscribeMessage('room:leave')
  async handleLeaveRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user: WsAuthenticatedUser = client.data?.user;
    if (!user) return;

    await client.leave(data.room);

    // Update presence
    const rooms = Array.from(client.rooms).filter((r) => r !== client.id);
    await this.presenceService.updateUserRooms(user.sub, rooms);

    // Notify room members
    client.to(data.room).emit('room:user_left', {
      room: data.room,
      userId: user.sub,
      leftAt: Date.now(),
    });

    client.emit('room:left', { room: data.room });

    this.logger.debug(`User ${user.sub} left room ${data.room}`);
  }

  // ─── Chat Messages ────────────────────────────────────────────────────────

  @SubscribeMessage('chat:message')
  async handleChatMessage(
    @MessageBody() data: { roomId: string; content: string; replyTo?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user: WsAuthenticatedUser = client.data?.user;
    if (!user) {
      client.emit('error', { code: 'UNAUTHORIZED', message: 'Not authenticated' });
      return;
    }

    // Rate limiting
    const rateCheck = await this.rateLimiter.checkLimit(client.id);
    if (!rateCheck.allowed) {
      client.emit('error', {
        code: 'RATE_LIMITED',
        message: 'Too many messages. Please slow down.',
        resetAt: rateCheck.resetAt,
      });
      return;
    }

    // Validate message payload
    const validation = validateMessage(
      require('./schemas/message.schema').ChatMessageSchema,
      { type: 'chat:message', payload: data },
    );
    if (!validation.success) {
      client.emit('error', {
        code: 'VALIDATION_ERROR',
        message: 'Invalid message data',
        details: validation.errors,
      });
      return;
    }

    // Check if user is in the room
    const isInRoom = client.rooms.has(data.roomId);
    if (!isInRoom) {
      client.emit('error', {
        code: 'NOT_IN_ROOM',
        message: 'You must join the room before sending messages',
      });
      return;
    }

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId: data.roomId,
      senderId: user.sub,
      senderEmail: user.email,
      senderRole: user.role,
      content: data.content,
      replyTo: data.replyTo || null,
      createdAt: Date.now(),
    };

    // Broadcast to everyone in the room (including sender for confirmation)
    this.server.to(data.roomId).emit('chat:message', message);

    this.logger.debug(
      `User ${user.sub} sent message in ${data.roomId}: "${data.content.substring(0, 50)}"`,
    );
  }

  // ─── Typing Indicators ────────────────────────────────────────────────────

  @SubscribeMessage('chat:typing')
  async handleTyping(
    @MessageBody() data: { roomId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const user: WsAuthenticatedUser = client.data?.user;
    if (!user) return;

    const validation = validateMessage(
      require('./schemas/message.schema').TypingIndicatorSchema,
      { type: 'chat:typing', payload: data },
    );
    if (!validation.success) return;

    // Only broadcast to others in the room
    client.to(data.roomId).emit('chat:typing', {
      roomId: data.roomId,
      userId: user.sub,
      email: user.email,
      isTyping: data.isTyping,
    });
  }

  // ─── Presence Updates ────────────────────────────────────────────────────

  @SubscribeMessage('presence:update')
  async handlePresenceUpdate(
    @MessageBody() data: { status: 'online' | 'away' | 'dnd' },
    @ConnectedSocket() client: Socket,
  ) {
    const user: WsAuthenticatedUser = client.data?.user;
    if (!user) return;

    const validation = validateMessage(
      require('./schemas/message.schema').PresenceUpdateSchema,
      { type: 'presence:update', payload: data },
    );
    if (!validation.success) return;

    // Broadcast presence update to all connected clients
    this.server.emit('presence:updated', {
      userId: user.sub,
      status: data.status,
      updatedAt: Date.now(),
    });
  }
}
