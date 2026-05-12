import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, Max, IsMimeType, IsDateString, Min, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequestUploadUrlDto {
  @ApiProperty({ example: 'course-video.mp4', description: 'Name of the file to upload' })
  @IsString()
  @IsNotEmpty({ message: 'File name is required' })
  fileName: string;

  @ApiProperty({ example: 'video/mp4', description: 'Content type of the file' })
  @IsMimeType({ message: 'Invalid content type' })
  @IsNotEmpty({ message: 'Content type is required' })
  contentType: string;

  @ApiProperty({ example: 524288000, description: 'File size in bytes (max 500MB)' })
  @IsNumber()
  @Min(1)
  @Max(524288000, { message: 'File size must be less than 500MB' })
  @IsNotEmpty({ message: 'File size is required' })
  fileSize: number;
}

export class UpdateUploadStatusDto {
  @ApiPropertyOptional({ enum: ['pending', 'uploading', 'complete', 'failed', 'cancelled'], description: 'Upload status' })
  @IsEnum(['pending', 'uploading', 'complete', 'failed', 'cancelled'], { message: 'Invalid upload status' })
  @IsOptional()
  status?: 'pending' | 'uploading' | 'complete' | 'failed' | 'cancelled';

  @ApiPropertyOptional({ example: 'Network error occurred', description: 'Error message if upload failed' })
  @IsString()
  @IsOptional()
  errorMessage?: string;
}

export class UploadProgressResponseDto {
  @ApiProperty({ example: 1, description: 'Upload ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 1, description: 'Lecture ID' })
  @IsNumber()
  lectureId: number;

  @ApiProperty({ example: 'course-video.mp4', description: 'File name' })
  @IsString()
  fileName: string;

  @ApiProperty({ example: 'video/mp4', description: 'Content type' })
  @IsString()
  contentType: string;

  @ApiProperty({ example: 524288000, description: 'File size in bytes' })
  @IsNumber()
  fileSize: number;

  @ApiProperty({ enum: ['pending', 'uploading', 'complete', 'failed', 'cancelled'], description: 'Upload status' })
  @IsEnum(['pending', 'uploading', 'complete', 'failed', 'cancelled'])
  status: 'pending' | 'uploading' | 'complete' | 'failed' | 'cancelled';

  @ApiPropertyOptional({ example: 'https://edutech-uploads.s3.amazonaws.com/...', description: 'S3 signed upload URL' })
  @IsString()
  @IsOptional()
  uploadUrl?: string;

  @ApiPropertyOptional({ example: '2026-05-13T14:30:00Z', description: 'Expiration timestamp of the signed URL' })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @ApiPropertyOptional({ example: '2026-05-13T14:25:00Z', description: 'When the upload was completed' })
  @IsDateString()
  @IsOptional()
  uploadedAt?: string;

  @ApiPropertyOptional({ example: 'Upload failed due to network error', description: 'Error message if upload failed' })
  @IsString()
  @IsOptional()
  errorMessage?: string;

  @ApiProperty({ example: false, description: 'Whether the file passed validation' })
  @IsBoolean()
  validationPassed: boolean;

  @ApiProperty({ example: '2026-05-13T14:00:00Z', description: 'Creation timestamp' })
  @IsDateString()
  createdAt: string;

  @ApiProperty({ example: '2026-05-13T14:00:00Z', description: 'Last update timestamp' })
  @IsDateString()
  updatedAt: string;
}

export class UploadUrlResponseDto {
  @ApiProperty({ example: 1, description: 'Upload ID' })
  @IsNumber()
  uploadId: number;

  @ApiProperty({ example: 'https://edutech-uploads.s3.amazonaws.com/...', description: 'Presigned S3 upload URL' })
  @IsString()
  uploadUrl: string;

  @ApiProperty({ example: '2026-05-13T14:30:00Z', description: 'Expiration timestamp' })
  @IsDateString()
  expiresAt: string;

  @ApiProperty({ example: 'PUT', description: 'HTTP method to use' })
  @IsString()
  method: string;

  @ApiProperty({ example: { 'Content-Type': 'video/mp4' }, description: 'Headers to include in upload request' })
  headers: Record<string, string>;
}

export class WebhookEventDto {
  @ApiProperty({ example: 'ObjectCreated:Put', description: 'S3 event name' })
  @IsString()
  eventName: string;

  @ApiProperty({ example: 'edutech-uploads', description: 'S3 bucket name' })
  @IsString()
  s3Bucket: string;

  @ApiProperty({ example: 'uploads/course-video.mp4', description: 'S3 object key' })
  @IsString()
  s3ObjectKey: string;

  @ApiProperty({ example: 524288000, description: 'Object size in bytes' })
  @IsNumber()
  objectSize: number;

  @ApiProperty({ example: 'ed33a1e8-c8f9-4e03-97d9-069a031ac51b', description: 'Upload ID from metadata' })
  @IsString()
  uploadId: string;

  @ApiProperty({ example: 1, description: 'Lecture ID from metadata' })
  @IsNumber()
  lectureId: number;
}
