import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, Min, MaxLength, MinLength, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiProperty({ example: 'Getting Started', description: 'Section title' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(2, { message: 'Title must be at least 2 characters' })
  @MaxLength(255, { message: 'Title must be at most 255 characters' })
  title: string;

  @ApiPropertyOptional({ example: 0, description: 'Order index for section positioning' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  orderIndex?: number;
}

export class UpdateSectionDto {
  @ApiPropertyOptional({ example: 'Introduction' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  orderIndex?: number;
}

export class ReorderSectionsDto {
  @ApiProperty({ example: [1, 2, 3], description: 'Section IDs in desired order' })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one section ID is required' })
  @IsNumber({}, { each: true })
  sectionIds: number[];
}
