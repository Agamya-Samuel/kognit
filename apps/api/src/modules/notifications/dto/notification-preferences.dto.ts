import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class NotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  assignmentReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  liveClassAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;
}