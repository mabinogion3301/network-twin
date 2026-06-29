import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export enum StationStatusDto {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  MAINTENANCE = 'MAINTENANCE',
}

export class CreateStationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  mapPositionX?: number;

  @IsOptional()
  @IsNumber()
  mapPositionY?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(StationStatusDto)
  status?: StationStatusDto;
}

export class UpdateStationDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsNumber() latitude?: number;
  @IsOptional() @IsNumber() longitude?: number;
  @IsOptional() @IsNumber() mapPositionX?: number;
  @IsOptional() @IsNumber() mapPositionY?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsEnum(StationStatusDto) status?: StationStatusDto;
}

export class StationQueryDto {
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsEnum(StationStatusDto) status?: StationStatusDto;
  @IsOptional() @IsString() search?: string;
}
