import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsEnum, IsArray, Min, Max, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateCourseDto {
  @ApiProperty({ example: 'Introduction to React', description: 'Course title' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(255, { message: 'Title must be at most 255 characters' })
  title: string;

  @ApiPropertyOptional({ example: 'Learn React from scratch...', description: 'Course description' })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ example: 'Engineering & Tech', description: 'Course domain/category' })
  @IsString()
  @IsNotEmpty({ message: 'Domain is required' })
  @MaxLength(100)
  domain: string;

  @ApiProperty({ example: 'free', enum: ['free', 'paid'], description: 'Pricing type' })
  @IsEnum(['free', 'paid'], { message: 'Pricing type must be free or paid' })
  pricingType: 'free' | 'paid';

  @ApiPropertyOptional({ example: 0, description: 'Price in INR (only for paid courses)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceInr?: number;

  @ApiProperty({ example: 'normal', enum: ['live', 'normal'], description: 'Course structure type' })
  @IsEnum(['live', 'normal'], { message: 'Course structure must be live or normal' })
  courseStructure: 'live' | 'normal';

  @ApiPropertyOptional({ example: 'https://example.com/thumb.jpg', description: 'Thumbnail URL' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  thumbnailUrl?: string;
}

export class UpdateCourseDto {
  @ApiPropertyOptional({ example: 'Advanced React Patterns' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description...' })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/thumb.jpg' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: 'Engineering & Tech' })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  domain?: string;

  @ApiPropertyOptional({ enum: ['free', 'paid'] })
  @IsEnum(['free', 'paid'])
  @IsOptional()
  pricingType?: 'free' | 'paid';

  @ApiPropertyOptional({ example: 499 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceInr?: number;

  @ApiPropertyOptional({ example: 'draft', enum: ['draft', 'in_review', 'revision_requested', 'published', 'archived'] })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'Please add more content to section 2' })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  revisionNotes?: string;
}

export class RequestRevisionDto {
  @ApiProperty({ example: 'Please add more lessons to section 2 and improve video quality.' })
  @IsString()
  @IsNotEmpty({ message: 'Revision notes are required' })
  @MaxLength(2000)
  notes: string;
}

export class SubmitForReviewDto {
  // Empty body - just triggers the action
}

export class CourseQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'Engineering & Tech', description: 'Filter by domain' })
  @IsString()
  @IsOptional()
  domain?: string;

  @ApiPropertyOptional({ example: 'published', description: 'Filter by status' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'normal', enum: ['live', 'normal'], description: 'Filter by course structure' })
  @IsString()
  @IsOptional()
  courseStructure?: string;

  @ApiPropertyOptional({ example: 1, description: 'Filter by instructor ID' })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @IsOptional()
  instructorId?: number;

  @ApiPropertyOptional({ example: true, description: 'Return only courses for current instructor' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  instructorOnly?: boolean;

  @ApiPropertyOptional({ example: 'react', description: 'Search term' })
  @IsString()
  @IsOptional()
  search?: string;
}

export class CreateCourseSessionDto {
  @ApiProperty({ example: 'Week 1 - Introduction' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'First session covering basics' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2025-02-01T10:00:00Z' })
  @IsString()
  @IsNotEmpty()
  scheduledAt: string;

  @ApiProperty({ example: 60 })
  @IsNumber()
  @Min(5)
  durationMinutes: number;

  @ApiPropertyOptional({ example: 'https://meet.example.com/room123' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  meetingLink?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  recordingAvailable?: boolean;
}

export class UpdateCourseSessionDto {
  @ApiPropertyOptional({ example: 'Updated session title' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2025-02-01T14:00:00Z' })
  @IsString()
  @IsOptional()
  scheduledAt?: string;

  @ApiPropertyOptional({ example: 90 })
  @IsNumber()
  @Min(5)
  @IsOptional()
  durationMinutes?: number;

  @ApiPropertyOptional({ example: 'https://meet.example.com/room456' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  meetingLink?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  recordingAvailable?: boolean;
}

export class CreateRecurringScheduleDto {
  @ApiProperty({ example: 'Monday & Wednesday Sessions' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: ['mon', 'wed'], description: 'Days of week' })
  @IsArray()
  @IsString({ each: true })
  daysOfWeek: string[];

  @ApiProperty({ example: '10:00' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: 60 })
  @IsNumber()
  @Min(5)
  durationMinutes: number;

  @ApiProperty({ example: '2025-02-01' })
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2025-04-30' })
  @IsString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({ example: 'https://meet.example.com/recurring' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  meetingLink?: string;
}

export class UpdateRecurringScheduleDto {
  @ApiPropertyOptional({ example: 'Updated schedule title' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: ['tue', 'thu'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  daysOfWeek?: string[];

  @ApiPropertyOptional({ example: '14:00' })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({ example: 90 })
  @IsNumber()
  @Min(5)
  @IsOptional()
  durationMinutes?: number;

  @ApiPropertyOptional({ example: '2025-03-01' })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: 'https://meet.example.com/new-recurring' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  meetingLink?: string;
}

export class CreateLessonAttachmentDto {
  @ApiProperty({ example: 'lecture-notes.pdf' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName: string;

  @ApiProperty({ example: 'https://storage.example.com/files/notes.pdf' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  fileUrl: string;

  @ApiPropertyOptional({ example: 'application/pdf' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  contentType?: string;

  @ApiPropertyOptional({ example: 1048576 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  fileSize?: number;
}

export class ReorderAttachmentsDto {
  @ApiProperty({ example: [3, 1, 2], description: 'Ordered attachment IDs' })
  @IsArray()
  @IsNumber({}, { each: true })
  orderedIds: number[];
}
