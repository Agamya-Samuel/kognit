import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, IsDateString, IsIn, MinLength } from 'class-validator';

// ─── Start Live Class ───────────────────────────────────────────────────────

export class StartLiveClassDto {
  @ApiProperty({ description: 'Live class ID to start' })
  @IsNumber()
  liveClassId: number;
}

// ─── Join Live Class ────────────────────────────────────────────────────────

export class JoinLiveClassDto {
  @ApiProperty({ description: 'Live class ID to join' })
  @IsNumber()
  liveClassId: number;

  @ApiPropertyOptional({ description: 'Token expiry in seconds', default: 3600 })
  @IsOptional()
  @IsNumber()
  @Min(60)
  expiresIn?: number;
}

// ─── End Live Class ─────────────────────────────────────────────────────────

export class EndLiveClassDto {
  @ApiProperty({ description: 'Live class ID to end' })
  @IsNumber()
  liveClassId: number;

  @ApiPropertyOptional({ description: 'Recording URL if available' })
  @IsOptional()
  @IsString()
  recordingUrl?: string;
}

// ─── Response DTOs ──────────────────────────────────────────────────────────

export class LiveKitTokenResponseDto {
  @ApiProperty({ description: 'LiveKit access token' })
  token: string;

  @ApiProperty({ description: 'Participant identity in the room' })
  identity: string;

  @ApiProperty({ description: 'Room name' })
  roomName: string;

  @ApiProperty({ description: 'Token expiry in seconds' })
  expiresIn: number;

  @ApiProperty({ description: 'LiveKit server URL' })
  livekitUrl: string;
}

export class LiveClassStatusResponseDto {
  @ApiProperty()
  liveClassId: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  roomName: string;

  @ApiPropertyOptional()
  participantCount?: number;

  @ApiPropertyOptional()
  maxParticipants?: number;

  @ApiPropertyOptional()
  recordingUrl?: string;
}

export class RoomInfoResponseDto {
  @ApiProperty()
  roomName: string;

  @ApiProperty()
  sid: string;

  @ApiProperty()
  participants: number;

  @ApiProperty()
  maxParticipants: number;

  @ApiPropertyOptional()
  createdAt?: string;

  @ApiProperty()
  active: boolean;
}

// ─── Scheduling DTOs ──────────────────────────────────────────────────────────

export class CreateScheduleDto {
  @ApiProperty({ description: 'Course ID to attach the live class to' })
  @IsNumber()
  courseId: number;

  @ApiProperty({ description: 'Session title' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({ description: 'Scheduled start time (ISO 8601)' })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ description: 'Duration in minutes (15-480)', example: 60 })
  @IsNumber()
  @Min(15)
  durationMinutes: number;

  @ApiPropertyOptional({ description: 'Meeting link (optional, auto-generated if not provided)' })
  @IsOptional()
  @IsString()
  meetingLink?: string;
}

export class UpdateScheduleDto {
  @ApiPropertyOptional({ description: 'New scheduled start time (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({ description: 'New duration in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(15)
  durationMinutes?: number;
}

export class CancelScheduleDto {
  @ApiProperty({ description: 'Live class ID to cancel' })
  @IsNumber()
  liveClassId: number;
}

export class CalendarQueryDto {
  @ApiProperty({ description: 'Start date (ISO 8601 or YYYY-MM-DD)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date (ISO 8601 or YYYY-MM-DD)' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Timezone for date grouping', default: 'Asia/Kolkata' })
  @IsOptional()
  @IsString()
  timezone?: string;
}

// ─── Recording DTOs ───────────────────────────────────────────────────────────

export class StartRecordingDto {
  @ApiProperty({ description: 'Live class ID to start recording' })
  @IsNumber()
  liveClassId: number;
}

export class RecordingWebhookDto {
  @ApiProperty({ description: 'Live class ID' })
  @IsNumber()
  liveClassId: number;

  @ApiProperty({ description: 'S3 URL of the completed recording' })
  @IsString()
  s3Url: string;
}

export class RetryRecordingDto {
  @ApiProperty({ description: 'Live class ID to retry recording' })
  @IsNumber()
  liveClassId: number;
}

// ─── Calendar Event Response ──────────────────────────────────────────────────

export class CalendarEventResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  courseId: number;

  @ApiProperty()
  courseTitle: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  instructorId: number;

  @ApiProperty()
  scheduledAt: string;

  @ApiProperty()
  durationMinutes: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  livekitRoomName: string;

  @ApiProperty()
  recordingStatus: string;

  @ApiPropertyOptional()
  recordingUrl?: string | null;

  @ApiPropertyOptional()
  meetingLink?: string | null;
}

export class CalendarDayResponseDto {
  @ApiProperty()
  date: string;

  @ApiProperty({ type: [CalendarEventResponseDto] })
  events: CalendarEventResponseDto[];
}

// ─── Recording Info Response ──────────────────────────────────────────────────

export class RecordingInfoResponseDto {
  @ApiProperty()
  liveClassId: number;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  s3Key?: string | null;

  @ApiPropertyOptional()
  muxAssetId?: string | null;

  @ApiPropertyOptional()
  muxPlaybackId?: string | null;

  @ApiPropertyOptional()
  playbackUrl?: string | null;

  @ApiPropertyOptional()
  error?: string | null;
}

export class PostSessionResultResponseDto {
  @ApiProperty()
  liveClassId: number;

  @ApiProperty()
  courseId: number;

  @ApiProperty()
  recordingStatus: string;

  @ApiPropertyOptional()
  muxAssetId?: string | null;

  @ApiPropertyOptional()
  muxPlaybackId?: string | null;

  @ApiProperty()
  courseUpdated: boolean;
}
