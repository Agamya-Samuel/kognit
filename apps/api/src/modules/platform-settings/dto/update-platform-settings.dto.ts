import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePlatformSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  siteName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  siteDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  supportEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactPhone?: string;

  @IsOptional()
  @IsString()
  // Social media links would typically be JSON, but keeping as string for simplicity
  socialMediaLinks?: string;

  @IsOptional()
  @IsString()
  maintenanceMode?: string; // Could be boolean, but keeping as string for flexibility

  @IsOptional()
  @IsString()
  allowRegistration?: string; // Could be boolean

  @IsOptional()
  @IsString()
  @MaxLength(50)
  defaultCourseLanguage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;

  // Add other settings as needed
}