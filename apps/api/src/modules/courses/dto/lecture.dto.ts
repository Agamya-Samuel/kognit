import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsEnum, IsArray, Min, MaxLength, MinLength, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLectureDto {
  @ApiProperty({ example: 'What is React?', description: 'Lecture title' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(2, { message: 'Title must be at least 2 characters' })
  @MaxLength(255, { message: 'Title must be at most 255 characters' })
  title: string;

  @ApiPropertyOptional({ example: 'In this lecture we cover...' })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ enum: ['video', 'live', 'text', 'assignment', 'quiz'], default: 'video' })
  @IsEnum(['video', 'live', 'text', 'assignment', 'quiz'], { message: 'Invalid lecture type' })
  @IsOptional()
  type?: 'video' | 'live' | 'text' | 'assignment' | 'quiz';

  @ApiPropertyOptional({ example: 0, description: 'Order index for lecture positioning' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  orderIndex?: number;

  @ApiPropertyOptional({ example: false, description: 'Whether this lecture is a free preview' })
  @IsBoolean()
  @IsOptional()
  isFreePreview?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Whether this lecture is published' })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class UpdateLectureDto {
  @ApiPropertyOptional({ example: 'Updated Lecture Title' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ enum: ['video', 'live', 'text', 'assignment', 'quiz'] })
  @IsEnum(['video', 'live', 'text', 'assignment', 'quiz'])
  @IsOptional()
  type?: 'video' | 'live' | 'text' | 'assignment' | 'quiz';

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  orderIndex?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isFreePreview?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class ReorderLecturesDto {
  @ApiProperty({ example: [1, 2, 3], description: 'Lecture IDs in desired order' })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one lecture ID is required' })
  @IsNumber({}, { each: true })
  lectureIds: number[];
}
