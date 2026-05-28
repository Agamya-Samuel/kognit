import { IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Update progress for a lecture
 */
export class UpdateProgressDto {
  @ApiProperty({ example: 120, description: 'Seconds watched' })
  @IsNumber()
  @Min(0)
  watchedSeconds: number;

  @ApiProperty({ example: 5, description: 'Lecture ID' })
  @IsNumber()
  @Min(0)
  lectureId: number;

  @ApiPropertyOptional({ example: false, description: 'Mark lecture as completed' })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

/**
 * Progress response for a single lecture
 */
export class LectureProgressDto {
  @ApiProperty({ example: 5 })
  lectureId: number;

  @ApiProperty({ example: 120 })
  watchedSeconds: number;

  @ApiProperty({ example: true })
  isCompleted: boolean;

  @ApiProperty({ example: '2026-05-17T10:30:00Z' })
  lastWatchedAt: string;

  @ApiProperty({ example: 300 })
  durationSeconds: number;

  @ApiProperty({ example: 40 })
  progressPercentage: number;
}

/**
 * Course progress summary response
 */
export class CourseProgressResponseDto {
  @ApiProperty({ example: 1 })
  courseId: number;

  @ApiProperty({ example: 24 })
  totalLectures: number;

  @ApiProperty({ example: 10 })
  completedLectures: number;

  @ApiProperty({ example: 3600 })
  watchedSeconds: number;

  @ApiProperty({ example: 7200 })
  totalDurationSeconds: number;

  @ApiProperty({ example: 41.67 })
  progressPercentage: number;
}

/**
 * Watch history item response
 */
export class WatchHistoryItemDto {
  @ApiProperty({ example: 5 })
  lectureId: number;

  @ApiProperty({ example: 'Introduction to React' })
  lectureTitle: string;

  @ApiProperty({ example: 300 })
  lectureDuration: number;

  @ApiProperty({ example: 'Getting Started' })
  sectionTitle: string;

  @ApiProperty({ example: 1 })
  courseId: number;

  @ApiProperty({ example: 'React Fundamentals' })
  courseTitle: string;

  @ApiProperty({ example: 120 })
  watchedSeconds: number;

  @ApiProperty({ example: false })
  isCompleted: boolean;

  @ApiProperty({ example: '2026-05-17T10:30:00Z' })
  lastWatchedAt: string;

  @ApiProperty({ example: 40 })
  progressPercentage: number;
}

/**
 * Watch history response
 */
export class WatchHistoryResponseDto {
  @ApiProperty({ type: [WatchHistoryItemDto] })
  items: WatchHistoryItemDto[];

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 0 })
  offset: number;
}

/**
 * Watch time summary response
 */
export class WatchTimeSummaryDto {
  @ApiProperty({ example: 7200 })
  totalWatchedSeconds: number;

  @ApiProperty({ example: 5 })
  totalCourses: number;

  @ApiProperty({ example: '2026-05-17T10:30:00Z' })
  lastWatchedAt: string | null;
}
