import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStationLinkDto {
  @IsString() @IsNotEmpty() stationAId: string;
  @IsString() @IsNotEmpty() stationBId: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateStationLinkDto {
  @IsOptional() @IsString() notes?: string;
}
