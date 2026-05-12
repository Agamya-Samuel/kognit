import { IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';

/**
 * Request signed playback URL
 */
export class RequestPlaybackUrlDto {
  @IsNumber()
  lectureId: number;

  @IsOptional()
  @IsNumber()
  expiryMinutes?: number = 60;
}

/**
 * Playback URL response
 */
export class PlaybackUrlResponseDto {
  playbackUrl: string;
  expiresAt: string;
  type: 'signed' | 'public';
}

/**
 * Video player configuration
 */
export class VideoPlayerConfigDto {
  @IsString()
  playbackUrl: string;

  @IsString()
  posterUrl?: string;

  @IsNumber()
  duration: number;

  @IsEnum(['preparing', 'ready', 'errored'])
  status: 'preparing' | 'ready' | 'errored';

  @IsOptional()
  errorMessage?: string;
}

/**
 * Video status response
 */
export class VideoStatusResponseDto {
  @IsNumber()
  lectureId: number;

  @IsString()
  muxAssetId?: string;

  @IsString()
  muxPlaybackId?: string;

  @IsEnum(['preparing', 'ready', 'errored', 'none'])
  status: 'preparing' | 'ready' | 'errored' | 'none';

  @IsNumber()
  duration: number;

  @IsString()
  @IsOptional()
  errorMessage?: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;
}

/**
 * Create Mux asset request
 */
export class CreateAssetDto {
  @IsString()
  lectureId: string;

  @IsString()
  s3Url: string;
}

/**
 * Asset creation response
 */
export class AssetCreationResponseDto {
  @IsString()
  assetId: string;

  @IsString()
  playbackId: string;

  @IsEnum(['preparing', 'ready', 'errored'])
  status: 'preparing' | 'ready' | 'errored';
}
