import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export enum EquipmentStatusDto {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  MAINTENANCE = 'MAINTENANCE',
}

export class CreateEquipmentDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() stationId: string;
  @IsString() @IsNotEmpty() typeId: string;
  @IsOptional() @IsString() manufacturerId?: string;
  @IsOptional() @IsString() modelId?: string;
  @IsOptional() @IsString() ip?: string;
  @IsOptional() @IsString() mac?: string;
  @IsOptional() @IsString() serial?: string;
  @IsOptional() @IsString() rack?: string;
  @IsOptional() @IsString() rackPosition?: string;

  // Quantidade de portas. Se informado, o sistema já cria as portas
  // automaticamente (números 1..N, tipo RJ45 por padrão) — evita trabalho
  // manual de cadastrar porta a porta para equipamentos novos.
  @IsOptional() @IsInt() @Min(0) portCount?: number;

  @IsOptional() @IsEnum(EquipmentStatusDto) status?: EquipmentStatusDto;
}

export class UpdateEquipmentDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() stationId?: string;
  @IsOptional() @IsString() typeId?: string;
  @IsOptional() @IsString() manufacturerId?: string;
  @IsOptional() @IsString() modelId?: string;
  @IsOptional() @IsString() ip?: string;
  @IsOptional() @IsString() mac?: string;
  @IsOptional() @IsString() serial?: string;
  @IsOptional() @IsString() rack?: string;
  @IsOptional() @IsString() rackPosition?: string;
  @IsOptional() @IsEnum(EquipmentStatusDto) status?: EquipmentStatusDto;
}

export class EquipmentQueryDto {
  @IsOptional() @IsString() stationId?: string;
  @IsOptional() @IsString() typeId?: string;
  @IsOptional() @IsEnum(EquipmentStatusDto) status?: EquipmentStatusDto;
  @IsOptional() @IsString() search?: string; // nome ou IP
}
