import { IsOptional, IsBoolean, IsString, IsIn } from 'class-validator';

export class NotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  emailEnrollments?: boolean;

  @IsOptional()
  @IsBoolean()
  emailSubmissions?: boolean;

  @IsOptional()
  @IsBoolean()
  emailReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  emailMarketing?: boolean;

  @IsOptional()
  @IsBoolean()
  pushEnrollments?: boolean;

  @IsOptional()
  @IsBoolean()
  pushSubmissions?: boolean;

  @IsOptional()
  @IsBoolean()
  pushReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  smsEnrollments?: boolean;

  @IsOptional()
  @IsBoolean()
  smsSubmissions?: boolean;

  @IsOptional()
  @IsBoolean()
  smsReminders?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['immediate', 'daily', 'weekly'])
  emailFrequency?: 'immediate' | 'daily' | 'weekly';

  @IsOptional()
  @IsString()
  @IsIn(['immediate', 'daily', 'weekly'])
  smsFrequency?: 'immediate' | 'daily' | 'weekly';
}

export class AdminNotificationConfigDto {
  @IsOptional()
  @IsBoolean()
  emailEnrollments?: boolean;

  @IsOptional()
  @IsBoolean()
  emailSubmissions?: boolean;

  @IsOptional()
  @IsBoolean()
  emailReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  emailMarketing?: boolean;

  @IsOptional()
  @IsBoolean()
  pushEnrollments?: boolean;

  @IsOptional()
  @IsBoolean()
  pushSubmissions?: boolean;

  @IsOptional()
  @IsBoolean()
  pushReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  smsEnrollments?: boolean;

  @IsOptional()
  @IsBoolean()
  smsSubmissions?: boolean;

  @IsOptional()
  @IsBoolean()
  smsReminders?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['immediate', 'daily', 'weekly'])
  emailFrequency?: 'immediate' | 'daily' | 'weekly';

  @IsOptional()
  @IsString()
  @IsIn(['immediate', 'daily', 'weekly'])
  smsFrequency?: 'immediate' | 'daily' | 'weekly';
}
