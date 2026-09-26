import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum FailureTypeDto {
  MANAGEMENT_FAILURE    = 'MANAGEMENT_FAILURE',
  OVERHEATING           = 'OVERHEATING',
  POWER_FAILURE         = 'POWER_FAILURE',
  EQUIPMENT_UNAVAILABLE = 'EQUIPMENT_UNAVAILABLE',
  NODE_RUPTURE          = 'NODE_RUPTURE',
  NODE_ATTENUATION      = 'NODE_ATTENUATION',
}

export enum FailureTargetTypeDto {
  STATION    = 'STATION',
  CONNECTION = 'CONNECTION',
}

export enum FailureSeverityDto {
  CRITICAL = 'CRITICAL',
  HIGH     = 'HIGH',
  MEDIUM   = 'MEDIUM',
  LOW      = 'LOW',
}

export class CreateFailureDto {
  @IsEnum(FailureTypeDto)       type: FailureTypeDto;
  @IsEnum(FailureTargetTypeDto) targetType: FailureTargetTypeDto;
  @IsNotEmpty() @IsString()     targetId: string;
  @IsNotEmpty() @IsString()     targetName: string;
  @IsOptional() @IsEnum(FailureSeverityDto) severity?: FailureSeverityDto;
  @IsOptional() @IsString()     note?: string;
}

export class UpdateNoteDto {
  @IsString() note: string;
}
