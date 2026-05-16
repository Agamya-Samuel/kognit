import { IsOptional, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class InstructorAnalyticsQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Course ID to filter by' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  courseId?: number;
}
