import { IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { AccessType } from '../../db/schema/enums';

export class EnrollmentFiltersDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsEnum(AccessType)
  accessType?: AccessType;
}