import { IsOptional, IsString, Matches, MaxLength, IsArray, IsNumber, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'User full name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'I am a passionate learner...', description: 'User bio' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional({ example: ['JavaScript', 'React'], description: 'Areas of expertise' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  expertise?: string[];

  @ApiPropertyOptional({ example: 'MIT', description: 'Institution name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  institution?: string;

  @ApiPropertyOptional({ example: '10th Grade', description: 'Student grade' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  grade?: string;

  @ApiPropertyOptional({ example: 'user@example.com', description: 'Email address' })
  @IsOptional()
  @IsString()
  @Matches(/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/, { message: 'Invalid email format' })
  email?: string;

  // Student onboarding profile fields
  @ApiPropertyOptional({ example: '+1234567890', description: 'Mobile phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  mobile?: string;

  @ApiPropertyOptional({ example: '123 Main Street, Apt 4B', description: 'Street address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'New York', description: 'City' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'NY', description: 'State or province' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ example: '10001', description: 'PIN or ZIP code' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  pinCode?: string;

  @ApiPropertyOptional({ example: 'United States', description: 'Country' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ example: 1, description: 'Affiliated institution ID' })
  @IsOptional()
  @IsNumber()
  affiliatedInstituteId?: number;
}