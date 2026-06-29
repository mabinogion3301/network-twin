import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export enum PortTypeDto {
  RJ45 = 'RJ45',
  SFP = 'SFP',
  SFP_PLUS = 'SFP_PLUS',
  QSFP = 'QSFP',
  FIBER = 'FIBER',
  OTHER = 'OTHER',
}

export enum PortStatusDto {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  DISABLED = 'DISABLED',
  ALERT = 'ALERT',
}

export class CreatePortDto {
  @IsString() @IsNotEmpty() equipmentId: string;
  @IsInt() @Min(1) number: number;
  @IsOptional() @IsString() name?: string;
  @IsEnum(PortTypeDto) type: PortTypeDto;
  @IsOptional() @IsString() speed?: string;
  @IsOptional() @IsEnum(PortStatusDto) status?: PortStatusDto;
}

export class UpdatePortDto {
  @IsOptional() @IsInt() @Min(1) number?: number;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEnum(PortTypeDto) type?: PortTypeDto;
  @IsOptional() @IsString() speed?: string;
  @IsOptional() @IsEnum(PortStatusDto) status?: PortStatusDto;
}

export class PortQueryDto {
  @IsOptional() @IsString() equipmentId?: string;
  @IsOptional() @IsEnum(PortStatusDto) status?: PortStatusDto;
}
