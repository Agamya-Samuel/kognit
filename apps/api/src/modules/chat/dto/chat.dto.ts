import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, Max, MinLength, MaxLength, IsEnum, IsBoolean } from 'class-validator';

// ─── Send Message ──────────────────────────────────────────────────────────

export class SendMessageDto {
  @ApiProperty({ description: 'Channel ID to send the message to' })
  @IsNumber()
  channelId: number;

  @ApiProperty({ description: 'Message content', example: 'Hello everyone!' })
  @IsString()
  @MinLength(1, { message: 'Message content cannot be empty' })
  @MaxLength(2000, { message: 'Message too long (max 2000 characters)' })
  content: string;

  @ApiPropertyOptional({ description: 'Parent message ID for threaded replies' })
  @IsOptional()
  @IsNumber()
  replyToId?: number;
}

// ─── Edit Message ──────────────────────────────────────────────────────────

export class EditMessageDto {
  @ApiProperty({ description: 'Updated message content' })
  @IsString()
  @MinLength(1, { message: 'Message content cannot be empty' })
  @MaxLength(2000, { message: 'Message too long (max 2000 characters)' })
  content: string;
}

// ─── Message Query (pagination) ────────────────────────────────────────────

export class MessageQueryDto {
  @ApiPropertyOptional({ description: 'Channel ID to filter messages' })
  @IsOptional()
  @IsNumber()
  channelId?: number;

  @ApiPropertyOptional({ description: 'Number of messages to return', default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Offset for pagination', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}

// ─── Replies Query ─────────────────────────────────────────────────────────

export class RepliesQueryDto {
  @ApiPropertyOptional({ description: 'Number of replies to return', default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Offset for pagination', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}

// ─── Flag / Moderate Message ───────────────────────────────────────────────

export class FlagMessageDto {
  @ApiPropertyOptional({ description: 'Reason for flagging' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class ModerateMessageDto {
  @ApiProperty({ description: 'Action to take', enum: ['flag', 'unflag', 'hide', 'delete'] })
  @IsString()
  @IsEnum(['flag', 'unflag', 'hide', 'delete'])
  action: 'flag' | 'unflag' | 'hide' | 'delete';
}

// ─── Channel CRUD ──────────────────────────────────────────────────────────

export class CreateChannelDto {
  @ApiProperty({ description: 'Channel name' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Channel type', enum: ['course', 'general', 'dm'] })
  @IsEnum(['course', 'general', 'dm'])
  type: 'course' | 'general' | 'dm';

  @ApiPropertyOptional({ description: 'Course ID (for course channels)' })
  @IsOptional()
  @IsNumber()
  courseId?: number;
}

export class UpdateChannelDto {
  @ApiPropertyOptional({ description: 'Updated channel name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;
}

// ─── Channel Members ───────────────────────────────────────────────────────

export class AddChannelMemberDto {
  @ApiProperty({ description: 'User ID to add to the channel' })
  @IsNumber()
  userId: number;
}

// ─── Channel Query ─────────────────────────────────────────────────────────

export class ChannelQueryDto {
  @ApiPropertyOptional({ description: 'Filter by course ID' })
  @IsOptional()
  @IsNumber()
  courseId?: number;

  @ApiPropertyOptional({ description: 'Filter by channel type', enum: ['course', 'general', 'dm'] })
  @IsOptional()
  @IsEnum(['course', 'general', 'dm'])
  type?: 'course' | 'general' | 'dm';

  @ApiPropertyOptional({ description: 'Number of channels to return', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Offset for pagination', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}

// ─── Response DTOs ─────────────────────────────────────────────────────────

export class MessageResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() channelId: number;
  @ApiProperty() senderId: number;
  @ApiProperty() content: string;
  @ApiPropertyOptional() replyToId: number | null;
  @ApiProperty() isEdited: boolean;
  @ApiProperty() isDeleted: boolean;
  @ApiProperty() moderationStatus: string;
  @ApiProperty() createdAt: Date | string;
  @ApiProperty() updatedAt: Date | string;
  @ApiPropertyOptional() replies?: MessageResponseDto[];
  @ApiPropertyOptional() senderName?: string;
  @ApiPropertyOptional() senderAvatarUrl?: string | null;
}

export class ChannelResponseDto {
  @ApiProperty() id: number;
  @ApiPropertyOptional() courseId: number | null;
  @ApiProperty() type: string;
  @ApiProperty() name: string;
  @ApiProperty() createdAt: Date | string;
  @ApiPropertyOptional() memberCount?: number;
}

