import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsEnum, Min, Max, MaxLength, MinLength } from 'class-validator';
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

  @ApiProperty({ example: 'web-development', description: 'Course domain/category' })
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

  @ApiPropertyOptional({ example: 'frontend' })
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

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
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

  @ApiPropertyOptional({ example: 'web-development', description: 'Filter by domain' })
  @IsString()
  @IsOptional()
  domain?: string;

  @ApiPropertyOptional({ example: true, description: 'Filter by published status' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

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
