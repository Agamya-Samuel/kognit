import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

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
