import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.module';
import { CreateStationDto, StationQueryDto, UpdateStationDto } from './dto/station.dto';
import { handlePrismaDeleteError } from '../../common/utils/prisma-errors.util';

@Injectable()
export class StationsService {
  constructor(private prisma: PrismaService) {}

  findAll(query: StationQueryDto) {
    return this.prisma.station.findMany({
      where: {
        city: query.city ? { equals: query.city, mode: 'insensitive' } : undefined,
        state: query.state ? { equals: query.state, mode: 'insensitive' } : undefined,
        status: query.status,
        name: query.search ? { contains: query.search, mode: 'insensitive' } : undefined,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const station = await this.prisma.station.findUnique({
      where: { id },
      include: { equipments: { include: { ports: true, type: true } } },
    });
    if (!station) throw new NotFoundException('Estação não encontrada');
    return station;
  }

  create(dto: CreateStationDto) {
    return this.prisma.station.create({ data: dto });
  }

  async update(id: string, dto: UpdateStationDto) {
    await this.ensureExists(id);
    return this.prisma.station.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    try {
      return await this.prisma.$transaction(async (tx) => {
        // StationLink é só um vínculo lógico (não é inventário físico), então
        // é seguro remover automaticamente. Equipamentos continuam bloqueando
        // a exclusão de propósito — são dados de inventário reais.
        await tx.stationLink.deleteMany({
          where: { OR: [{ stationAId: id }, { stationBId: id }] },
        });
        return tx.station.delete({ where: { id } });
      });
    } catch (error) {
      handlePrismaDeleteError(error, 'estação');
    }
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.station.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Estação não encontrada');
  }
}
