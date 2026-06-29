import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.module';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(query: string) {
    if (!query || query.trim().length < 2) return { stations: [], equipments: [], connections: [], ports: [] };

    const q = query.trim();

    const [stations, equipments, connections, ports] = await Promise.all([
      this.prisma.station.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        take: 10,
      }),
      this.prisma.equipment.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { ip: { contains: q, mode: 'insensitive' } },
          ],
        },
        include: { station: true },
        take: 10,
      }),
      this.prisma.connection.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        take: 10,
      }),
      this.prisma.port.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        include: { equipment: true },
        take: 10,
      }),
    ]);

    return { stations, equipments, connections, ports };
  }
}
