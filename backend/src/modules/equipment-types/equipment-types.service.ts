import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.module';
import { handlePrismaDeleteError } from '../../common/utils/prisma-errors.util';
import { CreateEquipmentTypeDto, UpdateEquipmentTypeDto } from './dto/equipment-type.dto';

@Injectable()
export class EquipmentTypesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.equipmentType.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.equipmentType.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Tipo de equipamento não encontrado');
    return item;
  }

  create(dto: CreateEquipmentTypeDto) {
    return this.prisma.equipmentType.create({ data: dto });
  }

  async update(id: string, dto: UpdateEquipmentTypeDto) {
    await this.findOne(id);
    return this.prisma.equipmentType.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.equipmentType.delete({ where: { id } });
    } catch (error) {
      handlePrismaDeleteError(error, 'tipo de equipamento');
    }
  }
}
