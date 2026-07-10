import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.module';
import { ConnectionQueryDto, CreateConnectionDto, UpdateConnectionDto } from './dto/connection.dto';
import { EventsGateway } from '../events-gateway/events.gateway';

@Injectable()
export class ConnectionsService {
  constructor(private prisma: PrismaService, private events: EventsGateway) {}

  findAll(query: ConnectionQueryDto) {
    return this.prisma.connection.findMany({
      where: {
        status: query.status,
        type: query.type,
        name: query.search ? { contains: query.search, mode: 'insensitive' } : undefined,
      },
      include: {
        sourcePort: { include: { equipment: { include: { station: true } } } },
        targetPort: { include: { equipment: { include: { station: true } } } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const connection = await this.prisma.connection.findUnique({
      where: { id },
      include: {
        sourcePort: { include: { equipment: { include: { station: true } } } },
        targetPort: { include: { equipment: { include: { station: true } } } },
      },
    });
    if (!connection) throw new NotFoundException('Conexão não encontrada');
    return connection;
  }

  async create(dto: CreateConnectionDto) {
    if (dto.sourcePortId === dto.targetPortId) {
      throw new BadRequestException('Uma porta não pode se conectar a ela mesma');
    }

    const [sourcePort, targetPort] = await Promise.all([
      this.prisma.port.findUnique({ where: { id: dto.sourcePortId } }),
      this.prisma.port.findUnique({ where: { id: dto.targetPortId } }),
    ]);
    if (!sourcePort) throw new NotFoundException('Porta de origem não encontrada');
    if (!targetPort) throw new NotFoundException('Porta de destino não encontrada');

    await this.ensurePortFree(dto.sourcePortId);
    await this.ensurePortFree(dto.targetPortId);

    const result = await this.prisma.connection.create({ data: dto });
    this.events.broadcastTopologyChanged();
    return result;
  }

  async update(id: string, dto: UpdateConnectionDto) {
    await this.ensureExists(id);
    const result = await this.prisma.connection.update({ where: { id }, data: dto });
    this.events.broadcastTopologyChanged();
    return result;
  }

  async remove(id: string) {
    await this.ensureExists(id);
    const result = await this.prisma.connection.delete({ where: { id } });
    this.events.broadcastTopologyChanged();
    return result;
  }

  // Uma porta só pode estar em uma conexão ativa por vez (origem ou destino)
  private async ensurePortFree(portId: string) {
    const existing = await this.prisma.connection.findFirst({
      where: { OR: [{ sourcePortId: portId }, { targetPortId: portId }] },
    });
    if (existing) {
      throw new ConflictException(`Porta já está em uso pela conexão "${existing.name}"`);
    }
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.connection.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Conexão não encontrada');
  }
}
