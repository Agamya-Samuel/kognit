import { IsObject, IsString, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for updating platform settings.
 * Keys are setting identifiers (alphanumeric, dash, underscore).
 * Values are JSON-serializable and stored as strings (max 1000 chars).
 */
export class SettingEntryDto {
  @ApiProperty({ description: 'Setting value (any JSON-serializable value)' })
  @IsString()
  @MaxLength(1000, { message: 'Setting value must not exceed 1000 characters when serialized' })
  value: string;
}

export class UpdateSettingsDto {
  @ApiProperty({
    description: 'Map of setting key → value. Keys must be alphanumeric (dash/underscore allowed).',
    example: { maintenance_mode: false, max_upload_size_mb: 500 },
  })
  @IsObject()
  settings: Record<string, unknown>;
}
