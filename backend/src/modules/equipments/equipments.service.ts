import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.module';
import { CreateEquipmentDto, EquipmentQueryDto, UpdateEquipmentDto } from './dto/equipment.dto';
import { EventsGateway } from '../events-gateway/events.gateway';

@Injectable()
export class EquipmentsService {
  constructor(private prisma: PrismaService, private events: EventsGateway) {}

  findAll(query: EquipmentQueryDto) {
    return this.prisma.equipment.findMany({
      where: {
        stationId: query.stationId,
        typeId: query.typeId,
        status: query.status,
        OR: query.search
          ? [
              { name: { contains: query.search, mode: 'insensitive' } },
              { ip: { contains: query.search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      include: { station: true, type: true, model: { include: { manufacturer: true } }, ports: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id },
      include: { station: true, type: true, model: { include: { manufacturer: true } }, ports: true },
    });
    if (!equipment) throw new NotFoundException('Equipamento não encontrado');
    return equipment;
  }

  async create(dto: CreateEquipmentDto) {
    const { portCount, ...data } = dto;
    const result = await this.prisma.$transaction(async (tx) => {
      const equipment = await tx.equipment.create({ data: { ...data, portCount: portCount ?? 0 } });
      if (portCount && portCount > 0) {
        await tx.port.createMany({
          data: Array.from({ length: portCount }, (_, i) => ({
            equipmentId: equipment.id, number: i + 1, type: 'RJ45' as const,
          })),
        });
      }
      return tx.equipment.findUnique({ where: { id: equipment.id }, include: { ports: true } });
    });
    this.events.broadcastTopologyChanged();
    return result;
  }

  async update(id: string, dto: UpdateEquipmentDto) {
    await this.ensureExists(id);
    const result = await this.prisma.equipment.update({ where: { id }, data: dto });
    this.events.broadcastTopologyChanged();
    return result;
  }

  async remove(id: string) {
    await this.ensureExists(id);
    const result = await this.prisma.$transaction(async (tx) => {
      const ports = await tx.port.findMany({ where: { equipmentId: id }, select: { id: true } });
      const portIds = ports.map((p) => p.id);
      if (portIds.length > 0) {
        await tx.connection.deleteMany({ where: { OR: [{ sourcePortId: { in: portIds } }, { targetPortId: { in: portIds } }] } });
        await tx.port.deleteMany({ where: { equipmentId: id } });
      }
      return tx.equipment.delete({ where: { id } });
    });
    this.events.broadcastTopologyChanged();
    return result;
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.equipment.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Equipamento não encontrado');
  }
}
