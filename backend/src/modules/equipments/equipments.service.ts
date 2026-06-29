import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.module';
import { CreateEquipmentDto, EquipmentQueryDto, UpdateEquipmentDto } from './dto/equipment.dto';

@Injectable()
export class EquipmentsService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.$transaction(async (tx) => {
      const equipment = await tx.equipment.create({ data: { ...data, portCount: portCount ?? 0 } });

      // Auto-criação de portas: evita trabalho manual de cadastrar porta a
      // porta sempre que um equipamento novo é registrado.
      if (portCount && portCount > 0) {
        await tx.port.createMany({
          data: Array.from({ length: portCount }, (_, i) => ({
            equipmentId: equipment.id,
            number: i + 1,
            type: 'RJ45' as const,
          })),
        });
      }

      return tx.equipment.findUnique({ where: { id: equipment.id }, include: { ports: true } });
    });
  }

  async update(id: string, dto: UpdateEquipmentDto) {
    await this.ensureExists(id);
    return this.prisma.equipment.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);

    // Um equipamento sempre tem portas, e as portas podem ter conexões.
    // Excluir o equipamento sem cuidar disso quebraria por chave estrangeira.
    // Como portas/conexões só existem em função do equipamento, é seguro
    // (e o comportamento esperado pelo usuário) excluir tudo em cascata aqui.
    return this.prisma.$transaction(async (tx) => {
      const ports = await tx.port.findMany({ where: { equipmentId: id }, select: { id: true } });
      const portIds = ports.map((p) => p.id);

      if (portIds.length > 0) {
        await tx.connection.deleteMany({
          where: { OR: [{ sourcePortId: { in: portIds } }, { targetPortId: { in: portIds } }] },
        });
        await tx.port.deleteMany({ where: { equipmentId: id } });
      }

      return tx.equipment.delete({ where: { id } });
    });
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.equipment.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Equipamento não encontrado');
  }
}
