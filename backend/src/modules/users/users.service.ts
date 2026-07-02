import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.module';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, active: true, roleId: true, role: true, createdAt: true },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, active: true, roleId: true, role: true, createdAt: true },
    });
  }

  async create(dto: CreateUserDto) {
    const passwordHash = await AuthService.hashPassword(dto.password);
    return this.prisma.user.create({
      data: { name: dto.name, email: dto.email, passwordHash, roleId: dto.roleId },
      select: { id: true, name: true, email: true, roleId: true },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const { newPassword, ...rest } = dto;
    const data: any = { ...rest };
    if (newPassword) {
      data.passwordHash = await AuthService.hashPassword(newPassword);
    }
    return this.prisma.user.update({ where: { id }, data });
  }

  remove(id: string) {
    // soft delete preferível a hard delete, para preservar histórico de auditoria
    return this.prisma.user.update({ where: { id }, data: { active: false } });
  }
}
