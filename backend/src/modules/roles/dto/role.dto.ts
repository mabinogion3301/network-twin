import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  // ex: { "stations.create": true, "stations.delete": false, "simulations.run": true }
  @IsObject()
  permissions: Record<string, boolean>;
}

export class UpdateRoleDto {
  @IsString()
  name?: string;

  @IsObject()
  permissions?: Record<string, boolean>;
}
