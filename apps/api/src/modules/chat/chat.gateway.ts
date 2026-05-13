import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './services/chat.service';
import { TypingService } from './services/typing.service';
import { WsAuthenticatedUser } from '../socket/guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
  transports: ['websocket', 'polling'],
})
export class ChatGateway {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly typingService: TypingService,
  ) {}

  // ─── Send Message (real-time) ─────────────────────────────────────────────

  @SubscribeMessage('chat:send')
  async handleSendMessage(
    @MessageBody() data: { channelId: number; content: string; replyToId?: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user: WsAuthenticatedUser = client.data?.user;
    if (!user) {
      client.emit('error', { code: 'UNAUTHORIZED', message: 'Not authenticated' });
      return;
    }

    try {
      const message = await this.chatService.sendMessage(
        user.sub,
        data.channelId,
        data.content,
        data.replyToId,
      );

      // Broadcast to the channel room
      const roomName = `channel:${data.channelId}`;
      this.server.to(roomName).emit('chat:message', {
        ...message,
        senderEmail: user.email,
        senderRole: user.role,
      });

      // Clear typing indicator for sender
      await this.typingService.stopTyping(user.sub, data.channelId);
      this.server.to(roomName).emit('chat:typing', {
        channelId: data.channelId,
        typingUsers: [],
      });
    } catch (error) {
      client.emit('error', {
        code: 'CHAT_ERROR',
        message: error.message || 'Failed to send message',
      });
    }
  }

  // ─── Edit Message (real-time) ─────────────────────────────────────────────

  @SubscribeMessage('chat:edit')
  async handleEditMessage(
    @MessageBody() data: { messageId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user: WsAuthenticatedUser = client.data?.user;
    if (!user) {
      client.emit('error', { code: 'UNAUTHORIZED', message: 'Not authenticated' });
      return;
    }

    try {
      const message = await this.chatService.editMessage(data.messageId, user.sub, data.content);

      const roomName = `channel:${message.channelId}`;
      this.server.to(roomName).emit('chat:message_edited', {
        id: message.id,
        content: message.content,
        isEdited: true,
        updatedAt: message.updatedAt,
      });
    } catch (error) {
      client.emit('error', {
        code: 'CHAT_ERROR',
        message: error.message || 'Failed to edit message',
      });
    }
  }

  // ─── Delete Message (real-time) ───────────────────────────────────────────

  @SubscribeMessage('chat:delete')
  async handleDeleteMessage(
    @MessageBody() data: { messageId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user: WsAuthenticatedUser = client.data?.user;
    if (!user) {
      client.emit('error', { code: 'UNAUTHORIZED', message: 'Not authenticated' });
      return;
    }

    try {
      // Get the message first to know the channel
      const message = await this.chatService.getMessage(data.messageId, user.sub);
      const channelId = message.channelId;

      await this.chatService.deleteMessage(data.messageId, user.sub, user.role);

      const roomName = `channel:${channelId}`;
      this.server.to(roomName).emit('chat:message_deleted', {
        messageId: data.messageId,
        deletedBy: user.sub,
      });
    } catch (error) {
      client.emit('error', {
        code: 'CHAT_ERROR',
        message: error.message || 'Failed to delete message',
      });
    }
  }

  // ─── Typing Indicator ─────────────────────────────────────────────────────

  @SubscribeMessage('chat:typing')
  async handleTyping(
    @MessageBody() data: { channelId: number; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const user: WsAuthenticatedUser = client.data?.user;
    if (!user) return;

    const roomName = `channel:${data.channelId}`;

    if (data.isTyping) {
      await this.typingService.startTyping(user.sub, user.email, data.channelId);
    } else {
      await this.typingService.stopTyping(user.sub, data.channelId);
    }

    // Get all typing users for this channel
    const typingUsers = await this.typingService.getTypingUsers(data.channelId);

    // Broadcast typing state to others in the channel
    client.to(roomName).emit('chat:typing', {
      channelId: data.channelId,
      typingUsers,
    });
  }

  // ─── Join Channel Room ────────────────────────────────────────────────────

  @SubscribeMessage('chat:join')
  async handleJoinChannel(
    @MessageBody() data: { channelId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user: WsAuthenticatedUser = client.data?.user;
    if (!user) {
      client.emit('error', { code: 'UNAUTHORIZED', message: 'Not authenticated' });
      return;
    }

    const roomName = `channel:${data.channelId}`;
    await client.join(roomName);

    client.emit('chat:joined', { channelId: data.channelId });

    // Notify others in the channel
    client.to(roomName).emit('chat:user_joined', {
      channelId: data.channelId,
      userId: user.sub,
      email: user.email,
      role: user.role,
    });
  }

  // ─── Leave Channel Room ───────────────────────────────────────────────────

  @SubscribeMessage('chat:leave')
  async handleLeaveChannel(
    @MessageBody() data: { channelId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const user: WsAuthenticatedUser = client.data?.user;
    if (!user) return;

    const roomName = `channel:${data.channelId}`;
    await client.leave(roomName);

    // Clear typing indicator
    await this.typingService.stopTyping(user.sub, data.channelId);

    client.to(roomName).emit('chat:user_left', {
      channelId: data.channelId,
      userId: user.sub,
    });
  }
}
