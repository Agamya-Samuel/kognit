import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/auth.decorators';
import { ChatService } from './services/chat.service';
import { ChannelService } from './services/channel.service';
import {
  SendMessageDto,
  EditMessageDto,
  MessageQueryDto,
  RepliesQueryDto,
  FlagMessageDto,
  ModerateMessageDto,
  CreateChannelDto,
  UpdateChannelDto,
  AddChannelMemberDto,
  ChannelQueryDto,
} from './dto/chat.dto';

@ApiTags('chat')
@ApiBearerAuth()
@Controller('api/v1/chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly channelService: ChannelService,
  ) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // MESSAGE ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  @Post('messages')
  @ApiOperation({ summary: 'Send a message to a channel' })
  async sendMessage(
    @Body() dto: SendMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.chatService.sendMessage(user.sub, dto.channelId, dto.content, dto.replyToId);
  }

  @Get('channels/:channelId/messages')
  @ApiOperation({ summary: 'Get message history for a channel' })
  async getMessages(
    @Param('channelId', ParseIntPipe) channelId: number,
    @Query() query: MessageQueryDto,
    @CurrentUser() user: any,
  ) {
    return this.chatService.getMessages(channelId, user.sub, {
      limit: query.limit,
      offset: query.offset,
    });
  }

  @Get('messages/:messageId')
  @ApiOperation({ summary: 'Get a single message' })
  async getMessage(
    @Param('messageId', ParseIntPipe) messageId: number,
    @CurrentUser() user: any,
  ) {
    return this.chatService.getMessage(messageId, user.sub);
  }

  @Put('messages/:messageId')
  @ApiOperation({ summary: 'Edit a message' })
  async editMessage(
    @Param('messageId', ParseIntPipe) messageId: number,
    @Body() dto: EditMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.chatService.editMessage(messageId, user.sub, dto.content);
  }

  @Delete('messages/:messageId')
  @ApiOperation({ summary: 'Delete a message' })
  async deleteMessage(
    @Param('messageId', ParseIntPipe) messageId: number,
    @CurrentUser() user: any,
  ) {
    return this.chatService.deleteMessage(messageId, user.sub, user.role);
  }

  // ─── Message Replies (Threading) ───────────────────────────────────────────

  @Get('messages/:messageId/replies')
  @ApiOperation({ summary: 'Get replies to a message' })
  async getReplies(
    @Param('messageId', ParseIntPipe) messageId: number,
    @Query() query: RepliesQueryDto,
    @CurrentUser() user: any,
  ) {
    return this.chatService.getReplies(messageId, user.sub, {
      limit: query.limit,
      offset: query.offset,
    });
  }

  // ─── Message Moderation ────────────────────────────────────────────────────

  @Post('messages/:messageId/flag')
  @ApiOperation({ summary: 'Flag a message for moderation' })
  async flagMessage(
    @Param('messageId', ParseIntPipe) messageId: number,
    @Body() dto: FlagMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.chatService.flagMessage(messageId, user.sub);
  }

  @Post('messages/:messageId/moderate')
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Moderate a message (flag, unflag, hide, delete)' })
  async moderateMessage(
    @Param('messageId', ParseIntPipe) messageId: number,
    @Body() dto: ModerateMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.chatService.moderateMessage(messageId, user.sub, user.role, dto.action);
  }

  // ─── Mark as Read ──────────────────────────────────────────────────────────

  @Post('channels/:channelId/read')
  @ApiOperation({ summary: 'Mark channel messages as read' })
  async markAsRead(
    @Param('channelId', ParseIntPipe) channelId: number,
    @CurrentUser() user: any,
  ) {
    return this.chatService.markAsRead(channelId, user.sub);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHANNEL ENDPOINTS
  // ═══════════════════════════════════════════════════════════════════════════

  @Post('channels')
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Create a new channel' })
  async createChannel(
    @Body() dto: CreateChannelDto,
    @CurrentUser() user: any,
  ) {
    return this.channelService.createChannel(dto.name, dto.type, user.sub, dto.courseId);
  }

  @Get('channels')
  @ApiOperation({ summary: 'List channels' })
  async getChannels(
    @Query() query: ChannelQueryDto,
    @CurrentUser() user: any,
  ) {
    return this.channelService.getChannels(user.sub, {
      courseId: query.courseId,
      type: query.type,
      limit: query.limit,
      offset: query.offset,
    });
  }

  @Get('channels/:channelId')
  @ApiOperation({ summary: 'Get a channel by ID' })
  async getChannel(
    @Param('channelId', ParseIntPipe) channelId: number,
  ) {
    return this.channelService.getChannel(channelId);
  }

  @Put('channels/:channelId')
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Update a channel' })
  async updateChannel(
    @Param('channelId', ParseIntPipe) channelId: number,
    @Body() dto: UpdateChannelDto,
    @CurrentUser() user: any,
  ) {
    return this.channelService.updateChannel(channelId, dto.name, user.sub, user.role);
  }

  // ─── Channel Membership ────────────────────────────────────────────────────

  @Post('channels/:channelId/join')
  @ApiOperation({ summary: 'Join a channel' })
  async joinChannel(
    @Param('channelId', ParseIntPipe) channelId: number,
    @CurrentUser() user: any,
  ) {
    return this.channelService.joinChannel(channelId, user.sub);
  }

  @Post('channels/:channelId/leave')
  @ApiOperation({ summary: 'Leave a channel' })
  async leaveChannel(
    @Param('channelId', ParseIntPipe) channelId: number,
    @CurrentUser() user: any,
  ) {
    return this.channelService.leaveChannel(channelId, user.sub);
  }

  @Get('channels/:channelId/members')
  @ApiOperation({ summary: 'List members of a channel' })
  async listMembers(
    @Param('channelId', ParseIntPipe) channelId: number,
    @CurrentUser() user: any,
  ) {
    return this.channelService.listMembers(channelId, user.sub);
  }

  @Post('channels/:channelId/members')
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Add a member to a channel' })
  async addMember(
    @Param('channelId', ParseIntPipe) channelId: number,
    @Body() dto: AddChannelMemberDto,
    @CurrentUser() user: any,
  ) {
    return this.channelService.joinChannel(channelId, dto.userId);
  }

  // ─── Course Channels ───────────────────────────────────────────────────────

  @Get('courses/:courseId/channels')
  @ApiOperation({ summary: 'Get channels for a course' })
  async getCourseChannels(
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.channelService.getCourseChannels(courseId);
  }

  // ─── User's Channels ───────────────────────────────────────────────────────

  @Get('my-channels')
  @ApiOperation({ summary: 'Get current user channels' })
  async getMyChannels(
    @CurrentUser() user: any,
  ) {
    return this.channelService.getUserChannels(user.sub);
  }
}
