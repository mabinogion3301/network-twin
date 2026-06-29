import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.module';
import { handlePrismaDeleteError } from '../../common/utils/prisma-errors.util';
import { CreatePortDto, PortQueryDto, UpdatePortDto } from './dto/port.dto';

@Injectable()
export class PortsService {
  constructor(private prisma: PrismaService) {}

  findAll(query: PortQueryDto) {
    return this.prisma.port.findMany({
      where: { equipmentId: query.equipmentId, status: query.status },
      include: { equipment: { select: { id: true, name: true, stationId: true } } },
      orderBy: { number: 'asc' },
    });
  }

  async findOne(id: string) {
    const port = await this.prisma.port.findUnique({
      where: { id },
      include: { equipment: true, connectionsAsSource: true, connectionsAsTarget: true },
    });
    if (!port) throw new NotFoundException('Porta não encontrada');
    return port;
  }

  async create(dto: CreatePortDto) {
    const duplicate = await this.prisma.port.findUnique({
      where: { equipmentId_number: { equipmentId: dto.equipmentId, number: dto.number } },
    });
    if (duplicate) throw new ConflictException('Já existe uma porta com esse número neste equipamento');
    return this.prisma.port.create({ data: dto });
  }

  async update(id: string, dto: UpdatePortDto) {
    await this.ensureExists(id);
    return this.prisma.port.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    try {
      return await this.prisma.port.delete({ where: { id } });
    } catch (error) {
      handlePrismaDeleteError(error, 'porta');
    }
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.port.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Porta não encontrada');
  }
}
