import { IsArray, IsOptional, IsString } from 'class-validator';

export class RunSimulationDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  connectionIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipmentIds?: string[];

  // IDs de estações em perda de gerência — usadas para estado visual
  // independente de equipamentos cadastrados.
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  failedStationIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  overheatStationIds?: string[];
}
