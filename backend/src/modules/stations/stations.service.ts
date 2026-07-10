import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.module';
import { CreateStationDto, StationQueryDto, UpdateStationDto } from './dto/station.dto';
import { handlePrismaDeleteError } from '../../common/utils/prisma-errors.util';
import { EventsGateway } from '../events-gateway/events.gateway';

@Injectable()
export class StationsService {
  constructor(private prisma: PrismaService, private events: EventsGateway) {}

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

  async create(dto: CreateStationDto) {
    const result = await this.prisma.station.create({ data: dto });
    this.events.broadcastTopologyChanged();
    return result;
  }

  async update(id: string, dto: UpdateStationDto) {
    await this.ensureExists(id);
    const result = await this.prisma.station.update({ where: { id }, data: dto });
    this.events.broadcastTopologyChanged();
    return result;
  }

  async remove(id: string) {
    await this.ensureExists(id);
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        await tx.stationLink.deleteMany({
          where: { OR: [{ stationAId: id }, { stationBId: id }] },
        });
        return tx.station.delete({ where: { id } });
      });
      this.events.broadcastTopologyChanged();
      return result;
    } catch (error) {
      handlePrismaDeleteError(error, 'estação');
    }
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.station.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Estação não encontrada');
  }
}
