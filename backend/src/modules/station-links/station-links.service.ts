import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.module';
import { CreateStationLinkDto, UpdateStationLinkDto } from './dto/station-link.dto';

@Injectable()
export class StationLinksService {
  constructor(private prisma: PrismaService) {}

  findAll(stationId?: string) {
    return this.prisma.stationLink.findMany({
      where: stationId ? { OR: [{ stationAId: stationId }, { stationBId: stationId }] } : undefined,
      include: { stationA: true, stationB: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const link = await this.prisma.stationLink.findUnique({
      where: { id },
      include: { stationA: true, stationB: true },
    });
    if (!link) throw new NotFoundException('Vínculo entre estações não encontrado');
    return link;
  }

  async create(dto: CreateStationLinkDto) {
    if (dto.stationAId === dto.stationBId) {
      throw new BadRequestException('Uma estação não pode ter um vínculo direto com ela mesma');
    }

    const [a, b] = await Promise.all([
      this.prisma.station.findUnique({ where: { id: dto.stationAId } }),
      this.prisma.station.findUnique({ where: { id: dto.stationBId } }),
    ]);
    if (!a) throw new NotFoundException('Estação A não encontrada');
    if (!b) throw new NotFoundException('Estação B não encontrada');

    const existing = await this.prisma.stationLink.findFirst({
      where: {
        OR: [
          { stationAId: dto.stationAId, stationBId: dto.stationBId },
          { stationAId: dto.stationBId, stationBId: dto.stationAId },
        ],
      },
    });
    if (existing) throw new ConflictException('Já existe um vínculo direto cadastrado entre essas estações');

    return this.prisma.stationLink.create({ data: dto });
  }

  async update(id: string, dto: UpdateStationLinkDto) {
    await this.ensureExists(id);
    return this.prisma.stationLink.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.stationLink.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.stationLink.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Vínculo entre estações não encontrado');
  }
}
