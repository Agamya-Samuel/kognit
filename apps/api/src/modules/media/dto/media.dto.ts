import { IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Request signed playback URL
 */
export class RequestPlaybackUrlDto {
  @ApiProperty({ example: 5, description: 'Lecture ID' })
  @IsNumber()
  lectureId: number;

  @ApiPropertyOptional({ example: 60, description: 'URL expiry in minutes', default: 60 })
  @IsOptional()
  @IsNumber()
  expiryMinutes?: number = 60;
}

/**
 * Playback URL response
 */
export class PlaybackUrlResponseDto {
  @ApiProperty({ example: 'https://stream.mux.com/abc123.m3u8?token=...' })
  playbackUrl: string;

  @ApiProperty({ example: '2026-05-17T12:00:00Z' })
  expiresAt: string;

  @ApiProperty({ example: 'signed', enum: ['signed', 'public'] })
  type: 'signed' | 'public';
}

/**
 * Video player configuration
 */
export class VideoPlayerConfigDto {
  @ApiProperty({ example: 'https://stream.mux.com/abc123.m3u8' })
  @IsString()
  playbackUrl: string;

  @ApiPropertyOptional({ example: 'https://img.mux.com/abc123/thumbnail.jpg' })
  @IsString()
  posterUrl?: string;

  @ApiProperty({ example: 300, description: 'Duration in seconds' })
  @IsNumber()
  duration: number;

  @ApiProperty({ example: 'ready', enum: ['preparing', 'ready', 'errored'] })
  @IsEnum(['preparing', 'ready', 'errored'])
  status: 'preparing' | 'ready' | 'errored';

  @ApiPropertyOptional({ example: 'Asset not found' })
  @IsOptional()
  errorMessage?: string;
}

/**
 * Video status response
 */
export class VideoStatusResponseDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  lectureId: number;

  @ApiPropertyOptional({ example: 'asset-abc123' })
  @IsString()
  muxAssetId?: string;

  @ApiPropertyOptional({ example: 'playback-abc123' })
  @IsString()
  muxPlaybackId?: string;

  @ApiProperty({ example: 'ready', enum: ['preparing', 'ready', 'errored', 'none'] })
  @IsEnum(['preparing', 'ready', 'errored', 'none'])
  status: 'preparing' | 'ready' | 'errored' | 'none';

  @ApiProperty({ example: 300, description: 'Duration in seconds' })
  @IsNumber()
  duration: number;

  @ApiPropertyOptional({ example: 'Processing failed' })
  @IsString()
  @IsOptional()
  errorMessage?: string;

  @ApiPropertyOptional({ example: 'https://img.mux.com/abc123/thumbnail.jpg' })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;
}

/**
 * Create Mux asset request
 */
export class CreateAssetDto {
  @ApiProperty({ example: '5', description: 'Lecture ID' })
  @IsString()
  lectureId: string;

  @ApiProperty({ example: 's3://bucket-name/videos/lecture-5.mp4' })
  @IsString()
  s3Url: string;
}

/**
 * Asset creation response
 */
export class AssetCreationResponseDto {
  @ApiProperty({ example: 'asset-abc123' })
  @IsString()
  assetId: string;

  @ApiProperty({ example: 'playback-abc123' })
  @IsString()
  playbackId: string;

  @ApiProperty({ example: 'preparing', enum: ['preparing', 'ready', 'errored'] })
  @IsEnum(['preparing', 'ready', 'errored'])
  status: 'preparing' | 'ready' | 'errored';
}
