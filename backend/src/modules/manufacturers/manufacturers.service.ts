import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.module';
import { handlePrismaDeleteError } from '../../common/utils/prisma-errors.util';
import { CreateManufacturerDto, UpdateManufacturerDto } from './dto/manufacturer.dto';

@Injectable()
export class ManufacturersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.manufacturer.findMany({ orderBy: { name: 'asc' }, include: { models: true } });
  }

  async findOne(id: string) {
    const item = await this.prisma.manufacturer.findUnique({ where: { id }, include: { models: true } });
    if (!item) throw new NotFoundException('Fabricante não encontrado');
    return item;
  }

  create(dto: CreateManufacturerDto) {
    return this.prisma.manufacturer.create({ data: dto });
  }

  async update(id: string, dto: UpdateManufacturerDto) {
    await this.findOne(id);
    return this.prisma.manufacturer.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.manufacturer.delete({ where: { id } });
    } catch (error) {
      handlePrismaDeleteError(error, 'fabricante');
    }
  }
}
