import { IsNotEmpty, IsString } from 'class-validator';

export class CreateManufacturerDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateManufacturerDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
