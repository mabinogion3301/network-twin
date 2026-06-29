import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEquipmentTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateEquipmentTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
