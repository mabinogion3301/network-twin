import { ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';

export class RunSimulationDto {
  // IDs das conexões que "caíram" (ex: fibra rompeu). Aceita nome OU id.
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  connectionIds?: string[];

  // IDs dos equipamentos que "caíram" totalmente (ex: equipamento queimou).
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipmentIds?: string[];
}
