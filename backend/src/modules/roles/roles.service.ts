import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.module';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.role.findMany();
  }

  findOne(id: string) {
    return this.prisma.role.findUnique({ where: { id } });
  }

  create(dto: CreateRoleDto) {
    return this.prisma.role.create({ data: dto });
  }

  update(id: string, dto: UpdateRoleDto) {
    return this.prisma.role.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.role.delete({ where: { id } });
  }
}
