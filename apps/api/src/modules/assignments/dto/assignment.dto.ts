import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  Max,
  MaxLength,
  MinLength,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

// ─── Assignment DTOs ─────────────────────────────────────────────────────────

export class CreateAssignmentDto {
  @ApiProperty({ example: 1, description: 'Lecture ID this assignment belongs to' })
  @IsNumber()
  @Min(1)
  lectureId: number;

  @ApiProperty({ example: 'Week 1 Quiz', description: 'Assignment title' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'Answer all questions...', description: 'Description' })
  @IsString()
  @IsOptional()
  @MaxLength(10000)
  description?: string;

  @ApiProperty({ example: 'mcq', enum: ['mcq', 'short', 'code'], description: 'Assignment type' })
  @IsEnum(['mcq', 'short', 'code'], { message: 'Type must be mcq, short, or code' })
  type: 'mcq' | 'short' | 'code';

  @ApiProperty({ example: 100, description: 'Maximum score' })
  @IsNumber()
  @Min(1, { message: 'Max score must be at least 1' })
  @Max(10000)
  maxScore: number;

  @ApiProperty({ example: '2026-06-01T23:59:59Z', description: 'Due date' })
  @IsString()
  @IsNotEmpty({ message: 'Due date is required' })
  dueAt: string;

  @ApiPropertyOptional({ example: 24, description: 'Late submission window in hours' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  lateWindowHours?: number;

  @ApiPropertyOptional({ example: 20, description: 'Penalty percentage for late submissions (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  latePenaltyPercent?: number;
}

export class UpdateAssignmentDto {
  @ApiPropertyOptional({ example: 'Updated Quiz Title' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description...' })
  @IsString()
  @IsOptional()
  @MaxLength(10000)
  description?: string;

  @ApiPropertyOptional({ enum: ['mcq', 'short', 'code'] })
  @IsEnum(['mcq', 'short', 'code'])
  @IsOptional()
  type?: 'mcq' | 'short' | 'code';

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @Min(1)
  @Max(10000)
  @IsOptional()
  maxScore?: number;

  @ApiPropertyOptional({ example: '2026-06-15T23:59:59Z' })
  @IsString()
  @IsOptional()
  dueAt?: string;

  @ApiPropertyOptional({ example: 48 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  lateWindowHours?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  latePenaltyPercent?: number;
}

export class AssignmentQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Lecture ID filter' })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @IsOptional()
  lectureId?: number;

  @ApiPropertyOptional({ example: 'mcq', enum: ['mcq', 'short', 'code'] })
  @IsEnum(['mcq', 'short', 'code'])
  @IsOptional()
  type?: 'mcq' | 'short' | 'code';

  @ApiPropertyOptional({ example: 1 })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}

// ─── Submission DTOs ──────────────────────────────────────────────────────────

export class SubmitAssignmentDto {
  @ApiProperty({ example: 'My answer text or JSON for MCQ', description: 'Submission content' })
  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  @MaxLength(50000)
  content: string;
}

export class GradeSubmissionDto {
  @ApiProperty({ example: 85, description: 'Score to assign' })
  @IsNumber()
  @Min(0, { message: 'Score cannot be negative' })
  score: number;

  @ApiPropertyOptional({ example: 'Good work!', description: 'Feedback for the student' })
  @IsString()
  @IsOptional()
  @MaxLength(10000)
  feedback?: string;
}

export class SubmissionQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Assignment ID filter' })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @IsOptional()
  assignmentId?: number;

  @ApiPropertyOptional({ example: 1 })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}

// ─── Quiz Question DTOs ──────────────────────────────────────────────────────

export class QuizQuestionDto {
  @ApiProperty({ example: 'What is 2+2?', description: 'Question text' })
  @IsString()
  @IsNotEmpty({ message: 'Question text is required' })
  @MaxLength(5000)
  questionText: string;

  @ApiProperty({ example: ['3', '4', '5', '6'], description: 'Answer options' })
  @IsArray()
  @ArrayMinSize(2, { message: 'At least 2 options required' })
  @IsString({ each: true })
  options: string[];

  @ApiProperty({ example: 1, description: 'Index of the correct option (0-based)' })
  @IsNumber()
  @Min(0)
  correctOptionIndex: number;

  @ApiPropertyOptional({ example: 10, description: 'Points for this question' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  points?: number;

  @ApiPropertyOptional({ example: 0, description: 'Order index for sorting' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  orderIndex?: number;
}

export class BulkGradeDto {
  @ApiProperty({
    description: 'Array of submission grades',
    example: [{ submissionId: 1, score: 85, feedback: 'Good' }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkGradeItemDto)
  grades: BulkGradeItemDto[];
}

export class BulkGradeItemDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  submissionId: number;

  @ApiProperty({ example: 85 })
  @IsNumber()
  @Min(0)
  score: number;

  @ApiPropertyOptional({ example: 'Good work!' })
  @IsString()
  @IsOptional()
  feedback?: string;
}

export class BulkCreateAssignmentsDto {
  @ApiProperty({ description: 'Array of assignments to create', type: [CreateAssignmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAssignmentDto)
  assignments: CreateAssignmentDto[];
}
