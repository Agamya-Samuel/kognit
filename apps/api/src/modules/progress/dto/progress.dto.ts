import { IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

/**
 * Update progress for a lecture
 */
export class UpdateProgressDto {
  @IsNumber()
  @Min(0)
  watchedSeconds: number;

  @IsNumber()
  @Min(0)
  lectureId: number;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

/**
 * Progress response for a single lecture
 */
export class LectureProgressDto {
  lectureId: number;
  watchedSeconds: number;
  isCompleted: boolean;
  lastWatchedAt: string;
  durationSeconds: number;
  progressPercentage: number;
}

/**
 * Course progress summary response
 */
export class CourseProgressResponseDto {
  courseId: number;
  totalLectures: number;
  completedLectures: number;
  watchedSeconds: number;
  totalDurationSeconds: number;
  progressPercentage: number;
}

/**
 * Watch history item response
 */
export class WatchHistoryItemDto {
  lectureId: number;
  lectureTitle: string;
  lectureDuration: number;
  sectionTitle: string;
  courseId: number;
  courseTitle: string;
  watchedSeconds: number;
  isCompleted: boolean;
  lastWatchedAt: string;
  progressPercentage: number;
}

/**
 * Watch history response
 */
export class WatchHistoryResponseDto {
  items: WatchHistoryItemDto[];
  total: number;
  limit: number;
  offset: number;
}
