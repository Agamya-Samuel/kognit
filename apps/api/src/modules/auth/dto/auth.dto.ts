import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsIn, IsArray, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'student@example.com', description: 'User email address' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @ApiProperty({ example: 'Password123', description: 'User password' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiPropertyOptional({
    example: 'student',
    description: 'Portal being accessed: student | instructor | admin',
    enum: ['student', 'instructor', 'admin'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['student', 'instructor', 'admin'])
  portal?: string;
}

export class RequestEmailVerificationDto {
  @ApiProperty({ example: 'student@example.com', description: 'Email address to verify' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @ApiPropertyOptional({
    example: 'student',
    description: 'Registration intent: student | instructor',
    enum: ['student', 'instructor'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['student', 'instructor'])
  intent?: string;
}

export class VerifyEmailCodeDto {
  @ApiProperty({ example: 'student@example.com', description: 'Email address' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @ApiProperty({ example: '123456', description: '6-digit verification code' })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code: string;
}

export class CompleteRegistrationDto {
  @ApiProperty({ example: 'student@example.com', description: 'Verified email address' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @ApiProperty({ example: '123456', description: '6-digit verification code' })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name', minLength: 2, maxLength: 255 })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(255, { message: 'Name must be at most 255 characters' })
  name: string;

  @ApiProperty({
    example: 'Password123',
    description: 'Password (min 8 chars, 1 uppercase, 1 lowercase, 1 digit)',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password must be at most 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one digit',
  })
  password: string;

  @ApiPropertyOptional({
    example: 'student',
    description: 'Registration intent: student | instructor',
    enum: ['student', 'instructor'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['student', 'instructor'])
  intent?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'Refresh token' })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'student@example.com', description: 'Email address' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'student@example.com', description: 'Email address' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @ApiProperty({ example: 'abc123def456', description: 'Password reset token' })
  @IsString()
  @IsNotEmpty({ message: 'Reset token is required' })
  token: string;

  @ApiProperty({
    example: 'NewPassword123',
    description: 'New password (min 8 chars, 1 uppercase, 1 lowercase, 1 digit)',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password must be at most 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one digit',
  })
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'CurrentPassword123', description: 'Current password' })
  @IsString()
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;

  @ApiProperty({
    example: 'NewPassword123',
    description: 'New password (min 8 chars, 1 uppercase, 1 lowercase, 1 digit)',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password must be at most 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one digit',
  })
  newPassword: string;
}

export class ValidateActivationTokenDto {
  @ApiProperty({ example: 'abc123...', description: 'Activation token from email' })
  @IsString()
  @IsNotEmpty({ message: 'Activation token is required' })
  token: string;
}

export class CompleteActivationDto {
  @ApiProperty({ example: 'abc123...', description: 'Activation token from email' })
  @IsString()
  @IsNotEmpty({ message: 'Activation token is required' })
  token: string;

  @ApiProperty({
    example: 'NewPassword123',
    description: 'Password to set (min 8 chars, 1 uppercase, 1 lowercase, 1 digit)',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password must be at most 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one digit',
  })
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(255, { message: 'Name must be at most 255 characters' })
  name: string;

  @ApiProperty({ example: '+1234567890', description: 'Mobile phone number' })
  @IsString()
  @MaxLength(20)
  mobile: string;

  @ApiProperty({ example: '123 Main Street', description: 'Street address' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'New York', description: 'City' })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: 'NY', description: 'State or province' })
  @IsString()
  @MaxLength(100)
  state: string;

  @ApiProperty({ example: '10001', description: 'PIN or ZIP code' })
  @IsString()
  @MaxLength(10)
  pinCode: string;

  @ApiProperty({ example: 'United States', description: 'Country' })
  @IsString()
  @MaxLength(100)
  country: string;
}

export class ValidateInstructorActivationTokenDto {
  @ApiProperty({ example: 'abc123...', description: 'Activation token from email' })
  @IsString()
  @IsNotEmpty({ message: 'Activation token is required' })
  token: string;
}

export class CompleteInstructorActivationDto {
  @ApiProperty({ example: 'abc123...', description: 'Activation token from email' })
  @IsString()
  @IsNotEmpty({ message: 'Activation token is required' })
  token: string;

  @ApiProperty({
    example: 'NewPassword123',
    description: 'Password to set (min 8 chars, 1 uppercase, 1 lowercase, 1 digit)',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password must be at most 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one digit',
  })
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(255, { message: 'Name must be at most 255 characters' })
  name: string;

  @ApiPropertyOptional({ example: 'Experienced web developer...', description: 'Instructor bio' })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  bio?: string;

  @ApiPropertyOptional({ example: ['JavaScript', 'React'], description: 'Areas of expertise' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  expertise?: string[];

  @ApiPropertyOptional({ example: '+1234567890', description: 'Mobile phone number' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  mobile?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/johndoe', description: 'LinkedIn profile URL' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  linkedinUrl?: string;

  @ApiPropertyOptional({ example: 'https://johndoe.com', description: 'Website or portfolio URL' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  websiteUrl?: string;
}
