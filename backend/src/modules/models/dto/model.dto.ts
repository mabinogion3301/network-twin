import { IsNotEmpty, IsString } from 'class-validator';

export class CreateModelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  manufacturerId: string;
}

export class UpdateModelDto {
  @IsString()
  name?: string;

  @IsString()
  manufacturerId?: string;
}
