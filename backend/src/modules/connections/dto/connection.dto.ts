import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum ConnectionTypeDto {
  FIBER = 'FIBER',
  CABLE = 'CABLE',
  RADIO = 'RADIO',
  WIRELESS = 'WIRELESS',
  OTHER = 'OTHER',
  ELETRONORTE_CAPACITY = 'ELETRONORTE_CAPACITY',
  ELETROSUL_CAPACITY = 'ELETROSUL_CAPACITY',
  TIM_CAPACITY = 'TIM_CAPACITY',
  TIM_FIBER = 'TIM_FIBER',
  ELETRONORTE_FIBER = 'ELETRONORTE_FIBER',
  ELETROSUL_FIBER = 'ELETROSUL_FIBER',
  GVT_FIBER = 'GVT_FIBER',
  CHESF_FIBER = 'CHESF_FIBER',
  TOLETO_FIBER = 'TOLETO_FIBER',
}

export enum ConnectionStatusDto {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  ALERT = 'ALERT',
  DISABLED = 'DISABLED',
}

export class CreateConnectionDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() sourcePortId: string;
  @IsString() @IsNotEmpty() targetPortId: string;
  @IsEnum(ConnectionTypeDto) type: ConnectionTypeDto;
  @IsOptional() @IsNumber() @Min(0) distance?: number;
  @IsOptional() @IsNumber() @Min(0) fiberCount?: number;
  @IsOptional() @IsNumber() @Min(0) fibersUsed?: number;
  @IsOptional() @IsEnum(ConnectionStatusDto) status?: ConnectionStatusDto;
  @IsOptional() @IsBoolean() isBackup?: boolean;
}

export class UpdateConnectionDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEnum(ConnectionTypeDto) type?: ConnectionTypeDto;
  @IsOptional() @IsNumber() @Min(0) distance?: number;
  @IsOptional() @IsNumber() @Min(0) fiberCount?: number;
  @IsOptional() @IsNumber() @Min(0) fibersUsed?: number;
  @IsOptional() @IsEnum(ConnectionStatusDto) status?: ConnectionStatusDto;
  @IsOptional() @IsBoolean() isBackup?: boolean;
}

export class ConnectionQueryDto {
  @IsOptional() @IsEnum(ConnectionStatusDto) status?: ConnectionStatusDto;
  @IsOptional() @IsEnum(ConnectionTypeDto) type?: ConnectionTypeDto;
  @IsOptional() @IsString() search?: string;
}

// Usado pela Etapa 4 (simulação): informar o identificador de uma conexão
// que "rompeu" (ex: nome da fibra, como no exemplo "FO-023" do requisito).
export class FailDto {
  @IsString() @IsNotEmpty() connectionIdOrName: string;
}
