import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.module';
import { handlePrismaDeleteError } from '../../common/utils/prisma-errors.util';
import { CreateModelDto, UpdateModelDto } from './dto/model.dto';

@Injectable()
export class ModelsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.model.findMany({ orderBy: { name: 'asc' }, include: { manufacturer: true } });
  }

  async findOne(id: string) {
    const item = await this.prisma.model.findUnique({ where: { id }, include: { manufacturer: true } });
    if (!item) throw new NotFoundException('Modelo não encontrado');
    return item;
  }

  create(dto: CreateModelDto) {
    return this.prisma.model.create({ data: dto });
  }

  async update(id: string, dto: UpdateModelDto) {
    await this.findOne(id);
    return this.prisma.model.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.model.delete({ where: { id } });
    } catch (error) {
      handlePrismaDeleteError(error, 'modelo');
    }
  }
}
